import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  MdCleaningServices, 
  MdContentCut, 
  MdHistory, 
  MdPerson, 
  MdAddCircle, 
  MdCheckCircle,
  MdInfo
} from 'react-icons/md';
import { FaTshirt, FaMagic } from 'react-icons/fa';
import { toast } from 'react-toastify';

const WardenServicePanel = () => {
  const { user } = useAuth();
  const [students] = useState([
    { id: 101, name: 'Rahul Kumar', class: '10th', section: 'A' },
    { id: 205, name: 'Priya Kumar', class: '8th', section: 'B' },
    { id: 302, name: 'Amit Singh', class: '12th', section: 'C' },
    { id: 410, name: 'Sneha Gupta', class: '9th', section: 'D' }
  ]);

  const serviceTypes = [
    { id: 'laundry', name: 'Laundry', icon: <FaTshirt />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'haircut', name: 'Hair Cutting', icon: <MdContentCut />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'shoe_polish', name: 'Shoe Polish', icon: <FaMagic />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'other', name: 'Other Services', icon: <MdCleaningServices />, color: 'text-emerald-600', bg: 'bg-emerald-50' }
  ];

  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedService, setSelectedService] = useState('laundry');
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const savedRecords = localStorage.getItem('hostel_service_records');
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
  }, []);

  const handleRecordService = (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }

    const studentObj = students.find(s => s.id === parseInt(selectedStudent));
    const serviceObj = serviceTypes.find(s => s.id === selectedService);

    const newRecord = {
      id: Date.now(),
      studentName: studentObj.name,
      studentId: studentObj.id,
      serviceType: serviceObj.name,
      date: serviceDate,
      recordedBy: user?.firstName || 'Warden'
    };

    const updatedRecords = [newRecord, ...records];
    setRecords(updatedRecords);
    localStorage.setItem('hostel_service_records', JSON.stringify(updatedRecords));
    
    toast.success(`Registered ${serviceObj.name} for ${studentObj.name}`);
    setSelectedStudent('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-lg p-5 text-white border-b-4 border-emerald-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black mb-1 flex items-center gap-3 italic tracking-tighter">
              <MdCleaningServices className="text-3xl text-emerald-400" />
              HOSTEL SERVICE CONSOLE
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
               Operational Log & Student Service Management
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg">
               <span className="text-emerald-400 font-black text-xs animate-pulse">SYSTEM ONLINE</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Record Service Form */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-5 flex items-center gap-2">
               <MdAddCircle className="text-blue-600 w-5 h-5" />
               Log New Service
            </h2>
            
            <form onSubmit={handleRecordService} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Select Student</label>
                <div className="relative">
                  <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg pl-10 pr-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  >
                    <option value="">Choose Student...</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.class})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Service Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {serviceTypes.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedService(s.id)}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all group ${
                        selectedService === s.id 
                          ? 'border-blue-600 bg-blue-50 text-blue-600' 
                          : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'
                      }`}
                    >
                      <div className={`text-lg ${selectedService === s.id ? s.color : 'text-gray-400 group-hover:scale-110 transition-transform'}`}>
                        {s.icon}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-tighter text-left leading-tight">
                        {s.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Service Date</label>
                <input
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-black py-3 rounded-xl hover:bg-emerald-600 transition-all shadow-lg active:scale-95 text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2"
              >
                <MdCheckCircle className="text-lg" />
                Commit Record
              </button>
            </form>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
             <MdInfo className="text-blue-500 text-xl flex-shrink-0" />
             <p className="text-[10px] text-blue-800/70 font-bold leading-relaxed">
                Ensure accuracy in service recording. All logs are final and will be reflected on Student & Parent terminals in real-time.
             </p>
          </div>
        </div>

        {/* Service Logs */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
              <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                 <MdHistory className="text-emerald-600 w-5 h-5" />
                 Operational History Ledger
              </h2>
              <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase">
                 Total Logs: {records.length}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                    <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Service Type</th>
                    <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {records.length > 0 ? (
                    records.map((rec) => (
                      <tr key={rec.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xs uppercase group-hover:bg-blue-600 group-hover:text-white transition-all">
                                {rec.studentName.charAt(0)}
                             </div>
                             <div>
                                <p className="text-xs font-black text-gray-800">{rec.studentName}</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">REF: HOSTEL-{rec.studentId}</p>
                             </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            rec.serviceType === 'Laundry' ? 'bg-blue-100 text-blue-700' :
                            rec.serviceType === 'Hair Cutting' ? 'bg-purple-100 text-purple-700' :
                            rec.serviceType === 'Shoe Polish' ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {rec.serviceType}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                           <p className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">{rec.date}</p>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-5 py-20 text-center">
                        <MdCleaningServices className="mx-auto text-4xl text-gray-200 mb-2" />
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">No service records registered today</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WardenServicePanel;
