# Build Stage
FROM node:lts-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application and build it
COPY . .
RUN npm run build

# List the contents of /app to confirm build output exists
RUN ls -la /app

# Production Stage
FROM nginx:stable-alpine AS production

# Copy the built app from the build stage into Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Run Nginx in the foreground to keep the container running
CMD ["nginx", "-g", "daemon off;"]