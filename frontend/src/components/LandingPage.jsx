import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// You can use an image or icon to enhance the look. If you have an icon or logo, import it here.
import financeIcon from '../assets/finance-icon.svg';  // Example: Make sure to replace with the actual image path

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-8">
      {/* Deployment Notice Banner */}
      <motion.div
        className="w-full max-w-4xl mb-8 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-lg shadow-lg"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">
              <strong>Notice:</strong> This is the frontend demo of Expense Genius. The backend is not currently deployed, so some features may not work as expected. 
              To try the full application locally, please check out the 
              <a 
                href="https://github.com/Rohann-79/finance-tracker" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-yellow-900 font-semibold ml-1"
              >
                GitHub repository
              </a> 
              and follow the setup instructions to run both frontend and backend locally.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Header Section */}
      <motion.h1
        className="text-5xl font-bold text-center mb-6"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Welcome to <span className="text-yellow-300">Expense Genius</span>
      </motion.h1>

      {/* Subheading */}
      <motion.p
        className="text-lg text-center mb-8 max-w-lg"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        Expense Genius is your smart financial assistant, using AI to analyze your banking transactions
        and provide deep insights into your spending and savings. Start managing your finances like a genius!
      </motion.p>

      {/* Finance Icon or Image */}
      <motion.img
        src={financeIcon} // Replace with your finance-related image/icon
        alt="Finance Icon"
        className="w-40 h-40 mb-6 animate__animated animate__fadeIn"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      />

      {/* How It Works Section */}
      <motion.div
        className="text-center mb-8 max-w-2xl"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
        <ul className="list-inside list-disc">
          <li className="text-lg">Securely link your bank account to our platform.</li>
          <li className="text-lg">AI analyzes your transaction history to track your spending and savings.</li>
          <li className="text-lg">Receive personalized insights and recommendations to improve your financial health.</li>
        </ul>
      </motion.div>

      {/* Call-to-Action Button */}
      <motion.div
        className="w-full flex justify-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 2 }}
      >
        <Link
          to="/signup"
          className="bg-yellow-500 text-blue-900 px-8 py-3 rounded-lg text-lg font-bold hover:bg-yellow-600 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Get Started with Expense Genius
        </Link>
      </motion.div>
    </div>
  );
};

export default LandingPage;
