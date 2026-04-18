import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchAttendanceHistory, getCurrentStudent } from '../../services/dataService';
import { toast } from 'react-toastify';
import ChildSelector from './ChildSelector';
import { 
  MdEventNote, 
  MdCheckCircle, 
  MdCancel, 
  MdAccessTime, 
  MdCalendarToday,
  MdTrendingUp,
  MdInfo
} from 'react-icons/md';

const Attendance = () => {
  const { user, selectedChild } = useAuth();
  const [data, setData] = useState({ records: [], analytics: {} });
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const currentStudent = getCurrentStudent(user, selectedChild);

  useEffect(() => {
    const loadAttendance = async () => {
      setLoading(true);
      try {
        const studentId = currentStudent?.id;
        const res = await fetchAttendanceHistory(studentId, { month: selectedMonth });
        if (res.success) {
          setData(res.data);
        }
      } catch (error) {
        toast.error('Failed to load attendance history');
      } finally {
        setLoading(false);
      }
    };

    if (currentStudent?.id) {
       loadAttendance();
    }
  }, [currentStudent?.id, selectedMonth]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'present': return 'text-green-600 bg-green-50 border-green-200';
      case 'absent': return 'text-red-600 bg-red-50 border-red-200';
      case 'late': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'leave': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'present': return <MdCheckCircle className="w-5 h-5 text-green-600" />;
      case 'absent': return <MdCancel className="w-5 h-5 text-red-600" />;
      case 'late': return <MdAccessTime className="w-5 h-5 text-yellow-600" />;
      default: return <MdInfo className="w-5 h-5 text-gray-600" />;
    }
  };

  const analytics = data.analytics || {};

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <MdEventNote className="text-4xl" />
            Attendance History
          </h1>
          <p className="text-blue-100 font-medium max-w-2xl">
            Track your daily presence, late arrivals, and attendance trends to ensure academic consistency.
          </p>
        </div>
        <MdCalendarToday className="absolute -right-8 -bottom-8 text-[12rem] opacity-10 rotate-12" />
      </div>

      <ChildSelector />

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Days</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-black text-slate-900">{analytics.totalDays || 0}</p>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><MdCalendarToday className="w-6 h-6" /></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Present</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-black text-green-600">{analytics.present || 0}</p>
            <div className="p-3 bg-green-50 rounded-xl text-green-600"><MdCheckCircle className="w-6 h-6" /></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Attendance %</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-black text-indigo-600">{analytics.attendancePercentage || 0}%</p>
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><MdTrendingUp className="w-6 h-6" /></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Academic Status</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-black text-slate-900">{analytics.status || 'N/A'}</p>
            <div className="p-3 bg-slate-50 rounded-xl text-slate-600"><MdInfo className="w-6 h-6" /></div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-black text-slate-900">Attendance Log</h2>
        <input 
          type="month" 
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
      </div>

      {/* Attendance List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Day</th>
              <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.records?.map((record, index) => (
              <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4 font-black text-slate-900 text-sm">
                  {new Date(record.date).toLocaleDateString('en-GB')}
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs font-bold uppercase tracking-tight">
                  {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${getStatusColor(record.status)}`}>
                    {getStatusIcon(record.status)}
                    {record.status}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                  {record.remarks || '--'}
                </td>
              </tr>
            ))}
            {!loading && data.records?.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                  No records found for this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
