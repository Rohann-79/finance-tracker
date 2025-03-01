import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// You can use an image or icon to enhance the look. If you have an icon or logo, import it here.
import financeIcon from '../assets/finance-icon.svg';  // Example: Make sure to replace with the actual image path

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-8">
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
