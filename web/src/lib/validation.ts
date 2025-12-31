export interface Country {
    name: { common: string };
    flags: { png: string; svg: string };
    cca2: string;
    idd: { root: string; suffixes: string[] };
    region: string;
    subregion?: string;
}

// Get phone code from country
export const getPhoneCode = (country: Country): string => {
    if (!country.idd?.root || !country.idd?.suffixes?.length) return '';
    return country.idd.root + country.idd.suffixes[0];
};

// Phone validation rules by country code
const PHONE_RULES: Record<string, number> = {
    '+33': 9,   // France
    '+1': 10,   // USA/Canada
    '+44': 10,  // UK
    '+49': 10,  // Germany
    '+34': 9,   // Spain
    '+39': 9,   // Italy
    '+32': 9,   // Belgium
    '+41': 9,   // Switzerland
    '+237': 9,  // Cameroon
    '+225': 10, // Ivory Coast
    '+221': 9,  // Senegal
    '+212': 9,  // Morocco
    '+213': 9,  // Algeria
    '+216': 8,  // Tunisia
    '+250': 9,  // Rwanda
    '+243': 9,  // DRC
    '+254': 9,  // Kenya
    '+234': 10, // Nigeria
    '+27': 9,   // South Africa
};

// Validate phone number for a specific country
export const validatePhoneNumber = (
    phone: string,
    country: Country | null
): { valid: boolean; error?: string } => {
    if (!country || !phone) {
        return { valid: false, error: 'Numéro de téléphone requis' };
    }

    const code = getPhoneCode(country);
    if (!code) {
        return { valid: false, error: 'Pays invalide' };
    }

    // Remove the country code if present
    let number = phone;
    if (phone.startsWith(code)) {
        number = phone.replace(code, '').trim();
    }

    // Clean the number (remove spaces and dashes)
    const cleanNumber = number.replace(/[\s-]/g, '');

    // Check if only digits
    if (!/^\d+$/.test(cleanNumber)) {
        return { valid: false, error: 'Le numéro ne doit contenir que des chiffres' };
    }

    // Get expected length for this country
    const expectedLength = PHONE_RULES[code] || 9;

    if (cleanNumber.length !== expectedLength) {
        return {
            valid: false,
            error: `Le numéro doit contenir ${expectedLength} chiffres pour ${country.name.common}`
        };
    }

    return { valid: true };
};

// Format phone number for display
export const formatPhoneNumber = (phone: string, country: Country | null): string => {
    if (!country || !phone) return phone;

    const code = getPhoneCode(country);
    let number = phone;

    if (phone.startsWith(code)) {
        number = phone.replace(code, '').trim();
    }

    // Clean and format
    const cleanNumber = number.replace(/[\s-]/g, '');

    // Add spaces every 2-3 digits for readability
    if (cleanNumber.length <= 6) {
        return cleanNumber.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
    } else if (cleanNumber.length <= 9) {
        return cleanNumber.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
    } else {
        return cleanNumber.replace(/(\d{3})(\d{3})(\d+)/, '$1 $2 $3');
    }
};

// Password validation
export const validatePassword = (password: string): {
    valid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
} => {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Au moins 8 caractères');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Au moins une majuscule');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Au moins une minuscule');
    }
    if (!/\d/.test(password)) {
        errors.push('Au moins un chiffre');
    }

    const valid = errors.length === 0;

    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (errors.length <= 1 && password.length >= 8) {
        strength = 'medium';
    }
    if (valid && password.length >= 10) {
        strength = 'strong';
    }

    return { valid, errors, strength };
};

// Email validation
export const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Format date for API (YYYY-MM-DD)
export const formatDateForAPI = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

// Format date for display (DD/MM/YYYY)
export const formatDateForDisplay = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};
