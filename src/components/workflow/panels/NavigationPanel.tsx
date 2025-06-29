import React from 'react';
import CardLibrary from '../dnd/CardLibrary';

const NavigationPanel = () => {
  return (
    <div>
      <h2 className="p-4 text-lg font-semibold">Navigation</h2>
      <CardLibrary />
      {/* Add navigation links here */}
    </div>
  );
};

export default NavigationPanel;
