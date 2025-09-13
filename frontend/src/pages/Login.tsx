import React from 'react';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Telemedicine Nabha
          </h1>
          <p className="text-gray-600">
            Access healthcare services anytime, anywhere
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-gray-500 mb-4">Login component - Coming soon</p>
          <div className="loading loading-spinner loading-md"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
