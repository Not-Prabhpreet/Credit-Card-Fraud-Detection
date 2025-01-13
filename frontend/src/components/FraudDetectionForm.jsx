import React, { useState } from 'react';
import { AlertCircle, CheckCircle, CreditCard } from 'lucide-react';
import DatasetExplorer from './DatasetExplorer';

const FraudDetectionForm = () => {
  const [formData, setFormData] = useState({
    Time: '',
    V1: '',
    V2: '',
    V3: '',
    V4: '',
    Amount: ''
  });
  
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPrediction(null);
    
    try {
      const requestData = {
        Time: parseFloat(formData.Time),
        V1: parseFloat(formData.V1),
        V2: parseFloat(formData.V2),
        V3: parseFloat(formData.V3),
        V4: parseFloat(formData.V4),
        Amount: parseFloat(formData.Amount)
      };

      console.log('Sending request data:', requestData);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received response:', data);
      setPrediction(data);
    } catch (err) {
      console.error('Error details:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f2ed] px-4 py-12">
      <div className="w-full max-w-6xl mx-auto bg-white shadow-2xl rounded-3xl p-8 md:p-12">
        <div className="flex items-center justify-center space-x-4 mb-12">
          <CreditCard className="h-10 w-10 text-[#1a1a1a]" />
          <h1 className="text-4xl font-bold text-[#1a1a1a]">
            Credit Card Fraud Detection
          </h1>
        </div>

        <DatasetExplorer onSelectTransaction={setFormData} />
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                Transaction Amount ($)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  name="Amount"
                  value={formData.Amount}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-4 bg-[#f5f2ed] border-2 border-[#1a1a1a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] transition-all"
                  required
                  placeholder="Enter amount"
                  step="0.01"
                />
              </div>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                Time (seconds)
              </label>
              <input
                type="number"
                name="Time"
                value={formData.Time}
                onChange={handleInputChange}
                className="w-full px-4 py-4 bg-[#f5f2ed] border-2 border-[#1a1a1a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] transition-all"
                required
                placeholder="Enter time in seconds"
              />
            </div>

            {['V1', 'V2', 'V3', 'V4'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-bold text-[#1a1a1a] mb-2">
                  {field} Value
                </label>
                <input
                  type="number"
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-[#f5f2ed] border-2 border-[#1a1a1a] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] transition-all"
                  step="0.000001"
                  required
                  placeholder={`Enter ${field} value`}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-6">
            <button
              type="submit"
              className="px-12 py-4 bg-[#1a1a1a] text-[#f5f2ed] text-lg font-bold rounded-xl hover:bg-[#333] focus:outline-none focus:ring-4 focus:ring-[#1a1a1a] focus:ring-opacity-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Analyzing...' : 'Analyze Transaction'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {prediction && !error && (
          <div className="mt-8 p-6 border-2 border-[#1a1a1a] rounded-xl bg-[#f5f2ed]">
            <div className="flex items-start space-x-4">
              {prediction.prediction === 1 ? (
                <>
                  <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-[#1a1a1a]">
                      Potential Fraud Detected
                    </h3>
                    <p className="mt-2 text-gray-700">
                      Fraud Probability: {(prediction.fraud_probability * 100).toFixed(2)}%
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-[#1a1a1a]">
                      Transaction Appears Legitimate
                    </h3>
                    <p className="mt-2 text-gray-700">
                      Fraud Probability: {(prediction.fraud_probability * 100).toFixed(2)}%
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FraudDetectionForm;
