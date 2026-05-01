import React, { useState, useEffect } from 'react';
import { 
  FaBus, 
  FaMapMarkerAlt, 
  FaClock, 
  FaCheckCircle, 
  FaRegCircle, 
  FaArrowRight,
  FaBell,
  FaPhoneAlt,
  FaUser,
  FaRoute
} from 'react-icons/fa';
import io from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';

const TrackVan = ({ studentId, branchId }) => {
  const [activeTrip, setActiveTrip] = useState(null);
  const [stopLogs, setStopLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const socketRef = React.useRef(null);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    fetchActiveTrip();
    fetchNotifications();

    // Setup Socket.io
    const socket = io(API_BASE_URL);
    socketRef.current = socket;
    
    socket.on('connect', () => {
      console.log('Connected to transport tracking');
      if (branchId) {
        socket.emit('join_branch', branchId);
      }
    });

    socket.on('trip_started', (data) => {
      console.log('Trip started event received', data);
      fetchActiveTrip();
    });

    socket.on('trip_update', (data) => {
      console.log('Trip update received:', data);
      fetchActiveTrip();
    });

    socket.on('stop_arrival', (data) => {
      fetchActiveTrip();
    });

    socket.on('next_stop', (data) => {
      fetchActiveTrip();
    });

    socket.on('trip_completed', () => {
      setActiveTrip(null);
      setStopLogs([]);
      toast.success('🏁 Trip completed successfully!');
    });

    socket.on('trip_started_global', () => {
      fetchActiveTrip();
    });

    // 5-second polling fallback
    const pollInterval = setInterval(() => {
      if (studentId) fetchActiveTrip();
    }, 5000);

    return () => {
      socket.disconnect();
      clearInterval(pollInterval);
    };
  }, [studentId]);

  const fetchActiveTrip = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !studentId) {
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/transport-panel/trip/active/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.trip) {
        setActiveTrip(response.data.trip);
        setStopLogs(response.data.stopLogs);
        if (socketRef.current) {
          socketRef.current.emit('join_trip', response.data.trip._id);
        }
      } else {
        setActiveTrip(null);
        setStopLogs([]);
      }
    } catch (error) {
      console.error('Error fetching trip status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !studentId) return;
      
      const response = await axios.get(`${API_BASE_URL}/api/transport-panel/trip/notifications/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100">
              <FaBus />
            </div>
            Track My Van
          </h1>
          <p className="text-slate-500 text-sm mt-1">Real-time transport tracking for your child</p>
        </div>
        
        {activeTrip ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            Trip Ongoing
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-full text-xs font-bold uppercase tracking-wider">
            No Active Trip
          </div>
        )}
      </div>

      {activeTrip ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Live Status Card */}
          <div className="lg:col-span-3 bg-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <FaBus size={120} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase border ${
                    activeTrip.trackingStatus === 'arrived' 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                      : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}>
                    {activeTrip.trackingStatus === 'arrived' ? 'Van Arrived' : 'Van Moving'}
                  </span>
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <FaClock className="text-[8px]" /> Last Updated: {new Date(activeTrip.lastUpdated || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <h2 className="text-4xl font-black tracking-tight flex items-center gap-4">
                    {activeTrip.trackingStatus === 'arrived' ? (
                      <>
                        <span className="text-emerald-400">At</span> {activeTrip.currentStop?.stopName || 'Current Stop'}
                      </>
                    ) : (
                      <>
                        <span className="text-blue-400 italic">To</span> {activeTrip.nextStop?.stopName || 'Next Stop'}
                      </>
                    )}
                  </h2>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.15em] text-xs">
                    {activeTrip.trackingStatus === 'arrived' 
                      ? 'Van is at the stop for pickup/drop' 
                      : `Moving from ${activeTrip.currentStop?.stopName || 'previous location'}`}
                  </p>
                </div>
              </div>

                <div className="flex items-center gap-8 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="text-center">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Route</p>
                  <p className="text-lg font-bold">{activeTrip.route?.routeName || 'N/A'}</p>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div className="text-center">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Vehicle</p>
                  <p className="text-lg font-bold">{activeTrip.vehicle?.vehicleNo || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 uppercase text-xs tracking-widest flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-600" /> Journey Progress
                </h3>
              </div>
              
              <div className="p-8">
                <div className="space-y-0">
                  {stopLogs.map((log, index) => {
                    const isArrived = log.status === 'arrived' || log.status === 'departed';
                    const isDeparted = log.status === 'departed';
                    const isCurrent = activeTrip.currentStopIndex !== undefined && index === activeTrip.currentStopIndex;
                    const isFuture = activeTrip.currentStopIndex !== undefined && index > activeTrip.currentStopIndex;

                    return (
                      <div key={log._id} className="relative flex gap-8 pb-10 group last:pb-0">
                        {/* Connecting Line */}
                        {index !== stopLogs.length - 1 && (
                          <div className={`absolute left-[15px] top-8 w-[2px] h-full ${isDeparted ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                        )}

                        {/* Dot Icon */}
                        <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-500 ${
                          isDeparted ? 'bg-blue-600 border-blue-600 text-white' : 
                          isCurrent ? 'bg-white border-blue-600 text-blue-600 shadow-xl shadow-blue-100 scale-125' : 
                          'bg-white border-slate-200 text-slate-300'
                        }`}>
                          {isDeparted ? <FaCheckCircle size={14} /> : isCurrent ? <FaBus size={12} className="animate-bounce" /> : <div className="w-2 h-2 bg-slate-300 rounded-full"></div>}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className={`font-bold transition-colors ${isCurrent ? 'text-blue-600 text-lg' : isFuture ? 'text-slate-400' : 'text-slate-700'}`}>
                                {log.stop.stopName}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                                Scheduled: {activeTrip.type === 'morning' ? log.stop.pickupTime : log.stop.dropTime}
                              </p>
                            </div>
                            
                            {isArrived && (
                              <div className="text-right">
                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase">
                                  {isDeparted ? 'Passed' : 'Van Here'}
                                </span>
                                {log.arrivalTime && (
                                  <p className="text-[10px] text-slate-400 mt-1">
                                    {new Date(log.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {isCurrent && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-4">
                              <div className="p-3 bg-white text-blue-600 rounded-lg shadow-sm"><FaClock /></div>
                              <div>
                                <p className="text-[10px] text-blue-400 font-bold uppercase">Current Status</p>
                                <p className="text-sm font-bold text-blue-800">Van is at this stop</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Details & Notifications Section */}
          <div className="space-y-6">
            {/* Vehicle Info */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
              <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest border-b pb-4">Vehicle Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 text-slate-600 rounded-xl"><FaBus /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Vehicle Number</p>
                    <p className="font-bold text-slate-700">{activeTrip?.vehicle?.vehicleNo || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 text-slate-600 rounded-xl"><FaRoute /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Route</p>
                    <p className="font-bold text-slate-700">{activeTrip?.route?.routeName || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 text-slate-600 rounded-xl"><FaUser /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Shift</p>
                    <p className="font-bold text-slate-700 capitalize">{activeTrip?.type} Shift</p>
                  </div>
                </div>
              </div>
              <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-100">
                <FaPhoneAlt /> Contact Driver
              </button>
            </div>

            {/* Notification History */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-700 uppercase text-xs tracking-widest">Recent Alerts</h3>
                <FaBell className="text-slate-400" />
              </div>
              <div className="p-2 max-h-[300px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n, i) => (
                    <div key={i} className="p-4 hover:bg-slate-50 rounded-xl transition-colors border-b last:border-0 border-slate-50">
                      <p className="text-sm font-bold text-slate-700">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                      <p className="text-[9px] text-slate-400 font-bold mt-2 uppercase tracking-wider">{new Date(n.createdAt).toLocaleTimeString()}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs italic">No recent alerts</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-16 rounded-3xl border border-dashed border-slate-200 text-center space-y-6">
          <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">
            <FaBus />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-700">Van Not Active</h2>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">Tracking will become available as soon as the driver starts the journey.</p>
          </div>
          <button 
            onClick={fetchActiveTrip}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            Check Status Now
          </button>
        </div>
      )}
    </div>
  );
};

export default TrackVan;
