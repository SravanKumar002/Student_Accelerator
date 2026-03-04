/**
 * ============================================================================
 * INDEX PAGE - Main Application Page
 * ============================================================================
 * 
 * This is the main page of the Student Accelerator application.
 * It manages the user journey through different views:
 * 
 * VIEWS:
 * 1. Landing    - Welcome hero section with CTA buttons
 * 2. Form       - Multi-step onboarding wizard (Profile → Goals → Availability)
 * 3. Path       - Generated learning path timeline
 * 4. Coach Auth - Authentication for coaches
 * 5. Coach      - Coach dashboard (for mentors)
 * 
 * USER FLOW:
 * Landing → Form (3 steps) → Generate Path → View Timeline
 * 
 * Author: Student Accelerator Team
 * ============================================================================
 */

import { useState } from 'react';
import nxtwaveLogo from '@/assets/nxtwave-logo.svg';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Components
import HeroSection from '@/components/HeroSection';
import FormStepIndicator from '@/components/FormStepIndicator';
import ProfileStep from '@/components/ProfileStep';
import GoalsStep from '@/components/GoalsStep';
import AvailabilityStep from '@/components/AvailabilityStep';
import PathTimeline from '@/components/PathTimeline';
import CoachDashboard from '@/components/CoachDashboard';
import CoachAuth from '@/pages/CoachAuth';

