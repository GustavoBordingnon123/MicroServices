# Usa uma imagem base do Node.js
FROM node:18

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos do projeto para o contêiner
COPY package*.json ./
COPY prisma ./prisma

# Instala as dependências
RUN npm install

# Gera o cliente Prisma
RUN npx prisma generate

# Copia o restante do código do projeto
COPY . .

# Expõe a porta do serviço
EXPOSE 3002

# Comando para iniciar o serviço
CMD ["node", "src/app.js"]
