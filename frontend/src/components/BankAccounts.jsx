import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PlaidLink from './PlaidLink';
import { useAuth } from '../context/AuthContext';

const BankAccounts = () => {
    const { user, token } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAccounts = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/bank-accounts/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setAccounts(response.data);
        } catch (err) {
            setError('Failed to fetch bank accounts');
            console.error('Error fetching bank accounts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && token) {
            fetchAccounts();
        }
    }, [user, token]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Bank Accounts</h2>
                <PlaidLink onSuccess={fetchAccounts} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((account) => (
                    <div key={account.id} className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium">{account.bank_name}</h3>
                                <p className="text-sm text-gray-500">{account.account_type}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-2xl font-bold">${account.balance.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">Current Balance</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BankAccounts; 