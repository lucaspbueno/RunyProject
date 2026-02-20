import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { calculateAge, formatDateBR } from "@/lib/date";
import Link from "next/link";
import { Calendar, Users, Clock } from "lucide-react";
import type { Athlete } from "@/shared/types";

interface TrainingCardProps {
  athlete: Athlete;
}

/**
 * Card de atleta para visualização na página de treinos
 */
export function TrainingCard({ athlete }: TrainingCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{athlete.name}</CardTitle>
          <Badge variant="secondary">
            {calculateAge(athlete.dateOfBirth)} anos
          </Badge>
        </div>
        <CardDescription className="text-sm">
          {athlete.email}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            Cadastrado em {formatDateBR(athlete.createdAt)}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="mr-2 h-4 w-4" />
            ID: {athlete.id}
          </div>
          
          <Button asChild className="w-full">
            <Link href={`/treinos/atleta/${athlete.id}`}>
              <Clock className="mr-2 h-4 w-4" />
              Ver Treinos
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
