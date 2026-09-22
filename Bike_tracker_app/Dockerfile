# Build context = repo root
FROM node:20-alpine

WORKDIR /app

# Copy just package files first (for layer caching)
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Now copy the rest
COPY server ./server
COPY public ./public

WORKDIR /app/server
EXPOSE 3000

CMD ["node", "index.js"]