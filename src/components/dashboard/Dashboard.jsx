import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import ChildSelector from './ChildSelector';
import { fetchDashboardData, getCurrentStudent } from '../../services/dataService';
import {
  MdDashboard,
  MdSchedule,
  MdMenuBook,
  MdAttachMoney,
  MdAssignment,
  MdNotifications,
  MdTrendingUp,
  MdPeople,
  MdSchool,
  MdEventNote,
  MdHotel,
  MdVideoCall,
  MdVideoLibrary,
  MdLibraryBooks,
  MdCleaningServices,
  MdInfo
} from 'react-icons/md';
import { FaRupeeSign } from 'react-icons/fa';

const Dashboard = ({ onMenuClick }) => {
  const { user, selectedChild } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentStudent = getCurrentStudent(user, selectedChild);

  const handleQuickAction = (actionId) => {
    if (onMenuClick) {
      onMenuClick(actionId);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const studentId = currentStudent?.id;
        const res = await fetchDashboardData(studentId);
        if (res.success) {
          setDashboardData(res.data);
        }
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [currentStudent?.id]);

  const stats = [
    {
      title: 'Current Attendance',
      value: dashboardData?.stats?.todayAttendance || 'N/A',
      change: dashboardData?.stats?.attendancePercentage ? `${dashboardData.stats.attendancePercentage}% overall` : 'Today',
      icon: <MdPeople className="w-6 h-6" />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      hideFor: ['warden']
    },
    {
      title: 'Pending Fees',
      value: dashboardData?.stats?.pendingFees !== undefined ? `₹${dashboardData.stats.pendingFees.toLocaleString()}` : '₹0',
      change: 'Due',
      icon: <FaRupeeSign className="w-6 h-6" />,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      hideFor: ['warden']
    },
    {
      title: 'Assignments',
      value: dashboardData?.stats?.upcomingAssignments || '0',
      change: 'Pending',
      icon: <MdAssignment className="w-6 h-6" />,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      hideFor: ['warden']
    },
    {
      title: 'Issued Books',
      value: dashboardData?.stats?.issuedBooks || '0',
      change: 'In hand',
      icon: <MdLibraryBooks className="w-6 h-6" />,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      hideFor: ['warden']
    },
    // Warden Stats
    {
      title: 'Total Students',
      value: dashboardData?.stats?.totalStudents || '0',
      change: 'Occupancy',
      icon: <MdPeople className="w-6 h-6" />,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      showOnly: ['warden']
    },
    {
      title: 'Pending Services',
      value: dashboardData?.stats?.activeServices || '0',
      change: 'Requests',
      icon: <MdCleaningServices className="w-6 h-6" />,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      showOnly: ['warden']
    }
  ].filter(s => {
    if (s.showOnly) return s.showOnly.includes(user?.role);
    if (s.hideFor) return !s.hideFor.includes(user?.role);
    return true;
  });

  const quickActions = [
    {
      id: 'timetable',
      title: 'View Timetable',
      description: 'Check today\'s class schedule',
      icon: <MdSchedule className="w-6 h-6" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: 'timetable'
    },
    {
      title: 'Live Class',
      description: 'Join your interactive session',
      icon: <MdVideoCall className="w-6 h-6" />,
      color: 'bg-red-500 hover:bg-red-600',
      action: 'live-classes'
    },
    {
      title: 'Recorded',
      description: 'Watch previous lectures',
      icon: <MdVideoLibrary className="w-6 h-6" />,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      action: 'recorded-classes'
    },
    {
      title: 'E-Diary',
      description: 'View daily learning progress',
      icon: <MdMenuBook className="w-6 h-6" />,
      color: 'bg-green-500 hover:bg-green-600',
      action: 'ediary'
    },
    {
      title: 'Fee Status',
      description: 'Check payment details',
      icon: <FaRupeeSign className="w-6 h-6" />,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: 'fee'
    },
    {
      title: 'Assignments',
      description: 'View and submit assigned work',
      icon: <MdAssignment className="w-6 h-6" />,
      color: 'bg-emerald-500 hover:bg-emerald-600',
      action: 'assignment'
    },
    {
      title: 'Notices',
      description: 'Read important announcements',
      icon: <MdNotifications className="w-6 h-6" />,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: 'notice'
    },
    {
      title: 'Library',
      description: 'Check book issue history',
      icon: <MdLibraryBooks className="w-6 h-6" />,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      action: 'library'
    },
    {
      title: 'Apply Leave',
      description: 'Request absence permission',
      icon: <MdEventNote className="w-6 h-6" />,
      color: 'bg-rose-500 hover:bg-rose-600',
      action: 'leave'
    },
    {
      title: 'Hostel',
      description: 'View room & mess details',
      icon: <MdHotel className="w-6 h-6" />,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      action: 'hostel'
    },
  ].filter(a => {
    if (user?.role === 'warden') {
      return ['notice', 'hostel'].includes(a.action);
    }
    return true;
  });

  const recentActivities = (dashboardData?.recentActivities || []).map(act => ({
    ...act,
    icon: act.type === 'attendance' ? <MdEventNote className="w-5 h-5" /> :
          act.type === 'payment' ? <MdAttachMoney className="w-5 h-5" /> :
          act.type === 'assignment' ? <MdAssignment className="w-5 h-5" /> :
          <MdNotifications className="w-5 h-5" />
  }));

  const upcomingEvents = dashboardData?.upcomingEvents || [];

  return (
    <div className="space-y-4">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black mb-0.5">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-blue-100 text-[11px] font-bold uppercase tracking-widest opacity-80">
              {user?.role === 'student'
                ? 'Ready to learn something new today?'
                : selectedChild
                  ? `Monitor ${selectedChild.name}'s progress`
                  : 'Monitor your children\'s progress'
              }
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <MdDashboard className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Child Selector for Parent */}
      <ChildSelector />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats
          .map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{stat.title}</p>
                  <p className="text-2xl font-black text-gray-900 mt-0.5">{stat.value}</p>
                  <p className="text-green-600 text-[10px] font-bold mt-0.5">{stat.change} since last week</p>
                </div>
                <div className={`${stat.bgColor} p-2.5 rounded-lg`}>
                  <div className={`${stat.color} text-white`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Quick Actions & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {quickActions
              .map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.action)}
                  className={`${action.color} text-white p-3.5 rounded-xl transition-all duration-200 text-left cursor-pointer transform hover:scale-[1.02] shadow-sm hover:shadow-md relative overflow-hidden group`}
                >
                  <div className="relative z-10">
                    <div className="flex items-center mb-1.5">
                      <div className="p-1.5 bg-white/20 rounded-lg group-hover:scale-110 transition-transform">
                        {action.icon}
                      </div>
                      <span className="ml-2 font-bold text-xs tracking-tight">{action.title}</span>
                    </div>
                    <p className="text-[10px] opacity-70 leading-tight line-clamp-1">{action.description}</p>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-purple-600 rounded-full"></span>
            Recent Activities
          </h2>
          <div className="space-y-3">
            {recentActivities
              .map((activity, index) => (
                <div key={index} className="flex items-center p-2.5 bg-gray-50/50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100">
                  <div className="p-1.5 bg-blue-50 rounded-md mr-2.5">
                    <div className="text-blue-500 w-4 h-4">
                      {activity.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-[11px] truncate">{activity.title}</p>
                    <p className="text-[9px] text-gray-400 font-medium">{activity.time}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-orange-500 rounded-full"></span>
          Upcoming Events
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {upcomingEvents.map((event, index) => (
            <div key={index} className="border border-gray-50 bg-gray-50/30 rounded-xl p-3.5 hover:border-blue-200 hover:bg-white hover:shadow-sm transition-all group">
              <h3 className="font-bold text-gray-800 text-xs mb-2 group-hover:text-blue-600 transition-colors">{event.title}</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-[10px] text-gray-500">
                  <MdEventNote className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                  <span className="font-bold">{event.date}</span>
                </div>
                <div className="flex items-center text-[10px] text-gray-500">
                  <MdSchedule className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                  <span className="font-bold">{event.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;