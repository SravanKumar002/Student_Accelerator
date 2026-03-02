/**
 * ============================================================================
 * AUTH CONTEXT - Authentication State Management
 * ============================================================================
 * 
 * This React Context provides authentication state and methods throughout
 * the application. It handles:
 * - User session persistence (localStorage)
 * - Login/logout functionality
 * - Loading state during initialization
 * 
 * USAGE:
 * 
 * 1. Wrap your app with AuthProvider:
 *    <AuthProvider>
 *      <App />
 *    </AuthProvider>
 * 
 * 2. Access auth state in any component:
 *    const { user, login, logout, loading } = useAuth();
 * 
 * Author: Student Accelerator Team
 * ============================================================================
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * User object structure
 * Contains essential user information for the authenticated session
 */
interface User {
    /** MongoDB ObjectId as string */
    id: string;
    
    /** User's display name */
    name: string;
    
    /** User's email address */
    email: string;
    
    /** JWT token for API authentication */
    token: string;
}

/**
 * Auth Context type definition
 * Defines all values and methods available from the context
 */
interface AuthContextType {
    /** Current authenticated user (null if not logged in) */
    user: User | null;
    
    /** Function to log in a user and persist session */
    login: (token: string, userData: Omit<User, 'token'>) => void;
    
    /** Function to log out and clear session */
    logout: () => void;
    
    /** True while checking localStorage for existing session */
    loading: boolean;
}

// =============================================================================
// CONTEXT CREATION
// =============================================================================

/**
 * Auth Context
 * Initially undefined - will throw error if used outside provider
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================================================
// CONTEXT PROVIDER
// =============================================================================

/**
 * Authentication Provider Component
 * 
 * Wraps the application and provides authentication state to all children.
 * Automatically checks localStorage on mount for existing session.
 * 
 * @param children - Child components that need access to auth state
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // -------------------------------------------------------------------------
    // STATE
    // -------------------------------------------------------------------------
    
    /** Current authenticated user (or null) */
    const [user, setUser] = useState<User | null>(null);
    
    /** Loading state while checking for existing session */
    const [loading, setLoading] = useState(true);

    // -------------------------------------------------------------------------
    // EFFECT: Check for existing session on mount
    // -------------------------------------------------------------------------
    
    useEffect(() => {
        /**
         * Check localStorage for existing authentication data.
         * This allows the session to persist across page refreshes.
         */
        const token = localStorage.getItem('token');
        const userDataString = localStorage.getItem('user');

        if (token && userDataString) {
            try {
                // Parse stored user data
                const userData = JSON.parse(userDataString);
                
                // Restore the session
                setUser({ ...userData, token });
            } catch (error) {
                // Invalid data in localStorage - clear it
                console.error('Error parsing stored user data:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }

        // Done checking - stop showing loading state
        setLoading(false);
    }, []);

    // -------------------------------------------------------------------------
    // METHODS
    // -------------------------------------------------------------------------

    /**
     * Log in a user and persist session to localStorage.
     * 
     * @param token - JWT token from the backend
     * @param userData - User data (id, name, email)
     * 
     * @example
     * login(response.token, {
     *   id: response.id,
     *   name: response.name,
     *   email: response.email
     * });
     */
    const login = (token: string, userData: Omit<User, 'token'>) => {
        // Persist to localStorage for session recovery
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update state
        setUser({ ...userData, token });
    };

    /**
     * Log out the current user and clear session.
     * Removes all auth data from localStorage and state.
     */
    const logout = () => {
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Clear state
        setUser(null);
    };

    // -------------------------------------------------------------------------
    // RENDER
    // -------------------------------------------------------------------------

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// =============================================================================
// CUSTOM HOOK
// =============================================================================

/**
 * useAuth Hook
 * 
 * Custom hook to access authentication context.
 * Throws an error if used outside of AuthProvider.
 * 
 * @returns AuthContextType - User state and auth methods
 * 
 * @example
 * const { user, login, logout, loading } = useAuth();
 * 
 * if (loading) return <Spinner />;
 * if (!user) return <LoginPage />;
 * return <Dashboard user={user} />;
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    
    if (context === undefined) {
        throw new Error(
            'useAuth must be used within an AuthProvider. ' +
            'Make sure your component is wrapped with <AuthProvider>.'
        );
    }
    
    return context;
};
