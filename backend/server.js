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

        if (!process.env.DEEPSEEK_API_KEY) {
            throw new Error('DEEPSEEK_API_KEY is not configured');
        }

        // Construct the prompt for the Deepseek AI API
        const prompt = `Create a modern, responsive website with the following specifications:
            
            DESCRIPTION:
            ${description}
            
            REQUIRED FEATURES:
            ${features}
            
            COLOR SCHEME:
            ${colorScheme}
            
            Please generate a complete, modern website that includes:
            1. index.html with proper HTML5 structure
            2. styles.css with modern CSS features and responsive design
            3. script.js with necessary JavaScript functionality
            4. Any additional assets or components needed
            
            The code should be:
            - Well-structured and organized
            - Fully functional and responsive
            - Following modern web development best practices
            - Including proper comments and documentation
            
            Return the response in the following JSON format:
            {
                "files": [
                    {
                        "name": "filename.extension",
                        "content": "file content here"
                    }
                ]
            }`;

        console.log('Making request to Deepseek API...');
        
        // Make request to Deepseek AI API
        const response = await axios.post('https://api.deepseek.ai/v1/completions', {
            model: "deepseek-coder",
            prompt,
            max_tokens: 4000,
            temperature: 0.7,
            format: "json"
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Received response from Deepseek API');

        if (!response.data || !response.data.choices || !response.data.choices[0]) {
            throw new Error('Invalid response from Deepseek API');
        }

        // Parse the response text as JSON
        let generatedFiles;
        try {
            const responseText = response.data.choices[0].text;
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }
            generatedFiles = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            console.error('Error parsing API response:', parseError);
            throw new Error('Failed to parse API response');
        }

        if (!generatedFiles || !generatedFiles.files || !Array.isArray(generatedFiles.files)) {
            throw new Error('Invalid file structure in API response');
        }

        // Create a zip file from the generated code
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        // Set the response headers for zip file download
        res.attachment('generated-website.zip');
        archive.pipe(res);

        // Add the generated files to the zip
        for (const file of generatedFiles.files) {
            if (file.name && file.content) {
                archive.append(file.content, { name: file.name });
            }
        }

        // Add a README file
        const readmeContent = `# Generated Website
This website was generated using AI based on the following requirements:

Description: ${description}
Features: ${features}
Color Scheme: ${colorScheme}

## Files Included
${generatedFiles.files.map(f => `- ${f.name}`).join('\n')}
`;
        archive.append(readmeContent, { name: 'README.md' });

        await archive.finalize();

    } catch (error) {
        console.error('Error details:', error);
        let errorMessage = 'Failed to generate website';
        
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('API Error Response:', error.response.data);
            errorMessage = `API Error: ${error.response.status} - ${error.response.data.error || 'Unknown error'}`;
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
            errorMessage = 'No response received from API';
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
            errorMessage = error.message;
        }

        res.status(500).json({ 
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
