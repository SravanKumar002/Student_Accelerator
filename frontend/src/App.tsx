/**
 * ============================================================================
 * APP COMPONENT - Application Root
 * ============================================================================
 * 
 * This is the root component of the Student Accelerator frontend.
 * It sets up all the providers and routing for the application.
 * 
 * ARCHITECTURE:
 * 
 * App (this file)
 * ├── QueryClientProvider  - React Query for server state
 * │   └── TooltipProvider  - Radix UI tooltips
 * │       ├── Toaster      - Toast notifications (shadcn)
 * │       ├── Sonner       - Toast notifications (sonner)
 * │       └── BrowserRouter - React Router
 * │           └── Routes
 * │               ├── /   - Index (main application)
 * │               └── /*  - NotFound (404 page)
 * 
 * KEY FEATURES:
 * - Single Page Application (SPA) with client-side routing
 * - Global state management via React Query
 * - Toast notifications for user feedback
 * - Clean URL structure
 * 
 * Author: Student Accelerator Team
 * ============================================================================
 */

import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Page Components
import Index from './pages/Index';
import NotFound from './pages/NotFound';

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * React Query Client
 * 
 * Manages server state, caching, and background refetching.
 * Used for API calls throughout the application.
 */
const queryClient = new QueryClient();

// =============================================================================
// MAIN APP COMPONENT
// =============================================================================

/**
 * App Component
 * 
 * The root component that wraps the entire application.
 * Sets up providers and routing.
 * 
 * @returns The complete application wrapped in providers
 */
const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            {/* Toast Notifications */}
            <Toaster />
            <Sonner />
            
            {/* Router */}
            <BrowserRouter>
                <Routes>
                    {/* Main Application */}
                    <Route path="/" element={<Index />} />
                    
                    {/* 404 - Must be last */}
                    {/* ADD ALL CUSTOM ROUTES ABOVE THIS LINE */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

// =============================================================================
// EXPORT
// =============================================================================

export default App;
