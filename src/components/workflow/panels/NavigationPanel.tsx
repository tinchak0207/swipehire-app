import CardLibrary from '../dnd/CardLibrary';

const NavigationPanel = () => {
  return (
    <div>
      <h2 className="p-4 font-semibold text-lg">Navigation</h2>
      <CardLibrary />
      {/* Add navigation links here */}
    </div>
  );
};

export default NavigationPanel;
