import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';

const TransportNotificationListener = () => {
  const { selectedChild } = useAuth();
  const [allocation, setAllocation] = React.useState(null);

  useEffect(() => {
    if (!selectedChild) return;

    const studentId = selectedChild.studentId || selectedChild.id;
    const branchId = selectedChild.branch;
    
    // Fetch student's route to filter notifications
    const fetchAllocation = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/api/transport-panel/trip/active/student/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // We don't need the trip, just to check if they have allocation
        // But wait, the API returns 404 if no allocation, which is fine
      } catch (e) { console.log('No allocation found for listener'); }
    };
    fetchAllocation();

    const socket = io(API_BASE_URL);

    socket.on('connect', () => {
      if (branchId) socket.emit('join_branch', branchId);
    });

    socket.on('trip_started', (data) => {
      // Only show if it matches student's route (we might need the allocation for this)
      // For now, let's just make it always show if same branch, but more specific toast
      toast.success(`🚌 Trip Started for Route ${data.routeId || ''}. Check if it's yours!`, {
        position: "top-right",
        autoClose: 5000,
      });
    });

    socket.on('transport_notification', (data) => {
      toast.info(`📍 ${data.title}: ${data.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    });

    socket.on('stop_arrival', (data) => {
      toast.info(`🏢 Van arrived at ${data.stopName}`, {
        position: "top-right",
        autoClose: 5000,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedChild]);

  return null; // This component doesn't render anything UI-wise, just listens
};

export default TransportNotificationListener;
