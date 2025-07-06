import React from 'react';
import CanvasArea from '../panels/CanvasArea';
import ConfigurationPanel from '../panels/ConfigurationPanel';
import NavigationPanel from '../panels/NavigationPanel';
import DataDashboard from '../visualization/DataDashboard';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-md">
        <NavigationPanel />
      </div>
      <div className="flex-1 p-4">
        <CanvasArea />
        <DataDashboard />
      </div>
      <div className="w-96 bg-white shadow-md">
        <ConfigurationPanel />
      </div>
    </div>
  );
};

export default DashboardLayout;
