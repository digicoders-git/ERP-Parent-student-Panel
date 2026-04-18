import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchHostel, getCurrentStudent } from '../../services/dataService';
import { toast } from 'react-toastify';
import {
  MdHotel,
  MdRestaurant,
  MdCleaningServices,
  MdAttachMoney,
  MdReportProblem,
  MdLocationOn,
  MdKingBed,
  MdMeetingRoom,
  MdCheckCircle,
  MdAccessTime,
  MdEvent,
  MdPeople,
  MdHistory,
  MdExitToApp,
  MdLogin,
  MdCalendarToday,
  MdInfo
} from 'react-icons/md';
import { FaUtensils, FaTshirt, FaCut, FaMagic, FaUserFriends, FaPhone } from 'react-icons/fa';
import ChildSelector from './ChildSelector';

const Hostel = () => {
  const { user, selectedChild } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [allocation, setAllocation] = useState(null);
  const [fullMenu, setFullMenu] = useState([]);
  const [services, setServices] = useState([]);
  const [entryLogs, setEntryLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);

  const currentStudent = getCurrentStudent(user, selectedChild);

  const loadHostel = async () => {
    setLoading(true);
    try {
      const studentId = currentStudent?.id;
      if (!studentId) return;
      const res = await fetchHostel(studentId);
      if (res.success) {
        setAllocation(res.data.allocation);
        setFullMenu(res.data.menu || []);
        setEntryLogs(res.data.entryLogs || []);
        setServices(res.data.services || []);
      }
    } catch (error) {
      toast.error('Failed to load hostel data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHostel();
  }, [currentStudent?.id]);

  const handleServiceRequest = async (type, category) => {
    setIsRequesting(true);
    try {
      const { requestHostelService } = await import('../../services/dataService');
      const res = await requestHostelService(currentStudent.id, type, category, `Student request for ${type}`);
      if (res.success) {
        toast.success(`${type} request sent successfully!`);
        loadHostel(); // Refresh history
      }
    } catch (error) {
      toast.error(error.message || 'Request failed');
    } finally {
      setIsRequesting(false);
    }
  };

  // Backwards compatibility for UI mapping
  const hostelData = allocation ? {
    hostelName: allocation.hostelName,
    roomNumber: allocation.roomNumber,
    monthlyRent: allocation.monthlyRent,
    floor: 'N/A', // Not in basic schema
    wardenName: 'TBD',
    wardenMobile: 'N/A'
  } : null;

  const roommates = []; // To be implemented in backend if needed
  const attendanceHistory = []; // Handled by fetchAttendanceHistory if needed

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <MdInfo /> },
    { id: 'mess', label: 'Mess & Menu', icon: <MdRestaurant /> },
    { id: 'attendance', label: 'Attendance', icon: <MdHistory /> },
    { id: 'logs', label: 'Entry/Exit', icon: <MdExitToApp /> },
    { id: 'services', label: 'Services', icon: <MdCleaningServices /> },
  ];

  return (
    <div className="space-y-4 pb-12">
      {/* Compact Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 rounded-2xl p-5 text-white shadow-lg">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <MdHotel className="text-[6rem]" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xl border border-white/20 shadow-inner">
                <MdHotel className="text-xl text-blue-300" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight leading-tight">Hostel Hub</h1>
                <p className="text-blue-200 font-bold text-[10px] flex items-center gap-1">
                  <MdLocationOn className="text-sm" />
                  {hostelData?.hostelName || 'Residential Complex Alpha'}
                </p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-lg p-2 px-3 border border-white/10 flex items-center gap-3">
              <div className="text-right">
                <p className="text-[8px] font-black uppercase text-blue-300 tracking-widest opacity-70">Room</p>
                <p className="text-sm font-black">{hostelData?.roomNumber}</p>
              </div>
              <div className="w-px h-6 bg-white/20 rounded-full" />
              <div className="text-left">
                <p className="text-[8px] font-black uppercase text-blue-300 tracking-widest opacity-70">Floor</p>
                <p className="text-sm font-black">{hostelData?.floor || 'G-Level'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ChildSelector />

      {/* Modern Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-slate-500 hover:text-indigo-600 border border-slate-100'
              }`}
          >
            <span className="text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="animate-in fade-in duration-500">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              {/* Room Details Card - Compact */}
              <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 opacity-10 pointer-events-none" />
                <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                  <MdKingBed className="text-indigo-600 text-xl" />
                  Your Residence
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Room Type</p>
                      <p className="text-sm font-black text-slate-700">{hostelData?.roomType || 'Standard Triple'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Bed</p>
                      <p className="text-sm font-black text-slate-700">{hostelData?.bedNumber || 'B1'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Roommates</h4>
                    {roommates.map((rm, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 hover:bg-indigo-50 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-white text-indigo-600 flex items-center justify-center font-black shadow-sm">
                          {rm.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm">{rm.studentName}</p>
                          <p className="text-xs text-indigo-600 font-bold">{rm.contact || 'Privacy Protected'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Services Quick View */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Laundry', icon: <FaTshirt />, status: '2 Items Pending', color: 'blue' },
                  { label: 'Mess', icon: <MdRestaurant />, status: 'Dinner: 8 PM', color: 'emerald' },
                  { label: 'Gate', icon: <MdExitToApp />, status: 'Closing: 10 PM', color: 'rose' }
                ].map((card, i) => (
                  <div key={i} className={`bg-white p-6 rounded-3xl border-2 border-${card.color}-50 shadow-sm hover:scale-105 transition-transform cursor-pointer`}>
                    <div className={`w-12 h-12 rounded-2xl bg-${card.color}-50 text-${card.color}-600 flex items-center justify-center text-2xl mb-4`}>
                      {card.icon}
                    </div>
                    <p className="font-black text-slate-800">{card.label}</p>
                    <p className={`text-xs font-bold text-${card.color}-600`}>{card.status}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar for Overview */}
            <div className="space-y-8">
              {/* Warden Box */}
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:scale-125 transition-transform duration-700">
                  <MdPeople size={120} />
                </div>
                <h3 className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Staff in Charge</h3>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 border-2 border-white/20 flex items-center justify-center text-2xl font-black">
                    {hostelData?.wardenName?.charAt(0) || 'W'}
                  </div>
                  <div>
                    <p className="text-xl font-extrabold">{hostelData?.wardenName || 'Mr. Rajesh Kumar'}</p>
                    <p className="text-xs text-slate-400 font-bold italic">Hostel Warden</p>
                  </div>
                </div>
                <a href={`tel:${hostelData?.wardenMobile}`} className="flex items-center justify-center gap-3 w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all">
                  <FaPhone /> Contact Warden
                </a>
              </div>

              {/* Fee Box */}
              <div className="bg-emerald-600 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
                <h3 className="text-emerald-100 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Financial Status</h3>
                <p className="text-[10px] font-black uppercase opacity-70 mb-1">Total Fee Pending</p>
                <p className="text-4xl font-black mb-6 flex items-center gap-1">
                  <span className="text-xl font-normal opacity-70">₹</span>4,500
                </p>
                <button className="w-full py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl text-xs font-black uppercase tracking-widest border border-white/10 transition-all">
                  Pay via UPI / Card
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MESS TAB */}
        {activeTab === 'mess' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <MdRestaurant className="text-orange-500" />
                    Weekly Food Calendar
                  </h3>
                  <div className="px-5 py-2 bg-white rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
                    Effective: March 2024
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-8 py-5">Day</th>
                        <th className="px-8 py-5">Breakfast (8:00 AM)</th>
                        <th className="px-8 py-5">Lunch (1:30 PM)</th>
                        <th className="px-8 py-5">Dinner (8:30 PM)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {fullMenu.map((m, i) => (
                        <tr key={i} className={`hover:bg-slate-50 transition-colors ${new Date().toLocaleDateString('en-GB', { weekday: 'long' }) === m.day ? 'bg-orange-50/50' : ''}`}>
                          <td className="px-8 py-6">
                            <span className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase ${new Date().toLocaleDateString('en-GB', { weekday: 'long' }) === m.day ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                              {m.day}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-sm font-bold text-slate-700 italic">"{m.breakfast}"</td>
                          <td className="px-8 py-6 text-sm font-bold text-slate-700 italic">"{m.lunch}"</td>
                          <td className="px-8 py-6 text-sm font-bold text-slate-700 italic">"{m.dinner}"</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                  <h4 className="text-sm font-black text-slate-800 mb-6 uppercase tracking-widest">Mess Rules</h4>
                  <ul className="space-y-4">
                    <li className="flex gap-3 text-xs font-bold text-slate-500">
                      <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex-shrink-0 flex items-center justify-center font-black">1</span>
                      QR Marking Mandatory
                    </li>
                    <li className="flex gap-3 text-xs font-bold text-slate-500">
                      <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex-shrink-0 flex items-center justify-center font-black">2</span>
                      Prior leave notice required
                    </li>
                    <li className="flex gap-3 text-xs font-bold text-slate-500">
                      <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex-shrink-0 flex items-center justify-center font-black">3</span>
                      No outside food during lunch
                    </li>
                  </ul>
                </div>

                <div className="bg-orange-600 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
                  <MdReportProblem className="absolute -right-4 -bottom-4 text-7xl opacity-20 rotate-12" />
                  <h4 className="text-xs font-black text-orange-200 uppercase tracking-widest mb-4">Quality Feedback</h4>
                  <p className="text-sm font-bold mb-6">Facing issues with food quality or mess staff?</p>
                  <button className="w-full py-3 bg-white text-orange-600 rounded-2xl font-black text-xs uppercase tracking-widest">Raise Complaint</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden text-center p-12">
              <div className="w-32 h-32 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-6xl mx-auto mb-8 animate-pulse">
                <MdCheckCircle />
              </div>
              <h3 className="text-3xl font-black text-slate-800 mb-2">98.5% Accuracy</h3>
              <p className="text-slate-400 font-bold mb-10 max-w-sm mx-auto">Your hostel residency record is healthy. Maintain punctuality for daily attendance marks.</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">{day}</p>
                    <div className="flex justify-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest">Recent Marks</h4>
              </div>
              <div className="p-6 space-y-4">
                {attendanceHistory.length > 0 ? (
                  attendanceHistory.map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase">{h.type}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{h.date}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${h.status === 'present' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {h.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <MdCalendarToday className="text-4xl text-slate-200 mx-auto mb-3" />
                    <p className="text-xs text-slate-400 font-bold italic">No digital records for last 7 days</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-800">Gate Entry/Exit Logs</h3>
              <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest">Active Monitoring</span>
            </div>
            <div className="p-4 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                {entryLogs.length > 0 ? (
                  entryLogs.map((log, i) => (
                    <div key={i} className="flex flex-col lg:flex-row lg:items-center justify-between p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 group hover:border-indigo-300 transition-all">
                      <div className="flex items-center gap-6 mb-4 lg:mb-0">
                        <div className={`p-4 rounded-2xl ${log.action === 'checkin' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'} text-2xl`}>
                          {log.action === 'checkin' ? <MdLogin /> : <MdExitToApp />}
                        </div>
                        <div>
                          <p className="text-lg font-black text-slate-800 uppercase tracking-tight">{log.action === 'checkin' ? 'Check-In' : 'Check-Out'}</p>
                          <p className="text-xs text-slate-400 font-bold italic">Gate #1 Main Entrance</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                          <p className="text-sm font-black text-slate-700">{log.date}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div className="text-left">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</p>
                          <p className="text-sm font-black text-slate-700">{log.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                    <p className="text-slate-400 font-black uppercase tracking-widest">No recent movement records</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SERVICES TAB */}
        {activeTab === 'services' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
                  <MdCleaningServices className="text-blue-500" />
                  Service History
                </h3>
                <div className="space-y-4">
                  {services.length > 0 ? (
                    services.map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${s.serviceType === 'Laundry' ? 'bg-blue-100 text-blue-600' :
                              s.serviceType === 'Hair Cutting' ? 'bg-indigo-100 text-indigo-600' :
                                'bg-amber-100 text-amber-600'
                            }`}>
                            {s.serviceType === 'Laundry' && <FaTshirt />}
                            {s.serviceType === 'Hair Cutting' && <FaCut />}
                            {s.serviceType === 'Shoe Polish' && <FaMagic />}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-sm">{s.serviceType}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{s.date}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${s.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                          }`}>
                          {s.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                      <p className="text-slate-400 font-bold text-xs uppercase">No service requests found</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl">
                  <h4 className="text-xs font-black text-indigo-200 uppercase tracking-widest mb-4">Request New</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Laundry', category: 'Laundry', icon: <FaTshirt /> },
                      { label: 'Barber', category: 'Hair Cutting', icon: <FaCut /> },
                      { label: 'Polish', category: 'Shoe Polish', icon: <FaMagic /> }
                    ].map((opt, i) => (
                      <button 
                        key={i} 
                        disabled={isRequesting}
                        onClick={() => handleServiceRequest(opt.label, opt.category)}
                        className="flex flex-col items-center justify-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all group disabled:opacity-50"
                      >
                        <div className="text-2xl group-hover:scale-110 transition-transform">{opt.icon}</div>
                        <span className="text-[10px] font-black uppercase">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <MdInfo size={60} />
                  </div>
                  <h4 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-widest">Quick Info</h4>
                  <p className="text-xs text-slate-400 font-bold leading-relaxed">Laundry credits are refilled every Sunday. Maximum 10 clothes per session allowed. Turnaround time: 48 hours.</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Hostel;
