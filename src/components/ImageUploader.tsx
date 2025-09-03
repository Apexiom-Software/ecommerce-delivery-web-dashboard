// src/components/ImageUploader.tsx
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ImageUploaderProps {
  onImageSelected: (imageUri: string | null) => void;
  onRemoveImage: () => void;
  maxSize?: number; // in MB
  allowedTypes?: string[];
  initialImage?: string | null;
  removable?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  onRemoveImage,
  maxSize = 5,
  allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
  initialImage,
  removable = true,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Sync avec initialImage
  useEffect(() => {
    if (initialImage) {
      if (initialImage.startsWith("data:")) {
        setImagePreview(initialImage);
      } else if (initialImage.startsWith("http")) {
        setImagePreview(initialImage);
      } else {
        // fallback photoBase64
        setImagePreview(`data:image/png;base64,${initialImage}`);
      }
    } else {
      setImagePreview(null);
    }
  }, [initialImage]);

  const handleFile = (file: File) => {
    setError(null);

    // type
    if (!allowedTypes.includes(file.type)) {
      setError("Unsupported file type. Please use JPEG, PNG, GIF or WebP.");
      return;
    }

    // size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File is too large. Maximum size: ${maxSize}MB.`);
      return;
    }

    // preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUri = e.target?.result as string;
      setImagePreview(imageUri);
      onImageSelected(imageUri);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setError(null);
    onRemoveImage();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClickArea = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept={allowedTypes.join(",")}
        className="hidden"
      />

      {imagePreview ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group"
        >
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg shadow-md"
          />
          {removable && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center rounded-lg transition-all duration-300">
              <button
                onClick={handleRemoveImage}
                className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 bg-red-500 text-white p-2 rounded-full shadow-lg transition-all duration-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
          }`}
          onClick={handleClickArea}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <svg
              className="w-12 h-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a2 2 0 01-2-2v-5m16 0v5a2 2 0 002 2h10a2 2 0 002-2v-5m-16 0h-16M9 9h6m-6 4h6m-6 4h6m-6 4h6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-gray-600">
              <p className="font-medium text-indigo-600">Upload an image</p>
              <p className="text-sm">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to {maxSize}MB
            </p>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-2 text-sm text-red-600"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default ImageUploader;
