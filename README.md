# 🏃 Runy — Sistema de Gestão de Atletas e Treinos

Aplicação web desenvolvida como solução para o desafio técnico da Runy.

O sistema permite o gerenciamento completo de Atletas e seus respectivos Treinos, com persistência relacional, validações robustas, análise de insights e acompanhamento de metas semanais. Arquitetura com separação clara de responsabilidades e tipagem end-to-end.

---

## 🚀 Como Iniciar

### Pré-requisitos
- Docker e Docker Compose instalados

### Passo a Passo
```bash
# 1. Copiar arquivo de ambiente (ou renomear .env.example para .env)
cp .env.example .env

# 2. Iniciar aplicação + banco (build + migrate + seed + start)
npm run docker:build-up
```

A aplicação estará disponível em: [http://localhost:3000](http://localhost:3000)

> O entrypoint executa automaticamente as migrations e o seed ao iniciar o container. Nenhum passo manual é necessário.

### Comandos Úteis
```bash
npm run docker:logs      # Ver logs de todos os serviços
npm run docker:down      # Parar e remover containers
npm run docker:restart   # Reiniciar os serviços
```

---

## 🧱 Stack Utilizada

### Frontend

- **Next.js 15.1.6** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** + Radix UI
- **React Hook Form** + **Zod**
- **Recharts** (visualização de dados)
- **next-themes** (alternância dark/light)
- **date-fns** (formatação de datas com locale pt-BR)
- **Lucide React** (ícones)

### Backend

- **tRPC 11** (type-safe API)
- **Zod** (validação de entrada)
- **Node.js**
- **superjson** (serialização do tRPC)

### Banco de Dados

- **PostgreSQL 15**
- **Drizzle ORM**

### Qualidade

- **ESLint**
- **Vitest** (testes unitários)

### DevOps

- **Docker** + **Docker Compose**
- Entrypoint com migrations e seed automático

---

## 🏗 Arquitetura do Projeto

O projeto foi estruturado com separação explícita entre camadas:

```
Frontend → Interface, formulários, estados e chamadas tRPC
Backend  → Routers tRPC, validações Zod e regras de negócio
Shared   → Tipos, schemas e constantes compartilhadas
DB       → Schemas e migrations isoladas com Drizzle
```

O frontend não acessa diretamente o banco de dados, garantindo encapsulamento da lógica de negócio.

### Padrão de Boundary

- **tRPC** define a fronteira entre frontend e backend
- **Zod schemas** são compartilhados e validam dados em ambas as camadas
- **Tipos TypeScript** são inferidos dos schemas e do banco de dados

---

## 📂 Estrutura de Pastas

```
├── app/                        # App Router (pages/layouts)
│   ├── api/trpc/               # Handler da API tRPC
│   ├── atletas/                # Páginas de gestão de atletas
│   │   └── [id]/insights/      # Tela de insights do atleta
│   └── treinos/                # Páginas de gestão de treinos
├── components/                 # Componentes reutilizáveis
│   ├── ui/                     # Componentes base (shadcn/ui)
│   └── features/               # Componentes de domínio
│       ├── athletes/           # Componentes de atletas e insights
│       └── trainings/          # Componentes de treinos
├── hooks/                      # Hooks personalizados
│   ├── athletes/               # Hooks específicos de atletas
│   └── use-toast.ts
├── lib/                        # Utilitários compartilhados
│   ├── trpc-client.ts
│   └── utils.ts
├── scripts/                    # Scripts utilitários (seed, entrypoint)
├── server/
│   ├── db/
│   │   ├── index.ts
│   │   ├── schema/             # Tabelas, enums e relações
│   │   └── migrations/
│   └── trpc/
│       ├── routers/
│       │   ├── athlete.router.ts
│       │   └── training.router.ts
│       ├── services/           # Lógica de negócio (insights)
│       ├── errors/             # Tratamento padronizado de erros
│       └── trpc.ts
└── shared/                     # Código compartilhado entre frontend e backend
    ├── schemas/                # Zod schemas de validação
    ├── types/                  # TypeScript types
    │   ├── domain/             # Tipos de domínio
    │   ├── forms/              # Tipos de formulários
    │   ├── hooks/              # Tipos de hooks
    │   └── ui/                 # Tipos de UI
    └── constants/              # Constantes da aplicação
```

Separação clara por domínio no backend (`athleteRouter`, `trainingRouter`) e services isolados (`InsightsService`).

---

## 📊 Modelagem de Dados

### Athlete

| Campo         | Tipo                                          |
|---------------|-----------------------------------------------|
| `id`          | integer, identity, PK                         |
| `name`        | varchar(255), NOT NULL                        |
| `email`       | varchar(255), NOT NULL, UNIQUE                |
| `dateOfBirth` | date, NOT NULL                                |
| `createdAt`   | timestamp with timezone, NOT NULL             |
| `updatedAt`   | timestamp with timezone, NOT NULL             |
| `deletedAt`   | timestamp with timezone, nullable (soft delete) |

### Training

| Campo             | Tipo                                          |
|-------------------|-----------------------------------------------|
| `id`              | integer, identity, PK                         |
| `athleteId`       | integer, FK → athletes.id (ON DELETE CASCADE) |
| `type`            | varchar(100), NOT NULL                        |
| `durationMinutes` | integer, NOT NULL                             |
| `intensity`       | enum (low, moderate, high), NOT NULL          |
| `notes`           | text, nullable                                |
| `createdAt`       | timestamp with timezone, NOT NULL             |
| `updatedAt`       | timestamp with timezone, NOT NULL             |
| `deletedAt`       | timestamp with timezone, nullable (soft delete) |

### Relacionamento

- **Athlete 1:N Training**
- Integridade garantida via foreign key no PostgreSQL com `ON DELETE CASCADE`
- Ambas as tabelas utilizam `deletedAt` para soft delete — os dados históricos são preservados

---

## 🔌 API (tRPC)

Routers organizados por domínio:

### `athleteRouter`

| Procedure      | Tipo     | Descrição                                        |
|----------------|----------|--------------------------------------------------|
| `getById`      | query    | Busca atleta por ID, independente do status      |
| `create`       | mutation | Cadastro com validação Zod                       |
| `list`         | query    | Listagem paginada (`page`, `limit`, `includeDeleted`) |
| `update`       | mutation | Edição — bloqueado se atleta estiver inativo     |
| `delete`       | mutation | Soft delete                                      |
| `reactivate`   | mutation | Reativação de atleta inativo                     |
| `getInsights`  | query    | Análise de desempenho e padrões de treinamento   |

### `trainingRouter`

| Procedure       | Tipo     | Descrição                                             |
|-----------------|----------|-------------------------------------------------------|
| `getById`       | query    | Busca treino por ID, independente do status           |
| `create`        | mutation | Criação — bloqueado se atleta estiver inativo         |
| `listByAthlete` | query    | Listagem paginada por atleta, com `includeDeleted`    |
| `update`        | mutation | Edição — bloqueado se treino ou atleta estiver inativo|
| `delete`        | mutation | Soft delete                                           |
| `reactivate`    | mutation | Reativação — bloqueado se atleta estiver inativo      |

Todos os inputs são validados com Zod antes da execução.

---

## 📈 Tela de Insights do Atleta

### Visão Geral

A tela de insights oferece análise avançada dos padrões de treinamento do atleta, com visualizações, métricas calculadas e recomendações personalizadas.

### Funcionalidades Principais

#### 1. **Filtros Dinâmicos**
- **Período**: 7, 30, 90 dias ou customizado
- **Comparação**: Compara período atual com período anterior equivalente
- **Intensidade**: Filtra por baixa, moderada ou alta intensidade
- **Tipo de Treino**: Filtra por tipo específico de atividade

#### 2. **KPIs Principais**
- Total de treinos no período
- Total de minutos de treinamento
- Carga total (durationMinutes × intensityWeight)
- Monotonia (carga média / desvio padrão da carga)
- Frequência semanal média
- Deltas percentuais quando comparação está ativa

#### 3. **Distribuições Visuais**
- **Por tipo de treino**: gráfico de pizza mostrando distribuição percentual
- **Por intensidade**: gráfico de pizza com distribuição de intensidades

#### 4. **Série Temporal**
- Gráfico de linha mostrando evolução semanal de:
  - Carga de treino
  - Minutos totais
  - Número de treinos

#### 5. **Insights Automáticos**
Sistema detecta automaticamente padrões e gera insights:

- **Monotonia**: Detecta quando treinos são muito similares (desvio padrão baixo)
- **Spikes**: Identifica aumentos bruscos de carga (>30% em uma semana)
- **Tendências**: Analisa se o atleta está aumentando, mantendo ou reduzindo volume
- **Consistência**: Avalia regularidade e frequência dos treinos

Cada insight tem:
- **Severidade**: info, warning ou critical
- **Título e descrição**: explicação clara do padrão detectado
- **Evidência**: dados concretos que sustentam o insight

#### 6. **Highlights**
Destaca os treinos mais relevantes:
- Maior carga
- Maior duração
- Maior intensidade

#### 7. **Metas Semanais** (Diferencial)
Sistema de definição e acompanhamento de metas:
- Define meta de **minutos por semana**
- Define meta de **treinos por semana**
- Persistência por atleta em **localStorage** (sem necessidade de banco de dados)
- Barra de progresso visual em tempo real baseada na semana atual
- Progresso calculado automaticamente dos treinos da semana ISO
- Edição rápida inline com validação
- Badge com data de início da semana atual

**Validações das Metas:**
- Minutos: 0 a 2000 por semana
- Treinos: 0 a 14 por semana

**Implementação:**
- Hook `useAthleteGoals(athleteId)` para gerenciamento de estado
- Cálculo da semana ISO compatível com backend (segunda-feira)
- Progresso baseado em `timeSeries` do backend (já inclui `trainingCount`)

#### 8. **Recomendações Não-Médicas** (Diferencial)
Sugestões baseadas em regras simples e explicáveis:

- **Spike detectado** → Sugere reduzir variação na próxima semana
- **Monotonia alta** → Sugere variar tipo/intensidade
- **Tendência decrescente** → Sugere revisar frequência
- **Boa consistência** → Reforço positivo
- **Padrão estável** → Mantém consistência e monitoramento

**Implementação:**
- Análise automática dos insights gerados pelo backend
- Máximo de 3 recomendações visíveis
- Texto educacional sobre natureza não-médica
- Resposta instantânea aos filtros (frontend-only)

**Importante:** Não constitui aconselhamento médico. São apenas sugestões educacionais baseadas em padrões comuns.

#### 9. **KPIs com Delta Visual** (Melhoria)
Indicadores principais com variação visual:

- **Delta visual**: ↑ (positivo), ↓ (negativo), → (neutro)
- **Percentual de variação** quando compare=true
- **Microcopy explicativa** em title para "Carga Total"
- **Cores semânticas**: verde para positivo, vermelho para negativo

**Fórmula da Carga:**
```typescript
Carga = duração (min) × intensidade (score)
```

### Cálculos Implementados

#### Pesos de Intensidade
```typescript
low: 1.0
moderate: 1.5
high: 2.0
```

#### Carga de Treino
```typescript
load = durationMinutes × intensityWeight
```

#### Monotonia
```typescript
monotony = averageLoad / stdDevLoad
```

Interpretação:
- `< 1.5`: Variação saudável
- `1.5 - 2.0`: Atenção
- `> 2.0`: Monotonia alta (risco)

#### Spike Detection
```typescript
spike = (currentWeekLoad - previousWeekLoad) / previousWeekLoad > 0.30
```

Aumentos acima de 30% em uma semana são sinalizados.

#### Trend Analysis
```typescript
trend = linearRegression(weeklyLoads)
```

Classifica como: UP (crescente), DOWN (decrescente) ou STABLE (estável).

---

## 🎨 UX Implementada

### Gestão de Atletas
- Listagem paginada de atletas com filtro de ativos/inativos
- CRUD completo de atletas
- Modal de detalhes do atleta
- Soft delete e reativação
- Confirmação antes de exclusão (AlertDialog)

### Gestão de Treinos
- CRUD de treinos vinculados a atleta
- Listagem filtrada por atleta
- Validação de atleta ativo antes de criar/editar treinos
- Soft delete e reativação

### Insights e Análise
- Dashboard completo de insights
- Filtros dinâmicos com atualização em tempo real
- Gráficos interativos (Recharts)
- Sistema de metas pessoais com localStorage
- Recomendações contextuais

### Estados e Feedback
- Loading skeletons em todas as operações assíncronas
- Empty states com ações sugeridas
- Error states com botão de retry
- Toasts de sucesso/erro
- Validação de formulários em tempo real

### Tema e Responsividade
- Alternância de tema dark/light
- Layout responsivo (mobile-first)
- Acessibilidade com componentes Radix UI

---

## 🌱 Seed

O banco é populado automaticamente ao iniciar via Docker. O seed é **idempotente** — se o banco já possuir dados, a execução é ignorada.

Dados criados:

- **5 atletas** com perfis variados
  - Corredor amador
  - Ciclista profissional
  - Triatleta
  - Nadador
  - Maratonista
  
- **25 treinos distribuídos** ao longo de 12 semanas
  - Variação de tipos (Corrida, Natação, Ciclismo, Musculação, etc.)
  - Variação de intensidades (low, moderate, high)
  - Distribuição que permite análise de monotonia, spikes e tendências

Para executar manualmente:

```bash
npm run db:seed
```

---

## ⚖️ Decisões Técnicas

### tRPC em vez de REST

- Elimina duplicação de contratos entre frontend e backend
- Tipagem end-to-end sem geração de código adicional
- Melhor DX com autocomplete e erros em tempo de desenvolvimento
- Serialização automática com superjson (Date, Map, Set, etc.)

### Drizzle ORM

- Controle explícito do schema em TypeScript
- Tipagem forte inferida diretamente das tabelas
- Simplicidade sem abstrações excessivas
- Migrations SQL geradas automaticamente

### Soft Delete Implementado

- Preserva histórico de dados ao desativar atletas e treinos
- Regras de domínio aplicadas nos routers
- Atletas inativos bloqueiam criação, edição e reativação de treinos
- `deletedAt` nullable em ambas as tabelas

### Zod Schemas Compartilhados

- Mesmos schemas utilizados no frontend (validação de formulários) e no backend (validação de input tRPC)
- Única fonte de verdade para regras de validação, sem duplicação
- Inferência de tipos TypeScript a partir dos schemas

### Paginação Offset-based

- Simples e suficiente para o escopo atual
- Evoluível para cursor-based em produção

### InsightsService Isolado

- Lógica de análise separada do router
- Testável independentemente
- Responsabilidades bem definidas
- Facilita evolução e manutenção

### Metas em localStorage

- Não requer modelagem de banco de dados adicional
- Persistência por atleta (key: `runy:athlete-goals:{athleteId}`)
- SSR-safe (só acessa localStorage no client)
- Performance instantânea

### Recomendações no Frontend

- Regras simples e determinísticas
- Não requer processamento no servidor
- Responde instantaneamente aos filtros
- Fácil de ajustar e iterar

---

## 📦 Scripts Disponíveis

### Docker (recomendado)
```bash
npm run docker:build       # Build dos containers
npm run docker:up          # Iniciar containers
npm run docker:build-up    # Build + iniciar containers (comando principal)
npm run docker:down        # Parar e remover containers
npm run docker:down-clear  # Parar, remover containers e volumes
npm run docker:stop        # Parar containers
npm run docker:start       # Iniciar containers
npm run docker:restart     # Reiniciar os serviços
npm run docker:logs        # Ver logs de todos os serviços
npm run docker:logs:app    # Logs apenas da aplicação
npm run docker:logs:db     # Logs apenas do banco
```

### Desenvolvimento Local
```bash
npm run dev                # Servidor Next.js desenvolvimento
npm run build              # Build para produção
npm run start              # Iniciar app em modo produção
npm run lint               # Verificar código com ESLint
npm run test               # Executar testes com Vitest
```

### Banco de Dados
```bash
npm run db:generate        # Gerar migrations com Drizzle
npm run db:migrate         # Executar migrations no banco
npm run db:seed            # Popular banco com dados iniciais
```

---

## 🧪 Testes

O projeto utiliza Vitest para testes unitários.

### Executar testes
```bash
npm run test              # Roda todos os testes
npm run test:watch        # Modo watch
npm run test:coverage     # Cobertura de código
```

### Testes Implementados
- Validação de schemas Zod
- Cálculos de insights (monotonia, spikes, tendências)
- Utilitários compartilhados

---

## 🔮 Melhorias Futuras

### Funcionalidades
- Autenticação e controle de acesso por perfil (atleta, treinador, admin)
- Dashboard analítico comparativo entre atletas
- Exportação de relatórios (PDF/CSV)
- Sistema de notificações (e-mail/push)
- Metas de longo prazo (mensais, anuais)
- Integração com dispositivos wearables (Garmin, Strava, etc.)

### Técnicas
- Testes de integração e E2E (Playwright)
- Cursor-based pagination para grandes volumes
- Rate limiting e throttling
- Observabilidade (OpenTelemetry, Sentry)
- CI/CD com GitHub Actions
- Deploy em cloud (Vercel + Neon/Supabase)
- Caching com Redis
- Background jobs para processamento pesado

### Análise
- Machine learning para predição de performance
- Detecção de overtraining com IA
- Sugestões personalizadas de treino
- Análise de correlação (sono, nutrição, performance)

---

## 📖 Variáveis de Ambiente

O arquivo `.env.example` contém todas as variáveis necessárias. Para uso local, copie e ajuste:

```bash
cp .env.example .env
```

### Variáveis principais:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/runy

# Node
NODE_ENV=development
```

Para Docker, as variáveis já estão configuradas no `docker-compose.yml`.

---

## 🐳 Docker

### Arquitetura

- **app**: Container Next.js (porta 3000)
- **db**: Container PostgreSQL 15 (porta 5432)
- Volume persistente para dados do banco

### Entrypoint Automático

O script `scripts/entrypoint.sh` executa na ordem:

1. Aguarda banco estar disponível
2. Executa migrations (`npm run db:migrate`)
3. Executa seed se banco estiver vazio
4. Inicia aplicação Next.js

### Healthcheck

O container da aplicação tem healthcheck configurado:
- Verifica resposta na porta 3000
- Intervalo de 30 segundos

---

## ✅ Critérios do Desafio Atendidos

### Requisitos Base
- ✅ Separação clara de responsabilidades (frontend / backend / shared)
- ✅ Tipagem forte end-to-end (TypeScript + tRPC)
- ✅ Validação robusta (Zod schemas compartilhados)
- ✅ CRUD completo de atletas e treinos
- ✅ Relacionamento 1:N entre Athlete e Training
- ✅ Soft delete com preservação de histórico
- ✅ Setup via Docker (aplicação + banco)
- ✅ UX consistente com estados de loading, erro e vazio

### Diferenciais Implementados
- ✅ **Insights avançados** com análise de monotonia, spikes e tendências
- ✅ **Sistema de metas semanais** com localStorage e progresso visual
- ✅ **Recomendações não-médicas** baseadas em padrões detectados
- ✅ **Filtros dinâmicos** (período, comparação, intensidade, tipo)
- ✅ **Visualizações gráficas** com Recharts (pizza, linha, série temporal)
- ✅ **Highlights automáticos** dos treinos mais relevantes
- ✅ **Distribuições estatísticas** por tipo e intensidade
- ✅ **Cálculos científicos** (carga, monotonia, spikes)
- ✅ **Documentação completa** com decisões técnicas e trade-offs

---

## 🎯 Trade-offs Documentados

### Metas em localStorage vs Banco de Dados

**Decisão:** localStorage

**Prós:**
- Zero impacto no banco e no backend
- Performance instantânea
- Simplicidade de implementação
- Fácil de testar e debugar

**Contras:**
- Não sincroniza entre dispositivos
- Limitado ao browser

**Justificativa:** Para MVP, a simplicidade e velocidade de implementação justificam. Em produção, migraria para o banco com sincronização.

### Recomendações no Frontend vs Backend

**Decisão:** Frontend

**Prós:**
- Resposta instantânea aos filtros
- Não sobrecarrega o servidor
- Mais fácil de iterar e ajustar regras

**Contras:**
- Lógica exposta no cliente
- Não reutilizável fora do navegador

**Justificativa:** Regras são simples e determinísticas. Se evoluírem para ML, migrar para o backend.

### Offset vs Cursor Pagination

**Decisão:** Offset

**Prós:**
- Implementação simples
- Adequado para volumes pequenos/médios
- Permite "pular" para qualquer página

**Contras:**
- Performance degrada em tabelas grandes
- Inconsistências com inserções simultâneas

**Justificativa:** Para o escopo atual (centenas de registros), offset é suficiente e mais simples.

### Cálculo de Insights Síncrono vs Background Job

**Decisão:** Síncrono no request

**Prós:**
- Sempre atualizado em tempo real
- Não requer infraestrutura adicional
- Simplicidade de debugging

**Contras:**
- Request pode demorar mais
- Recalcula a cada chamada

**Justificativa:** Com queries otimizadas, o cálculo é rápido (<100ms). Em produção com milhares de treinos, usar cache + background jobs.

---

## 👨‍💻 Autor

**Lucas Parreiras Romanelli Bueno**

- 📧 Email: [lucaspbueno22@gmail.com](mailto:lucaspbueno22@gmail.com)
- 💼 LinkedIn: [linkedin.com/in/lucas-parreiras-romanelli-bueno](https://www.linkedin.com/in/lucas-parreiras-romanelli-bueno/)

Desenvolvido com ❤️ usando tecnologias modernas e melhores práticas de desenvolvimento.

---

## 📄 Licença

Este projeto foi desenvolvido como parte de um desafio técnico e é de propriedade intelectual do autor.