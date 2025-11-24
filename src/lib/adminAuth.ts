// 簡單的認證服務
const ADMIN_USERS = [
    { username: 'admin', password: 'admin', role: 'admin' },
    { username: '0503', password: '0503', role: 'staff' },
];

export class AdminAuthService {
    private static SESSION_KEY = 'admin_session';

    /**
     * 登入驗證
     */
    static login(username: string, password: string): boolean {
        const user = ADMIN_USERS.find(
            u => u.username === username && u.password === password
        );

        if (user) {
            // 儲存登入狀態到 sessionStorage
            sessionStorage.setItem(this.SESSION_KEY, JSON.stringify({
                username: user.username,
                role: user.role,
                loginTime: new Date().toISOString(),
            }));
            return true;
        }

        return false;
    }

    /**
     * 檢查是否已登入
     */
    static isAuthenticated(): boolean {
        if (typeof window === 'undefined') return false;
        const session = sessionStorage.getItem(this.SESSION_KEY);
        if (!session) return false;

        try {
            const data = JSON.parse(session);
            // Check if data has required fields
            return !!(data.username && data.role);
        } catch (e) {
            return false;
        }
    }

    /**
     * 取得目前登入的用戶資訊
     */
    static getCurrentUser() {
        if (typeof window === 'undefined') return null;
        const session = sessionStorage.getItem(this.SESSION_KEY);
        return session ? JSON.parse(session) : null;
    }

    /**
     * 登出
     */
    static logout() {
        if (typeof window === 'undefined') return;
        sessionStorage.removeItem(this.SESSION_KEY);
    }
}
