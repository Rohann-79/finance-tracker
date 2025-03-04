import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register the required components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const chartRef = useRef(null);  // Ref to store the chart instance

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get('http://localhost:8000/expenses/');
      setExpenses(response.data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        amount: parseFloat(amount),
        category,
        date,
        user_id: 1,  // Replace with the logged-in user's ID
      };
      await axios.post('http://localhost:8000/expenses/', payload);
      fetchExpenses(); // Refresh the expenses list
      setAmount('');
      setCategory('');
      setDate('');
    } catch (error) {
      console.error('Failed to add expense:', error);
    }
  };

  const handlePredict = async () => {
    try {
      const payload = {
        month: new Date().getMonth() + 1,  // Send the current month as an integer
      };
      const response = await axios.post('http://localhost:8000/predict/', payload);
      setPrediction(response.data.predicted_expense);
    } catch (error) {
      console.error('Failed to predict expenses:', error);
    }
  };

  const data = {
    labels: expenses.map((expense) => expense.category),
    datasets: [
      {
        label: 'Expenses',
        data: expenses.map((expense) => expense.amount),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <form onSubmit={handleAddExpense} className="mb-6">
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-2"
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-2"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-2"
        />
        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
        >
          Add Expense
        </button>
      </form>
      <button
        onClick={handlePredict}
        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mb-6"
      >
        Predict Next Month's Expense
      </button>
      {prediction && (
        <p className="text-lg font-semibold mb-6">
          Predicted Expense: ${prediction.toFixed(2)}
        </p>
      )}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <Bar ref={chartRef} data={data} />
      </div>
    </div>
  );
};

export default Dashboard;
