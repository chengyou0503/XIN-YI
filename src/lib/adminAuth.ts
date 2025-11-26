import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';

export class AdminAuthService {
    /**
     * 登入驗證 (Firebase Auth)
     */
    static async login(email: string, password: string): Promise<void> {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            console.error('Login failed:', error);
            throw new Error(this.getErrorMessage(error.code));
        }
    }

    /**
     * 登出
     */
    static async logout(): Promise<void> {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    /**
     * 監聽登入狀態
     */
    static onAuthStateChanged(callback: (user: User | null) => void): () => void {
        return onAuthStateChanged(auth, callback);
    }

    /**
     * 取得目前使用者 (同步，但可能為 null，建議使用 onAuthStateChanged)
     */
    static get currentUser(): User | null {
        return auth.currentUser;
    }

    private static getErrorMessage(code: string): string {
        switch (code) {
            case 'auth/invalid-email':
                return 'Email 格式錯誤';
            case 'auth/user-disabled':
                return '此帳號已被停用';
            case 'auth/user-not-found':
                return '找不到此帳號';
            case 'auth/wrong-password':
                return '密碼錯誤';
            case 'auth/invalid-credential':
                return '帳號或密碼錯誤';
            default:
                return '登入失敗，請稍後再試';
        }
    }
}
