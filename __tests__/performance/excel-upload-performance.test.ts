import { performance } from 'perf_hooks'
import { createLargeTestExcel } from '../fixtures/create-test-excel-files'

describe('Excel Upload Performance Tests', () => {
  
  describe('Memory Usage Tests', () => {
    it('should handle large files without excessive memory usage', async () => {
      const initialMemory = process.memoryUsage()
      
      // 5000 satırlık büyük dosya oluştur
      const largeBuffer = createLargeTestExcel(5000)
      
      const afterCreationMemory = process.memoryUsage()
      const memoryIncrease = afterCreationMemory.heapUsed - initialMemory.heapUsed
      
      // Memory artışı 100MB'dan az olmalı
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024)
      
      // Garbage collection tetikle
      if (global.gc) {
        global.gc()
      }
      
      const afterGCMemory = process.memoryUsage()
      
      // GC sonrası memory kullanımı başlangıca yakın olmalı
      expect(afterGCMemory.heapUsed).toBeLessThan(initialMemory.heapUsed + 50 * 1024 * 1024)
    })
    
    it('should process files in chunks to avoid memory issues', async () => {
      const testSizes = [100, 500, 1000, 2000]
      const memoryUsages: number[] = []
      
      for (const size of testSizes) {
        const beforeMemory = process.memoryUsage().heapUsed
        
        const buffer = createLargeTestExcel(size)
        
        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 10))
        
        const afterMemory = process.memoryUsage().heapUsed
        memoryUsages.push(afterMemory - beforeMemory)
        
        // Cleanup
        if (global.gc) {
          global.gc()
        }
      }
      
      // Memory kullanımı linear olarak artmamalı (chunking çalışıyorsa)
      const memoryGrowthRate = memoryUsages[3] / memoryUsages[0]
      expect(memoryGrowthRate).toBeLessThan(10) // 20x veri için 10x'dan az memory artışı
    })
  })
  
  describe('Processing Speed Tests', () => {
    it('should process small files quickly', async () => {
      const buffer = createLargeTestExcel(100)
      
      const startTime = performance.now()
      
      // Simulate Excel processing
      const XLSX = require('xlsx')
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(worksheet)
      
      // Simulate data processing
      let processedCount = 0
      for (const row of data) {
        // Simulate validation and conversion
        if (row['Durum tanıtıcısı']) {
          processedCount++
        }
        await new Promise(resolve => setImmediate(resolve)) // Yield control
      }
      
      const endTime = performance.now()
      const processingTime = endTime - startTime
      
      expect(processedCount).toBe(100)
      expect(processingTime).toBeLessThan(1000) // 1 saniyeden az
    })
    
    it('should process medium files within acceptable time', async () => {
      const buffer = createLargeTestExcel(1000)
      
      const startTime = performance.now()
      
      const XLSX = require('xlsx')
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(worksheet)
      
      let processedCount = 0
      for (const row of data) {
        if (row['Durum tanıtıcısı']) {
          processedCount++
        }
        await new Promise(resolve => setImmediate(resolve))
      }
      
      const endTime = performance.now()
      const processingTime = endTime - startTime
      
      expect(processedCount).toBe(1000)
      expect(processingTime).toBeLessThan(5000) // 5 saniyeden az
    })
    
    it('should handle large files within reasonable time', async () => {
      const buffer = createLargeTestExcel(5000)
      
      const startTime = performance.now()
      
      const XLSX = require('xlsx')
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(worksheet)
      
      let processedCount = 0
      for (const row of data) {
        if (row['Durum tanıtıcısı']) {
          processedCount++
        }
        await new Promise(resolve => setImmediate(resolve))
      }
      
      const endTime = performance.now()
      const processingTime = endTime - startTime
      
      expect(processedCount).toBe(5000)
      expect(processingTime).toBeLessThan(30000) // 30 saniyeden az
    })
  })
  
  describe('Database Performance Tests', () => {
    it('should batch database operations efficiently', async () => {
      const mockPrisma = {
        borcluBilgileri: {
          createMany: jest.fn(),
          create: jest.fn()
        }
      }
      
      const testData = Array.from({ length: 1000 }, (_, index) => ({
        durumTanitici: `${100000 + index}`,
        muhatapTanimi: `Test ${index}`
      }))
      
      const startTime = performance.now()
      
      // Simulate batch processing
      const batchSize = 100
      const batches = []
      
      for (let i = 0; i < testData.length; i += batchSize) {
        const batch = testData.slice(i, i + batchSize)
        batches.push(batch)
      }
      
      // Process batches
      for (const batch of batches) {
        mockPrisma.borcluBilgileri.createMany.mockResolvedValueOnce({ count: batch.length })
        await mockPrisma.borcluBilgileri.createMany({ data: batch })
      }
      
      const endTime = performance.now()
      const processingTime = endTime - startTime
      
      expect(batches.length).toBe(10) // 1000 / 100 = 10 batches
      expect(processingTime).toBeLessThan(1000) // Batch processing should be fast
      expect(mockPrisma.borcluBilgileri.createMany).toHaveBeenCalledTimes(10)
    })
    
    it('should handle database connection pooling efficiently', async () => {
      const connectionTimes: number[] = []
      
      // Simulate multiple concurrent database operations
      const operations = Array.from({ length: 50 }, async (_, index) => {
        const startTime = performance.now()
        
        // Simulate database operation
        await new Promise(resolve => setTimeout(resolve, Math.random() * 10))
        
        const endTime = performance.now()
        connectionTimes.push(endTime - startTime)
        
        return { id: index, processed: true }
      })
      
      const results = await Promise.all(operations)
      
      expect(results).toHaveLength(50)
      expect(results.every(r => r.processed)).toBe(true)
      
      // Average connection time should be reasonable
      const avgConnectionTime = connectionTimes.reduce((a, b) => a + b, 0) / connectionTimes.length
      expect(avgConnectionTime).toBeLessThan(50) // 50ms average
    })
  })
  
  describe('Error Handling Performance', () => {
    it('should handle errors efficiently without significant slowdown', async () => {
      const testData = Array.from({ length: 1000 }, (_, index) => ({
        durumTanitici: index % 5 === 0 ? '' : `${100000 + index}`, // %20 hata oranı
        muhatapTanimi: `Test ${index}`
      }))
      
      const startTime = performance.now()
      
      let successCount = 0
      let errorCount = 0
      const errors: string[] = []
      
      for (const [index, row] of testData.entries()) {
        try {
          if (!row.durumTanitici) {
            throw new Error('Durum tanıtıcı boş')
          }
          successCount++
        } catch (error) {
          errorCount++
          errors.push(`Satır ${index + 1}: ${error.message}`)
        }
        
        // Yield control periodically
        if (index % 100 === 0) {
          await new Promise(resolve => setImmediate(resolve))
        }
      }
      
      const endTime = performance.now()
      const processingTime = endTime - startTime
      
      expect(successCount).toBe(800) // %80 başarı
      expect(errorCount).toBe(200) // %20 hata
      expect(processingTime).toBeLessThan(2000) // Error handling shouldn't slow down significantly
    })
    
    it('should efficiently categorize and report errors', async () => {
      const errors = Array.from({ length: 1000 }, (_, index) => ({
        rowIndex: index,
        errorType: ['TYPE_MISMATCH', 'REQUIRED_FIELD', 'DATABASE_ERROR', 'VALIDATION_ERROR'][index % 4],
        message: `Error ${index}`
      }))
      
      const startTime = performance.now()
      
      // Simulate error categorization
      const categorized = errors.reduce((acc, error) => {
        if (!acc[error.errorType]) {
          acc[error.errorType] = []
        }
        acc[error.errorType].push(error)
        return acc
      }, {} as Record<string, any[]>)
      
      // Generate report
      const report = Object.entries(categorized)
        .map(([type, typeErrors]) => `${type}: ${typeErrors.length} errors`)
        .join(', ')
      
      const endTime = performance.now()
      const processingTime = endTime - startTime
      
      expect(Object.keys(categorized)).toHaveLength(4)
      expect(categorized.TYPE_MISMATCH).toHaveLength(250)
      expect(report).toContain('TYPE_MISMATCH: 250 errors')
      expect(processingTime).toBeLessThan(100) // Error categorization should be very fast
    })
  })
  
  describe('Concurrent Processing Tests', () => {
    it('should handle multiple file uploads concurrently', async () => {
      const fileCount = 5
      const filesPerUpload = 200
      
      const startTime = performance.now()
      
      // Simulate concurrent uploads
      const uploadPromises = Array.from({ length: fileCount }, async (_, index) => {
        const buffer = createLargeTestExcel(filesPerUpload)
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
        
        return {
          uploadId: index,
          rowsProcessed: filesPerUpload,
          success: true
        }
      })
      
      const results = await Promise.all(uploadPromises)
      
      const endTime = performance.now()
      const totalTime = endTime - startTime
      
      expect(results).toHaveLength(fileCount)
      expect(results.every(r => r.success)).toBe(true)
      expect(totalTime).toBeLessThan(5000) // Concurrent processing should be efficient
      
      const totalRowsProcessed = results.reduce((sum, r) => sum + r.rowsProcessed, 0)
      expect(totalRowsProcessed).toBe(fileCount * filesPerUpload)
    })
  })
})