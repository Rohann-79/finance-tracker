import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const addBankAccount = async (accountData) => {
    try {
        const response = await api.post('/bank-accounts/', accountData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getBankAccounts = async (userId) => {
    try {
        const response = await api.get(`/bank-accounts/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const addTransaction = async (transactionData) => {
    try {
        const response = await api.post('/transactions/', transactionData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getTransactions = async (userId) => {
    try {
        const response = await api.get(`/transactions/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getSpendingPatterns = async (userId) => {
    try {
        const response = await api.get(`/analysis/spending-patterns/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getWastefulSpending = async (userId) => {
    try {
        const response = await api.get(`/analysis/wasteful-spending/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getSavingsOpportunities = async (userId) => {
    try {
        const response = await api.get(`/analysis/savings-opportunities/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getMonthlySummary = async (userId) => {
    try {
        const response = await api.get(`/analysis/monthly-summary/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}; 