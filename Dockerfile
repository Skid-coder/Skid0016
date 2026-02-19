FROM node:20-alpine

WORKDIR /app

# Install backend dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Install and build frontend
COPY client/package.json client/package-lock.json* ./client/
RUN cd client && npm install
COPY client/ ./client/
RUN cd client && npm run build

# Copy backend
COPY server/ ./server/

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["node", "server/index.js"]
