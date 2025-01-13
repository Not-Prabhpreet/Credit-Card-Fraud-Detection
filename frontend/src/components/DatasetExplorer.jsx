import React, { useState, useEffect } from 'react';
import { Copy, Info } from 'lucide-react';

const DatasetExplorer = ({ onSelectTransaction }) => {
  const [samples, setSamples] = useState([]);
  const [explanation, setExplanation] = useState({});
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/sample-transactions`)
      .then(res => res.json())
      .then(data => {
        setSamples(data.samples);
        setExplanation(data.explanation);
        setLoading(false);
      })
      .catch(err => console.error('Error fetching samples:', err));
  }, []);

  const handleCopy = (transaction) => {
    onSelectTransaction({
      Time: transaction.Time.toString(),
      V1: transaction.V1.toString(),
      V2: transaction.V2.toString(),
      V3: transaction.V3.toString(),
      V4: transaction.V4.toString(),
      Amount: transaction.Amount.toString()
    });
  };

  if (loading) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-xl">
        Loading sample transactions...
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="bg-[#1a1a1a] text-[#f5f2ed] p-6 rounded-t-xl">
        <h2 className="text-xl font-bold mb-2">Try Real Transaction Data</h2>
        <p className="text-sm opacity-90">
          Below are real transactions from our dataset. Click "Use This Transaction" to test any example.
          Green rows are legitimate transactions, red rows are known fraud cases.
        </p>
      </div>
      
      <div className="overflow-x-auto border-2 border-[#1a1a1a] rounded-b-xl">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-b">Time</th>
              <th className="px-4 py-2 border-b">Amount ($)</th>
              <th className="px-4 py-2 border-b">V1</th>
              <th className="px-4 py-2 border-b">V2</th>
              <th className="px-4 py-2 border-b">V3</th>
              <th className="px-4 py-2 border-b">V4</th>
              <th className="px-4 py-2 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {samples.map((transaction, idx) => (
              <tr 
                key={idx}
                className={`${
                  transaction.Class === 0 
                    ? 'hover:bg-green-50' 
                    : 'hover:bg-red-50'
                }`}
              >
                <td className="px-4 py-2 border-b">{transaction.Time}</td>
                <td className="px-4 py-2 border-b">${transaction.Amount}</td>
                <td className="px-4 py-2 border-b">{transaction.V1}</td>
                <td className="px-4 py-2 border-b">{transaction.V2}</td>
                <td className="px-4 py-2 border-b">{transaction.V3}</td>
                <td className="px-4 py-2 border-b">{transaction.V4}</td>
                <td className="px-4 py-2 border-b">
                  <button
                    onClick={() => handleCopy(transaction)}
                    className="flex items-center space-x-1 px-3 py-1 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#333] transition-colors text-sm"
                  >
                    <Copy size={14} />
                    <span>Use This Transaction</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 p-4 bg-blue-50 rounded-xl text-sm">
        <div className="flex items-start space-x-2">
          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h3 className="font-bold text-blue-800">Understanding the Data:</h3>
            <ul className="mt-2 space-y-1 text-blue-700">
              <li><strong>Time:</strong> {explanation.Time}</li>
              <li><strong>V1-V4:</strong> {explanation['V1-V4']}</li>
              <li><strong>Amount:</strong> {explanation.Amount}</li>
              <li><strong>Colors:</strong> Green rows are legitimate transactions, red rows indicate fraud</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetExplorer;
