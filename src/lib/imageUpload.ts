import { storage } from './firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export class ImageUploadService {
    /**
     * Upload image file to Firebase Storage
     * @param file - Image file to upload
     * @param path - Storage path (e.g., 'menu-items/item-id')
     * @returns URL of uploaded image
     */
    static async uploadImage(file: File, path: string): Promise<string> {
        try {
            // Create a storage reference
            const storageRef = ref(storage, path);

            // Upload the file
            await uploadBytes(storageRef, file);

            // Get the download URL
            const url = await getDownloadURL(storageRef);

            console.log('圖片上傳成功:', url);
            return url;
        } catch (error) {
            console.error('圖片上傳失敗:', error);
            throw error;
        }
    }

    /**
     * Convert image file to optimized format if needed
     * @param file - Original image file
     * @returns Optimized file or original if optimization fails
     */
    static async optimizeImage(file: File): Promise<File> {
        // For now, just return the original file
        // You can add image compression here if needed
        return file;
    }

    /**
     * Validate image file
     * @param file - File to validate
     * @returns true if valid, throws error if invalid
     */
    static validateImage(file: File): boolean {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            throw new Error('請上傳有效的圖片格式（JPG, PNG, WebP, GIF）');
        }

        if (file.size > maxSize) {
            throw new Error('圖片大小不能超過 5MB');
        }

        return true;
    }
}
