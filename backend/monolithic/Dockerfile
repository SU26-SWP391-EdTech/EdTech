FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
#RUN npm ci --only=production
RUN npm install --omit=dev

# Copy source code
COPY . .

# Use Docker-specific env file
COPY .env.docker .env

# Build the NestJS app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start:prod"]
