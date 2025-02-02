# Step 1: Use a Node.js image to build the React app
FROM node:20-alpine AS builder

# # Set working directory inside the container
WORKDIR /


# # Copy package.json and package-lock.json to install dependencies
COPY . .

# # Build the React app for production
RUN npm install


RUN npm run build

# Stage 2: Serve with a lightweight HTTP server
FROM nginx:alpine
# # Copy the build output to Caddy's web root
COPY --from=builder /build /usr/share/nginx/html

# Add custom Nginx configuration
COPY /nginx/nginx.conf /etc/nginx/conf.d/default.conf

# # Expose port 80 for HTTP traffic
EXPOSE 80