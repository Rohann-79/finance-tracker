import React, { useCallback, useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const PlaidLink = ({ onSuccess }) => {
    const { user, token } = useAuth();
    const [linkToken, setLinkToken] = useState(null);

    const getLinkToken = async () => {
        try {
            const response = await axios.post('http://localhost:8000/plaid/create_link_token', {
                user_id: user.id
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setLinkToken(response.data.link_token);
        } catch (error) {
            console.error('Error getting link token:', error);
        }
    };

    const config = {
        token: linkToken,
        onSuccess: async (public_token, metadata) => {
            try {
                const response = await axios.post('http://localhost:8000/plaid/exchange_token', {
                    public_token,
                    user_id: user.id
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                await axios.post('http://localhost:8000/plaid/fetch_transactions', {
                    access_token: response.data.access_token,
                    user_id: user.id
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                onSuccess && onSuccess();
            } catch (error) {
                console.error('Error linking bank account:', error);
            }
        },
        onExit: (err, metadata) => {
            if (err != null) console.error('Error linking bank account:', err);
        },
        onLoad: () => {
            console.log('Plaid Link loaded');
        },
        onEvent: (eventName, metadata) => {
            console.log('Plaid Link event:', eventName, metadata);
        }
    };

    const { open, ready } = usePlaidLink(config);

    const handleClick = async () => {
        if (!linkToken) {
            await getLinkToken();
        }
        if (linkToken) {
            open();
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={!ready || !linkToken}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
            Connect Your Bank Account
        </button>
    );
};

export default PlaidLink; 