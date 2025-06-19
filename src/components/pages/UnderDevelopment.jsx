import React from 'react';

const UnderDevelopment = () => {
  return (
    <div className="bg-white p-12 rounded-lg shadow text-center">
      <div className="text-6xl mb-4">🚧</div>
      <h3 className="text-xl font-semibold mb-2">Function under development</h3>
      <p className="text-gray-500">This feature will be completed in the next version.</p>
    </div>
  );
};

export default UnderDevelopment;