# Stage 1: Build
FROM node:20-alpine AS build

# Set work directory
WORKDIR /app

# Install dependencies with security flags
COPY package*.json ./
RUN npm install --legacy-peer-deps --no-audit

# Copy source code
COPY . .

# Build the application
RUN npm run build -- --configuration production

# Stage 2: Serve
FROM nginx:alpine
# Bust cache to ensure apk upgrade always fetches latest packages (set by CI)
ARG BUILDDATE
RUN apk update && apk upgrade --no-cache

# Create a non-root user for nginx
# Alpine nginx image already has an nginx user, but we'll ensure permissions
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from stage 1
COPY --from=build /app/dist/angular-portfolio/browser /usr/share/nginx/html

# Set ownership to nginx user
RUN chown -R nginx:nginx /usr/share/nginx/html

# Switch to non-root user
USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
