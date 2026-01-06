

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."assignment_status" AS ENUM (
    'pendente',
    'confirmado',
    'recusado'
);


ALTER TYPE "public"."assignment_status" OWNER TO "postgres";


CREATE TYPE "public"."member_status_enum" AS ENUM (
    'ativo',
    'inativo'
);


ALTER TYPE "public"."member_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."sector_enum" AS ENUM (
    'mídia',
    'geral',
    'louvor',
    'infantil',
    'social'
);


ALTER TYPE "public"."sector_enum" OWNER TO "postgres";


CREATE TYPE "public"."status_enum" AS ENUM (
    'pending',
    'processing',
    'sent',
    'failed'
);


ALTER TYPE "public"."status_enum" OWNER TO "postgres";


CREATE TYPE "public"."user_role_enum" AS ENUM (
    'admin',
    'pastor(a)',
    'lider_midia',
    'lider_geral',
    'pendente',
    'membro'
);


ALTER TYPE "public"."user_role_enum" OWNER TO "postgres";


CREATE TYPE "public"."visitor_status_enum" AS ENUM (
    'sem_igreja',
    'visitante_outra_igreja',
    'afastado',
    'indeciso'
);


ALTER TYPE "public"."visitor_status_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_default_assignments_for_new_event"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Insere na tabela 'event_assignments' múltiplas vezes com base na 'quantity' da tarefa.
  INSERT INTO public.event_assignments (event_id, task_id)
  SELECT
    NEW.id, -- O ID do novo evento que foi inserido
    t.id    -- O ID da tarefa padrão
  FROM public.tasks AS t
  -- A "mágica" acontece aqui:
  -- generate_series cria uma linha para cada número de 1 até a quantidade da tarefa.
  -- O CROSS JOIN multiplica as tarefas por essas linhas, gerando o número correto de inserções.
  CROSS JOIN LATERAL generate_series(1, t.quantity)
  WHERE t.is_default = true;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_default_assignments_for_new_event"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  member_id uuid;
begin
  -- Verifica se existe um membro com o mesmo telefone que ainda não tem user_id
  select id into member_id
  from public.members
  where phone = new.raw_user_meta_data->>'phone' and user_id is null;

  if member_id is not null then
    -- Se o membro existe, vincula o user_id E atualiza os dados reais
    update public.members
    set
      user_id = new.id,
      name = new.raw_user_meta_data->>'name',
      birthdate = (new.raw_user_meta_data->>'birthdate')::date
    where id = member_id;
  else
    -- Se o membro não existe, cria um novo registro
    insert into public.members (user_id, name, phone, birthdate, role, status)
    values (
      new.id,
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'phone',
      (new.raw_user_meta_data->>'birthdate')::date,
      'pendente', -- Role padrão para novos usuários
      'ativo'     -- Status padrão para novos usuários
    );
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."handle_new_user"() IS 'Trigger que vincula usuários novos a membros pré-existentes via telefone.
Se o membro já existe (cadastrado pelo admin), atualiza nome e birthdate com dados reais.
Se não existe, cria novo registro com status pendente.';



CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.members m
    INNER JOIN public.roles r ON m.role_id = r.id
    WHERE m.user_id = auth.uid()
    AND r.name = 'Admin'
  );
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_admin"() IS 'Verifica se o usuário autenticado é Admin. Usa SECURITY DEFINER para evitar recursão infinita nas policies.';



CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."verify_user_password"("password" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT id FROM auth.users
    WHERE id = auth.uid() AND encrypted_password = crypt(password::text, auth.users.encrypted_password)
  );
END;
$$;


