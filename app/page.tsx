import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrapper } from "@/components/wrapper";

export default function Home() {
  return (
    <Wrapper>
      <Navigation />
      
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Runy</h1>
          <p className="text-xl text-muted-foreground mt-2">
            Sistema de Gerenciamento de Atletas e Treinos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Atletas</CardTitle>
              <CardDescription>
                Gerencie o cadastro de atletas, informações pessoais e acompanhamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                • Crie e edite fichas de atletas<br/>
                • Acompanhe dados pessoais<br/>
                • Visualize histórico de treinos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Treinos</CardTitle>
              <CardDescription>
                Controle o planejamento e execução dos treinos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                • Cadastre treinos personalizados<br/>
                • Vincule treinos aos atletas<br/>
                • Acompanhe intensidade e duração
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Wrapper>
  );
}
