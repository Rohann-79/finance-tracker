import React, { useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const PlaidLink = ({ onSuccess }) => {
    const { user } = useAuth();

    const config = {
        token: null, // We'll get this from the backend
        onSuccess: async (public_token, metadata) => {
            // Send public_token to server
            try {
                const response = await axios.post('http://localhost:8000/plaid/exchange_token', {
                    public_token,
                    user_id: user.id
                });
                
                // Get historical transactions
                await axios.post('http://localhost:8000/plaid/fetch_transactions', {
                    user_id: user.id
                });

                onSuccess && onSuccess();
            } catch (error) {
                console.error('Error linking bank account:', error);
            }
        },
        onExit: (err, metadata) => {
            if (err != null) console.error('Error linking bank account:', err);
        }
    };

    const { open, ready } = usePlaidLink(config);

    return (
        <button
            onClick={() => open()}
            disabled={!ready}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
        >
            Connect Your Bank Account
        </button>
    );
};

export default PlaidLink; 