import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Heart, Building2, CreditCard, QrCode } from 'lucide-react';
import { CopyPixButton } from '@/components/site/CopyPixButton';

export const metadata = {
  title: 'Dízimos e Ofertas | Igreja Viva Esperança',
  description: 'Contribua com a obra de Deus. Conheça as formas de fazer sua doação para a Igreja Viva Esperança.',
};

export default function OfertasPage() {
  const pixKey = 'contato@vivaesperanca.com';
  const bankData = {
    bank: 'Banco do Brasil',
    agency: '1234-5',
    account: '12345-6',
    cnpj: '00.000.000/0001-00',
    name: 'Igreja Viva Esperança',
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-card to-background py-20 mt-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center space-y-4">
            <Heart className="h-16 w-16 mx-auto text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">Dízimos e Ofertas</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sua contribuição nos ajuda a continuar transformando vidas através do evangelho de Cristo.
            </p>
          </div>
        </div>
      </section>

      {/* Bible Verses Section */}
      <section className="w-full py-16 bg-card/50">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">O que a Bíblia diz sobre Generosidade</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Verse 1 */}
            <Card className="bg-card border-primary/20">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2 italic">
                  "Cada um dê conforme determinou em seu coração, não com pesar ou por obrigação,
                  pois Deus ama quem dá com alegria."
                </p>
                <p className="text-xs font-semibold text-primary">2 Coríntios 9:7</p>
              </CardContent>
            </Card>

            {/* Verse 2 */}
            <Card className="bg-card border-primary/20">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2 italic">
                  "Trazei todos os dízimos à casa do tesouro, para que haja mantimento na minha casa,
                  e depois fazei prova de mim, diz o Senhor dos Exércitos."
                </p>
                <p className="text-xs font-semibold text-primary">Malaquias 3:10</p>
              </CardContent>
            </Card>

            {/* Verse 3 */}
            <Card className="bg-card border-primary/20">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2 italic">
                  "Lembrem-se: aquele que semeia pouco, também colherá pouco,
                  e aquele que semeia com fartura, também colherá fartamente."
                </p>
                <p className="text-xs font-semibold text-primary">2 Coríntios 9:6</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Payment Methods Section */}
      <section className="w-full py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Formas de Contribuir</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* PIX Card */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <QrCode className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">PIX</CardTitle>
                    <CardDescription>Forma rápida e segura</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2">Chave PIX (E-mail):</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-4 py-3 rounded-md text-sm font-mono">
                      {pixKey}
                    </code>
                    <CopyPixButton pixKey={pixKey} />
                  </div>
                </div>

                <Separator />

                <div className="bg-white p-4 rounded-lg flex justify-center">
                  <div className="w-48 h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                    <QrCode className="h-24 w-24 text-primary/50" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Escaneie o QR Code acima com seu app de banco para fazer a transferência via PIX
                </p>
              </CardContent>
            </Card>

            {/* Bank Transfer Card */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Transferência Bancária</CardTitle>
                    <CardDescription>TED ou DOC</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm font-semibold">Banco:</span>
                    <span className="text-sm text-muted-foreground">{bankData.bank}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm font-semibold">Agência:</span>
                    <span className="text-sm text-muted-foreground">{bankData.agency}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm font-semibold">Conta Corrente:</span>
                    <span className="text-sm text-muted-foreground">{bankData.account}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm font-semibold">CNPJ:</span>
                    <span className="text-sm text-muted-foreground">{bankData.cnpj}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm font-semibold">Titular:</span>
                    <span className="text-sm text-muted-foreground">{bankData.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* In-Person Card */}
            <Card className="border-2 lg:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <CreditCard className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Oferta Presencial</CardTitle>
                    <CardDescription>Durante os cultos</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Você também pode contribuir presencialmente durante nossos cultos. Há envelopes disponíveis
                  para ofertas e dízimos, e você pode depositá-los nas urnas localizadas na entrada da igreja.
                </p>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-semibold mb-2">Horários dos Cultos:</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Domingo: 10h e 18h</p>
                    <p>• Quarta-feira: 19h30</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Transparency Section */}
      <section className="w-full py-16 bg-card">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-bold mb-6">Transparência e Propósito</h2>
          <p className="text-muted-foreground mb-4">
            Todas as contribuições são utilizadas com responsabilidade e transparência para a manutenção
            da igreja, apoio a projetos sociais, missões e expansão do Reino de Deus.
          </p>
          <p className="text-muted-foreground">
            Acreditamos na prestação de contas e na administração fiel dos recursos confiados a nós.
            Sua generosidade faz a diferença na vida de muitas pessoas!
          </p>

          <div className="mt-8">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <p className="text-lg font-semibold text-primary mb-2">
                  "Deus ama quem dá com alegria"
                </p>
                <p className="text-sm text-muted-foreground">2 Coríntios 9:7</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
