import { NextRequest, NextResponse } from 'next/server'
import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js'
import QRCode from 'qrcode'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

// WhatsApp client instance
let client: Client | null = null
let isClientReady = false
let qrCodeData: string | null = null

// Initialize WhatsApp client
function initializeClient() {
  if (client) return client

  console.log('Creating new WhatsApp client...')
  
  const sessionPath = process.env.WHATSAPP_SESSION_PATH || './.wwebjs_auth'
  
  client = new Client({
    authStrategy: new LocalAuth({
      clientId: "whatsapp-client",
      dataPath: sessionPath
    }),
    puppeteer: {
      headless: true, // Set to true for Docker container
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    }
  })

  client.on('qr', async (qr) => {
    console.log('QR Code received, generating data URL...')
    try {
      qrCodeData = await QRCode.toDataURL(qr)
      console.log('QR Code generated successfully')
    } catch (error) {
      console.error('QR Code generation error:', error)
    }
  })

  client.on('ready', () => {
    console.log('WhatsApp client is ready!')
    isClientReady = true
    qrCodeData = null
  })

  client.on('authenticated', () => {
    console.log('WhatsApp client authenticated')
  })

  client.on('auth_failure', (msg) => {
    console.error('Authentication failed:', msg)
    isClientReady = false
  })

  client.on('disconnected', (reason) => {
    console.log('WhatsApp client disconnected:', reason)
    isClientReady = false
    qrCodeData = null
    
    // Don't immediately set client to null, let it try to reconnect
    setTimeout(() => {
      if (!isClientReady) {
        console.log('Client still not ready after disconnect, resetting...')
        client = null
      }
    }, 5000)
  })

  client.initialize()
  return client
}

// Format phone number for WhatsApp
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '')
  
  // If starts with 0, replace with 90 (Turkey)
  if (cleaned.startsWith('0')) {
    cleaned = '90' + cleaned.substring(1)
  }
  
  // If doesn't start with country code, add Turkey code
  if (!cleaned.startsWith('90')) {
    cleaned = '90' + cleaned
  }
  
  return cleaned + '@c.us'
}

