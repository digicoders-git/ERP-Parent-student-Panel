import { useAuth } from '../../context/AuthContext';
import { MdPeople } from 'react-icons/md';

const ChildSelector = () => {
  const { user, selectedChild, setSelectedChild } = useAuth();

  if (user?.role !== 'parent' || !user?.children) {
    return null;
  }

  const handleChildChange = (child) => {
    setSelectedChild(child);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
          <MdPeople className="w-4 h-4" />
        </div>
        <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">Select Child Profile</h2>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {user.children.map((child) => {
          const isActive = selectedChild?.id === child.id;
          return (
            <button
              key={child.studentId}
              onClick={() => handleChildChange(child)}
              className={`px-4 py-2 rounded-xl transition-all duration-300 text-left cursor-pointer border-2 ${isActive
                ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200 hover:bg-blue-50/30'
                }`}
            >
              <div className="font-black text-xs">{child.name}</div>
              <div className={`text-[9px] font-bold uppercase tracking-tight ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
                {child.class} {child.section} • Roll: {child.rollNo}
              </div>
            </button>
          );
        })}
      </div>
      
      {selectedChild && (
        <div className="mt-3 py-1.5 px-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            Active Profile: <span className="text-blue-600 font-black">{selectedChild.name}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ChildSelector;