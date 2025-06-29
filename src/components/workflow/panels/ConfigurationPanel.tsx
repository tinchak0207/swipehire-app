import React from 'react';
import AlertSystem from '../visualization/AlertSystem';

const ConfigurationPanel = () => {
  return (
    <div>
      <h2 className="p-4 text-lg font-semibold">Configuration</h2>
      <AlertSystem />
      {/* Add configuration options here */}
    </div>
  );
};

export default ConfigurationPanel;
