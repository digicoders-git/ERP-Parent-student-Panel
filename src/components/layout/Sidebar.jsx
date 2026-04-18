import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import {
  MdDashboard,
  MdSchedule,
  MdMenuBook,
  MdAttachMoney,
  MdAssignment,
  MdNotifications,
  MdLogout,
  MdMenu,
  MdClose,
  MdHotel,
  MdVideoCall,
  MdVideoLibrary,
  MdLibraryBooks,
  MdCleaningServices,
  MdEventNote
} from 'react-icons/md';
import { FaRupeeSign } from "react-icons/fa";

const Sidebar = ({ onMenuClick, activeItem, setActiveItem, isExpanded, setIsExpanded }) => {
  const { logout, user } = useAuth();

  const getFirstLetter = () => {
    return user?.firstName?.charAt(0).toUpperCase() || 'U';
  };

  const handleMenuClick = (itemId) => {
    setActiveItem(itemId);
    onMenuClick(itemId);
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of the system',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        Swal.fire(
          'Logged Out!',
          'You have been successfully logged out.',
          'success'
        );
      }
    });
  };

  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: <MdDashboard className="w-5 h-5" />
    },
    {
      id: 'attendance',
      name: 'Attendance',
      icon: <MdEventNote className="w-5 h-5" />,
      hideFor: ['warden']
    },
    {
      id: 'timetable',
      name: 'Timetable',
      icon: <MdSchedule className="w-5 h-5" />,
      hideFor: ['warden']
    },
    {
      id: 'live-classes',
      name: 'Live Classes',
      icon: <MdVideoCall className="w-5 h-5" />,
      hideFor: ['warden']
    },
    {
      id: 'recorded-classes',
      name: 'Recorded Classes',
      icon: <MdVideoLibrary className="w-5 h-5" />,
      hideFor: ['warden']
    },
    {
      id: 'ediary',
      name: 'E-Diary',
      icon: <MdMenuBook className="w-5 h-5" />,
      hideFor: ['warden']
    },
    {
      id: 'fee',
      name: 'Fee',
      icon: <FaRupeeSign className="w-5 h-5" />,
      hideFor: ['warden']
    },
    {
      id: 'assignment',
      name: 'Assignment',
      icon: <MdAssignment className="w-5 h-5" />,
      hideFor: ['warden']
    },
    {
      id: 'notice',
      name: 'Notice',
      icon: <MdNotifications className="w-5 h-5" />
    },
    {
      id: 'hostel',
      name: 'Hostel',
      icon: <MdHotel className="w-5 h-5" />
    },
    {
      id: 'warden-service',
      name: 'Service Panel',
      icon: <MdCleaningServices className="w-5 h-5" />,
      showOnly: ['warden']
    },
    {
      id: 'library',
      name: 'Library',
      icon: <MdLibraryBooks className="w-5 h-5" />,
      hideFor: ['warden']
    },
    {
      id: 'leave',
      name: 'Apply Leave',
      icon: <MdEventNote className="w-5 h-5" />,
      hideFor: ['warden']
    }
  ].filter(item => {
    if (item.showOnly) return item.showOnly.includes(user?.role);
    if (item.hideFor) return !item.hideFor.includes(user?.role);
    return true;
  });

  return (
    <div
      className={`bg-gradient-to-b from-slate-800 to-slate-900 h-screen fixed left-0 top-0 z-50 transition-all duration-200 shadow-xl flex flex-col ${isExpanded ? 'w-64' : 'w-16'
        }`}
    >
      {/* Fixed Top Section: Toggle and User Info */}
      <div className="p-4 flex-shrink-0">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors duration-200 cursor-pointer"
          >
            {isExpanded ? <MdClose className="w-5 h-5" /> : <MdMenu className="w-5 h-5" />}
          </button>
        </div>

        <div className={`flex items-center mb-8 transition-all duration-150 ${isExpanded ? 'justify-start' : 'justify-center'
          }`}>
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-white font-bold text-xs">
              {getFirstLetter()}
            </span>
          </div>
          <div className={`ml-2.5 flex-1 transition-all duration-200 overflow-hidden ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
            }`}>
            <h2 className="text-base font-black text-white mb-0 whitespace-nowrap">
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} Panel
            </h2>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest whitespace-nowrap">ERP System</p>
          </div>
        </div>
      </div>

      {/* Scrollable Middle Section: Menu Items */}
      <nav className={`flex-1 overflow-y-auto px-4 space-y-2 scrollbar-none [&::-webkit-scrollbar]:w-0`}>
        {menuItems
          .map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center text-left transition-all duration-150 cursor-pointer ${isExpanded
                  ? 'px-3 py-2.5 space-x-2.5 rounded-lg'
                  : 'w-10 h-10 rounded-full justify-center mx-auto'
                } ${activeItem === item.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-md'
                  : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                }`}
              title={!isExpanded ? item.name : ''}
            >
              <div className={`${activeItem === item.id ? 'text-white' : 'text-gray-500'} flex-shrink-0`}>
                <div className={`${isExpanded ? '' : 'scale-110'}`}>
                  {item.icon}
                </div>
              </div>
              <div className={`font-bold text-xs tracking-tight transition-all duration-200 whitespace-nowrap overflow-hidden ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                {item.name}
              </div>
            </button>
          ))}
      </nav>

      {/* Fixed Bottom Section: Logout */}
      <div className="p-4 flex-shrink-0 border-t border-slate-700/50 mt-auto">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center text-left text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-150 cursor-pointer ${isExpanded
              ? 'px-4 py-3 space-x-3 rounded-xl'
              : 'w-10 h-10 rounded-full justify-center mx-auto'
            }`}
          title={!isExpanded ? 'Logout' : ''}
        >
          <MdLogout className="w-5 h-5 flex-shrink-0" />
          <span className={`font-medium transition-all duration-200 overflow-hidden whitespace-nowrap ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
            }`}>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;