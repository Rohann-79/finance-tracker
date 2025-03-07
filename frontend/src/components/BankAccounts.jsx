import React, { useState, useEffect } from 'react';
import { addBankAccount, getBankAccounts } from '../services/bankingService';
import { useAuth } from '../context/AuthContext';

const BankAccounts = () => {
    const { user } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [newAccount, setNewAccount] = useState({
        account_number: '',
        bank_name: '',
        account_type: 'checking',
        balance: 0
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const data = await getBankAccounts(user.id);
            setAccounts(data);
        } catch (err) {
            setError('Failed to fetch bank accounts');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const accountData = {
                ...newAccount,
                user_id: user.id
            };
            await addBankAccount(accountData);
            fetchAccounts();
            setNewAccount({
                account_number: '',
                bank_name: '',
                account_type: 'checking',
                balance: 0
            });
        } catch (err) {
            setError('Failed to add bank account');
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Bank Accounts</h2>
            
            {/* Add New Account Form */}
            <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Add New Account</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Account Number"
                        value={newAccount.account_number}
                        onChange={(e) => setNewAccount({...newAccount, account_number: e.target.value})}
                        className="p-2 border rounded"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Bank Name"
                        value={newAccount.bank_name}
                        onChange={(e) => setNewAccount({...newAccount, bank_name: e.target.value})}
                        className="p-2 border rounded"
                        required
                    />
                    <select
                        value={newAccount.account_type}
                        onChange={(e) => setNewAccount({...newAccount, account_type: e.target.value})}
                        className="p-2 border rounded"
                    >
                        <option value="checking">Checking</option>
                        <option value="savings">Savings</option>
                        <option value="credit">Credit Card</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Initial Balance"
                        value={newAccount.balance}
                        onChange={(e) => setNewAccount({...newAccount, balance: parseFloat(e.target.value)})}
                        className="p-2 border rounded"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Add Account
                </button>
            </form>

            {/* Display Accounts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map(account => (
                    <div key={account.id} className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold">{account.bank_name}</h3>
                        <p className="text-gray-600">Account: {account.account_number}</p>
                        <p className="text-gray-600">Type: {account.account_type}</p>
                        <p className="text-xl font-bold mt-2">
                            Balance: ${account.balance.toFixed(2)}
                        </p>
                    </div>
                ))}
            </div>

            {error && (
                <div className="mt-4 text-red-500">
                    {error}
                </div>
            )}
        </div>
    );
};

export default BankAccounts; 