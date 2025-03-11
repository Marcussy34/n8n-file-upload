import { useState } from "react";

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(""); // "success", "error", or ""

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setMessage("");
    setStatus("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a PDF file first.");
      setStatus("error");
      return;
    }

    if (file.type !== "application/pdf") {
      setMessage("Only PDF files are allowed.");
      setStatus("error");
      return;
    }

    setIsUploading(true);
    setMessage("Uploading file...");
    setStatus("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage("File uploaded successfully and sent to n8n!");
        setStatus("success");
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById("file-upload");
        if (fileInput) fileInput.value = "";
      } else {
        setMessage(`Error: ${result.error}`);
        setStatus("error");
      }
    } catch (error) {
      setMessage("Upload failed. Please try again.");
      setStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-8 border border-black/[.08] dark:border-white/[.145] rounded-lg max-w-md mx-auto">
      <h2 className="text-xl font-semibold">Upload PDF to n8n</h2>
      
      <div className="flex flex-col gap-2">
        <label htmlFor="file-upload" className="text-sm font-medium">
          Select PDF file:
        </label>
        <input 
          id="file-upload"
          type="file" 
          accept=".pdf,application/pdf" 
          onChange={handleFileChange}
          className="border border-black/[.08] dark:border-white/[.145] rounded p-2 text-sm"
        />
        {file && (
          <p className="text-sm mt-1">
            Selected: <span className="font-mono">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>
      
      <button 
        onClick={handleUpload}
        disabled={isUploading || !file}
        className={`rounded-full border border-solid transition-colors flex items-center justify-center gap-2 h-10 px-4
          ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}
          ${!file ? 'opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-800 border-transparent' : 
            'bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] border-transparent'}`}
      >
        {isUploading ? "Uploading..." : "Upload to n8n"}
      </button>
      
      {message && (
        <div className={`text-sm p-3 rounded ${
          status === "success" ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200" : 
          status === "error" ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200" : 
          "bg-gray-100 dark:bg-gray-800"
        }`}>
          {message}
        </div>
      )}
    </div>
  );
} 