// GET - Check WhatsApp connection status and get QR code if needed
export async function GET() {
  try {
    console.log('WhatsApp status check - Client exists:', !!client)
    console.log('WhatsApp status check - Is ready:', isClientReady)
    console.log('WhatsApp status check - Has QR:', !!qrCodeData)
    
    if (!client) {
      console.log('Initializing WhatsApp client...')
      initializeClient()
    } else if (!isClientReady && !qrCodeData) {
      console.log('Client exists but not ready and no QR. Reinitializing...')
      // Reset client and reinitialize
      if (client) {
        try {
          await client.destroy()
        } catch (destroyError) {
          console.log('Error destroying client:', destroyError)
        }
      }
      client = null
      isClientReady = false
      qrCodeData = null
      initializeClient()
    }

    // Wait a bit for QR code generation if client was just initialized
    if (!isClientReady && !qrCodeData && client) {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    return NextResponse.json({
      success: true,
      isReady: isClientReady,
      qrCode: qrCodeData,
      message: isClientReady ? 'WhatsApp is connected' : qrCodeData ? 'Scan QR code to connect' : 'WhatsApp is initializing...',
      debug: {
        clientExists: !!client,
        isReady: isClientReady,
        hasQR: !!qrCodeData
      }
    })
  } catch (error) {
    console.error('WhatsApp status check error:', error)
    return NextResponse.json(
      { success: false, error: 'WhatsApp status check failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST - Send WhatsApp message
export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message, debtorName, durumTanitici, recipients, files } = await request.json()
    
    console.log('WhatsApp API called with:', {
      phoneNumber: phoneNumber ? 'provided' : 'missing',
      message: message ? 'provided' : 'missing',
      filesCount: files ? files.length : 0,
      recipients: recipients ? recipients.length : 0
    })

    if (!phoneNumber && !recipients) {
      return NextResponse.json(
        { success: false, error: 'Telefon numarası veya alıcı listesi gerekli' },
        { status: 400 }
      )
    }

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Mesaj gerekli' },
        { status: 400 }
      )
    }

    // Initialize client if not exists
    if (!client) {
      initializeClient()
    }

    // Check if client is ready
    if (!isClientReady) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'WhatsApp bağlantısı hazır değil. Lütfen QR kodu ile giriş yapın.',
          qrCode: qrCodeData
        },
        { status: 503 }
      )
    }

    // Handle bulk messaging
    if (recipients && Array.isArray(recipients)) {
      const results = []
      
      for (const recipient of recipients) {
        const { phoneNumber: recipientPhone, durumTanitici: recipientDurumTanitici, name } = recipient
        
        if (!recipientPhone) {
          results.push({
            durumTanitici: recipientDurumTanitici,
            success: false,
            error: 'Telefon numarası bulunamadı'
          })
          continue
        }

        // Create message record in database
        const messageRecord = await prisma.whatsAppMessage.create({
          data: {
            durumTanitici: recipientDurumTanitici,
            phoneNumber: recipientPhone,
            message: message,
            status: 'pending'
          }
        })

        try {
          // Format phone number
          const formattedNumber = formatPhoneNumber(recipientPhone)

          // Check if client is still ready before proceeding
          if (!client || !isClientReady) {
            await prisma.whatsAppMessage.update({
              where: { id: messageRecord.id },
              data: {
                status: 'failed',
                errorMessage: 'WhatsApp bağlantısı kesildi'
              }
            })
            
            results.push({
              durumTanitici: recipientDurumTanitici,
              success: false,
              error: 'WhatsApp bağlantısı kesildi'
            })
            continue
          }

          // Check if number is registered on WhatsApp with error handling
          let isRegistered = false
          try {
            isRegistered = await client.isRegisteredUser(formattedNumber)
          } catch (registrationError) {
            console.error('Error checking if user is registered:', registrationError)
            
            // If session is closed, reset client and stop bulk operation
            if (registrationError instanceof Error && registrationError.message.includes('Session closed')) {
              console.log('Session closed detected during bulk operation, resetting client...')
              isClientReady = false
              client = null
              
              await prisma.whatsAppMessage.update({
                where: { id: messageRecord.id },
                data: {
                  status: 'failed',
                  errorMessage: 'WhatsApp oturumu kapandı'
                }
              })
              
              results.push({
                durumTanitici: recipientDurumTanitici,
                success: false,
                error: 'WhatsApp oturumu kapandı'
              })
              
              // Return early to stop bulk operation
              return NextResponse.json({
                success: false,
                error: 'WhatsApp oturumu kapandı. Lütfen yeniden bağlanın.',
                results,
                needsReconnection: true
              }, { status: 503 })
            }
            
            // For other errors, assume number is registered and try to send
            console.log('Assuming number is registered due to check error')
            isRegistered = true
          }
          
          if (!isRegistered) {
            await prisma.whatsAppMessage.update({
              where: { id: messageRecord.id },
              data: {
                status: 'failed',
                errorMessage: 'Bu telefon numarası WhatsApp\'ta kayıtlı değil'
              }
            })
            
            results.push({
              durumTanitici: recipientDurumTanitici,
              success: false,
              error: 'Bu telefon numarası WhatsApp\'ta kayıtlı değil'
            })
            continue
          }

          // Prepare message with debtor info
          const fullMessage = name 
            ? `Sayın ${name},\n\n${message}`
            : message

          // Send message
          let sentMessage
          if (files && files.length > 0) {
            console.log('Files to send:', files.length)
            // Send files with message
            for (let i = 0; i < files.length; i++) {
              const file = files[i]
              try {
                console.log('Processing file:', file.filename, 'Type:', file.mimetype)
                
                // Try alternative approach: save to temp file first
                let base64Data = file.data
                if (base64Data.includes(',')) {
                  base64Data = base64Data.split(',')[1]
                }
                
                // Validate base64 data
                if (!base64Data || base64Data.length === 0) {
                  throw new Error('Invalid base64 data')
                }
                
                // Create temp directory if it doesn't exist
                const tempDir = process.env.UPLOAD_TEMP_PATH || path.join(process.cwd(), 'temp')
                if (!fs.existsSync(tempDir)) {
                  fs.mkdirSync(tempDir, { recursive: true })
                }
                
                // Save file temporarily
                const tempFileName = `temp_${Date.now()}_${file.filename}`
                const tempFilePath = path.join(tempDir, tempFileName)
                
                try {
                  // Write base64 data to temp file
                  fs.writeFileSync(tempFilePath, base64Data, 'base64')
                  
                  // Create MessageMedia from file
                  const media = MessageMedia.fromFilePath(tempFilePath)
                  
                  console.log('Media object created from file:', {
                    mimetype: media.mimetype,
                    filename: file.filename,
                    tempPath: tempFilePath
                  })
                  
                  console.log('Sending media message...')
                  const mediaMessage = await client!.sendMessage(formattedNumber, media, {
                    caption: i === 0 ? fullMessage : undefined
                  })
                  
                  // Clean up temp file
                  fs.unlinkSync(tempFilePath)
                  
                  console.log('Media message sent successfully, temp file cleaned up')
                  if (!sentMessage) sentMessage = mediaMessage
                } catch (tempFileError) {
                  // Clean up temp file if it exists
                  if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath)
                  }
                  throw tempFileError
                }
              } catch (fileError) {
                console.error('File send error for', file.filename, ':', fileError)
                console.error('Error details:', {
                  message: fileError instanceof Error ? fileError.message : 'Unknown error',
                  stack: fileError instanceof Error ? fileError.stack : undefined,
                  fileInfo: {
                    name: file.filename,
                    type: file.mimetype,
                    dataLength: file.data?.length || 0
                  }
                })
                // Continue with next file or send text message
              }
            }
            // If no files were sent successfully, send text message
            if (!sentMessage) {
              console.log('No files sent successfully, sending text message')
              sentMessage = await client!.sendMessage(formattedNumber, fullMessage)
            }
          } else {
            sentMessage = await client!.sendMessage(formattedNumber, fullMessage)
          }
          
          // Update message record as sent
          await prisma.whatsAppMessage.update({
            where: { id: messageRecord.id },
            data: {
              status: 'sent',
              sentAt: new Date(),
              messageId: sentMessage.id._serialized
            }
          })

          results.push({
            durumTanitici: recipientDurumTanitici,
            success: true,
            messageId: sentMessage.id._serialized
          })

        } catch (error) {
          console.error(`Error sending message to ${recipientPhone}:`, error)
          
          let errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
          
          // Handle session closed error
          if (error instanceof Error && error.message.includes('Session closed')) {
            console.log('Session closed detected during message send, resetting client...')
            isClientReady = false
            client = null
            errorMessage = 'WhatsApp oturumu kapandı'
          }
          
          // Update message record as failed
          await prisma.whatsAppMessage.update({
            where: { id: messageRecord.id },
            data: {
              status: 'failed',
              errorMessage: errorMessage
            }
          })

          results.push({
            durumTanitici: recipientDurumTanitici,
            success: false,
            error: errorMessage
          })
          
          // If session closed, stop bulk operation
          if (error instanceof Error && error.message.includes('Session closed')) {
            return NextResponse.json({
              success: false,
              error: 'WhatsApp oturumu kapandı. Lütfen yeniden bağlanın.',
              results,
              needsReconnection: true
            }, { status: 503 })
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Toplu mesaj gönderimi tamamlandı',
        results
      })
    }

    // Handle single message
    if (!durumTanitici) {
      return NextResponse.json(
        { success: false, error: 'Durum tanıtıcı gerekli' },
        { status: 400 }
      )
    }

    // Create message record in database
    const messageRecord = await prisma.whatsAppMessage.create({
      data: {
        durumTanitici,
        phoneNumber,
        message,
        status: 'pending'
      }
    })

    try {
      // Format phone number
      const formattedNumber = formatPhoneNumber(phoneNumber)

      // Check if client is still ready before proceeding
      if (!client || !isClientReady) {
        await prisma.whatsAppMessage.update({
          where: { id: messageRecord.id },
          data: {
            status: 'failed',
            errorMessage: 'WhatsApp bağlantısı kesildi. Lütfen yeniden bağlanın.'
          }
        })
        
        return NextResponse.json(
          { 
            success: false, 
            error: 'WhatsApp bağlantısı kesildi. Lütfen yeniden bağlanın.',
            qrCode: qrCodeData
          },
          { status: 503 }
        )
      }

      // Check if number is registered on WhatsApp with error handling
      let isRegistered = false
      try {
        isRegistered = await client.isRegisteredUser(formattedNumber)
      } catch (registrationError) {
        console.error('Error checking if user is registered:', registrationError)
        
        // If session is closed, reset client
        if (registrationError instanceof Error && registrationError.message.includes('Session closed')) {
          console.log('Session closed detected, resetting client...')
          isClientReady = false
          client = null
          
          await prisma.whatsAppMessage.update({
            where: { id: messageRecord.id },
            data: {
              status: 'failed',
              errorMessage: 'WhatsApp oturumu kapandı. Lütfen yeniden bağlanın.'
            }
          })
          
          return NextResponse.json(
            { 
              success: false, 
              error: 'WhatsApp oturumu kapandı. Lütfen yeniden bağlanın.',
              needsReconnection: true
            },
            { status: 503 }
          )
        }
        
        // For other errors, assume number is registered and try to send
        console.log('Assuming number is registered due to check error')
        isRegistered = true
      }
      
      if (!isRegistered) {
        await prisma.whatsAppMessage.update({
          where: { id: messageRecord.id },
          data: {
            status: 'failed',
            errorMessage: 'Bu telefon numarası WhatsApp\'ta kayıtlı değil'
          }
        })
        
        return NextResponse.json(
          { success: false, error: 'Bu telefon numarası WhatsApp\'ta kayıtlı değil' },
          { status: 400 }
        )
      }

      // Prepare message with debtor info
      const fullMessage = debtorName 
        ? `Sayın ${debtorName},\n\n${message}`
        : message

      // Send message
      let sentMessage
      if (files && files.length > 0) {
        console.log('Files to send:', files.length)
        // Send files with message
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          try {
            console.log('Processing file:', file.filename, 'Type:', file.mimetype)
            
            // Try alternative approach: save to temp file first
            let base64Data = file.data
            if (base64Data.includes(',')) {
              base64Data = base64Data.split(',')[1]
            }
            
            // Validate base64 data
            if (!base64Data || base64Data.length === 0) {
              throw new Error('Invalid base64 data')
            }
            
            // Create temp directory if it doesn't exist
            const tempDir = process.env.UPLOAD_TEMP_PATH || path.join(process.cwd(), 'temp')
            if (!fs.existsSync(tempDir)) {
              fs.mkdirSync(tempDir, { recursive: true })
            }
            
            // Save file temporarily
            const tempFileName = `temp_${Date.now()}_${file.filename}`
            const tempFilePath = path.join(tempDir, tempFileName)
            
            try {
              // Write base64 data to temp file
              fs.writeFileSync(tempFilePath, base64Data, 'base64')
              
              // Create MessageMedia from file
              const media = MessageMedia.fromFilePath(tempFilePath)
              
              console.log('Media object created from file:', {
                mimetype: media.mimetype,
                filename: file.filename,
                tempPath: tempFilePath
              })
              
              console.log('Sending media message...')
              const mediaMessage = await client!.sendMessage(formattedNumber, media, {
                caption: i === 0 ? fullMessage : undefined
              })
              
              // Clean up temp file
              fs.unlinkSync(tempFilePath)
              
              console.log('Media message sent successfully, temp file cleaned up')
              if (!sentMessage) sentMessage = mediaMessage
            } catch (tempFileError) {
              // Clean up temp file if it exists
              if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath)
              }
              throw tempFileError
            }
          } catch (fileError) {
            console.error('File send error for', file.filename, ':', fileError)
            console.error('Error details:', {
              message: fileError instanceof Error ? fileError.message : 'Unknown error',
              stack: fileError instanceof Error ? fileError.stack : undefined,
              fileInfo: {
                name: file.filename,
                type: file.mimetype,
                dataLength: file.data?.length || 0
              }
            })
            // Continue with next file or send text message
          }
        }
        // If no files were sent successfully, send text message
        if (!sentMessage) {
          console.log('No files sent successfully, sending text message')
          sentMessage = await client!.sendMessage(formattedNumber, fullMessage)
        }
      } else {
        sentMessage = await client!.sendMessage(formattedNumber, fullMessage)
      }
      
      // Update message record as sent
      await prisma.whatsAppMessage.update({
        where: { id: messageRecord.id },
        data: {
          status: 'sent',
          sentAt: new Date(),
          messageId: sentMessage.id._serialized
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Mesaj başarıyla gönderildi',
        sentTo: formattedNumber,
        sentMessage: fullMessage,
        messageId: sentMessage.id._serialized
      })

    } catch (error) {
      console.error('WhatsApp message send error:', error)
      
      let errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
      let statusCode = 500
      let needsReconnection = false
      
      // Handle session closed error
      if (error instanceof Error && error.message.includes('Session closed')) {
        console.log('Session closed detected during single message send, resetting client...')
        isClientReady = false
        client = null
        errorMessage = 'WhatsApp oturumu kapandı. Lütfen yeniden bağlanın.'
        statusCode = 503
        needsReconnection = true
      }
      
      // Update message record as failed
      await prisma.whatsAppMessage.update({
        where: { id: messageRecord.id },
        data: {
          status: 'failed',
          errorMessage: errorMessage
        }
      })

      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          needsReconnection: needsReconnection
        },
        { status: statusCode }
      )
    }

  } catch (error) {
    console.error('WhatsApp API error:', error)
    return NextResponse.json(
      { success: false, error: 'API hatası oluştu' },
      { status: 500 }
    )
  }
}

// DELETE - Disconnect WhatsApp client
export async function DELETE() {
  try {
    if (client) {
      await client.destroy()
      client = null
      isClientReady = false
      qrCodeData = null
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp bağlantısı kesildi'
    })
  } catch (error) {
    console.error('WhatsApp disconnect error:', error)
    return NextResponse.json(
      { success: false, error: 'Bağlantı kesilirken hata oluştu' },
      { status: 500 }
    )
  }
}