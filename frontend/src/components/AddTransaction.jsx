import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { addTransaction, getBankAccounts } from '../services/bankingService';

const AddTransaction = () => {
    const { user } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [transaction, setTransaction] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        merchant: '',
        category: 'essential',
        importance: 'necessary',
        account_id: '',
        notes: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const data = await getBankAccounts(user.id);
            setAccounts(data);
            if (data.length > 0) {
                setTransaction(prev => ({ ...prev, account_id: data[0].id }));
            }
        } catch (err) {
            setError('Failed to fetch bank accounts');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const transactionData = {
                ...transaction,
                user_id: user.id,
                amount: parseFloat(transaction.amount)
            };

            await addTransaction(transactionData);
            setSuccess('Transaction added successfully!');
            
            // Reset form
            setTransaction({
                date: new Date().toISOString().split('T')[0],
                amount: '',
                description: '',
                merchant: '',
                category: 'essential',
                importance: 'necessary',
                account_id: accounts[0]?.id || '',
                notes: ''
            });
        } catch (err) {
            setError('Failed to add transaction');
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-6">Add New Transaction</h2>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            value={transaction.date}
                            onChange={(e) => setTransaction({ ...transaction, date: e.target.value })}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <input
                            type="number"
                            step="0.01"
                            value={transaction.amount}
                            onChange={(e) => setTransaction({ ...transaction, amount: e.target.value })}
                            className="w-full p-2 border rounded"
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                            type="text"
                            value={transaction.description}
                            onChange={(e) => setTransaction({ ...transaction, description: e.target.value })}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Merchant</label>
                        <input
                            type="text"
                            value={transaction.merchant}
                            onChange={(e) => setTransaction({ ...transaction, merchant: e.target.value })}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            value={transaction.category}
                            onChange={(e) => setTransaction({ ...transaction, category: e.target.value })}
                            className="w-full p-2 border rounded"
                            required
                        >
                            <option value="essential">Essential</option>
                            <option value="savings">Savings</option>
                            <option value="education">Education</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="entertainment">Entertainment</option>
                            <option value="shopping">Shopping</option>
                            <option value="transport">Transport</option>
                            <option value="misc">Miscellaneous</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Importance</label>
                        <select
                            value={transaction.importance}
                            onChange={(e) => setTransaction({ ...transaction, importance: e.target.value })}
                            className="w-full p-2 border rounded"
                            required
                        >
                            <option value="necessary">Necessary</option>
                            <option value="important">Important</option>
                            <option value="optional">Optional</option>
                            <option value="wasteful">Wasteful</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                        <select
                            value={transaction.account_id}
                            onChange={(e) => setTransaction({ ...transaction, account_id: e.target.value })}
                            className="w-full p-2 border rounded"
                            required
                        >
                            {accounts.map(account => (
                                <option key={account.id} value={account.id}>
                                    {account.bank_name} - {account.account_number}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            value={transaction.notes}
                            onChange={(e) => setTransaction({ ...transaction, notes: e.target.value })}
                            className="w-full p-2 border rounded"
                            rows="3"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="mt-6 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Add Transaction
                </button>

                {error && (
                    <div className="mt-4 text-red-500">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mt-4 text-green-500">
                        {success}
                    </div>
                )}
            </form>
        </div>
    );
};

export default AddTransaction; 