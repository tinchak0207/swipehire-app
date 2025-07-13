import { Handle, Position } from 'reactflow';

const DataMetricTriggerNode = () => {
  return (
    <div className="card w-72 bg-primary text-primary-content shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Data Metric Trigger</h2>
        <p>Triggers based on data metrics.</p>
      </div>
      <Handle type="source" position={Position.Right} className="h-4 w-4" />
    </div>
  );
};

export default DataMetricTriggerNode;
