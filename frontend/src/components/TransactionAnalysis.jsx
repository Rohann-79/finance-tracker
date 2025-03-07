import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    getTransactions,
    getSpendingPatterns,
    getWastefulSpending,
    getSavingsOpportunities,
    getMonthlySummary
} from '../services/bankingService';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const TransactionAnalysis = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [spendingPatterns, setSpendingPatterns] = useState(null);
    const [wastefulSpending, setWastefulSpending] = useState([]);
    const [savingsOpportunities, setSavingsOpportunities] = useState([]);
    const [monthlySummary, setMonthlySummary] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [
                transactionsData,
                patternsData,
                wastefulData,
                savingsData,
                summaryData
            ] = await Promise.all([
                getTransactions(user.id),
                getSpendingPatterns(user.id),
                getWastefulSpending(user.id),
                getSavingsOpportunities(user.id),
                getMonthlySummary(user.id)
            ]);

            setTransactions(transactionsData);
            setSpendingPatterns(patternsData);
            setWastefulSpending(wastefulData);
            setSavingsOpportunities(savingsData);
            setMonthlySummary(summaryData);
        } catch (err) {
            setError('Failed to fetch analysis data');
        }
    };

    const spendingChartData = spendingPatterns ? {
        labels: Object.keys(spendingPatterns.category_totals),
        datasets: [{
            label: 'Spending by Category',
            data: Object.values(spendingPatterns.category_totals),
            backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
                'rgba(255, 159, 64, 0.5)',
                'rgba(199, 199, 199, 0.5)',
                'rgba(83, 102, 255, 0.5)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(199, 199, 199, 1)',
                'rgba(83, 102, 255, 1)',
            ],
            borderWidth: 1,
        }]
    } : null;

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-6">Financial Analysis</h2>

            {/* Monthly Summary */}
            {monthlySummary && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold">Total Spent</h3>
                        <p className="text-2xl font-bold">${monthlySummary.total_spent.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold">Essential Expenses</h3>
                        <p className="text-2xl font-bold">${monthlySummary.essential_expenses.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold">Savings</h3>
                        <p className="text-2xl font-bold">${monthlySummary.savings.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold">Wasteful Spending</h3>
                        <p className="text-2xl font-bold text-red-500">${monthlySummary.wasteful_spending.toFixed(2)}</p>
                    </div>
                </div>
            )}

            {/* Spending Patterns Chart */}
            {spendingChartData && (
                <div className="bg-white p-4 rounded-lg shadow mb-8">
                    <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
                    <div className="h-[300px]">
                        <Pie data={spendingChartData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            )}

            {/* Savings Opportunities */}
            {savingsOpportunities.length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow mb-8">
                    <h3 className="text-lg font-semibold mb-4">Savings Opportunities</h3>
                    <div className="space-y-4">
                        {savingsOpportunities.map((opportunity, index) => (
                            <div key={index} className="border-b pb-4">
                                <p className="font-semibold">{opportunity.category}</p>
                                <p className="text-gray-600">{opportunity.recommendation}</p>
                                <p className="text-green-600 font-semibold">
                                    Potential Savings: ${opportunity.potential_savings.toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Wasteful Spending */}
            {wastefulSpending.length > 0 && (
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Wasteful Spending</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-3 text-left">Date</th>
                                    <th className="px-6 py-3 text-left">Description</th>
                                    <th className="px-6 py-3 text-left">Category</th>
                                    <th className="px-6 py-3 text-left">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {wastefulSpending.map((transaction, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="px-6 py-4">{new Date(transaction.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">{transaction.description}</td>
                                        <td className="px-6 py-4">{transaction.category}</td>
                                        <td className="px-6 py-4 text-red-500">${transaction.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {error && (
                <div className="mt-4 text-red-500">
                    {error}
                </div>
            )}
        </div>
    );
};

export default TransactionAnalysis; 