import { useState } from 'react';
import Image from 'next/image';

interface ImageUploaderProps {
  initialImage?: string;
  folder: string; // 'workshops' or 'instructors'
  onImageSelected: (file: File | null) => void;
  className?: string;
}

const ImageUploader = ({ initialImage, folder, onImageSelected, className = '' }: ImageUploaderProps) => {
  const [previewImage, setPreviewImage] = useState<string>(initialImage || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setError(null);
    
    // Create a preview URL for the selected file
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
    
    // Store the file reference but don't upload yet
    setSelectedFile(file);
    
    // Send the file to parent component
    onImageSelected(file);
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {previewImage ? (
        <div className="relative w-full h-64 mb-4">
          <Image 
            src={previewImage} 
            alt="Selected image" 
            fill 
            className="object-cover rounded-lg"
            unoptimized={previewImage.startsWith('blob:')} // For blob URLs
          />
        </div>
      ) : (
        <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
          <p className="text-gray-500">No image selected</p>
        </div>
      )}

      <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors">
        {previewImage ? 'Change Image' : 'Select Image'}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </label>

      {selectedFile && (
        <p className="text-green-600 mt-2 text-sm">
          Image selected: {selectedFile.name} (will be uploaded when you submit the form)
        </p>
      )}

      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </div>
  );
};

export default ImageUploader;