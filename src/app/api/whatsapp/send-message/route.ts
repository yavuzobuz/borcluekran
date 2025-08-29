import { NextRequest, NextResponse } from 'next/server';
import makeWASocket, { DisconnectReason, useMultiFileAuthState, WASocket } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';

let globalSocket: WASocket | null = null;
let isConnecting = false;
let qrCodeData: string | null = null;
let isReady = false;
let lastConnectionAttempt = 0;
let connectionRetries = 0;
let connectionPromise: Promise<{ socket: WASocket; qr?: string }> | null = null;
const CONNECTION_COOLDOWN = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

// Connection state enum
enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

let connectionState: ConnectionState = ConnectionState.DISCONNECTED;

// Auth state directory - use the directory created in Docker
const AUTH_DIR = path.join(process.cwd(), '.wwebjs_auth');

// Ensure auth directory exists
if (!fs.existsSync(AUTH_DIR)) {
  try {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  } catch (error) {
    console.warn('Could not create auth directory:', error);
    // Directory might already exist or have permission issues
  }
}

async function initializeWhatsApp(): Promise<{ socket: WASocket; qr?: string }> {
  // Return existing connection promise if already connecting
  if (connectionPromise && isConnecting) {
    console.log('Connection already in progress, returning existing promise');
    return connectionPromise;
  }
  
  const now = Date.now();
  
  // Prevent rapid reconnection attempts
  if (now - lastConnectionAttempt < CONNECTION_COOLDOWN) {
    throw new Error('Connection attempt too soon. Please wait.');
  }
  
  // Check retry limit
  if (connectionRetries >= MAX_RETRIES) {
    connectionState = ConnectionState.ERROR;
    throw new Error('Maximum connection retries exceeded. Please try again later.');
  }
  
  lastConnectionAttempt = now;
  isConnecting = true;
  connectionState = ConnectionState.CONNECTING;
  qrCodeData = null;
  isReady = false;
  connectionRetries++;
  
  // Create and store the connection promise
  connectionPromise = createConnection();
  
  try {
    const result = await connectionPromise;
    return result;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }
}

async function createConnection(): Promise<{ socket: WASocket; qr?: string }> {

  try {
    console.log('Initializing WhatsApp connection with Baileys...');
    
    // Clean up existing socket if any
    if (globalSocket) {
      try {
        await globalSocket.logout();
      } catch (error) {
        console.warn('Error during socket cleanup:', error);
      }
      globalSocket = null;
    }
    
    // Load auth state
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    
    // Create socket with improved configuration
    const socket = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ['Borç Sorgulama', 'Chrome', '1.0.0'],
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
      defaultQueryTimeoutMs: 60000,
      connectTimeoutMs: 60000,
       keepAliveIntervalMs: 30000,
       retryRequestDelayMs: 250,
       maxMsgRetryCount: 5
    });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        isConnecting = false;
        reject(new Error('Connection timeout'));
      }, 120000); // 2 minutes timeout

      // Handle QR code generation
      socket.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        console.log('Connection update:', { connection, qr: !!qr });
        
        if (qr) {
          try {
            qrCodeData = await QRCode.toDataURL(qr);
            console.log('QR code generated successfully');
          } catch (error) {
            console.error('Error generating QR code:', error);
          }
        }
        
        if (connection === 'close') {
          clearTimeout(timeout);
          isConnecting = false;
          isReady = false;
          
          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut && 
                                 statusCode !== DisconnectReason.badSession &&
                                 connectionRetries < MAX_RETRIES;
          
          console.log('Connection closed:', {
            error: lastDisconnect?.error?.message,
            statusCode,
            shouldReconnect,
            retries: connectionRetries
          });
          
          if (shouldReconnect) {
            // Auto-reconnect after a delay with exponential backoff
            const delay = RETRY_DELAY * Math.pow(2, connectionRetries - 1);
            console.log(`Retrying connection in ${delay}ms (attempt ${connectionRetries}/${MAX_RETRIES})`);
            connectionState = ConnectionState.ERROR;
            connectionPromise = null; // Clear the promise for retry
            setTimeout(() => {
              initializeWhatsApp().catch(console.error);
            }, delay);
          } else {
            // Reset retries if we're not reconnecting
            connectionRetries = 0;
            connectionState = ConnectionState.DISCONNECTED;
            connectionPromise = null;
          }
          
          reject(new Error(`Connection closed: ${lastDisconnect?.error?.message || 'Unknown error'}`));
        } else if (connection === 'open') {
          clearTimeout(timeout);
          isConnecting = false;
          isReady = true;
          connectionState = ConnectionState.CONNECTED;
          qrCodeData = null;
          globalSocket = socket;
          connectionRetries = 0; // Reset retries on successful connection
          connectionPromise = null; // Clear the promise
          
          console.log('WhatsApp connected successfully!');
          resolve({ socket });
        }
      });
      
      // Save credentials when updated
      socket.ev.on('creds.update', saveCreds);
      
      // Handle messages
      socket.ev.on('messages.upsert', async (m) => {
        console.log('Received messages:', m.messages.length);
      });
    });
    
  } catch (error) {
    isConnecting = false;
    console.error('Error initializing WhatsApp:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      retries: connectionRetries
    });
    
    // Reset connection state on critical errors
    if (error instanceof Error && 
        (error.message.includes('ECONNREFUSED') || 
         error.message.includes('ENOTFOUND') ||
         error.message.includes('timeout'))) {
      connectionRetries = 0;
    }
    
    throw error;
  }
}

