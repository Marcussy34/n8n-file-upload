import formidable from "formidable";
import fs from "fs";
import path from "path";
import axios from "axios";
import { createReadStream } from "fs";
import FormData from "form-data";

// Disable the default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Create uploads directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Configure formidable
  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
  });

  try {
    // Parse the form
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Get the uploaded file
    const file = files.file[0]; // Access the first file in the array
    
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Get the file path - in newer formidable versions, it's in file.filepath
    const filePath = file.filepath || (file.path ? file.path : null);
    
    if (!filePath) {
      return res.status(500).json({ error: "Could not determine file path" });
    }

    // Validate file type
    if (file.mimetype !== "application/pdf") {
      // Clean up the invalid file
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Only PDF files are allowed" });
    }

    // Replace with your actual n8n webhook URL
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || "https://your-n8n-instance.com/webhook/pdf-upload";

    // Create form data for the n8n webhook
    const formData = new FormData();
    formData.append("file", createReadStream(filePath), {
      filename: file.originalFilename || file.originalname || "uploaded.pdf",
      contentType: "application/pdf",
    });

    // Add the file name as a separate field
    const fileName = file.originalFilename || file.originalname || "uploaded.pdf";
    formData.append("fileName", fileName);
    
    // You can also add additional metadata if needed
    formData.append("fileSize", file.size || "unknown");
    formData.append("uploadedAt", new Date().toISOString());

    // Send the file to n8n webhook
    const n8nResponse = await axios.post(n8nWebhookUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    // Clean up the file after sending to n8n
    fs.unlinkSync(filePath);

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully and sent to n8n",
      filename: file.originalFilename || file.originalname || "uploaded.pdf",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      error: "File upload failed",
      details: error.message,
    });
  }
} 