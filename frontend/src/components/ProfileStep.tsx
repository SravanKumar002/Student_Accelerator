/**
 * ============================================================================
 * PROFILE STEP COMPONENT
 * ============================================================================
 * 
 * First step of the onboarding wizard.
 * Collects basic student information for personalized learning paths.
 * 
 * FIELDS COLLECTED:
 * - Full Name (required) - Student's name for personalization
 * - Current Year - Academic year (1st through 4th)
 * - Language Comfort - Preferred language (Telugu, English, Other)
 * - Academic Backlogs - Whether student has pending subjects
 * 
 * USAGE:
 * <ProfileStep 
 *   data={profileState} 
 *   onChange={(newData) => setProfileState(newData)} 
 * />
 * 
 * Author: Student Accelerator Team
 * ============================================================================
 */

import { StudentProfile } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Props for the ProfileStep component
 */
interface ProfileStepProps {
    /** Current profile data */
    data: StudentProfile;
    
    /** Callback when profile data changes */
    onChange: (data: StudentProfile) => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Available academic years */
const ACADEMIC_YEARS = ['1st', '2nd', '3rd', '4th'] as const;

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * ProfileStep Component
 * 
 * Renders the profile information form with:
 * - Text input for name
 * - Dropdowns for year and language
 * - Toggle for backlogs status
 * 
 * @param props - Component props
 * @param props.data - Current profile data
 * @param props.onChange - Callback when data changes
 */
const ProfileStep = ({ data, onChange }: ProfileStepProps) => {
    // -------------------------------------------------------------------------
    // HANDLERS
    // -------------------------------------------------------------------------

    /**
     * Updates a single field in the profile data
     */
    const updateField = <K extends keyof StudentProfile>(
        field: K, 
        value: StudentProfile[K]
    ) => {
        onChange({ ...data, [field]: value });
    };

    // -------------------------------------------------------------------------
    // RENDER
    // -------------------------------------------------------------------------

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div>
                <h2 className="text-3xl font-extrabold font-display mb-2 text-foreground tracking-tight">
                    Academic & Personal Profile
                </h2>
                <p className="text-muted-foreground font-medium text-lg">
                    Tell us about yourself so we can construct your personalized blueprint.
                </p>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name Input */}
                <div className="space-y-3">
                    <Label htmlFor="name" className="text-foreground/80 text-sm font-bold">
                        Full Name <span className="text-primary">*</span>
                    </Label>
                    <Input
                        id="name"
                        placeholder="Enter your name"
                        value={data.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        required
                        className="bg-white border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl focus-visible:ring-primary shadow-sm"
                    />
                </div>

                {/* Academic Year Select */}
                <div className="space-y-3">
                    <Label className="text-foreground/80 text-sm font-bold">
                        Current Year <span className="text-primary">*</span>
                    </Label>
                    <Select 
                        value={data.year} 
                        onValueChange={(v) => updateField('year', v as StudentProfile['year'])}
                    >
                        <SelectTrigger className="bg-white border-border text-foreground h-12 rounded-xl focus:ring-primary shadow-sm">
                            <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-border text-foreground">
                            {ACADEMIC_YEARS.map((year) => (
                                <SelectItem 
                                    key={year} 
                                    value={year} 
                                    className="focus:bg-muted focus:text-foreground"
                                >
                                    {year} Year
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Email ID Input */}
                <div className="space-y-3">
                    <Label htmlFor="email" className="text-foreground/80 text-sm font-bold">
                        Email ID <span className="text-primary">*</span>
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={data.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        required
                        className="bg-white border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl focus-visible:ring-primary shadow-sm"
                    />
                </div>

                {/* Phone Number Input */}
                <div className="space-y-3">
                    <Label htmlFor="phone" className="text-foreground/80 text-sm font-bold">
                        Phone Number <span className="text-primary">*</span>
                    </Label>
                    <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={data.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        required
                        className="bg-white border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl focus-visible:ring-primary shadow-sm"
                    />
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// EXPORT
// =============================================================================

export default ProfileStep;
