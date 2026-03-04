/**
 * ============================================================================
 * HERO SECTION COMPONENT
 * ============================================================================
 * 
 * The landing page hero section that welcomes users to the Student Accelerator.
 * This is the first screen users see when visiting the application.
 * 
 * FEATURES DISPLAYED:
 * - Animated headline with gradient text
 * - Stats about the platform (tracks, sessions, personalization)
 * - Feature cards explaining the platform benefits
 * - Call-to-action buttons for students and coaches
 * 
 * VISUAL ELEMENTS:
 * - Animated background orbs (using bg-orb CSS class)
 * - Glass-morphism panels for feature cards
 * - Framer Motion animations for entrance effects
 * - Inspirational quotes for motivation
 * 
 * NAVIGATION:
 * - "Build My Roadmap" → Opens the onboarding form
 * - "Coach Portal" / "Coach Login" → Opens coach authentication
 * 
 * USAGE:
 * <HeroSection 
 *   onGetStarted={() => navigateToForm()} 
 *   onCoachDashboard={() => navigateToCoach()} 
 * />
 * 
 * Author: Student Accelerator Team
 * ============================================================================
 */

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Target, Book, Rocket, GraduationCap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import nxtwaveLogo from '@/assets/nxtwave-logo.svg';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Props for the HeroSection component
 */
interface HeroSectionProps {
    /** Callback when user clicks "Build My Roadmap" */
    onGetStarted: () => void;
    
