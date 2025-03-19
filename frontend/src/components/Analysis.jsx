import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSpendingPatterns, getWastefulSpending, getSavingsOpportunities, getMonthlySummary } from '../services/analysisService';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Analysis = () => {
    const { user } = useAuth();
    const [monthlySummary, setMonthlySummary] = useState(null);
    const [spendingPatterns, setSpendingPatterns] = useState(null);
    const [wastefulSpending, setWastefulSpending] = useState([]);
    const [savingsOpportunities, setSavingsOpportunities] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [monthlyData, setMonthlyData] = useState([]);

    useEffect(() => {
        fetchAnalysis();
        fetchMonthlyData();
    }, [user]);

    const fetchAnalysis = async () => {
        try {
            setLoading(true);
            setError('');
            
            const [summary, patterns, wasteful, savings] = await Promise.all([
                getMonthlySummary(user.id),
                getSpendingPatterns(user.id),
                getWastefulSpending(user.id),
                getSavingsOpportunities(user.id)
            ]);

            setMonthlySummary(summary);
            setSpendingPatterns(patterns);
            setWastefulSpending(wasteful);
            setSavingsOpportunities(savings);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to fetch financial analysis');
            console.error('Analysis error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMonthlyData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/analysis/monthly_summary');
            setMonthlyData(response.data);
        } catch (err) {
            setError('Failed to fetch financial analysis');
            console.error('Error fetching monthly data:', err);
        }
    };

    if (loading) {
        return <div className="p-4">Loading analysis...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    const chartData = {
        labels: monthlyData.map(item => item.month),
        datasets: [
            {
                label: 'Income',
                data: monthlyData.map(item => item.income),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            },
            {
                label: 'Expenses',
                data: monthlyData.map(item => item.expenses),
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Monthly Income vs Expenses'
            }
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Financial Analysis</h2>
            
            <div className="bg-white p-6 rounded-lg shadow">
                <Line data={chartData} options={chartOptions} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {monthlyData.map((month, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow">
                        <h3 className="font-semibold">{month.month}</h3>
                        <div className="mt-2 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Income:</span>
                                <span className="font-medium text-green-600">${month.income.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Expenses:</span>
                                <span className="font-medium text-red-600">${month.expenses.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Net:</span>
                                <span className={`font-medium ${month.income - month.expenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${(month.income - month.expenses).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Monthly Summary */}
            {monthlySummary && (
                <div className="bg-white p-4 rounded-lg shadow mb-4">
                    <h3 className="text-xl font-semibold mb-2">Monthly Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600">Total Spent</p>
                            <p className="text-2xl font-bold">${monthlySummary.total_spent.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Essential Expenses</p>
                            <p className="text-2xl font-bold">${monthlySummary.essential_expenses.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Savings</p>
                            <p className="text-2xl font-bold">${monthlySummary.savings.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Wasteful Spending</p>
                            <p className="text-2xl font-bold text-red-500">${monthlySummary.wasteful_spending.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Spending Patterns */}
            {spendingPatterns && (
                <div className="bg-white p-4 rounded-lg shadow mb-4">
                    <h3 className="text-xl font-semibold mb-2">Spending Patterns</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(spendingPatterns.category_totals).map(([category, amount]) => (
                            <div key={category}>
                                <p className="text-gray-600">{category}</p>
                                <p className="text-xl font-bold">${amount.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Wasteful Spending */}
            {wastefulSpending.length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow mb-4">
                    <h3 className="text-xl font-semibold mb-2">Wasteful Spending</h3>
                    <div className="space-y-2">
                        {wastefulSpending.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{item.description}</p>
                                    <p className="text-sm text-gray-600">{item.merchant}</p>
                                </div>
                                <p className="text-red-500">${item.amount.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Savings Opportunities */}
            {savingsOpportunities.length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-2">Savings Opportunities</h3>
                    <div className="space-y-4">
                        {savingsOpportunities.map((opportunity, index) => (
                            <div key={index} className="border-b pb-4">
                                <p className="font-medium">{opportunity.category}</p>
                                <p className="text-sm text-gray-600">{opportunity.recommendation}</p>
                                <p className="text-green-500 mt-2">Potential Savings: ${opportunity.potential_savings.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analysis; 