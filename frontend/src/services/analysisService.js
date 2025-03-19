import api from './api';

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