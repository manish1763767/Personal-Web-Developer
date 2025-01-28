document.getElementById('websiteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values
    const description = document.getElementById('description').value;
    const features = document.getElementById('features').value;
    const colorScheme = document.getElementById('colorScheme').value;

    // Show loading state
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('result').classList.add('hidden');

    try {
        const response = await fetch('http://localhost:3000/generate-website', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                description,
                features,
                colorScheme
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate website');
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        
        // Update download link
        const downloadLink = document.getElementById('downloadLink');
        downloadLink.href = downloadUrl;
        downloadLink.download = 'generated-website.zip';

        // Show result section
        document.getElementById('result').classList.remove('hidden');
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while generating the website. Please try again.');
    } finally {
        document.getElementById('loading').classList.add('hidden');
    }
});
