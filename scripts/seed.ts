import { dbScripts } from "@/scripts/scripts.connection";
import { athletes, trainings } from "@/server/db/schema/tables";

/**
 * Script de seed para popular o banco de dados com dados iniciais.
 * É idempotente: se já houver atletas cadastrados, o seed é ignorado.
 *
 * Cada treino está associado a exatamente 1 atleta (1:1 por treino).
 */

// ---------------------------------------------------------------------------
// Dados dos atletas
// ---------------------------------------------------------------------------

const athleteData = [
  {
    name: "Lucas Ferreira",
    email: "lucas.ferreira@runy.com",
    dateOfBirth: new Date("2004-03-15"),
  },
  {
    name: "Ana Beatriz Costa",
    email: "ana.beatriz@runy.com",
    dateOfBirth: new Date("2002-07-22"),
  },
  {
    name: "Carlos Eduardo Mendes",
    email: "carlos.mendes@runy.com",
    dateOfBirth: new Date("1988-11-08"),
  },
  {
    name: "Mariana Oliveira",
    email: "mariana.oliveira@runy.com",
    dateOfBirth: new Date("1997-01-30"),
  },
  {
    name: "Rafael Santos",
    email: "rafael.santos@runy.com",
    dateOfBirth: new Date("1990-05-14"),
  },
];

// ---------------------------------------------------------------------------
// Dados dos treinos — cada treino pertence a exatamente 1 atleta
// ---------------------------------------------------------------------------

function buildTrainings(ids: number[]) {
  const [lucasId, anaId, carlosId, marianaId, rafaelId] = ids;

  return [
    // ── Lucas Ferreira — corredor de longa distância ──────────────────────
    {
      athleteId: lucasId,
      type: "Corrida Contínua",
      durationMinutes: 60,
      intensity: "moderate" as const,
      notes: "Manutenção do ritmo de base em pace constante",
    },
    {
      athleteId: lucasId,
      type: "Intervalado 400m",
      durationMinutes: 45,
      intensity: "high" as const,
      notes: "8 repetições de 400m com intervalo de 90s entre cada",
    },
    {
      athleteId: lucasId,
      type: "Corrida Longa",
      durationMinutes: 90,
      intensity: "low" as const,
      notes: "Corrida de endurance semanal em ritmo confortável",
    },

    // ── Ana Beatriz Costa — corredora em desenvolvimento ──────────────────
    {
      athleteId: anaId,
      type: "Corrida Leve",
      durationMinutes: 30,
      intensity: "low" as const,
      notes: "Foco na respiração e na postura durante toda a corrida",
    },
    {
      athleteId: anaId,
      type: "Fartlek",
      durationMinutes: 40,
      intensity: "moderate" as const,
      notes: "Variações livres de ritmo ao longo do percurso no parque",
    },
    {
      athleteId: anaId,
      type: "Corrida Progressiva",
      durationMinutes: 35,
      intensity: "moderate" as const,
      notes: "Acelerar gradualmente, atingindo ritmo forte nos últimos 10 min",
    },

    // ── Carlos Eduardo Mendes — triatleta ────────────────────────────────
    {
      athleteId: carlosId,
      type: "Corrida Técnica",
      durationMinutes: 50,
      intensity: "moderate" as const,
      notes: "Exercícios de passada, cadência e postura corporal",
    },
    {
      athleteId: carlosId,
      type: "HIIT Corrida",
      durationMinutes: 30,
      intensity: "high" as const,
      notes: "10x100m em velocidade máxima com recuperação total entre séries",
    },
    {
      athleteId: carlosId,
      type: "Corrida de Recuperação",
      durationMinutes: 40,
      intensity: "low" as const,
      notes: "Recuperação ativa no dia seguinte à competição",
    },

    // ── Mariana Oliveira — corredora de trail ────────────────────────────
    {
      athleteId: marianaId,
      type: "Trail Run",
      durationMinutes: 80,
      intensity: "high" as const,
      notes: "Percurso com subidas íngremes e desnível acumulado de 400m",
    },
    {
      athleteId: marianaId,
      type: "Corrida de Base",
      durationMinutes: 55,
      intensity: "low" as const,
      notes: "Volume semanal de base aeróbica em terreno plano",
    },
    {
      athleteId: marianaId,
      type: "Treino de Força em Corrida",
      durationMinutes: 45,
      intensity: "moderate" as const,
      notes: "Fortalecimento muscular combinado com corrida em ritmo moderado",
    },

    // ── Rafael Santos — velocista ─────────────────────────────────────────
    {
      athleteId: rafaelId,
      type: "Treino de Velocidade",
      durationMinutes: 35,
      intensity: "high" as const,
      notes: "6x200m em sprint máximo com recuperação completa entre séries",
    },
    {
      athleteId: rafaelId,
      type: "Corrida Aeróbica",
      durationMinutes: 50,
      intensity: "low" as const,
      notes:
        "Base aeróbica leve para suporte e recuperação do trabalho de sprint",
    },
    {
      athleteId: rafaelId,
      type: "Intervalado Curto",
      durationMinutes: 40,
      intensity: "high" as const,
      notes: "10x100m com foco total na fase de aceleração inicial",
    },
  ];
}

// ---------------------------------------------------------------------------
// Execução principal
// ---------------------------------------------------------------------------

async function seed() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  // Verificar se já existem dados para garantir idempotência
  const existing = await dbScripts.select().from(athletes);

  if (existing.length > 0) {
    console.log(
      `✅ Banco de dados já está populado (${existing.length} atleta(s) encontrado(s)). Seed ignorado.\n`,
    );
    return;
  }

  // ── Inserir atletas ──────────────────────────────────────────────────────
  console.log("👤 Inserindo atletas...");

  const insertedAthletes = await dbScripts
    .insert(athletes)
    .values(athleteData)
    .returning({ id: athletes.id, name: athletes.name });

  insertedAthletes.forEach(({ name, id }) =>
    console.log(`   ✔ ${name} (id: ${id})`),
  );

  // ── Inserir treinos ──────────────────────────────────────────────────────
  console.log("\n🏃 Inserindo treinos...");

  const athleteIds = insertedAthletes.map(({ id }) => id);
  const trainingData = buildTrainings(athleteIds);

  const insertedTrainings = await dbScripts
    .insert(trainings)
    .values(trainingData)
    .returning({
      id: trainings.id,
      type: trainings.type,
      athleteId: trainings.athleteId,
    });

  insertedTrainings.forEach(({ type, id, athleteId }) =>
    console.log(`   ✔ "${type}" (id: ${id}) → atleta id: ${athleteId}`),
  );

  // ── Resumo ───────────────────────────────────────────────────────────────
  console.log(
    `
    ✅ Seed concluído com sucesso!
      • ${insertedAthletes.length} atletas inseridos
      • ${insertedTrainings.length} treinos inseridos (${insertedTrainings.length / insertedAthletes.length} por atleta)
    `
  );

}

seed().catch((err) => {
  console.error("❌ Erro ao executar seed:", err);
  process.exit(1);
});
