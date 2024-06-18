# Stage 1: Build
FROM node:18-alpine AS builder

# Install dependencies only when needed
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies based on the lock file
RUN npm ci

# Copy the rest of the application code to the working directory
COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

# Build the Next.js application
RUN npm run build

# Stage 2: Serve
FROM node:18-alpine AS runtime

WORKDIR /app

# Copy the build output from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./

# Install only production dependencies
RUN npm install 

# Add a non-root user
RUN adduser -D nextuser
USER nextuser

# Expose the port on which the app will run
EXPOSE 3000

# Start the application
ENV NODE_ENV=production
CMD ["npm", "start"]