ALTER FUNCTION "public"."verify_user_password"("password" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    "member_name" "text",
    "action_type" "text" NOT NULL,
    "resource_type" "text" NOT NULL,
    "resource_id" "uuid",
    "details" "jsonb" DEFAULT '{}'::"jsonb",
    "ip_address" "text",
    "user_agent" "text"
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."audit_logs" IS 'Registra todas as ações importantes do sistema para auditoria e análise';



COMMENT ON COLUMN "public"."audit_logs"."member_name" IS 'Nome do membro denormalizado para preservar histórico';



COMMENT ON COLUMN "public"."audit_logs"."action_type" IS 'Tipo de ação: task_assigned, event_created, member_updated, etc';



COMMENT ON COLUMN "public"."audit_logs"."resource_type" IS 'Tipo de recurso afetado: event, task, member, visitor, etc';



COMMENT ON COLUMN "public"."audit_logs"."details" IS 'Detalhes adicionais da ação em formato JSON flexível';



CREATE TABLE IF NOT EXISTS "public"."event_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "task_id" "uuid" NOT NULL,
    "member_id" "uuid",
    "status" "public"."assignment_status" DEFAULT 'pendente'::"public"."assignment_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."event_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "event_date" timestamp with time zone NOT NULL,
    "description" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."member_sectors" (
    "member_id" "uuid" NOT NULL,
    "sector_id" "uuid" NOT NULL
);


ALTER TABLE "public"."member_sectors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "sector" "public"."sector_enum"[],
    "phone" "text" NOT NULL,
    "birthdate" "date" NOT NULL,
    "user_id" "uuid",
    "role" "public"."user_role_enum" DEFAULT 'pendente'::"public"."user_role_enum" NOT NULL,
    "status" "public"."member_status_enum" DEFAULT 'ativo'::"public"."member_status_enum" NOT NULL,
    "role_id" "uuid",
    "sector_id" "uuid",
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."members" OWNER TO "postgres";


COMMENT ON COLUMN "public"."members"."sector" IS 'DEPRECATED - usar sector_id';



COMMENT ON COLUMN "public"."members"."role" IS 'DEPRECATED - usar role_id';



COMMENT ON COLUMN "public"."members"."role_id" IS 'Role do membro (sistema novo - usar este)';



COMMENT ON COLUMN "public"."members"."sector_id" IS 'Setor do membro (sistema novo - usar este)';



COMMENT ON COLUMN "public"."members"."deleted_at" IS 'Timestamp when member was soft deleted (NULL = active member)';



CREATE TABLE IF NOT EXISTS "public"."message" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "message" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "error_message" "text",
    "status" "public"."status_enum" DEFAULT 'pending'::"public"."status_enum" NOT NULL
);


ALTER TABLE "public"."message" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."page_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "page_name" "text" NOT NULL,
    "page_path" "text" NOT NULL,
    "allowed_roles" "public"."user_role_enum"[] NOT NULL,
    "icon" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."page_permissions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."page_permissions"."page_path" IS 'Caminho da página - /admin/configuracoes acessível apenas para admins';



CREATE TABLE IF NOT EXISTS "public"."post_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "slug" character varying(100) NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."post_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(255) NOT NULL,
    "slug" character varying(255) NOT NULL,
    "content" "text" NOT NULL,
    "excerpt" "text",
    "featured_image" "text",
    "author_id" "uuid",
    "category_id" "uuid",
    "published_at" timestamp with time zone,
    "status" character varying(20) DEFAULT 'draft'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "posts_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['draft'::character varying, 'published'::character varying])::"text"[])))
);


ALTER TABLE "public"."posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_leadership" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."roles" IS 'Roles dinâmicas do sistema - gerenciáveis via UI';



COMMENT ON COLUMN "public"."roles"."name" IS 'Nome da role (ex: Admin, Pastor(a), Líder de Mídia)';



COMMENT ON COLUMN "public"."roles"."is_leadership" IS 'Indica se a role tem permissões de liderança';



CREATE TABLE IF NOT EXISTS "public"."sectors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon" "text" DEFAULT 'Users'::"text",
    "color" "text" DEFAULT '#3B82F6'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sectors" OWNER TO "postgres";


COMMENT ON TABLE "public"."sectors" IS 'Setores da igreja - gerenciáveis via UI';



COMMENT ON COLUMN "public"."sectors"."name" IS 'Nome do setor (ex: Mídia, Louvor, Infantil)';



COMMENT ON COLUMN "public"."sectors"."icon" IS 'Nome do ícone Lucide React';



COMMENT ON COLUMN "public"."sectors"."color" IS 'Cor em hexadecimal para identificação visual';



CREATE TABLE IF NOT EXISTS "public"."tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "sector" "public"."sector_enum",
    "is_default" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "sector_id" "uuid",
    CONSTRAINT "positive_quantity" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."visitors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "visitor_name" "text" NOT NULL,
    "visitor_whatsapp" "text" NOT NULL,
    "first_time" boolean DEFAULT false NOT NULL,
    "event_name" "text",
    "invited_by" "uuid",
    "visitor_status" "public"."visitor_status_enum",
    "visite_date" "date" NOT NULL,
    "visitor_city" "text",
    "how_found_church" "text",
    "prayer_requests" "text",
    "consent_lgpd" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."visitors" OWNER TO "postgres";


