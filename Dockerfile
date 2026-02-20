FROM node:20-alpine

WORKDIR /app

# Instalar dependências
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código fonte
COPY . .

EXPOSE 3000

# Iniciar em modo desenvolvimento
CMD ["npm", "run", "dev"]
