# Etapa 1: Construção da aplicação
FROM node:20.17.0 AS builder

# Defina o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copie o package.json e o package-lock.json
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie todo o código da aplicação
COPY . .

# Compile a aplicação
RUN npm run build

# Etapa 2: Container de execução
FROM node:20.17.0

# Defina o diretório de trabalho para a aplicação
WORKDIR /usr/src/app

# Copie apenas os arquivos necessários da etapa de construção
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./

# Exponha a porta que o NestJS usará
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "start:prod"]
