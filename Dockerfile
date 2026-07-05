# Use the official Node.js image.
FROM node:20-slim

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy local code to the container image.
COPY . .

# Build the application (runs vite build and esbuild)
RUN npm run build

# Set environment variable for production
ENV NODE_ENV=production

# Expose port 8080 so Cloud Run knows where to send traffic
EXPOSE 8080

# Run the web service on container startup.
CMD [ "npm", "start" ]
