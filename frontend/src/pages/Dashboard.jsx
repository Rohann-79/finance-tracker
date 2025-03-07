import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BankAccounts from '../components/BankAccounts';
import AddTransaction from '../components/AddTransaction';
import TransactionAnalysis from '../components/TransactionAnalysis';

const Dashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('analysis');

    const tabs = [
        { id: 'analysis', name: 'Analysis' },
        { id: 'accounts', name: 'Bank Accounts' },
        { id: 'transactions', name: 'Add Transaction' }
    ];

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8">Welcome, {user?.username}!</h1>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                py-4 px-1 border-b-2 font-medium text-sm
                                ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                            `}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'analysis' && <TransactionAnalysis />}
                {activeTab === 'accounts' && <BankAccounts />}
                {activeTab === 'transactions' && <AddTransaction />}
            </div>
        </div>
    );
};

export default Dashboard;
