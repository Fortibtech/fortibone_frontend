import axiosInstance from './axiosInstance';

// Types
export interface RegisterPayload {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    dateOfBirth: string;
    country: string;
    city: string;
    gender: 'MALE' | 'FEMALE';
    profileType: 'PARTICULIER' | 'PRO';
}

export interface LoginResponse {
    success: boolean;
    token?: string;
    message?: string;
}

export interface ResetPasswordPayload {
    email: string;
    otp: string;
    newPassword: string;
}

// Auth Service Functions
export const registerUser = async (data: RegisterPayload) => {
    try {
        const response = await axiosInstance.post('/auth/register', data);
        if (response.status === 201) {
            return {
                success: true,
                message: response.data?.message || 'Inscription réussie.',
            };
        }
        throw new Error('Réponse inattendue du serveur.');
    } catch (error: any) {
        console.error('Registration error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        if (error.response?.status === 409) {
            throw new Error('Cet email est déjà utilisé.');
        }
        if (error.response?.data?.message) {
            const msg = Array.isArray(error.response.data.message)
                ? error.response.data.message.join(', ')
                : error.response.data.message;
            throw new Error(msg);
        }
        throw new Error('Une erreur est survenue lors de l\'inscription.');
    }
};

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
    try {
        const response = await axiosInstance.post('/auth/login', { email, password });

        if (response.status === 201) {
            return {
                success: true,
                token: response.data?.access_token,
            };
        }
        throw new Error('Réponse inattendue du serveur.');
    } catch (error: any) {
        if (error.response?.status === 401 &&
            error.response?.data?.message === 'Veuillez d\'abord vérifier votre e-mail.') {
            const err = new Error('EMAIL_NOT_VERIFIED');
            (err as any).originalMessage = error.response.data.message;
            throw err;
        }
        if (error.response?.status === 401) {
            throw new Error('Identifiants invalides.');
        }
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Une erreur est survenue lors de la connexion.');
    }
};

export const forgotPassword = async (email: string) => {
    try {
        const response = await axiosInstance.post('/auth/forgot-password', { email });
        return {
            success: true,
            data: response.data,
            status: response.status,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data || { message: 'Une erreur est survenue.' },
            status: error.response?.status || 500,
        };
    }
};

export const resetPassword = async (data: ResetPasswordPayload) => {
    try {
        const response = await axiosInstance.post('/auth/reset-password', data);
        if (response.status === 201) {
            return {
                success: true,
                message: response.data?.message || 'Mot de passe mis à jour avec succès.',
            };
        }
        throw new Error('Réponse inattendue du serveur.');
    } catch (error: any) {
        if (error.response?.status === 400) {
            throw new Error('Le code OTP est invalide ou expiré.');
        }
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Une erreur est survenue lors de la réinitialisation.');
    }
};

export const resendOtp = async (email: string, type: 'PASSWORD_RESET' | 'EMAIL_VERIFICATION') => {
    try {
        const response = await axiosInstance.post('/auth/resend-otp', { email, type });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Erreur inconnue' };
    }
};

export const verifyEmail = async (email: string, otp: string) => {
    try {
        const response = await axiosInstance.post('/auth/verify-email', { email, otp });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: 'Erreur inconnue' };
    }
};

export const getProfile = async () => {
    try {
        const response = await axiosInstance.get('/auth/profile');
        return response.data;
    } catch (error: any) {
        throw error;
    }
};
