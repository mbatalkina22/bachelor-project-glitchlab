'use client';

/**
 * Uploads an image directly to Cloudinary without using Base64 encoding
 */
export const uploadImage = async (file: File, folder: string): Promise<string> => {
  try {
    // Create a FormData instance to send the file directly
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('publicId', `${folder}_${Date.now()}`);

    // Make API call to upload to Cloudinary
    const response = await fetch('/api/cloudinary/upload/direct', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    throw new Error('Failed to upload image');
  }
};

/**
 * Utility function to check if a string is a valid URL
 */
export const isValidUrl = (str: string): boolean => {
  try {
    new URL(str);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Check if the image URL is still valid (not deleted from Cloudinary)
 */
export const checkImageExists = async (url: string): Promise<boolean> => {
  if (!url || !isValidUrl(url)) return false;
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
};