# Build stage
FROM node:18-alpine AS base
WORKDIR /app
RUN npm install -g npm@latest

# API service
FROM base AS api
COPY package.json package-lock.json* ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]

# Worker service  
FROM base AS worker
COPY package.json package-lock.json* ./
RUN npm ci --only=production
COPY . .
CMD ["node", "worker.js"]

# Development
FROM base AS development
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]