// Types and utilities
import {
    StudentProfile,
    LearningGoals,
    Availability,
    FormStep,
    LearningPathData
} from '@/lib/types';
import api from '@/lib/api';
import { studentApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { generateLearningPath } from '@/lib/pathEngine';
import { usePersistedState, clearPersistedForm } from '@/hooks/use-persisted-state';
import { toast } from 'sonner';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Application Views
 * Represents all possible screens in the application
 */
type View = 'landing' | 'form' | 'path' | 'coach' | 'coach-auth';

// =============================================================================
// DEFAULT VALUES
// =============================================================================

/**
 * Default Profile
 * Initial values for the profile form step
 */
const defaultProfile: StudentProfile = {
    name: '',
    year: '2nd',
    email: '',
    phone: ''
};

/**
 * Default Goals
 * Initial values for the goals form step
 */
const defaultGoals: LearningGoals = {
    targetStack: 'fullstack',
    courseName: 'all',
    lastCompletedSessionId: '',
    currentSkillLevel: 2
};

/**
 * Default Availability
 * Initial values for the availability form step
 */
const defaultAvailability: Availability = {
    weekdayHours: 2,
    weekendHours: 4,
    preferredWindow: 'afternoon',
    planDuration: '1-month'
};

/**
 * Form Steps
 * The three steps of the onboarding wizard
 */
const STEPS: FormStep[] = ['profile', 'goals', 'availability'];

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validates the profile step data.
 * 
 * @param profile - The profile data to validate
 * @returns Error message string, or null if valid
 */
const validateProfile = (profile: StudentProfile): string | null => {
    if (!profile.name.trim()) {
        return 'Full Name is required.';
    }
    if (!profile.email.trim()) {
        return 'Email ID is required.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
        return 'Please enter a valid email address.';
    }
    if (!profile.phone.trim()) {
        return 'Phone Number is required.';
    }
    return null;
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Index Page Component
 * 
 * The main page that orchestrates the entire user journey.
 * Manages view state, form data, and navigation.
 */
const Index = () => {
    // -------------------------------------------------------------------------
    // HOOKS
    // -------------------------------------------------------------------------
    
    const { user } = useAuth();

    // -------------------------------------------------------------------------
    // STATE
    // -------------------------------------------------------------------------
    
    /** Current view being displayed */
    const [view, setView] = useState<View>('landing');
    
    /** Current step in the form wizard (persisted) */
    const [step, setStep] = usePersistedState<FormStep>('form-step', 'profile');
    
    /** Profile form data (persisted) */
    const [profile, setProfile] = usePersistedState('form-profile', defaultProfile);
    
    /** Goals form data (persisted) */
    const [goals, setGoals] = usePersistedState('form-goals', defaultGoals);
    
    /** Availability form data (persisted) */
    const [availability, setAvailability] = usePersistedState('form-availability', defaultAvailability);
    
    /** Generated learning path (after form submission) */
    const [generatedPath, setGeneratedPath] = useState<LearningPathData | null>(null);
    
    /** Loading state during path generation */
    const [isLoading, setIsLoading] = useState(false);

    // -------------------------------------------------------------------------
    // COMPUTED VALUES
    // -------------------------------------------------------------------------
    
    /** Index of the current step (0, 1, or 2) */
    const currentStepIndex = STEPS.indexOf(step);
    
    /** Steps that have been completed */
    const completedSteps = STEPS.slice(0, currentStepIndex) as FormStep[];

    // -------------------------------------------------------------------------
    // HANDLERS
    // -------------------------------------------------------------------------

    /**
     * Handles the "Next" button click.
     * Validates current step and either advances or submits the form.
     */
    const handleNext = async () => {
        // Validate profile step
        if (step === 'profile') {
            const error = validateProfile(profile);
            if (error) {
                toast.error(error);
                return;
            }
        }

        // Validate goals step
        if (step === 'goals') {
            if (!goals.courseName && !goals.targetStack) {
                toast.error('Please select a learning track or course.');
                return;
            }
        }

        // If not on last step, advance to next step
        if (currentStepIndex < STEPS.length - 1) {
            setStep(STEPS[currentStepIndex + 1]);
            return;
        }

        // On last step - submit form and generate path
        try {
            setIsLoading(true);
            
            // Call backend API to generate path (typed helper)
            const response = await studentApi.generatePath({
                profile,
                goals,
                availability
            });

            setGeneratedPath(response.data);
            setView('path');
            
            // Clear persisted form data after successful generation
            clearPersistedForm();
            
        } catch (error: any) {
            // Fallback to client-side path generation
            console.error('Failed to generate path via API:', error);
            toast.error('Using default curriculum path engine.');
            
            const fallbackPath = generateLearningPath({ profile, goals, availability });
            setGeneratedPath(fallbackPath);
            setView('path');
            
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handles the "Back" button click.
     * Goes to previous step or back to landing.
     */
    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setStep(STEPS[currentStepIndex - 1]);
        } else {
            setView('landing');
        }
    };

    /**
     * Handles navigation to coach dashboard.
     * Shows auth screen if not logged in.
     */
    const handleCoachDashboard = () => {
        if (user) {
            setView('coach');
        } else {
            setView('coach-auth');
        }
    };

    // -------------------------------------------------------------------------
    // RENDER: Landing View
    // -------------------------------------------------------------------------
    
    if (view === 'landing') {
        return (
            <HeroSection
                onGetStarted={() => {
                    setView('form');
                    setStep('profile');
                }}
                onCoachDashboard={handleCoachDashboard}
            />
        );
    }

    // -------------------------------------------------------------------------
    // RENDER: Coach Auth View
    // -------------------------------------------------------------------------
    
    if (view === 'coach-auth') {
        return (
            <CoachAuth
                onBack={() => setView('landing')}
                onSuccess={() => setView('coach')}
            />
        );
    }

    // -------------------------------------------------------------------------
    // RENDER: Coach Dashboard View
    // -------------------------------------------------------------------------
    
    if (view === 'coach') {
        return <CoachDashboard onBack={() => setView('landing')} />;
    }

    // -------------------------------------------------------------------------
    // RENDER: Path Timeline View
    // -------------------------------------------------------------------------
    
    if (view === 'path' && generatedPath) {
        return (
            <PathTimeline
                path={generatedPath}
                onBack={() => {
                    setView('form');
                    setStep('availability');
                }}
                onHome={() => setView('landing')}
                onSave={async () => {
                    await studentApi.savePath(generatedPath);
                }}
            />
        );
    }

    // -------------------------------------------------------------------------
    // RENDER: Form View (Default)
    // -------------------------------------------------------------------------
    
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
            {/* Decorative background orbs */}
            <div className="bg-orb w-[700px] h-[700px] top-[-300px] left-[-200px] opacity-[0.12]" />
            <div className="bg-orb w-[600px] h-[600px] bottom-[-200px] right-[-200px] opacity-[0.1]" />

            <div className="container mx-auto px-6 py-10 max-w-2xl flex-1 relative z-10 flex flex-col">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <img src={nxtwaveLogo} alt="NxtWave Logo" className="h-8" />
                </div>
                
                {/* Step Indicator */}
                <FormStepIndicator currentStep={step} completedSteps={completedSteps} />

                {/* Form Card */}
                <div className="flex-1 my-8 p-8 sm:p-10 rounded-[2rem] glass-panel bg-white/70 border border-white/60 shadow-xl relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: -10 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        >
                            {/* Render current step */}
                            {step === 'profile' && (
                                <ProfileStep data={profile} onChange={setProfile} />
                            )}
                            {step === 'goals' && (
                                <GoalsStep data={goals} onChange={setGoals} />
                            )}
                            {step === 'availability' && (
                                <AvailabilityStep data={availability} onChange={setAvailability} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-6 pt-6 border-t border-border/60">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        onClick={handlePrev}
                        disabled={isLoading}
                        className="text-muted-foreground font-semibold hover:text-foreground hover:bg-muted rounded-xl px-6"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {currentStepIndex === 0 ? 'Home' : 'Back'}
                    </Button>
                    
                    {/* Next/Submit Button */}
                    <Button
                        onClick={handleNext}
                        disabled={isLoading}
                        className={`rounded-xl px-8 shadow-md transition-transform font-bold ${
                            currentStepIndex === STEPS.length - 1
                                ? 'accent-gradient text-white border-0 hover:scale-[1.03] shadow-[0_8px_20px_rgba(99,102,241,0.3)]'
                                : 'bg-primary text-white hover:bg-primary/90'
                        }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                Extracting <span className="animate-pulse">...</span>
                            </span>
                        ) : currentStepIndex === STEPS.length - 1 ? (
                            <>
                                Extract Data Path <Sparkles className="ml-2 h-4 w-4" />
                            </>
                        ) : (
                            <>
                                Next <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// EXPORT
// =============================================================================

export default Index;
