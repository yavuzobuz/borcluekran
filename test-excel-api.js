const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function testExcelUpload() {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream('test-excel-upload.xlsx'), {
      filename: 'test-excel-upload.xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const response = await axios.post('http://localhost:3000/api/excel', form, {
      headers: {
        ...form.getHeaders()
      }
    });

    console.log('Response status:', response.status);
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testExcelUpload();