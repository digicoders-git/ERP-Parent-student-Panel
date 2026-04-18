const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';

/**
 * Centered API fetcher with automatic token injection and error handling
 */
const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/parent-student${endpoint}`, {
      ...options,
      headers,
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'API request failed');
    }
    return result;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

// --- DATA FETCHING METHODS ---

export const fetchDashboardData = (studentId) => 
  apiFetch(`/dashboard${studentId ? `?studentId=${studentId}` : ''}`);

export const fetchTimetable = (studentId) => 
  apiFetch(`/timetable${studentId ? `?studentId=${studentId}` : ''}`);

export const fetchFees = (studentId) => 
  apiFetch(`/fee${studentId ? `?studentId=${studentId}` : ''}`);

export const fetchLibrary = (studentId) => 
  apiFetch(`/library${studentId ? `?studentId=${studentId}` : ''}`);

export const fetchBrowseBooks = (studentId, search = '', category = 'All') => 
  apiFetch(`/library/browse?studentId=${studentId}&search=${search}&category=${category}`);

export const requestBook = (studentId, bookId) => 
  apiFetch(`/library/request`, {
    method: 'POST',
    body: JSON.stringify({ studentId, bookId })
  });

export const fetchBookRequests = (studentId) => 
  apiFetch(`/library/requests?studentId=${studentId}`);

export const fetchAssignments = (studentId) => 
  apiFetch(`/assignments${studentId ? `?studentId=${studentId}` : ''}`);

export const fetchHostel = (studentId) => 
  apiFetch(`/hostel${studentId ? `?studentId=${studentId}` : ''}`);

export const fetchNotices = (studentId) => 
  apiFetch(`/notices${studentId ? `?studentId=${studentId}` : ''}`);

export const fetchLiveClasses = (studentId) => 
  apiFetch(`/live-classes${studentId ? `?studentId=${studentId}` : ''}`);

export const fetchRecordedClasses = (studentId) => 
  apiFetch(`/recorded-classes${studentId ? `?studentId=${studentId}` : ''}`);

export const fetchEDiary = (studentId) => 
  apiFetch(`/ediary${studentId ? `?studentId=${studentId}` : ''}`);

export const submitAssignment = (studentId, assignmentId, content) =>
  apiFetch(`/assignment/submit`, {
    method: 'POST',
    body: JSON.stringify({ studentId, assignmentId, content })
  });

export const requestHostelService = (studentId, serviceType, category, description) =>
  apiFetch(`/warden/services`, {
    method: 'POST',
    body: JSON.stringify({ studentId, serviceType, serviceCategory: category, description })
  });

export const applyLeave = (studentId, data) =>
  apiFetch(`/leave/apply`, {
    method: 'POST',
    body: JSON.stringify({ studentId, ...data })
  });

export const fetchLeaveHistory = (studentId) =>
  apiFetch(`/leave/history?studentId=${studentId}`);

export const initiatePayment = (feeId, amount) =>
  apiFetch(`/payment/initiate`, {
    method: 'POST',
    body: JSON.stringify({ feeId, amount })
  });

export const confirmPayment = (feeId, amount, trxId) =>
  apiFetch(`/payment/confirm`, {
    method: 'POST',
    body: JSON.stringify({ feeId, amount, transactionId: trxId })
  });

export const confirmFeePayment = (feeId, amount, transactionId) =>
  apiFetch(`/payment/confirm`, {
    method: 'POST',
    body: JSON.stringify({ feeId, amount, transactionId })
  });

export const fetchAttendanceHistory = (studentId, params = {}) => {
  const queryParams = new URLSearchParams({
    studentId,
    ...params
  }).toString();
  return apiFetch(`/attendance-history?${queryParams}`);
};

/**
 * Helper to get the canonical student context based on login state
 */
export const getCurrentStudent = (user, selectedChild) => {
  if (user?.role === 'student') {
    return {
      id: user.studentId || user._id,
      name: `${user.firstName} ${user.lastName || ''}`.trim(),
      class: user.class,
      section: user.section
    };
  } else if (user?.role === 'parent' && selectedChild) {
    return {
      id: selectedChild.studentId || selectedChild.id,
      name: selectedChild.name,
      class: selectedChild.class,
      section: selectedChild.section
    };
  }
  return null;
};