COMMENT ON COLUMN "public"."visitors"."invited_by" IS 'Nome da pessoa que convidou o visitante (texto livre)';



COMMENT ON COLUMN "public"."visitors"."visitor_city" IS 'Cidade ou bairro do visitante';



COMMENT ON COLUMN "public"."visitors"."how_found_church" IS 'Como o visitante conheceu a igreja (rede social, indicação, Google, etc)';



COMMENT ON COLUMN "public"."visitors"."prayer_requests" IS 'Pedidos de oração compartilhados pelo visitante';



COMMENT ON COLUMN "public"."visitors"."consent_lgpd" IS 'Consentimento LGPD para uso dos dados pessoais e contato';



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "Members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_assignments"
    ADD CONSTRAINT "event_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."member_sectors"
    ADD CONSTRAINT "member_sectors_pkey" PRIMARY KEY ("member_id", "sector_id");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_phone_key" UNIQUE ("phone");



ALTER TABLE ONLY "public"."message"
    ADD CONSTRAINT "message_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."page_permissions"
    ADD CONSTRAINT "page_permissions_page_path_key" UNIQUE ("page_path");



ALTER TABLE ONLY "public"."page_permissions"
    ADD CONSTRAINT "page_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_categories"
    ADD CONSTRAINT "post_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."post_categories"
    ADD CONSTRAINT "post_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post_categories"
    ADD CONSTRAINT "post_categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sectors"
    ADD CONSTRAINT "sectors_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."sectors"
    ADD CONSTRAINT "sectors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."visitors"
    ADD CONSTRAINT "visitors_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_audit_logs_action_type" ON "public"."audit_logs" USING "btree" ("action_type");



CREATE INDEX "idx_audit_logs_created_at" ON "public"."audit_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_audit_logs_resource_id" ON "public"."audit_logs" USING "btree" ("resource_id");



CREATE INDEX "idx_audit_logs_resource_type" ON "public"."audit_logs" USING "btree" ("resource_type");



CREATE INDEX "idx_audit_logs_user_action" ON "public"."audit_logs" USING "btree" ("user_id", "action_type", "created_at" DESC);



CREATE INDEX "idx_audit_logs_user_id" ON "public"."audit_logs" USING "btree" ("user_id");



CREATE INDEX "idx_members_deleted_at" ON "public"."members" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);



CREATE INDEX "idx_members_role_id" ON "public"."members" USING "btree" ("role_id");



CREATE INDEX "idx_members_sector_id" ON "public"."members" USING "btree" ("sector_id");



CREATE INDEX "idx_posts_author_id" ON "public"."posts" USING "btree" ("author_id");



CREATE INDEX "idx_posts_category_id" ON "public"."posts" USING "btree" ("category_id");



CREATE INDEX "idx_posts_published_at" ON "public"."posts" USING "btree" ("published_at" DESC);



CREATE INDEX "idx_posts_slug" ON "public"."posts" USING "btree" ("slug");



CREATE INDEX "idx_posts_status" ON "public"."posts" USING "btree" ("status");



CREATE INDEX "idx_roles_is_leadership" ON "public"."roles" USING "btree" ("is_leadership");



CREATE OR REPLACE TRIGGER "on_event_created_create_default_assignments" AFTER INSERT ON "public"."events" FOR EACH ROW EXECUTE FUNCTION "public"."create_default_assignments_for_new_event"();



CREATE OR REPLACE TRIGGER "update_post_categories_updated_at" BEFORE UPDATE ON "public"."post_categories" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_posts_updated_at" BEFORE UPDATE ON "public"."posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_roles_updated_at" BEFORE UPDATE ON "public"."roles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_sectors_updated_at" BEFORE UPDATE ON "public"."sectors" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."event_assignments"
    ADD CONSTRAINT "event_assignments_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_assignments"
    ADD CONSTRAINT "event_assignments_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."event_assignments"
    ADD CONSTRAINT "event_assignments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."member_sectors"
    ADD CONSTRAINT "member_sectors_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "public"."sectors"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."posts"
    ADD CONSTRAINT "posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."post_categories"("id") ON DELETE SET NULL;



