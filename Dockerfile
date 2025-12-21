# Dockerfile otimizado para Next.js 15 (Multi-stage build)

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar dependências instaladas
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Argumentos de build APENAS para variáveis NEXT_PUBLIC_* (embebidas no código)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

# Definir variáveis de ambiente para o build
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build da aplicação
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar package.json e node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copiar arquivos built
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Mudar proprietário dos arquivos
RUN chown -R nextjs:nodejs /app

# Trocar para usuário não-root
USER nextjs

EXPOSE 3000

ENV PORT=3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
