const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function testUpload() {
    const dummyPath = path.join(__dirname, 'dummy.txt');
    fs.writeFileSync(dummyPath, 'Dummy file content');

    const form = new FormData();
    form.append('pdf', fs.createReadStream(dummyPath));

    try {
        const response = await axios.post('http://localhost:5005/api/pdf/upload', form, {
            headers: form.getHeaders(),
        });
        console.log('Success:', response.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    } finally {
        fs.unlinkSync(dummyPath);
    }
}

testUpload();
