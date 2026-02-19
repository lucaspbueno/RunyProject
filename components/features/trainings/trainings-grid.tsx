import { TrainingCard } from "./training-card";

interface Athlete {
  id: number;
  name: string;
  email: string;
  dateOfBirth: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface TrainingsGridProps {
  athletes: Athlete[];
}

/**
 * Grid de cards de atletas para página de treinos
 */
export function TrainingsGrid({ athletes }: TrainingsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {athletes.map((athlete) => (
        <TrainingCard key={athlete.id} athlete={athlete} />
      ))}
    </div>
  );
}