CREATE POLICY "Admin can update all members" ON "public"."members" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



COMMENT ON POLICY "Admin can update all members" ON "public"."members" IS 'Permite que admins atualizem qualquer membro. Usa função is_admin() para evitar recursão.';



CREATE POLICY "Admins and pastors can delete categories" ON "public"."post_categories" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."members" "m"
     JOIN "public"."roles" "r" ON (("m"."role_id" = "r"."id")))
  WHERE (("m"."user_id" = "auth"."uid"()) AND (("r"."name" = 'Admin'::"text") OR ("r"."name" = 'Pastor(a)'::"text"))))));



CREATE POLICY "Admins and pastors can delete posts" ON "public"."posts" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."members" "m"
     JOIN "public"."roles" "r" ON (("m"."role_id" = "r"."id")))
  WHERE (("m"."user_id" = "auth"."uid"()) AND (("r"."name" = 'Admin'::"text") OR ("r"."name" = 'Pastor(a)'::"text"))))));



CREATE POLICY "Admins and pastors can insert categories" ON "public"."post_categories" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."members" "m"
     JOIN "public"."roles" "r" ON (("m"."role_id" = "r"."id")))
  WHERE (("m"."user_id" = "auth"."uid"()) AND (("r"."name" = 'Admin'::"text") OR ("r"."name" = 'Pastor(a)'::"text"))))));



CREATE POLICY "Admins and pastors can update categories" ON "public"."post_categories" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."members" "m"
     JOIN "public"."roles" "r" ON (("m"."role_id" = "r"."id")))
  WHERE (("m"."user_id" = "auth"."uid"()) AND (("r"."name" = 'Admin'::"text") OR ("r"."name" = 'Pastor(a)'::"text")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."members" "m"
     JOIN "public"."roles" "r" ON (("m"."role_id" = "r"."id")))
  WHERE (("m"."user_id" = "auth"."uid"()) AND (("r"."name" = 'Admin'::"text") OR ("r"."name" = 'Pastor(a)'::"text"))))));



CREATE POLICY "Allow all access for authenticated members" ON "public"."visitors" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."members"
  WHERE (("members"."user_id" = "auth"."uid"()) AND ("members"."role_id" IS NOT NULL)))));



CREATE POLICY "Allow all for admins" ON "public"."page_permissions" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."members" "m"
     JOIN "public"."roles" "r" ON (("m"."role_id" = "r"."id")))
  WHERE (("m"."user_id" = "auth"."uid"()) AND ("r"."name" = 'Admin'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."members" "m"
     JOIN "public"."roles" "r" ON (("m"."role_id" = "r"."id")))
  WHERE (("m"."user_id" = "auth"."uid"()) AND ("r"."name" = 'Admin'::"text")))));



CREATE POLICY "Allow delete for admins" ON "public"."tasks" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."members" "m"
     JOIN "public"."roles" "r" ON (("m"."role_id" = "r"."id")))
  WHERE (("m"."user_id" = "auth"."uid"()) AND ("r"."name" = 'Admin'::"text")))));



CREATE POLICY "Allow delete on event_assignments for leaders and admins" ON "public"."event_assignments" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."members" "m"
     JOIN "public"."roles" "r" ON (("m"."role_id" = "r"."id")))
  WHERE (("m"."user_id" = "auth"."uid"()) AND ("r"."is_leadership" = true)))));



CREATE POLICY "Allow insert and update for leaders and admins" ON "public"."events" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."members" "m"
     JOIN "public"."roles" "r" ON (("m"."role_id" = "r"."id")))
  WHERE (("m"."user_id" = "auth"."uid"()) AND ("r"."is_leadership" = true))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."members" "m"
     JOIN "public"."roles" "r" ON (("m"."role_id" = "r"."id")))
  WHERE (("m"."user_id" = "auth"."uid"()) AND ("r"."is_leadership" = true)))));



CREATE POLICY "Allow insert for authenticated non-pending members" ON "public"."members" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "user_id") AND ("role_id" IS NOT NULL)));



