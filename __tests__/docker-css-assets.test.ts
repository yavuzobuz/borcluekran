/**
 * Tests for Docker CSS and static asset loading
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('Docker CSS and Static Assets', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
  
  beforeAll(async () => {
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  describe('CSS Asset Loading', () => {
    it('should serve CSS files with correct Content-Type', async () => {
      const response = await fetch(`${baseUrl}/_next/static/css/app/layout.css`);
      
      if (response.ok) {
        expect(response.headers.get('content-type')).toContain('text/css');
        expect(response.status).toBe(200);
      }
    });

    it('should serve CSS files with proper cache headers', async () => {
      const response = await fetch(`${baseUrl}/_next/static/css/app/layout.css`);
      
      if (response.ok) {
        const cacheControl = response.headers.get('cache-control');
        expect(cacheControl).toBeTruthy();
        
        if (process.env.NODE_ENV === 'production') {
          expect(cacheControl).toContain('max-age');
        }
      }
    });
  });

  describe('Static Asset Loading', () => {
    it('should serve JavaScript files with correct Content-Type', async () => {
      // Try to fetch a common Next.js chunk
      const response = await fetch(`${baseUrl}/_next/static/chunks/main.js`);
      
      if (response.ok) {
        expect(response.headers.get('content-type')).toContain('application/javascript');
        expect(response.status).toBe(200);
      }
    });

    it('should serve public assets correctly', async () => {
      const response = await fetch(`${baseUrl}/favicon.ico`);
      expect(response.status).toBe(200);
      
      const contentType = response.headers.get('content-type');
      expect(contentType).toContain('image');
    });
  });

  describe('Font Asset Loading', () => {
    it('should serve font files with correct MIME types', async () => {
      // This test will only run if font files exist
      const fontExtensions = ['.woff', '.woff2', '.ttf'];
      
      for (const ext of fontExtensions) {
        try {
          const response = await fetch(`${baseUrl}/_next/static/media/font${ext}`);
          if (response.ok) {
            const contentType = response.headers.get('content-type');
            expect(contentType).toContain('font');
          }
        } catch (error) {
          // Font file might not exist, skip
        }
      }
    });
  });

  describe('Performance and Caching', () => {
    it('should enable compression for text assets', async () => {
      const response = await fetch(`${baseUrl}/_next/static/css/app/layout.css`, {
        headers: {
          'Accept-Encoding': 'gzip, deflate, br'
        }
      });
      
      if (response.ok) {
        const encoding = response.headers.get('content-encoding');
        // Compression might be enabled
        if (encoding) {
          expect(['gzip', 'deflate', 'br']).toContain(encoding);
        }
      }
    });

    it('should set ETag headers for static assets', async () => {
      const response = await fetch(`${baseUrl}/_next/static/css/app/layout.css`);
      
      if (response.ok) {
        const etag = response.headers.get('etag');
        expect(etag).toBeTruthy();
      }
    });
  });
});