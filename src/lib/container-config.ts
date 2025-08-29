// Container-specific configuration utilities

/**
 * Get the appropriate file path based on environment
 */
export function getContainerPath(relativePath: string): string {
  if (process.env.NODE_ENV === 'production') {
    // In Docker container, use absolute paths
    return `/app/${relativePath}`;
  } else {
    // In development, use relative paths
    return relativePath;
  }
}

/**
 * Check if running in Docker container
 */
export function isRunningInContainer(): boolean {
  return process.env.NODE_ENV === 'production' && 
         process.env.HOSTNAME === '0.0.0.0';
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig() {
  const isContainer = isRunningInContainer();
  
  return {
    isContainer,
    databasePath: isContainer ? '/app/prisma/dev.db' : './prisma/dev.db',
    whatsappAuthPath: isContainer ? '/app/.wwebjs_auth' : './.wwebjs_auth',
    whatsappCachePath: isContainer ? '/app/.wwebjs_cache' : './.wwebjs_cache',
    tempPath: isContainer ? '/app/temp' : './temp',
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: process.env.NODE_ENV || 'development'
  };
}

/**
 * Get Puppeteer configuration for container environment
 */
export function getPuppeteerConfig() {
  const isContainer = isRunningInContainer();
  
  const baseArgs = [
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
    '--disable-renderer-backgrounding',
    '--disable-extensions',
    '--disable-plugins',
    '--disable-default-apps',
    '--disable-translate',
    '--disable-sync',
    '--no-default-browser-check',
    '--no-pings',
    '--single-process',
    '--memory-pressure-off',
    '--max_old_space_size=4096'
  ];
  
  return {
    headless: true,
    args: baseArgs,
    timeout: 60000,
    ...(isContainer && {
      executablePath: '/usr/bin/chromium-browser'
    })
  };
}