CREATE POLICY "Allow insert for leaders and admins" ON "public"."tasks" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."members" "m"
     JOIN "public"."roles" "r" ON (("m"."role_id" = "r"."id")))
  WHERE (("m"."user_id" = "auth"."uid"()) AND ("r"."is_leadership" = true)))));



CREATE POLICY "Allow insert on event_assignments for leaders and admins" ON "public"."event_assignments" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."members" "m"
     JOIN "public"."roles" "r" ON (("m"."role_id" = "r"."id")))
  WHERE (("m"."user_id" = "auth"."uid"()) AND ("r"."is_leadership" = true)))));



CREATE POLICY "Allow members to view all non-pending members" ON "public"."members" FOR SELECT TO "authenticated" USING ((("deleted_at" IS NULL) AND (("role_id" <> ( SELECT "roles"."id"
   FROM "public"."roles"
  WHERE ("roles"."name" = 'Pendente'::"text"))) OR ("auth"."uid"() = "user_id"))));



CREATE POLICY "Allow public insert visitors" ON "public"."visitors" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Allow read for authenticated users" ON "public"."page_permissions" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow select for all non-pending members" ON "public"."events" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."members" "m"
  WHERE (("m"."user_id" = "auth"."uid"()) AND ("m"."role_id" <> ( SELECT "roles"."id"
           FROM "public"."roles"
          WHERE ("roles"."name" = 'Pendente'::"text")))))));



CREATE POLICY "Allow update for authenticated non-pending members" ON "public"."members" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow update for leaders and admins" ON "public"."tasks" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."members" "m"
     JOIN "public"."roles" "r" ON (("m"."role_id" = "r"."id")))
  WHERE (("m"."user_id" = "auth"."uid"()) AND ("r"."is_leadership" = true))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."members" "m"
     JOIN "public"."roles" "r" ON (("m"."role_id" = "r"."id")))
  WHERE (("m"."user_id" = "auth"."uid"()) AND ("r"."is_leadership" = true)))));



CREATE POLICY "Allow update on event_assignments for non-pending members" ON "public"."event_assignments" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."members" "m"
  WHERE (("m"."user_id" = "auth"."uid"()) AND ("m"."role_id" <> ( SELECT "roles"."id"
           FROM "public"."roles"
          WHERE ("roles"."name" = 'Pendente'::"text"))))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."members" "m"
  WHERE (("m"."user_id" = "auth"."uid"()) AND ("m"."role_id" <> ( SELECT "roles"."id"
           FROM "public"."roles"
          WHERE ("roles"."name" = 'Pendente'::"text")))))));



CREATE POLICY "Allow view on event_assignments for non-pending members" ON "public"."event_assignments" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."members" "m"
  WHERE (("m"."user_id" = "auth"."uid"()) AND ("m"."role_id" <> ( SELECT "roles"."id"
           FROM "public"."roles"
          WHERE ("roles"."name" = 'Pendente'::"text")))))));



CREATE POLICY "Allow view on tasks for non-pending members" ON "public"."tasks" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."members" "m"
  WHERE (("m"."user_id" = "auth"."uid"()) AND ("m"."role_id" <> ( SELECT "roles"."id"
           FROM "public"."roles"
          WHERE ("roles"."name" = 'Pendente'::"text")))))));



CREATE POLICY "Anyone can view categories" ON "public"."post_categories" FOR SELECT USING (true);



CREATE POLICY "Anyone can view published posts" ON "public"."posts" FOR SELECT USING (((("status")::"text" = 'published'::"text") OR ("auth"."uid"() IS NOT NULL)));



CREATE POLICY "Authenticated users can insert audit logs" ON "public"."audit_logs" FOR INSERT TO "authenticated" WITH CHECK (true);



COMMENT ON POLICY "Authenticated users can insert audit logs" ON "public"."audit_logs" IS 'Permite que usuários autenticados insiram logs de auditoria. Logs são rastreáveis via user_id.';



CREATE POLICY "Authenticated users can read audit logs" ON "public"."audit_logs" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users podem atualizar roles" ON "public"."roles" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users podem atualizar sectors" ON "public"."sectors" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users podem deletar roles" ON "public"."roles" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users podem deletar sectors" ON "public"."sectors" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users podem inserir roles" ON "public"."roles" FOR INSERT TO "authenticated" WITH CHECK (true);



COMMENT ON POLICY "Authenticated users podem inserir roles" ON "public"."roles" IS 'Permite que usuários autenticados criem roles - verificação de admin feita na aplicação';



