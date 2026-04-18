import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchLiveClasses, getCurrentStudent } from '../../services/dataService';
import { toast } from 'react-toastify';
import {
  MdVideoCall,
  MdAccessTime,
  MdPerson,
  MdSchool,
  MdPlayCircleFilled,
  MdRadioButtonChecked,
  MdCalendarToday
} from 'react-icons/md';
import Swal from 'sweetalert2';
import ChildSelector from './ChildSelector';

const LiveClasses = () => {
  const { user, selectedChild } = useAuth();
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentStudent = getCurrentStudent(user, selectedChild);

  useEffect(() => {
    const loadLiveClasses = async () => {
      setLoading(true);
      try {
        const studentId = currentStudent?.id;
        const res = await fetchLiveClasses(studentId);
        if (res.success) {
          const transformed = (res.data || []).map(c => ({
            id: c.id || c._id,
            subject: c.subject,
            topic: c.topic || c.title,
            teacher: c.teacher || 'Academic Dept',
            startTime: c.startTime || (c.scheduledAt ? new Date(c.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'),
            endTime: c.endTime || 'N/A',
            status: c.status || (c.scheduledAt && new Date(c.scheduledAt) <= new Date() ? 'ongoing' : 'upcoming'),
            meetingLink: c.meetingLink || '#'
          }));
          setLiveClasses(transformed);
        }
      } catch (error) {
        toast.error('Failed to load live classes');
      } finally {
        setLoading(false);
      }
    };

    loadLiveClasses();
  }, [currentStudent?.id]);

  const handleJoinClass = (className, link) => {
    if (user.role === 'parent') return;
    if (link === '#') {
      Swal.fire({
        title: 'Class not started',
        text: 'This class will start at its scheduled time.',
        icon: 'info',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    Swal.fire({
      title: 'Joining Class',
      text: `Do you want to join the ${className} live session?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Join Now'
    }).then((result) => {
      if (result.isConfirmed) {
        window.open(link, '_blank');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <MdVideoCall className="text-4xl animate-pulse" />
            Live Classes
          </h1>
          <p className="text-rose-100 font-medium">
            {user.role === 'parent'
              ? `Monitoring live schedule for ${selectedChild?.name || 'child'}`
              : 'Join your ongoing and upcoming interactive sessions'}
          </p>
        </div>
        <MdSchool className="absolute -right-8 -bottom-8 text-9xl opacity-10 rotate-12" />
      </div>
      <ChildSelector />

      {/* Ongoing Classes */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <MdRadioButtonChecked className="text-red-500 animate-pulse" />
          Ongoing Sessions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {liveClasses.filter(c => c.status === 'ongoing').map((cls) => (
            <div key={cls.id} className="bg-white rounded-2xl border-2 border-red-50 p-6 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                  <MdVideoCall className="text-2xl" />
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                  Live Now
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">{cls.subject}</h3>
              <p className="text-slate-500 text-sm font-medium mb-4">{cls.topic}</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <MdPerson className="text-slate-400" />
                  <span className="font-bold">{cls.teacher}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <MdAccessTime className="text-slate-400" />
                  <span className="font-bold">{cls.startTime} - {cls.endTime}</span>
                </div>
              </div>

              {user.role === 'student' ? (
                <button
                  onClick={() => handleJoinClass(cls.subject, cls.meetingLink)}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"
                >
                  <MdPlayCircleFilled className="text-lg" />
                  Join Session
                </button>
              ) : (
                <div className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 border border-slate-200">
                  <MdRadioButtonChecked className="text-red-400 animate-pulse" />
                  Student Attending
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Classes Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <MdCalendarToday className="text-blue-500" />
          Schedule for Today
        </h2>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Teacher</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {liveClasses.map((cls) => (
                <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <MdAccessTime className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-700">{cls.startTime}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{cls.subject}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{cls.topic}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-600">{cls.teacher}</span>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'student' ? (
                      <button
                        onClick={() => handleJoinClass(cls.subject, cls.meetingLink)}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${cls.status === 'ongoing'
                            ? 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-100'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                      >
                        {cls.status === 'ongoing' ? 'Join' : 'Waiting'}
                      </button>
                    ) : (
                      <span className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${cls.status === 'ongoing' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-50 text-slate-400'
                        }`}>
                        {cls.status === 'ongoing' ? 'In Progress' : 'Upcoming'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LiveClasses;
