# Use Node LTS
FROM node:20-slim

# Build-time variables
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Required for @xenova/transformers (they use onnx & wasm backends)
RUN apt-get update \
    && apt-get install -y \
       wget \
       unzip \
       ca-certificates \
       libatomic1 \
       build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package.json first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Expose port (Cloud Run will override but safe)
EXPOSE 3000

# Start server
CMD ["node", "dist/server.js"]