CREATE POLICY "Authenticated users podem inserir sectors" ON "public"."sectors" FOR INSERT TO "authenticated" WITH CHECK (true);



COMMENT ON POLICY "Authenticated users podem inserir sectors" ON "public"."sectors" IS 'Permite que usuários autenticados criem setores - verificação de admin feita na aplicação';



CREATE POLICY "Authorized users can insert posts" ON "public"."posts" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."members" "m"
     JOIN "public"."roles" "r" ON (("m"."role_id" = "r"."id")))
  WHERE (("m"."user_id" = "auth"."uid"()) AND (("r"."name" = 'Admin'::"text") OR ("r"."name" = 'Pastor(a)'::"text"))))));



CREATE POLICY "Authors and admins can update posts" ON "public"."posts" FOR UPDATE TO "authenticated" USING ((("author_id" = ( SELECT "members"."id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"()))) OR (EXISTS ( SELECT 1
   FROM ("public"."members" "m"
     JOIN "public"."roles" "r" ON (("m"."role_id" = "r"."id")))
  WHERE (("m"."user_id" = "auth"."uid"()) AND ("r"."name" = 'Admin'::"text")))))) WITH CHECK ((("author_id" = ( SELECT "members"."id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"()))) OR (EXISTS ( SELECT 1
   FROM ("public"."members" "m"
     JOIN "public"."roles" "r" ON (("m"."role_id" = "r"."id")))
  WHERE (("m"."user_id" = "auth"."uid"()) AND ("r"."name" = 'Admin'::"text"))))));



CREATE POLICY "Authors can view their own posts" ON "public"."posts" FOR SELECT USING (("author_id" IN ( SELECT "members"."id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Enable read access for all users" ON "public"."members" FOR SELECT USING (true);



CREATE POLICY "Only service role can delete audit logs" ON "public"."audit_logs" FOR DELETE TO "service_role" USING (true);



CREATE POLICY "Only service role can update audit logs" ON "public"."audit_logs" FOR UPDATE TO "service_role" WITH CHECK (true);



CREATE POLICY "Roles são visíveis para todos" ON "public"."roles" FOR SELECT USING (true);



CREATE POLICY "Sectors são visíveis para todos" ON "public"."sectors" FOR SELECT USING (true);



ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."event_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."message" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."page_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."post_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sectors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."visitors" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."create_default_assignments_for_new_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_default_assignments_for_new_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_default_assignments_for_new_event"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."verify_user_password"("password" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."verify_user_password"("password" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."verify_user_password"("password" "text") TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."event_assignments" TO "anon";
GRANT ALL ON TABLE "public"."event_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."event_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."member_sectors" TO "anon";
GRANT ALL ON TABLE "public"."member_sectors" TO "authenticated";
GRANT ALL ON TABLE "public"."member_sectors" TO "service_role";



GRANT ALL ON TABLE "public"."members" TO "anon";
GRANT ALL ON TABLE "public"."members" TO "authenticated";
GRANT ALL ON TABLE "public"."members" TO "service_role";



GRANT ALL ON TABLE "public"."message" TO "anon";
GRANT ALL ON TABLE "public"."message" TO "authenticated";
GRANT ALL ON TABLE "public"."message" TO "service_role";



GRANT ALL ON TABLE "public"."page_permissions" TO "anon";
GRANT ALL ON TABLE "public"."page_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."page_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."post_categories" TO "anon";
GRANT ALL ON TABLE "public"."post_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."post_categories" TO "service_role";



GRANT ALL ON TABLE "public"."posts" TO "anon";
GRANT ALL ON TABLE "public"."posts" TO "authenticated";
GRANT ALL ON TABLE "public"."posts" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON TABLE "public"."sectors" TO "anon";
GRANT ALL ON TABLE "public"."sectors" TO "authenticated";
GRANT ALL ON TABLE "public"."sectors" TO "service_role";



GRANT ALL ON TABLE "public"."tasks" TO "anon";
GRANT ALL ON TABLE "public"."tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."tasks" TO "service_role";



GRANT ALL ON TABLE "public"."visitors" TO "anon";
GRANT ALL ON TABLE "public"."visitors" TO "authenticated";
GRANT ALL ON TABLE "public"."visitors" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






