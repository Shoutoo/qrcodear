# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy source code and build project
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy built artifacts and production node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Copy legacy static assets and views for rewiring
COPY --from=builder /app/../server/views ./server/views
COPY --from=builder /app/../server/uploads ./server/uploads

EXPOSE 3001

CMD ["node", "dist/main.js"]
