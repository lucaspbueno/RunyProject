# Runy Project

Aplicação web moderna para gerenciamento de atletas e treinos, construída com Next.js, TypeScript, tRPC, PostgreSQL e Drizzle ORM.

## 🚀 Stack Utilizada

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: tRPC, Zod (validação)
- **Banco de Dados**: PostgreSQL com Drizzle ORM
- **Containerização**: Docker e Docker Compose
- **Qualidade**: ESLint, Prettier

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Node.js 20+ (para desenvolvimento local)

## 🐳 Executar com Docker (Recomendado)

### Produção
```bash
# Copiar variáveis de ambiente
cp .env.example .env

# Iniciar todos os serviços
docker compose up --build
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000)

### Desenvolvimento
```bash
# Iniciar em modo desenvolvimento com hot reload
npm run docker:dev

# Parar serviços de desenvolvimento
npm run docker:dev-down
```

## 💻 Desenvolvimento Local

### Setup inicial
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Iniciar PostgreSQL (via Docker)
docker run --name runy-postgres -e POSTGRES_DB=runydb -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15-alpine

# Gerar migrations
npm run db:generate

# Rodar migrations
npm run db:migrate

# Iniciar servidor de desenvolvimento
npm run dev
```

### Scripts úteis
```bash
npm run lint          # Verificar código com ESLint
npm run build         # Build para produção
npm run db:generate   # Gerar migrations do Drizzle
npm run db:migrate    # Executar migrations no banco
npm run docker:logs   # Ver logs dos containers Docker
```

## 🏗️ Estrutura do Projeto

```
├── app/                 # Frontend (Next.js App Router)
├── db/                  # Schemas e configurações do Drizzle
│   ├── schema/         # Modelos de dados
│   │   ├── tables/     # Tabelas (athletes, trainings)
│   │   ├── relations/  # Relacionamentos
│   │   └── enums/      # Enums (intensidade)
│   └── migrations/     # Migrations geradas
├── scripts/            # Scripts utilitários
├── Dockerfile          # Imagem para produção
├── Dockerfile.dev      # Imagem para desenvolvimento
├── docker-compose.yml  # Orquestração produção
└── docker-compose.dev.yml # Orquestração desenvolvimento
```

## 🗄️ Modelagem de Dados

### Atletas
- id (PK)
- nome
- email (único)
- data de nascimento
- criado em

### Treinos
- id (PK)
- atletaId (FK)
- tipo de treino
- duração (minutos)
- intensidade (low, moderate, high)
- observações
- criado em

**Relacionamento**: Um atleta pode ter vários treinos (1:N).

## 🐳 Docker Commands

```bash
# Build e start produção
docker compose up --build

# Parar serviços
docker compose down

# Ver logs
docker compose logs -f

# Acessar container da aplicação
docker compose exec app sh

# Acessar banco de dados
docker compose exec db psql -U postgres -d runydb
```

## 🔧 Configuração

As variáveis de ambiente são configuradas via arquivo `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/runydb"
POSTGRES_DB=runydb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
NODE_ENV=development
PORT=3000
```

## 📝 Decisões Técnicas

- **Multi-stage build**: Otimização de imagem Docker reduzindo tamanho final
- **Standalone output**: Next.js configurado para produção em containers
- **Health checks**: PostgreSQL com verificação de saúde antes de iniciar app
- **Non-root user**: Segurança com usuário dedicado no container
- **Volume persistente**: Dados do banco persistem entre reinicializações
- **Wait-for-db script**: Garante conexão com banco antes de iniciar aplicação

## 🚀 Próximos Passos

- [ ] Implementar tRPC routers (athleteRouter, trainingRouter)
- [ ] Criar telas de UI com shadcn/ui
- [ ] Adicionar testes unitários
- [ ] Implementar paginação
- [ ] Adicionar autenticação
- [ ] CI/CD pipeline
