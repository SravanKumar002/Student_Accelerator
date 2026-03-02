/**
 * ============================================================================
 * FORM STEP INDICATOR COMPONENT
 * ============================================================================
 * 
 * A visual progress indicator for multi-step forms.
 * Shows which step the user is on and which steps are completed.
 * 
 * VISUAL STATES:
 * - Completed: Green circle with checkmark
 * - Current: Highlighted circle with step number
 * - Inactive: Muted circle with step number
 * 
 * STEPS DISPLAYED:
 * 1. Profile - Student information
 * 2. Goals - Learning objectives
 * 3. Schedule - Time availability
 * 
 * CSS CLASSES USED:
 * - step-completed: Completed step styling (defined in index.css)
 * - step-active: Current step styling
 * - step-inactive: Future step styling
 * 
 * USAGE:
 * <FormStepIndicator 
 *   currentStep="goals" 
 *   completedSteps={['profile']} 
 * />
 * 
 * Author: Student Accelerator Team
 * ============================================================================
 */

import { Check } from 'lucide-react';
import { FormStep } from '@/lib/types';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Props for the FormStepIndicator component
 */
interface FormStepIndicatorProps {
    /** The currently active step */
    currentStep: FormStep;
    
    /** Array of steps that have been completed */
    completedSteps: FormStep[];
}

/**
 * Internal step configuration
 */
interface StepConfig {
    key: FormStep;
    label: string;
    number: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Step configuration array
 * Defines the order and display properties of each step
 */
const STEPS: StepConfig[] = [
    { key: 'profile', label: 'Profile', number: 1 },
    { key: 'goals', label: 'Goals', number: 2 },
    { key: 'availability', label: 'Schedule', number: 3 },
];

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * FormStepIndicator Component
 * 
 * Renders a horizontal progress bar showing:
 * - Step circles with numbers or checkmarks
 * - Step labels (hidden on mobile)
 * - Connecting lines between steps
 * 
 * @param props - Component props
 * @param props.currentStep - The active step key
 * @param props.completedSteps - Array of completed step keys
 */
const FormStepIndicator = ({ currentStep, completedSteps }: FormStepIndicatorProps) => {
    /**
     * Determines the CSS class for a step circle based on its state
     */
    const getStepClass = (stepKey: FormStep): string => {
        const isCompleted = completedSteps.includes(stepKey);
        const isCurrent = currentStep === stepKey;
        
        if (isCompleted) return 'step-completed';
        if (isCurrent) return 'step-active';
        return 'step-inactive';
    };

    /**
     * Determines the CSS class for a step label based on its state
     */
    const getLabelClass = (stepKey: FormStep): string => {
        const isCurrent = currentStep === stepKey;
        return isCurrent ? 'text-foreground' : 'text-muted-foreground';
    };

    /**
     * Determines the CSS class for the connecting line
     */
    const getLineClass = (stepKey: FormStep): string => {
        const isCompleted = completedSteps.includes(stepKey);
        return isCompleted ? 'bg-success' : 'bg-border';
    };

    return (
        <div className="flex items-center justify-center gap-2 mb-10">
            {STEPS.map((step, index) => {
                const isCompleted = completedSteps.includes(step.key);
                const isLastStep = index === STEPS.length - 1;

                return (
                    <div key={step.key} className="flex items-center gap-2">
                        {/* Step Circle and Label */}
                        <div className="flex items-center gap-2">
                            {/* Circle */}
                            <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${getStepClass(step.key)}`}
                            >
                                {isCompleted ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    step.number
                                )}
                            </div>
                            
                            {/* Label (hidden on mobile) */}
                            <span
                                className={`text-sm font-medium hidden sm:block ${getLabelClass(step.key)}`}
                            >
                                {step.label}
                            </span>
                        </div>
                        
                        {/* Connecting Line (not shown after last step) */}
                        {!isLastStep && (
                            <div className={`w-12 h-0.5 mx-1 rounded ${getLineClass(step.key)}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// =============================================================================
// EXPORT
// =============================================================================

export default FormStepIndicator;
