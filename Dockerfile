FROM node:20-alpine

WORKDIR /app

# Instalar dependências
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código fonte
COPY . .

# Tornar o entrypoint executável
RUN chmod +x scripts/entrypoint.sh

EXPOSE 3000

# Entrypoint: executa migrations, seed e inicia o servidor
CMD ["sh", "scripts/entrypoint.sh"]
