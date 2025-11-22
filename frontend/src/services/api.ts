import axios from 'axios';

// Tu URL de Render (con el prefijo de API si lo usaste)
const API_BASE_URL = process.env.REACT_APP_API_URL;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

// --- Interceptor de Petición ---
// Se ejecuta ANTES de cada petición
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- Métodos Helper ---

export const saveDemographics = async (sessionId: string, age: number, gender: string) => {
    return apiClient.post(`/vocational-test/${sessionId}/demographics`, { age, gender });
};

export default apiClient;