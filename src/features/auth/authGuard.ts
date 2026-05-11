import { store } from '../../app/store/store';

/**
 * Auth guard service for checking authentication
 * Works outside React component lifecycle
 */
class AuthGuardService {
    /**
     * Check if user is currently authenticated
     */
    isAuthenticated(): boolean {
        const state = store.getState();
        return !!state.auth?.user;
    }

    /**
     * Get current authenticated user
     */
    getCurrentUser() {
        const state = store.getState();
        return state.auth?.user || null;
    }

    /**
     * Check authentication and redirect to login if not authenticated
     * @param delay - Delay in ms to allow auth state to hydrate from localStorage
     * @returns Promise that resolves to true if authenticated, false if redirecting
     */
    async checkAndRedirect(delay: number = 200): Promise<boolean> {
        // Optimistic check: if already authenticated, don't wait
        if (this.isAuthenticated()) {
            return true;
        }

        return new Promise((resolve) => {
            // Wait for auth state to potentially load from localStorage
            setTimeout(() => {
                if (this.isAuthenticated()) {
                    resolve(true);
                } else {
                    // Not authenticated, redirect to login
                    window.location.href = '/login';
                    resolve(false);
                }
            }, delay);
        });
    }
}

// Export singleton instance
export const authGuard = new AuthGuardService();
