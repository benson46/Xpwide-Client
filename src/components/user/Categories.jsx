import React from 'react';

export default function Categories(){
  const categories = [
    { name: 'GAMES', icon: '🎮' },
    { name: 'CONSOLE', icon: '🎲' },
    { name: 'ACCESSORIES', icon: '🎧' }
  ];

  return (
    <div className="flex justify-center space-x-8 my-8">
      {categories.map((category) => (
        <button
          key={category.name}
          className="flex flex-col items-center p-4 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
            <span className="text-2xl">{category.icon}</span>
          </div>
          <span className="text-sm font-medium">{category.name}</span>
        </button>
      ))}
    </div>
  );
};


