import axiosInstance from './axiosInstance';

export interface UpdateProfileData {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    city?: string;
    country?: string;
    dateOfBirth?: string;
}

export const uploadUserAvatar = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axiosInstance.post('/users/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: "Erreur lors de l'upload de l'avatar" };
    }
};

export const updateUserProfile = async (data: UpdateProfileData) => {
    try {
        const response = await axiosInstance.patch('/users/profile', data);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { message: "Erreur lors de la mise à jour du profil" };
    }
};