    /** Callback when user clicks "Coach Portal" */
    onCoachDashboard: () => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Stats displayed in the hero section
 * These highlight the platform's capabilities
 */
const HERO_STATS = [
    { value: '10+', label: 'Course Tracks' },
    { value: '500+', label: 'Sessions' },
    { value: '100%', label: 'Personalized' },
];

/**
 * Feature cards content
 * Each card explains a key benefit of the platform
 */
const FEATURE_CARDS = [
    { 
        icon: Rocket, 
        label: 'Personalized Roadmap', 
        desc: 'Get a week-by-week plan built around your available hours and learning goals.', 
    },
    { 
        icon: Book, 
        label: 'NxtWave Academy Portal Links', 
        desc: 'Every session links directly to the NxtWave Academy portal — just click and start learning.', 
    },
    { 
        icon: Target, 
        label: 'Smart Pacing', 
        desc: 'Adjusts session load based on your skill level and learning pace.', 
    },
    { 
        icon: TrendingUp, 
        label: 'Track Progress', 
        desc: 'Coaches can monitor your path and help you stay on track.', 
    },
];

/**
 * Animation configuration for Framer Motion
 */
const ANIMATION_CONFIG = {
    duration: 0.8,
    ease: 'easeOut' as const
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * HeroSection Component
 * 
 * Renders the landing page with:
 * - Animated background orbs
 * - Header with navigation
 * - Main headline and description
 * - Feature cards with hover effects
 * - Call-to-action buttons
 * 
 * @param props - Component props
 * @param props.onGetStarted - Handler for starting the onboarding flow
 * @param props.onCoachDashboard - Handler for coach portal access
 */
const HeroSection = ({ onGetStarted, onCoachDashboard }: HeroSectionProps) => {
    return (
        <section className="relative min-h-screen flex flex-col overflow-hidden bg-background text-foreground">
            {/* ----------------------------------------------------------------
                BACKGROUND DECORATIVE ORBS
                Creates a soft, glowing ambiance
            ---------------------------------------------------------------- */}
            <div className="bg-orb w-[600px] h-[600px] top-[-100px] left-[-200px] opacity-[0.15]" />
            <div className="bg-orb w-[700px] h-[700px] bottom-[-200px] right-[-100px] opacity-[0.2]" />
            <div className="bg-orb w-[400px] h-[400px] top-[30%] right-[10%] opacity-[0.08]" />

            {/* ----------------------------------------------------------------
                TOP BANNER
                Promotional message strip
            ---------------------------------------------------------------- */}
            <div className="w-full py-2.5 text-center text-primary-foreground text-xs md:text-sm font-semibold tracking-wide flex justify-center items-center gap-2 accent-gradient relative z-20">
                <Sparkles className="w-4 h-4" /> 
                NxtWave Academy — Your Personalized Learning Roadmap 
                <Sparkles className="w-4 h-4" />
            </div>

            {/* ----------------------------------------------------------------
                HEADER / NAVIGATION
            ---------------------------------------------------------------- */}
            <header className="w-full relative z-20 bg-white/60 backdrop-blur-xl border-b border-white shadow-sm px-6 py-4">
                <div className="container mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <img src={nxtwaveLogo} alt="NxtWave Logo" className="h-9" />
                    </div>
                    
                    {/* Navigation Links */}
                    <nav className="flex items-center gap-4 md:gap-8">
                        <button 
                            onClick={onGetStarted} 
                            className="text-sm font-semibold text-foreground hover:text-primary transition-colors hidden md:block"
                        >
                            Career Tracks
                        </button>
                        <button 
                            onClick={onCoachDashboard} 
                            className="text-sm font-bold text-primary hover:text-accent transition-colors relative group"
                        >
                            Coach Login
                            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-accent transition-all group-hover:w-full"></span>
                        </button>
                    </nav>
                </div>
            </header>

            {/* ----------------------------------------------------------------
                MAIN CONTENT AREA
            ---------------------------------------------------------------- */}
            <div className="flex-1 flex items-center relative z-10 pt-8 sm:pt-10 pb-16 sm:pb-20">
                <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
                    <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

                        {/* --------------------------------------------------------
                            LEFT COLUMN: Text Content
                        -------------------------------------------------------- */}
                        <div className="flex-1 lg:pr-10">
                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: ANIMATION_CONFIG.duration, ease: ANIMATION_CONFIG.ease }}
                            >
                                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/20 bg-primary/5 text-sm font-bold mb-6 sm:mb-8 text-primary shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                                    NxtWave Academy
                                </div>
                            </motion.div>

                            {/* Main Headline */}
                            <motion.h1
                                className="text-4xl sm:text-5xl lg:text-7xl font-extrabold font-display leading-[1.1] mb-5 sm:mb-6 tracking-tight text-foreground"
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: ANIMATION_CONFIG.duration, delay: 0.1, ease: ANIMATION_CONFIG.ease }}
                            >
                                Your roadmap to<br />
                                <span className="text-gradient drop-shadow-sm">tech mastery.</span>
                            </motion.h1>

                            {/* Description */}
                            <motion.p
                                className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 max-w-xl font-medium leading-relaxed"
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: ANIMATION_CONFIG.duration, delay: 0.2, ease: ANIMATION_CONFIG.ease }}
                            >
                                Tell us your goals and availability — NxtWave Academy will craft a week-by-week learning plan with direct portal links to every session.
                            </motion.p>

                            {/* Inspirational Quote */}
                            <motion.div
                                className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 mb-8 max-w-xl"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: ANIMATION_CONFIG.duration, delay: 0.25, ease: ANIMATION_CONFIG.ease }}
                            >
                                <p className="text-sm italic text-foreground/70 font-medium">
                                    "The future belongs to those who learn more skills and combine them in creative ways."
                                </p>
                                <p className="text-xs text-primary font-bold mt-1">— Robert Greene</p>
                            </motion.div>

                            {/* CTA Buttons */}
                            <motion.div
                                className="flex flex-wrap items-center gap-4"
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: ANIMATION_CONFIG.duration, delay: 0.3, ease: ANIMATION_CONFIG.ease }}
                            >
                                {/* Primary CTA */}
                                <Button
                                    size="lg"
                                    onClick={onGetStarted}
                                    className="accent-gradient border-none shadow-[0_8px_20px_rgba(99,102,241,0.3)] text-white font-bold text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7 rounded-2xl hover:scale-[1.03] transition-transform"
                                >
                                    Build My Roadmap
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                                
                                {/* Secondary CTA */}
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={onCoachDashboard}
                                    className="bg-white border-border text-foreground font-bold text-base px-6 py-6 rounded-2xl hover:bg-muted transition-all"
                                >
                                    <GraduationCap className="mr-2 h-5 w-5" />
                                    Coach Portal
                                </Button>
                            </motion.div>

                            {/* Stats Row */}
                            <motion.div
                                className="flex gap-6 sm:gap-10 mt-10 sm:mt-12"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: ANIMATION_CONFIG.duration, delay: 0.45, ease: ANIMATION_CONFIG.ease }}
                            >
                                {HERO_STATS.map((stat, index) => (
                                    <div key={index} className="text-center">
                                        <div className="text-2xl sm:text-3xl font-extrabold font-display text-foreground">
                                            {stat.value}
                                        </div>
                                        <div className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* --------------------------------------------------------
                            RIGHT COLUMN: Feature Cards
                        -------------------------------------------------------- */}
                        <div className="flex-1 w-full max-w-lg">
                            <motion.div
                                className="grid gap-4 sm:gap-5"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1, delay: 0.4, staggerChildren: 0.1 }}
                            >
                                {FEATURE_CARDS.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        className="flex items-start gap-4 sm:gap-5 p-5 sm:p-6 rounded-2xl glass-panel card-hover relative overflow-hidden group bg-white/80"
                                        whileHover={{ x: 8 }}
                                    >
                                        {/* Left accent bar on hover */}
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        
                                        {/* Icon */}
                                        <div className="p-3 sm:p-3.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                                            <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                                        </div>
                                        
                                        {/* Content */}
                                        <div className="min-w-0">
                                            <h3 className="text-base sm:text-lg font-bold text-foreground mb-1 font-display tracking-tight">
                                                {feature.label}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
                                                {feature.desc}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

// =============================================================================
// EXPORT
// =============================================================================

export default HeroSection;
