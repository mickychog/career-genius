import axios from 'axios';

// Lógica para seleccionar la URL:
// 1. Si existe la variable de entorno (Producción/Configuración manual), usa esa.
// 2. Si no, usa localhost (Desarrollo por defecto).
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';


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

export const selectCareer = async (sessionId: string, careerName: string) => {
    return apiClient.post(`/vocational-test/${sessionId}/select-career`, { careerName });
};

export const getTestStatus = async () => {
    return apiClient.get('/vocational-test/status');
};

export default apiClient;