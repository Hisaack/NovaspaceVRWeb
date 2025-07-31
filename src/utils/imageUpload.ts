interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadImage = async (file: File, folder: string = 'uploads'): Promise<UploadResult> => {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.'
      };
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size too large. Please upload an image smaller than 5MB.'
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    
    // Ensure consistent folder structure for all uploads
    let uploadFolder = folder;
    if (folder === 'modules') {
      uploadFolder = 'modules'; // All modules go to same folder regardless of course type
    } else if (folder === 'courses') {
      uploadFolder = 'courses'; // All courses go to same folder regardless of visibility
    }
    
    const filename = `${uploadFolder}_${timestamp}_${randomString}.${extension}`;

    // Create FormData for upload
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', uploadFolder);
    formData.append('filename', filename);

    // Upload to server
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:7001/api'}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      return {
        success: false,
        error: errorData.message || 'Failed to upload image'
      };
    }

    const result = await response.json();
    
    return {
      success: true,
      url: result.url // This will be something like '/uploads/courses/course_1234567890_abc123.jpg'
    };

  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.'
    };
  }
};

export const deleteImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract filename from URL
    const filename = imageUrl.split('/').pop();
    if (!filename) return false;

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:7001/api'}/upload/image/${filename}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Image delete error:', error);
    return false;
  }
};

// Utility function to validate image URLs
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Check if it's a valid URL format
  try {
    new URL(url, window.location.origin);
    return true;
  } catch {
    // Check if it's a relative path
    return url.startsWith('/') && (
      url.includes('.jpg') || 
      url.includes('.jpeg') || 
      url.includes('.png') || 
      url.includes('.gif') || 
      url.includes('.webp')
    );
  }
};

// Get full URL for display
export const getImageUrl = (path: string): string => {
  if (!path) return '/MobiusBackGround.jpg'; // Default fallback
  
  // If it's already a full URL, return as is
  if (path.startsWith('http')) return path;
  
  // If it's a relative path starting with /uploads, use API base URL
  if (path.startsWith('/uploads')) {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://localhost:7001';
    return `${apiBaseUrl}${path}`;
  }
  
  // If it's a relative path, make it absolute with current origin
  if (path.startsWith('/')) return path;
  
  // Otherwise, prepend with /
  return `/${path}`;
};