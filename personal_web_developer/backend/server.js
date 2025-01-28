require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '..')));

app.post('/generate-website', async (req, res) => {
    try {
        const { description, features, colorScheme } = req.body;

        // Construct the prompt for the Deepseek AI API
        const prompt = `Generate a complete website based on the following requirements:
            Description: ${description}
            Features: ${features}
            Color Scheme: ${colorScheme}
            
            Please provide the complete HTML, CSS, and JavaScript code for a modern, responsive website.
            Include all necessary files and structure them properly.`;

        // Make request to Deepseek AI API
        const response = await axios.post('https://api.deepseek.com/v1/generate', {
            prompt,
            // Add your specific Deepseek AI API parameters here
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Create a zip file from the generated code
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        // Set the response headers for zip file download
        res.attachment('generated-website.zip');
        archive.pipe(res);

        // Add the generated files to the zip
        const files = response.data.files; // Adjust based on actual Deepseek API response
        for (const file of files) {
            archive.append(file.content, { name: file.name });
        }

        archive.finalize();

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate website' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
