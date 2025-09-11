#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
require('dotenv').config()

// Güvenli environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Eksik environment variables!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Güçlü şifre üretici
function generateStrongPassword() {
  const length = 16
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

// E-posta listesi oluştur
function generateEmailList() {
  const emails = ['obuzhukuk@obuzhukuk.com']
  for (let i = 1; i < 20; i++) {
    emails.push(`obuzhukuk${i}@obuzhukuk.com`)
  }
  return emails
}

async function createUsers() {
  console.log('👥 20 kullanıcı oluşturuluyor...')
  
  const emails = generateEmailList()
  const users = []
  const csvData = ['email,password,status']

  try {
    for (const email of emails) {
      const password = generateStrongPassword()
      
      console.log(`📧 Kullanıcı oluşturuluyor: ${email}`)
      
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true // E-posta doğrulamasını atla (admin tarafından oluşturulan)
      })
      
      if (error) {
        console.error(`❌ Hata (${email}):`, error.message)
        csvData.push(`${email},"[HATA]","${error.message}"`)
        continue
      }
      
      if (data.user) {
        users.push({
          email: email,
          password: password,
          userId: data.user.id
        })
        csvData.push(`${email},"${password}","created"`)
        console.log(`✅ Başarılı: ${email}`)
      }
      
      // API rate limit için kısa bekleme
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // CSV dosyasına kaydet
    const csvPath = path.join(__dirname, '..', 'users-created.csv')
    fs.writeFileSync(csvPath, csvData.join('\n'), 'utf8')
    
    console.log('\n' + '='.repeat(50))
    console.log(`🎉 ${users.length} kullanıcı başarıyla oluşturuldu!`)
    console.log(`📄 Kullanıcı bilgileri: ${csvPath}`)
    console.log('⚠️  CSV dosyasını güvenli bir yerde saklayın!')
    console.log('='.repeat(50))
    
    return users
    
  } catch (error) {
    console.error('❌ Kullanıcı oluşturma hatası:', error)
    throw error
  }
}

if (require.main === module) {
  createUsers()
    .then(() => {
      console.log('✅ Kullanıcı oluşturma işlemi tamamlandı')
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ İşlem başarısız:', error)
      process.exit(1)
    })
}

module.exports = { createUsers }
