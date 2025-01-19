import axios from 'axios';
import { DatabaseService } from './database';

const IMGBB_API_KEY = 'e308dc4ad9c6b000233b4d8353e2e1a3'; // Get this from imgbb.com
const UPLOAD_URL = `https://api.imgbb.com/1/upload`;

export const ImageService = {
  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('key', IMGBB_API_KEY);

      const response = await axios.post(UPLOAD_URL, formData);
      return response.data.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  async updateUserAvatar(userId, file) {
    try {
      // Validate file
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('حجم الصورة يجب أن يكون أقل من 2 ميجابايت');
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('يجب أن تكون الصورة بصيغة JPG أو PNG أو WebP');
      }

      // Upload to ImgBB
      const imageUrl = await this.uploadImage(file);

      // Update user profile in Firebase
      await DatabaseService.updateUserProfile(userId, {
        photoURL: imageUrl
      });

      return imageUrl;
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  }
}; 