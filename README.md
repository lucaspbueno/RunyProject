# 🏃 Runy — Sistema de Gestão de Atletas e Treinos

Aplicação web desenvolvida como solução para o desafio técnico da Runy.

O sistema permite o gerenciamento completo de Atletas e seus respectivos Treinos, com persistência relacional, validações robustas e arquitetura com separação clara de responsabilidades.

---

## 🚀 Como Iniciar

### Pré-requisitos
- Docker e Docker Compose instalados

### Passo a Passo
```bash
# 1. Copiar arquivo de ambiente (Ou então apenas altere o nome do arquivo de .env.example para .env)
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

- **Next.js 16.1.6** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** + Radix UI
- **React Hook Form**
- **next-themes** (alternância dark/light)
- **date-fns** (formatação de datas com locale pt-BR)

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

---

## 🏗 Arquitetura do Projeto

O projeto foi estruturado com separação explícita entre camadas:

```
Frontend → Interface, formulários, estados e chamadas tRPC
Backend  → Routers tRPC, validações Zod e regras de negócio
DB       → Schemas e migrations isoladas com Drizzle
```

O frontend não acessa diretamente o banco de dados, garantindo encapsulamento da lógica de negócio.

---

## 📂 Estrutura de Pastas

```
├── app/                        # App Router (pages/layouts)
│   ├── api/trpc/               # Handler da API tRPC
│   ├── atletas/                # Páginas de gestão de atletas
│   └── treinos/                # Páginas de gestão de treinos
├── components/                 # Componentes reutilizáveis
│   ├── ui/                     # Componentes base (shadcn/ui)
│   └── features/               # Componentes de domínio
│       ├── athletes/
│       └── trainings/
├── hooks/                      # Hooks personalizados
├── lib/                        # Utilitários compartilhados
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
│       ├── errors/             # Tratamento padronizado de erros
│       └── trpc.ts
└── shared/                     # Código compartilhado entre frontend e backend
    ├── schemas/                # Zod schemas de validação
    ├── types/                  # TypeScript types
    └── constants/              # Constantes da aplicação
```

Separação clara por domínio no backend (`athleteRouter`, `trainingRouter`).

---

## 📊 Modelagem de Dados Implementada

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

| Procedure    | Tipo     | Descrição                                        |
|--------------|----------|--------------------------------------------------|
| `getById`    | query    | Busca atleta por ID, independente do status      |
| `create`     | mutation | Cadastro com validação Zod                       |
| `list`       | query    | Listagem paginada (`page`, `limit`, `includeDeleted`) |
| `update`     | mutation | Edição — bloqueado se atleta estiver inativo     |
| `delete`     | mutation | Soft delete                                      |
| `reactivate` | mutation | Reativação de atleta inativo                     |

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

## 🎨 UX Implementada

- Listagem paginada de atletas com filtro de ativos/inativos
- CRUD completo de atletas
- CRUD de treinos vinculados a atleta
- Soft delete e reativação para atletas e treinos
- Modal de detalhes do atleta
- Estados de loading em todas as operações assíncronas
- Estado vazio (empty state) com ação de criação
- Estado de erro com botão de retry
- Toasts de sucesso/erro
- Confirmação antes de exclusão (AlertDialog)
- Alternância de tema dark/light
- Layout responsivo

---

## 🌱 Seed

O banco é populado automaticamente ao iniciar via Docker. O seed é **idempotente** — se o banco já possuir dados, a execução é ignorada.

Dados criados:

- **5 atletas** com perfis variados (corredores de diferentes modalidades)
- **15 treinos** — 3 por atleta, com intensidades variadas (`low`, `moderate`, `high`)

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

### Drizzle ORM

- Controle explícito do schema em TypeScript
- Tipagem forte inferida diretamente das tabelas
- Simplicidade sem abstrações excessivas

### Soft Delete implementado

- Preserva histórico de dados ao desativar atletas e treinos
- Regras de domínio aplicadas nos routers: atletas inativos bloqueiam criação, edição e reativação de treinos

### Zod schemas compartilhados

- Mesmos schemas utilizados no frontend (validação de formulários) e no backend (validação de input tRPC)
- Única fonte de verdade para regras de validação, sem duplicação

### Paginação Offset-based

- Simples e suficiente para o escopo atual
- Evoluível para cursor-based em produção

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
```

### Banco de Dados
```bash
npm run db:generate        # Gerar migrations com Drizzle
npm run db:migrate         # Executar migrations no banco
npm run db:seed            # Popular banco com dados iniciais
```

---

## 🔮 Melhorias Futuras

- Autenticação e controle de acesso por perfil
- Filtros por data e intensidade de treino
- Dashboard analítico de performance
- Testes automatizados (unitários e de integração)
- Observabilidade e logging estruturado
- CI/CD

---

## ✅ Critérios do Desafio Atendidos

- ✅ Separação clara de responsabilidades (frontend / backend / shared)
- ✅ Tipagem forte end-to-end (TypeScript + tRPC)
- ✅ Validação robusta (Zod schemas compartilhados)
- ✅ CRUD completo de atletas e treinos
- ✅ Relacionamento 1:N entre Athlete e Training
- ✅ Soft delete com preservação de histórico
- ✅ Setup via Docker (aplicação + banco)
- ✅ UX consistente com estados de loading, erro e vazio

---

## 👨‍💻 Autor

**Lucas Parreiras Romanelli Bueno**

- 📧 Email: [lucaspbueno22@gmail.com](mailto:lucaspbueno22@gmail.com)
- 💼 LinkedIn: [linkedin.com/in/lucas-parreiras-romanelli-bueno](https://www.linkedin.com/in/lucas-parreiras-romanelli-bueno/)

Desenvolvido com ❤️ usando tecnologias modernas e melhores práticas de desenvolvimento.