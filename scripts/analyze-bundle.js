const { execSync } = require('child_process');

console.log('🔍 Bundle analizi başlatılıyor...');

try {
  // Bundle boyutunu analiz et
  execSync('npx @next/bundle-analyzer', { stdio: 'inherit' });
  
  console.log('✅ Bundle analizi tamamlandı!');
} catch (error) {
  console.error('❌ Bundle analizi hatası:', error.message);
}
