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
            console.log('🔼 開始上傳圖片:', { fileName: file.name, size: file.size, path });

            // Create a storage reference
            const storageRef = ref(storage, path);

            // Upload the file
            const uploadResult = await uploadBytes(storageRef, file);
            console.log('✅ 圖片上傳完成:', uploadResult.metadata.fullPath);

            // Get the download URL
            const url = await getDownloadURL(storageRef);

            console.log('✅ 取得下載網址:', url);
            return url;
        } catch (error: any) {
            console.error('❌ 圖片上傳失敗:', error);

            // 提供更詳細的錯誤訊息
            if (error.code === 'storage/unauthorized') {
                throw new Error('圖片上傳失敗：沒有權限。請檢查 Firebase Storage 規則設定。');
            } else if (error.code === 'storage/canceled') {
                throw new Error('圖片上傳已取消');
            } else if (error.code === 'storage/unknown') {
                throw new Error('圖片上傳失敗：未知錯誤。請檢查網路連線和 Firebase 設定。');
            }

            throw new Error(`圖片上傳失敗: ${error.message || error.code || '未知錯誤'}`);
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
