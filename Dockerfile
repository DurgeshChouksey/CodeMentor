# Use Node LTS
FROM node:20-slim

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

WORKDIR /app

# Install OS deps required by Prisma
RUN apt-get update \
    && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json first
COPY package*.json ./

# Install deps
RUN npm install

# Copy entire project
COPY . .

# Generate Prisma client (Database URL will come from Cloud Run env vars)
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Start server
CMD ["node", "dist/server.js"]



