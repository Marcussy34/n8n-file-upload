# Next.js File Upload to n8n

A Next.js application that allows users to upload PDF files and send them to an n8n workflow via webhook.

## Features

- PDF file upload with client-side validation
- Server-side file processing with formidable
- Direct integration with n8n webhooks
- Responsive UI with status feedback

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file based on `.env.example` and add your n8n webhook URL
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## n8n Configuration

In your n8n workflow:

1. Add a Webhook node as the trigger
2. Configure it to accept POST requests
3. Enable "Binary Data" option and set the binary property name to "file"
4. Use the webhook URL in your `.env.local` file

## Dependencies

- Next.js
- React
- formidable (for file uploads)
- axios (for HTTP requests)
- form-data (for multipart/form-data requests)

## License

MIT
