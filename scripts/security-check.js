#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔒 Güvenlik Kontrolü Başlatılıyor...\n')

const issues = []

// 1. .env dosyasını kontrol et
function checkEnvFile() {
  console.log('📋 .env dosyası kontrol ediliyor...')
  
  const envPath = path.join(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) {
    issues.push('❌ .env dosyası bulunamadı!')
    return
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8')
  
  // Boş API key'leri kontrol et
  if (envContent.includes('GEMINI_API_KEY=""') || envContent.includes('GEMINI_API_KEY=')) {
    issues.push('⚠️  GEMINI_API_KEY boş veya eksik')
  }
  
  // Varsayılan secret kontrol et
  if (envContent.includes('this_is_a_temporary_secret')) {
    issues.push('❌ NEXTAUTH_SECRET hala varsayılan değerde!')
  }
  
  // Supabase anahtarları kontrol et
  if (envContent.includes('YOUR_SUPABASE_URL_HERE')) {
    issues.push('⚠️  Supabase URL eksik')
  }
  
  if (envContent.includes('YOUR_SUPABASE_ANON_KEY_HERE')) {
    issues.push('⚠️  Supabase ANON KEY eksik')
  }
  
  console.log('✅ .env dosyası kontrolü tamamlandı')
}

// 2. Hassas dosyaların .gitignore'da olup olmadığını kontrol et
function checkGitignore() {
  console.log('📋 .gitignore kontrolü...')
  
  const gitignorePath = path.join(__dirname, '..', '.gitignore')
  if (!fs.existsSync(gitignorePath)) {
    issues.push('❌ .gitignore dosyası bulunamadı!')
    return
  }
  
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8')
  
  const requiredEntries = ['.env*', '.wwebjs_auth/', '.wwebjs_cache/', '*.pem']
  
  for (const entry of requiredEntries) {
    if (!gitignoreContent.includes(entry)) {
      issues.push(`⚠️  .gitignore'da "${entry}" eksik`)
    }
  }
  
  console.log('✅ .gitignore kontrolü tamamlandı')
}

// 3. Dockerfile güvenlik kontrolü
function checkDockerfile() {
  console.log('📋 Dockerfile güvenlik kontrolü...')
  
  const dockerfilePath = path.join(__dirname, '..', 'Dockerfile')
  if (!fs.existsSync(dockerfilePath)) {
    issues.push('❌ Dockerfile bulunamadı!')
    return
  }
  
  const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8')
  
  // Tehlikeli flagler
  if (dockerfileContent.includes('--accept-data-loss')) {
    issues.push('❌ Dockerfile\'da --accept-data-loss flag\'i kullanılıyor!')
  }
  
  // Root kullanıcı kontrolü
  if (!dockerfileContent.includes('USER nextjs')) {
    issues.push('⚠️  Dockerfile\'da non-root user kullanılmıyor')
  }
  
  console.log('✅ Dockerfile kontrolü tamamlandı')
}

// 4. Package.json bağımlılık kontrolü
function checkDependencies() {
  console.log('📋 Bağımlılık güvenlik kontrolü...')
  
  const packagePath = path.join(__dirname, '..', 'package.json')
  if (!fs.existsSync(packagePath)) {
    issues.push('❌ package.json bulunamadı!')
    return
  }
  
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  const deps = { ...packageContent.dependencies, ...packageContent.devDependencies }
  
  // Bilinen güvenlik riski olan eski sürümler
  const riskPackages = {
    'next': '< 13.0.0',
    'react': '< 17.0.0',
    '@prisma/client': '< 4.0.0'
  }
  
  for (const [pkg, minVersion] of Object.entries(riskPackages)) {
    if (deps[pkg]) {
      console.log(`📦 ${pkg}: ${deps[pkg]}`)
    }
  }
  
  console.log('✅ Bağımlılık kontrolü tamamlandı')
}

// Ana kontrol
async function runSecurityCheck() {
  checkEnvFile()
  checkGitignore()
  checkDockerfile()
  checkDependencies()
  
  console.log('\n' + '='.repeat(50))
  
  if (issues.length === 0) {
    console.log('🎉 Tüm güvenlik kontrolleri başarılı!')
    console.log('✅ Sisteminiz güvenlik açısından hazır görünüyor.')
  } else {
    console.log(`⚠️  ${issues.length} güvenlik sorunu tespit edildi:`)
    issues.forEach(issue => console.log(`  ${issue}`))
    console.log('\n🔧 Lütfen yukarıdaki sorunları düzeltin.')
  }
  
  console.log('\n' + '='.repeat(50))
  return issues.length === 0
}

if (require.main === module) {
  runSecurityCheck()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('❌ Güvenlik kontrolü sırasında hata:', error)
      process.exit(1)
    })
}

module.exports = { runSecurityCheck }
