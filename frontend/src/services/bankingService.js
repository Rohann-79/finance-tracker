import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const addBankAccount = async (accountData) => {
    try {
        const response = await axios.post(`${API_URL}/bank-accounts/`, accountData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getBankAccounts = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/bank-accounts/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const addTransaction = async (transactionData) => {
    try {
        const response = await axios.post(`${API_URL}/transactions/`, transactionData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getTransactions = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/transactions/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getSpendingPatterns = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/analysis/spending-patterns/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getWastefulSpending = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/analysis/wasteful-spending/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getSavingsOpportunities = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/analysis/savings-opportunities/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getMonthlySummary = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/analysis/monthly-summary/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}; 