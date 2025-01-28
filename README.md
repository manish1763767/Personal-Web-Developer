# AI Website Generator

A modern web application that uses Deepseek AI API to generate custom websites based on user requirements.

## Features

- Modern, responsive UI with glass-morphism effects
- Real-time website generation using AI
- Download generated website as a ZIP file
- Intuitive form with floating labels
- Mobile-friendly design

## Tech Stack

- Frontend: HTML, CSS (with Tailwind CSS), JavaScript
- Backend: Node.js, Express.js
- AI Integration: Deepseek AI API
- Additional Libraries: 
  - axios for API requests
  - archiver for ZIP file creation
  - cors for cross-origin resource sharing
  - dotenv for environment variables

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DEEPSEEK_API_KEY=your_api_key_here
PORT=3000 # Optional, defaults to 3000
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. For production:
   ```bash
   npm start
   ```

## API Integration

The application uses the Deepseek AI API to generate website code based on user input. Make sure to obtain an API key from Deepseek and add it to your `.env` file.
