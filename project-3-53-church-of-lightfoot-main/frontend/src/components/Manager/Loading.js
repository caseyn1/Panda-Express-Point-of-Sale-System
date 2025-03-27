import React from 'react';

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white border-opacity-75"></div>
    </div>
  );
};

export default LoadingOverlay;