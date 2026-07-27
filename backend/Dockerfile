# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma
RUN npm ci
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY prisma ./prisma
RUN npx prisma generate
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
