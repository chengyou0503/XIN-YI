
import { storage } from './firebaseConfig';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

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

            throw new Error(`圖片上傳失敗: ${error.message || error.code || '未知錯誤'} `);
        }
    }

    /**
     * Delete an image from Firebase Storage given its download URL.
     * @param url - The download URL of the image to delete.
     */
    static async deleteImage(url: string): Promise<void> {
        try {
            // 從 Firebase Storage URL 中提取路徑
            // URL 格式: https://firebasestorage.googleapis.com/v0/b/BUCKET/o/PATH?alt=media&token=...
            const urlObj = new URL(url);
            const pathMatch = urlObj.pathname.match(/\/o\/(.+)/);
            if (!pathMatch) {
                throw new Error('無法從 URL 解析路徑');
            }
            // URL decode 路徑
            const imagePath = decodeURIComponent(pathMatch[1]);
            const storageRef = ref(storage, imagePath);
            await deleteObject(storageRef);
            console.log('✅ 圖片已刪除:', url);
        } catch (error) {
            console.error('❌ 刪除圖片失敗:', error);
            // 不拋出錯誤，僅記錄，因為刪除失敗不應阻止其他操作
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
