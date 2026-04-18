import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchTimetable, getCurrentStudent } from '../../services/dataService';
import { toast } from 'react-toastify';
import {
  MdSchedule,
  MdAccessTime,
  MdLocationOn,
  MdPerson,
  MdSchool,
  MdBook,
  MdScience,
  MdSports,
  MdRestaurant,
  MdExpandMore,
  MdEventBusy
} from 'react-icons/md';
import ChildSelector from './ChildSelector';

const Timetable = () => {
  const { user, selectedChild } = useAuth();
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState({});

  const currentStudent = getCurrentStudent(user, selectedChild);
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = weekDays[new Date().getDay()];

  useEffect(() => {
    const loadTimetable = async () => {
      setLoading(true);
      try {
        const studentId = currentStudent?.id;
        const res = await fetchTimetable(studentId);
        if (res.success) {
          const scheduleData = res.data || {};
          setSchedule(scheduleData);
          
          const stats = res._stats || {};
          const totalItems = stats.final || 0;
          
          if (totalItems > 0) {
            toast.success(`Active Sync: Found ${totalItems} classes for ${stats.ident?.name || 'you'}`);
          } else {
            // Include stats in the info toast for debugging
            const statSummary = `Matches: Branch(${stats.branchMatch}), Class(${stats.classMatch})`;
            toast.info(`Timetable Sync: 0 Classes found. (${statSummary})`);
          }
        }
      } catch (error) {
        console.error('Timetable Error:', error);
        toast.error('Failed to connect to timetable service');
      } finally {
        setLoading(false);
      }
    };

    loadTimetable();
  }, [currentStudent?.id]);

  const toggleDayExpansion = (day) => {
    setExpandedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const getSubjectIcon = (type) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('math')) return <MdSchool className="w-5 h-5 text-blue-400" />;
    if (t.includes('english')) return <MdBook className="w-5 h-5 text-blue-400" />;
    if (t.includes('science') || t.includes('physics') || t.includes('chem')) return <MdScience className="w-5 h-5 text-blue-400" />;
    if (t.includes('sports')) return <MdSports className="w-5 h-5 text-blue-400" />;
    if (t.includes('break') || t.includes('lunch')) return <MdRestaurant className="w-5 h-5 text-blue-400" />;
    return <MdBook className="w-5 h-5 text-blue-400" />;
  };

  const getSubjectColor = (type) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('math')) return 'bg-gradient-to-br from-[#dbeafe] to-[#bfdbfe]';
    if (t.includes('english')) return 'bg-gradient-to-br from-[#fef3c7] to-[#fde68a]';
    if (t.includes('science') || t.includes('physics') || t.includes('chem')) return 'bg-gradient-to-br from-[#d1fae5] to-[#a7f3d0]';
    if (t.includes('sports')) return 'bg-gradient-to-br from-[#fee2e2] to-[#fecaca]';
    if (t.includes('break') || t.includes('lunch')) return 'bg-gradient-to-br from-[#f3f4f6] to-[#e5e7eb]';
    return 'bg-gradient-to-br from-[#dbeafe] to-[#bfdbfe]';
  };

  // Robust fallback: if current day's array exists but is empty, try Monday
  const hasSchedule = (day) => schedule[day] && schedule[day].length > 0;
  const todaySchedule = hasSchedule(currentDay) ? schedule[currentDay] : (schedule['Monday'] || []);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Class Timetable
            </h1>
            <p className="text-blue-100 text-lg">
              {user?.role === 'student' ? 'Your weekly class schedule' : 'Student weekly class schedule'}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <MdSchedule className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
      </div>
      <ChildSelector />

      {/* Current Day Highlight */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Today's Schedule</h2>
          <div className="flex items-center bg-blue-100 px-4 py-2 rounded-lg">
            <MdAccessTime className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-600 font-semibold">{currentDay}</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {todaySchedule.length > 0 ? todaySchedule.map((item, index) => (
            <div key={index} className="bg-gradient-to-br from-white to-gray-50 border border-gray-800 rounded-xl p-5 hover:shadow-xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:border-blue-200 group">
              <div className="flex items-start justify-between mb-4">
                <div className={`${getSubjectColor(item.type)} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">
                    {getSubjectIcon(item.type)}
                  </div>
                </div>
                <div className="bg-cyan-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                  {item.time}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {item.subject}
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <MdPerson className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="font-medium">{item.teacher}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MdLocationOn className="w-4 h-4 mr-2 text-blue-500" />
                    <span>{item.room}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getSubjectColor(item.type)} bg-opacity-10 text-gray-700`}>
                    <div className={`w-2 h-2 ${getSubjectColor(item.type || 'default')} rounded-full mr-2`}></div>
                    {item.type ? (item.type.charAt(0).toUpperCase() + item.type.slice(1)) : 'Subject'}
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
              <MdEventBusy className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-xl font-medium">No classes scheduled for today</p>
              <p className="text-sm">Enjoy your time or catch up on assignments!</p>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Overview */}
      <div id="weekly-overview" className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Weekly Overview</h2>

        <div className="grid grid-cols-2 gap-6">
          {weekDays.map((day) => (
            <div key={day} className={`bg-white border rounded-lg p-4 shadow hover:shadow-md transition-all duration-300 ${day === currentDay
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-200 hover:border-blue-200'
              }`}>
              <div className={`text-center mb-3 pb-2 border-b ${day === currentDay ? 'border-blue-200' : 'border-gray-100'
                }`}>
                <h3 className={`font-semibold text-sm ${day === currentDay ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                  {day}
                </h3>
                {day === currentDay && (
                  <div className="inline-flex items-center mt-1 px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></div>
                    Today
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {schedule[day] && schedule[day].length > 0 ? (
                  <>
                    {(expandedDays[day] ? schedule[day] : schedule[day]?.slice(0, 4))?.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded p-2 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center mb-1">
                          <div className={`w-2 h-2 ${getSubjectColor(item.type)} rounded-full mr-2`}></div>
                          <div className="font-medium text-gray-900 text-xs truncate flex-1">
                            {item.subject}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 ml-4">
                          <div className="flex items-center justify-between">
                            <span>{item.time}</span>
                            <span className="text-gray-400">{item.room}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {schedule[day]?.length > 4 && (
                      <div className="text-center mt-2">
                        <button
                          onClick={() => toggleDayExpansion(day)}
                          className="inline-flex items-center px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded text-xs transition-colors cursor-pointer"
                        >
                          {expandedDays[day] ? (
                            <>Show Less</>
                          ) : (
                            <>
                              <MdExpandMore className="w-3 h-3 mr-1" />
                              +{schedule[day].length - 4} more
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-xs text-gray-400 italic">No classes scheduled</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Legend */}

    </div>
  );
};

export default Timetable;