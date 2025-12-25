import React from 'react';

type Props = {
  onAdd: () => void;
  mode: 'visual' | 'raw';
  setMode: (m: 'visual' | 'raw') => void;
  onExtract?: () => void;
};

const Toolbar: React.FC<Props> = ({ onAdd, mode, setMode, onExtract }) => {
  return (
    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-300 rounded-t-lg">
      <button 
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        onClick={onAdd}
      >
        ➕ <span>Add Step</span>
      </button>
      
      <div className="ml-auto flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
        <button 
          className={`px-4 py-2 font-semibold rounded-md transition-all duration-200 ${
            mode === 'visual' 
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setMode('visual')}
        >
          👁️ Visual
        </button>
        
        <button 
          className={`px-4 py-2 font-semibold rounded-md transition-all duration-200 ${
            mode === 'raw' 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setMode('raw')}
        >
          ⚙️ Raw
        </button>
        
        {onExtract && (
          <button 
            className="px-4 py-2 font-semibold rounded-md text-gray-600 hover:bg-orange-100 hover:text-orange-700 transition-all duration-200"
            onClick={onExtract}
            title="Copy all steps to clipboard"
          >
            📋 Extract
          </button>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
