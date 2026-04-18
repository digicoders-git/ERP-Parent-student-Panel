import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Dashboard from '../dashboard/Dashboard';
import Timetable from '../dashboard/Timetable';
import EDiary from '../dashboard/EDiary';
import Fee from '../dashboard/Fee';
import Assignment from '../dashboard/Assignment';
import Notice from '../dashboard/Notice';
import Hostel from '../dashboard/Hostel';
import LiveClasses from '../dashboard/LiveClasses';
import RecordedClasses from '../dashboard/RecordedClasses';
import Library from '../dashboard/Library';
import Attendance from '../dashboard/Attendance';
import ApplyLeave from '../dashboard/ApplyLeave';
import WardenServicePanel from '../dashboard/WardenServicePanel';

const Layout = ({ children }) => {
  const [activeComponent, setActiveComponent] = useState(() => {
    return localStorage.getItem('activeComponent') || 'dashboard';
  });
  const [isExpanded, setIsExpanded] = useState(true);

  const handleMenuClick = (componentId) => {
    setActiveComponent(componentId);
    localStorage.setItem('activeComponent', componentId);
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case 'dashboard': return <Dashboard onMenuClick={handleMenuClick} />;
      case 'attendance': return <Attendance />;
      case 'timetable': return <Timetable />;
      case 'live-classes': return <LiveClasses />;
      case 'recorded-classes': return <RecordedClasses />;
      case 'ediary': return <EDiary />;
      case 'fee': return <Fee />;
      case 'assignment': return <Assignment />;
      case 'notice': return <Notice />;
      case 'hostel': return <Hostel />;
      case 'library': return <Library />;
      case 'leave': return <ApplyLeave />;
      case 'warden-service': return <WardenServicePanel />;
      default: return <Dashboard onMenuClick={handleMenuClick} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar 
        onMenuClick={handleMenuClick} 
        activeItem={activeComponent}
        setActiveItem={setActiveComponent}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />
      <div className={`transition-all duration-200 ${isExpanded ? 'ml-64' : 'ml-16'}`}>
        <Navbar />
        <main className="p-4 overflow-auto">
          {renderComponent()}
        </main>
      </div>
    </div>
  );
};

export default Layout;