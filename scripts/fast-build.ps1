# Fast Docker build script with optimizations for Windows

Write-Host "🚀 Starting optimized Docker build..." -ForegroundColor Green

# Enable BuildKit for faster builds
$env:DOCKER_BUILDKIT = 1

# Build with cache mount and parallel processing
docker build `
  --build-arg BUILDKIT_INLINE_CACHE=1 `
  --progress=plain `
  --tag borclu-sorgulama:latest `
  --file Dockerfile `
  .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build completed!" -ForegroundColor Green
    
    # Optional: Start the container immediately
    $start = Read-Host "Start the container now? (y/N)"
    if ($start -eq "y" -or $start -eq "Y") {
        Write-Host "🏃 Starting container..." -ForegroundColor Yellow
        docker-compose up -d
        Write-Host "✅ Container started! Visit http://localhost:3000" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
}