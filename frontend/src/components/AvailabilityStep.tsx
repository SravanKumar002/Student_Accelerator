/**
 * ============================================================================
 * AVAILABILITY STEP COMPONENT
 * ============================================================================
 * 
 * Third and final step of the onboarding wizard.
 * Collects time availability for scheduling learning sessions.
 * 
 * FIELDS COLLECTED:
 * - Weekday Hours - Hours available per weekday (Mon-Fri)
 * - Weekend Hours - Hours available per weekend day (Sat-Sun)
 * - Plan Duration - Target completion timeframe (1 week to 2 months)
 * 
 * CALCULATIONS:
 * - Total Weekly Hours = (Weekday Hours × 5) + (Weekend Hours × 2)
 * - This metric is used by the path engine to determine session pacing
 * 
 * USAGE:
 * <AvailabilityStep 
 *   data={availabilityState} 
 *   onChange={(newData) => setAvailabilityState(newData)} 
 * />
 * 
 * Author: Student Accelerator Team
 * ============================================================================
 */

import { Availability } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Props for the AvailabilityStep component
 */
interface AvailabilityStepProps {
    /** Current availability data */
    data: Availability;
    
    /** Callback when availability data changes */
    onChange: (data: Availability) => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Available plan duration options
 * Defines the target completion timeframe for the learning path
 */
const DURATIONS = [
    { value: '1-week', label: '1 Week Sprint' },
    { value: '2-week', label: '2 Week Sprint' },
    { value: '3-week', label: '3 Week Sprint' },
    { value: '1-month', label: '1 Month' },
    { value: '2-month', label: '2 Months' },
] as const;

/**
 * Slider configuration for weekday hours
 */
const WEEKDAY_SLIDER = {
    min: 0,
    max: 6,
    step: 0.5,
    daysPerWeek: 5
} as const;

/**
 * Slider configuration for weekend hours
 */
const WEEKEND_SLIDER = {
    min: 0,
    max: 8,
    step: 0.5,
    daysPerWeekend: 2
} as const;

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * AvailabilityStep Component
 * 
 * Renders the time availability form with:
 * - Total weekly hours display card
 * - Dual sliders for weekday/weekend hours
 * - Duration dropdown for plan timeframe
 * 
 * @param props - Component props
 * @param props.data - Current availability data
 * @param props.onChange - Callback when data changes
 */
const AvailabilityStep = ({ data, onChange }: AvailabilityStepProps) => {
    // -------------------------------------------------------------------------
    // COMPUTED VALUES
    // -------------------------------------------------------------------------
    
    /**
     * Calculate total weekly hours from weekday and weekend availability
     * Formula: (weekdayHours × 5 days) + (weekendHours × 2 days)
     */
    const totalWeeklyHours = (data.weekdayHours * WEEKDAY_SLIDER.daysPerWeek) + 
                              (data.weekendHours * WEEKEND_SLIDER.daysPerWeekend);
    
    /** Calculate weekday total hours */
    const weekdayTotal = data.weekdayHours * WEEKDAY_SLIDER.daysPerWeek;
    
    /** Calculate weekend total hours */
    const weekendTotal = data.weekendHours * WEEKEND_SLIDER.daysPerWeekend;

    // -------------------------------------------------------------------------
    // HANDLERS
    // -------------------------------------------------------------------------

    /**
     * Updates weekday hours
     */
    const handleWeekdayChange = (values: number[]) => {
        onChange({ ...data, weekdayHours: values[0] });
    };

    /**
     * Updates weekend hours
     */
    const handleWeekendChange = (values: number[]) => {
        onChange({ ...data, weekendHours: values[0] });
    };

    /**
     * Updates plan duration
     */
    const handleDurationChange = (value: string) => {
        onChange({ ...data, planDuration: value as Availability['planDuration'] });
    };

    // -------------------------------------------------------------------------
    // RENDER
    // -------------------------------------------------------------------------

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div>
                <h2 className="text-3xl font-extrabold font-display mb-2 text-foreground tracking-tight">
                    Time Analytics
                </h2>
                <p className="text-muted-foreground font-medium text-lg">
                    Allocate data inputs for scheduling distribution.
                </p>
            </div>

            {/* Total Weekly Hours Card */}
            <div className="p-6 rounded-2xl bg-white/80 border border-primary/20 flex items-center gap-5 shadow-[0_8px_30px_rgba(99,102,241,0.06)] transition-transform hover:scale-[1.01]">
                {/* Clock Icon */}
                <div className="p-3 bg-primary/10 rounded-xl shadow-inner">
                    <Clock className="h-8 w-8 text-primary flex-shrink-0 animate-pulse" />
                </div>
                
                {/* Hours Display */}
                <div>
                    <div className="text-3xl font-extrabold font-display text-foreground tracking-tight">
                        {totalWeeklyHours}{' '}
                        <span className="text-xl text-muted-foreground font-bold">hrs/wk</span>
                    </div>
                    <div className="text-sm text-primary font-bold mt-1 uppercase tracking-wider">
                        Total capacity metric
                    </div>
                </div>
            </div>

            {/* Hour Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Weekday Hours Slider */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-foreground/80 text-sm font-bold">
                            Weekday Hours (per day)
                        </Label>
                        <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-md">
                            Mon – Fri
                        </span>
                    </div>
                    <Slider
                        value={[data.weekdayHours]}
                        onValueChange={handleWeekdayChange}
                        min={WEEKDAY_SLIDER.min}
                        max={WEEKDAY_SLIDER.max}
                        step={WEEKDAY_SLIDER.step}
                        className="w-full"
                    />
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                            5 days × {data.weekdayHours} hrs = {weekdayTotal.toFixed(1)} hrs
                        </span>
                        <span className="text-sm text-primary font-extrabold">
                            {data.weekdayHours} hrs/day
                        </span>
                    </div>
                </div>

                {/* Weekend Hours Slider */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-foreground/80 text-sm font-bold">
                            Weekend Hours (per day)
                        </Label>
                        <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-md">
                            Sat – Sun
                        </span>
                    </div>
                    <Slider
                        value={[data.weekendHours]}
                        onValueChange={handleWeekendChange}
                        min={WEEKEND_SLIDER.min}
                        max={WEEKEND_SLIDER.max}
                        step={WEEKEND_SLIDER.step}
                        className="w-full"
                    />
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                            2 days × {data.weekendHours} hrs = {weekendTotal.toFixed(1)} hrs
                        </span>
                        <span className="text-sm text-primary font-extrabold">
                            {data.weekendHours} hrs/day
                        </span>
                    </div>
                </div>
            </div>

            {/* Plan Duration Selector */}
            <div className="space-y-4">
                <Label className="text-foreground/80 text-sm font-bold">
                    How many days do you want to plan this?
                </Label>
                <Select
                    value={data.planDuration}
                    onValueChange={handleDurationChange}
                >
                    <SelectTrigger className="w-full bg-white border-border text-foreground h-14 rounded-xl focus:ring-primary shadow-sm font-medium">
                        <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border text-foreground shadow-xl z-50">
                        {DURATIONS.map((duration) => (
                            <SelectItem 
                                key={duration.value} 
                                value={duration.value} 
                                className="focus:bg-muted focus:text-foreground font-medium"
                            >
                                {duration.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};

// =============================================================================
// EXPORT
// =============================================================================

export default AvailabilityStep;
