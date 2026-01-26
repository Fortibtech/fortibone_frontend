import axios from 'axios';

const CAREERS_API_URL = process.env.NEXT_PUBLIC_CAREERS_API_URL || 'http://localhost:8081/api';

export const careersApi = axios.create({
    baseURL: CAREERS_API_URL,
    // headers: { 'Content-Type': 'application/json' }, // Let axios handle content-type
});

// Add interceptor to include token
careersApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('candidate_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = async (email: string, pass: string) => {
    const res = await careersApi.post('/auth/login', { email, password: pass });
    if (res.data.access_token) {
        localStorage.setItem('candidate_token', res.data.access_token);
        localStorage.setItem('candidate_email', email);
    }
    return res.data;
};

export const register = async (email: string, pass: string) => {
    const res = await careersApi.post('/auth/register', { email, password: pass });
    return res.data; // Register usually requires login afterwards or returns token depending on implementation
};

export const logout = () => {
    localStorage.removeItem('candidate_token');
    localStorage.removeItem('candidate_email');
};

export interface JobPosition {
    id: string;
    title: string;
    department: string;
    location: string;
    type: string;
    description: string;
    requirements: string | string[]; // Accessing compiled backend, type might vary
    targetCandidates?: number;
    isActive: boolean;
    createdAt: string;
}

export const getJobs = async (): Promise<JobPosition[]> => {
    try {
        const response = await careersApi.get<JobPosition[]>('/jobs');
        return response.data;
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return [];
    }
};

export const applyToJob = async (jobId: string, candidate: any) => {
    // If candidate is FormData, axios handles headers automatically
    return await careersApi.post(`/jobs/${jobId}/apply`, candidate);
};

export const createJob = async (data: Partial<JobPosition>) => {
    return await careersApi.post('/jobs', data);
};

export const updateJob = async (id: string, data: Partial<JobPosition>) => {
    return await careersApi.patch(`/jobs/${id}`, data);
};

export const deleteJob = async (id: string) => {
    return await careersApi.delete(`/jobs/${id}`);
};
