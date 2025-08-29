#!/bin/bash

# Fast Docker build script with optimizations

echo "🚀 Starting optimized Docker build..."

# Enable BuildKit for faster builds
export DOCKER_BUILDKIT=1

# Build with cache mount and parallel processing
docker build \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  --progress=plain \
  --tag borclu-sorgulama:latest \
  --file Dockerfile \
  .

echo "✅ Build completed!"

# Optional: Start the container immediately
read -p "Start the container now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🏃 Starting container..."
    docker-compose up -d
    echo "✅ Container started! Visit http://localhost:3000"
fi