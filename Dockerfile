# ================================
# Étape 1 : Build
# ================================
FROM node:18-alpine AS builder

# Dossier de travail
WORKDIR /app

# Copier package.json
COPY package*.json ./

# Copier prisma
COPY prisma ./prisma/

# Installer les dépendances
RUN npm install

# Copier tout le code
COPY . .

# Générer Prisma Client
RUN npx prisma generate

# Build NestJS
RUN npm run build

# ================================
# Étape 2 : Production
# ================================
FROM node:18-alpine AS production

WORKDIR /app

# Copier depuis builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

# Port
EXPOSE 3000

# Lancer migrations + app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]