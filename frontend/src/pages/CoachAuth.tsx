/**
 * ============================================================================
 * COACH AUTHENTICATION PAGE
 * ============================================================================
 * 
 * Authentication page for coaches/mentors to access the coach dashboard.
 * Supports both traditional email/password and Google OAuth authentication.
 * 
 * AUTHENTICATION METHODS:
 * 1. Email/Password - Traditional login and registration
 * 2. Google OAuth - One-click sign-in via Firebase Google Auth
 * 
 * USER FLOW:
 * - New users: Register with name, email, password → Auto-login → Dashboard
 * - Existing users: Login with email/password → Dashboard
 * - Google users: Click Google button → Firebase popup → Backend verification → Dashboard
 * 
 * BACKEND INTEGRATION:
 * - POST /api/auth/register - Create new account
 * - POST /api/auth/login - Login with credentials
 * - POST /api/auth/firebase-google - Verify Google ID token
 * 
 * USAGE:
 * <CoachAuth 
 *   onBack={() => navigateHome()} 
 *   onSuccess={() => navigateToDashboard()} 
 * />
 * 
 * Author: Student Accelerator Team
 * ============================================================================
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import api from '@/lib/api';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Props for the CoachAuth component
 */
interface CoachAuthProps {
    /** Callback to navigate back to home/landing */
    onBack: () => void;
    
    /** Callback after successful authentication */
    onSuccess: () => void;
}

const CoachAuth = ({ onBack, onSuccess }: CoachAuthProps) => {
    const { login } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();
            
            const response = await api.post(`/api/auth/firebase-google`, {
                idToken,
                name: result.user.displayName,
                email: result.user.email,
                role: 'coach'
            });

            login(response.data.token, response.data);
            toast.success('Successfully logged in with Google!');
            onSuccess();
        } catch (error: any) {
            console.error('Google sign-in error:', error);
            // Handle specific Firebase errors
            if (error.code === 'auth/popup-closed-by-user') {
                toast.error('Sign-in popup was closed. Please try again.');
            } else if (error.code === 'auth/popup-blocked') {
                toast.error('Popup was blocked. Please allow popups for this site.');
            } else if (error.code === 'auth/cancelled-popup-request') {
                // User cancelled, no need to show error
            } else if (error.code === 'auth/unauthorized-domain') {
                toast.error('This domain is not authorized for sign-in. Please contact support.');
            } else {
                toast.error(error.response?.data?.message || error.message || 'Google sign-in failed.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = isLogin ? {
                email: formData.email,
                password: formData.password
            } : {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: 'coach'
            };

            const response = await api.post(`/api/auth${isLogin ? '/login' : '/register'}`, payload);

            login(response.data.token, response.data);
            toast.success(isLogin ? 'Successfully logged in!' : 'Account created successfully!');
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Authentication failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col pt-10 px-6">
            <div className="container mx-auto max-w-md w-full">
                <Button variant="ghost" className="mb-8 p-0 hover:bg-transparent" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Card className="card-elevated border-opacity-50">
                        <CardHeader className="space-y-1 text-center pb-6">
                            <CardTitle className="text-2xl font-display font-bold">Coach Portal</CardTitle>
                            <CardDescription>
                                {isLogin ? 'Enter your credentials to manage your students' : 'Create an account to start coaching'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {!isLogin && (
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="Dr. Sravan Kumar"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required={!isLogin}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="coach@nxtwave.com"
                                            className="pl-10"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            className="pl-10"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full accent-gradient hover:opacity-90 transition-opacity mt-6"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <LogIn className="mr-2 h-4 w-4" />
                                    )}
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                </Button>
                            </form>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                            >
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Continue with Google
                            </Button>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 pt-4 border-t border-border/10">
                            <div className="text-sm text-center text-muted-foreground">
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="text-primary hover:underline font-medium focus:outline-none"
                                >
                                    {isLogin ? 'Sign up' : 'Log in'}
                                </button>
                            </div>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default CoachAuth;