// Initialize on startup
if (!globalSocket && !isConnecting) {
  initializeWhatsApp().catch(console.error);
}

export async function GET(request: NextRequest) {
  try {
    const statusMessage = {
      [ConnectionState.CONNECTED]: 'WhatsApp is ready',
      [ConnectionState.CONNECTING]: 'WhatsApp is connecting...',
      [ConnectionState.DISCONNECTED]: 'WhatsApp is disconnected',
      [ConnectionState.ERROR]: 'WhatsApp connection error'
    }[connectionState] || 'WhatsApp status unknown';

    return NextResponse.json({
      success: connectionState === ConnectionState.CONNECTED,
      isReady,
      connectionState,
      qrCode: qrCodeData,
      message: statusMessage,
      debug: {
        hasSocket: !!globalSocket,
        isConnecting,
        isReady,
        hasQR: !!qrCodeData,
        lastAttempt: lastConnectionAttempt,
        retries: connectionRetries,
        maxRetries: MAX_RETRIES,
        hasConnectionPromise: !!connectionPromise
      }
    });
  } catch (error) {
    console.error('Error in GET /api/whatsapp/send-message:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        connectionState: ConnectionState.ERROR
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message } = await request.json();
    
    if (!phoneNumber || !message) {
      return NextResponse.json(
        { success: false, error: 'Phone number and message are required' },
        { status: 400 }
      );
    }
    
    // Check if WhatsApp is ready
    if (!globalSocket || !isReady) {
      // Try to initialize if not connecting
      if (!isConnecting) {
        initializeWhatsApp().catch(console.error);
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'WhatsApp is not ready',
          qrCode: qrCodeData,
          message: 'Please scan QR code or wait for connection'
        },
        { status: 503 }
      );
    }
    
    // Format phone number
    const formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
    const jid = formattedNumber.includes('@') ? formattedNumber : `${formattedNumber}@s.whatsapp.net`;
    
    // Check if number exists on WhatsApp
    const onWhatsAppResult = await globalSocket.onWhatsApp(jid);
    const [result] = onWhatsAppResult || [];
    if (!result?.exists) {
      return NextResponse.json(
        { success: false, error: 'Phone number is not registered on WhatsApp' },
        { status: 400 }
      );
    }
    
    // Send message
    const sentMessage = await globalSocket.sendMessage(result.jid, { text: message });

    if (!sentMessage) {
      return NextResponse.json(
        { success: false, error: 'Failed to send message' },
        { status: 500 }
      );
    }
    
    console.log('Message sent successfully:', sentMessage.key.id);
    
    return NextResponse.json({
      success: true,
      messageId: sentMessage.key.id,
      message: 'Message sent successfully'
    });
    
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send message',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Cleanup function
process.on('SIGINT', async () => {
  if (globalSocket) {
    await globalSocket.logout();
  }
  process.exit(0);
});
