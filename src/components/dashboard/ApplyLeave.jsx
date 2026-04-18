import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { applyLeave, fetchLeaveHistory, getCurrentStudent } from '../../services/dataService';
import { toast } from 'react-toastify';
import ChildSelector from './ChildSelector';
import {
  MdEventNote,
  MdDateRange,
  MdDescription,
  MdSend,
  MdHistory,
  MdCheckCircle,
  MdPending,
  MdCancel,
  MdAdd
} from 'react-icons/md';

const ApplyLeave = () => {
  const { user, selectedChild } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    leaveType: 'Medical',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const currentStudent = getCurrentStudent(user, selectedChild);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await fetchLeaveHistory(currentStudent.id);
      if (res.success) {
        setHistory(res.data || []);
      }
    } catch (error) {
      toast.error('Failed to load leave history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentStudent?.id) loadHistory();
  }, [currentStudent?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      return toast.warn('Please fill all fields');
    }

    setIsSubmitting(true);
    try {
      const res = await applyLeave(currentStudent.id, formData);
      if (res.success) {
        toast.success('Leave application submitted!');
        setShowApplyModal(false);
        setFormData({ leaveType: 'Medical', startDate: '', endDate: '', reason: '' });
        loadHistory();
      }
    } catch (error) {
      toast.error(error.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
        <MdEventNote className="absolute -right-4 -bottom-4 text-8xl opacity-10 rotate-12" />
        <div className="relative z-10 flex justify-between items-center text-left">
          <div>
            <h1 className="text-2xl font-black mb-1 flex items-center gap-2">
              <MdEventNote /> Leave Management
            </h1>
            <p className="text-rose-100 text-[10px] font-black uppercase tracking-widest opacity-80">
              Absence Requests & Attendance Tracking
            </p>
          </div>
          <button 
            onClick={() => setShowApplyModal(true)}
            className="bg-white text-rose-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all flex items-center gap-2"
          >
            <MdAdd className="text-lg" /> Apply Leave
          </button>
        </div>
      </div>

      <ChildSelector />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics or Quick Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
             <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Leave Norms</h3>
             <ul className="space-y-3">
                {[
                  'Medical leave requires a doctor certificate.',
                  'Apply at least 24h before for parental leave.',
                  'Approval usually takes 12-24 hours.',
                  'Maximum 3 consecutive days allowed.'
                ].map((rule, i) => (
                  <li key={i} className="flex gap-3 text-xs font-bold text-gray-600 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">•</span>
                    {rule}
                  </li>
                ))}
             </ul>
          </div>
        </div>

        {/* History List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xs font-black text-gray-700 uppercase tracking-wider">Leave History</h2>
                <div className="flex gap-2">
                   <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest border border-emerald-100">Approved: {history.filter(h => h.status === 'approved').length}</span>
                   <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-600 text-[8px] font-black uppercase tracking-widest border border-amber-100">Pending: {history.filter(h => h.status === 'pending').length}</span>
                </div>
             </div>

             <div className="divide-y divide-gray-50">
                {loading ? (
                   <div className="p-10 text-center animate-pulse text-gray-300 font-black uppercase text-xs">Fetching records...</div>
                ) : history.length > 0 ? history.map((leave, i) => (
                  <div key={i} className="p-5 hover:bg-gray-50 transition-all group">
                    <div className="flex items-center justify-between gap-4">
                       <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl ${getStatusStyle(leave.status)} shadow-inner`}>
                             {leave.status === 'pending' ? <MdPending className="w-5 h-5" /> : leave.status === 'approved' ? <MdCheckCircle className="w-5 h-5" /> : <MdCancel className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                               <h4 className="text-sm font-black text-gray-900 group-hover:text-rose-600 transition-colors uppercase tracking-tight">{leave.leaveType}</h4>
                               <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(leave.status)}`}>{leave.status}</span>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                               <MdDateRange /> {new Date(leave.startDate).toLocaleDateString()} — {new Date(leave.endDate).toLocaleDateString()}
                            </p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-bold text-gray-500 max-w-[150px] truncate group-hover:whitespace-normal transition-all">{leave.reason}</p>
                       </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-20 text-center">
                    <MdEventNote className="w-16 h-16 text-gray-100 mx-auto" />
                    <p className="text-gray-400 font-black text-sm uppercase mt-4">No leave applications found</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-rose-500 p-6 text-white flex justify-between items-center text-left">
              <div>
                <h3 className="font-black text-sm uppercase tracking-widest">New Application</h3>
                <p className="text-rose-100 text-[10px] font-bold uppercase mt-1 opacity-80">Please provide valid absence details</p>
              </div>
              <button onClick={() => setShowApplyModal(false)} className="hover:bg-white/20 p-2 rounded-xl transition-all"><MdCancel className="text-2xl" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Leave Type</label>
                  <select 
                    value={formData.leaveType}
                    onChange={e => setFormData({...formData, leaveType: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-sm font-black text-gray-700 focus:outline-none focus:border-rose-400 transition-all custom-select"
                  >
                    <option>Medical</option>
                    <option>Family Event</option>
                    <option>Marriage</option>
                    <option>Urgent Work</option>
                    <option>Others</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Start Date</label>
                  <input 
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-sm font-black text-gray-700 focus:outline-none focus:border-rose-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">End Date</label>
                  <input 
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-sm font-black text-gray-700 focus:outline-none focus:border-rose-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1 text-left">Detailed Reason</label>
                <textarea 
                  rows={4}
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-700 focus:outline-none focus:border-rose-400 transition-all placeholder:text-gray-300"
                  placeholder="Explain why you are taking leave..."
                ></textarea>
              </div>

              <div className="pt-4 flex gap-4">
                 <button 
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-4 border-2 border-gray-100 rounded-2xl text-xs font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-all"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2 py-4 bg-rose-500 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-100 hover:bg-rose-600 disabled:bg-gray-300 transition-all flex items-center justify-center gap-3 px-8"
                >
                  {isSubmitting ? 'Submitting...' : <><MdSend className="text-lg" /> Submit Application</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyLeave;
