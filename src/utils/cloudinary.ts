import { v2 as cloudinary } from 'cloudinary';

// This file should only be imported in server components or API routes
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export const uploadImage = async (file: File, folder: string): Promise<string> => {
  const fileStr = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });

  try {
    // Make API call to upload to Cloudinary
    const response = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        fileStr, 
        folder,
        publicId: `${folder}_${Date.now()}` // Create unique ID
      }),
    });

    const data = await response.json();
    return data.url;
  } catch (error) {
    throw new Error('Failed to upload image');
  }
};