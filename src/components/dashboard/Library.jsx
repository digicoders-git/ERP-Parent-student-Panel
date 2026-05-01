import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  fetchLibrary, 
  fetchBrowseBooks, 
  requestBook, 
  fetchBookRequests, 
  getCurrentStudent 
} from '../../services/dataService';
import { toast } from 'react-toastify';
import ChildSelector from './ChildSelector';
import {
  MdLibraryBooks,
  MdCheckCircle,
  MdHistory,
  MdWarning,
  MdCalendarToday,
  MdSearch,
  MdFilterList,
  MdPerson,
  MdCategory,
  MdCurrencyRupee,
  MdBook,
  MdClose,
  MdOutlineSend,
  MdRadioButtonUnchecked,
  MdErrorOutline
} from 'react-icons/md';

const STATUS_STYLES = {
  Returned:  { badge: 'bg-green-100 text-green-700 border-green-200', icon: <MdCheckCircle className="w-3.5 h-3.5" />, dot: 'bg-green-500' },
  Issued:    { badge: 'bg-blue-100 text-blue-700 border-blue-200',  icon: <MdHistory className="w-3.5 h-3.5" />,      dot: 'bg-blue-500'  },
  Overdue:   { badge: 'bg-red-100 text-red-700 border-red-200',     icon: <MdWarning className="w-3.5 h-3.5" />,      dot: 'bg-red-500'   },
  Pending:   { badge: 'bg-amber-100 text-amber-700 border-amber-200', icon: <MdRadioButtonUnchecked className="w-3.5 h-3.5" />, dot: 'bg-amber-500' },
  Approved:  { badge: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: <MdCheckCircle className="w-3.5 h-3.5" />, dot: 'bg-indigo-500' },
  Rejected:  { badge: 'bg-gray-100 text-gray-700 border-gray-200', icon: <MdErrorOutline className="w-3.5 h-3.5" />, dot: 'bg-gray-500' },
  Fulfilled: { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <MdCheckCircle className="w-3.5 h-3.5" />, dot: 'bg-emerald-500' },
};

const CATEGORY_COLORS = {
  Science:     'bg-purple-100 text-purple-700',
  Mathematics: 'bg-blue-100 text-blue-700',
  Biography:   'bg-amber-100 text-amber-700',
  Fiction:     'bg-pink-100 text-pink-700',
  History:     'bg-teal-100 text-teal-700',
  default:     'bg-gray-100 text-gray-600',
};

const Library = () => {
  const { user, selectedChild } = useAuth();
  const [activeTab, setActiveTab] = useState('issued'); // 'issued', 'browse', 'requests'
  const [library, setLibrary] = useState([]);
  const [browseBooks, setBrowseBooks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedBook, setSelectedBook] = useState(null);
  const [requestingId, setRequestingId] = useState(null);

  const currentStudent = getCurrentStudent(user, selectedChild);

  const loadData = async () => {
    if (!currentStudent?.id) return;
    setLoading(true);
    try {
      const studentId = currentStudent.id;
      // Fetch core data in parallel
      const [libRes, reqRes] = await Promise.all([
        fetchLibrary(studentId),
        fetchBookRequests(studentId)
      ]);

      if (libRes.success) setLibrary(libRes.data || []);
      if (reqRes.success) setRequests(reqRes.data || []);

      // If on browse tab, also fetch that
      if (activeTab === 'browse') {
        const browseRes = await fetchBrowseBooks(studentId, search);
        if (browseRes.success) setBrowseBooks(browseRes.data || []);
      }
    } catch (error) {
      toast.error('Failed to load library data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentStudent?.id]);

  // Handle tab switches and search
  useEffect(() => {
    if (activeTab === 'browse') {
      const timer = setTimeout(async () => {
        const res = await fetchBrowseBooks(currentStudent.id, search);
        if (res.success) setBrowseBooks(res.data || []);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeTab, search, currentStudent?.id]);

  const stats = useMemo(() => ({
    total:    library.length,
    issued:   library.filter(b => b.status === 'Issued').length,
    returned: library.filter(b => b.status === 'Returned').length,
    overdue:  library.filter(b => b.status === 'Overdue').length,
    approved: library.filter(b => b.status === 'Approved').length,
    fine:     library.reduce((sum, b) => sum + (b.fine || 0), 0),
    // Request stats
    reqTotal:    requests.length,
    reqPending:  requests.filter(r => r.status?.toLowerCase() === 'pending').length,
    reqApproved: requests.filter(r => r.status?.toLowerCase() === 'approved').length,
    reqRejected: requests.filter(r => r.status?.toLowerCase() === 'rejected').length,
  }), [library, requests]);

  const filteredIssued = useMemo(() =>
    library.filter(b => {
      const matchSearch = (b.bookName || '').toLowerCase().includes(search.toLowerCase()) ||
                          (b.author || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'All' || b.status === filterStatus;
      return matchSearch && matchStatus;
    }),
  [library, search, filterStatus]);

  const handleRequestBook = async (bookId) => {
    setRequestingId(bookId);
    try {
      const res = await requestBook(currentStudent.id, bookId);
      if (res.success) {
        toast.success('Book request submitted successfully!');
        // Refresh requests list
        const reqRes = await fetchBookRequests(currentStudent.id);
        if (reqRes.success) setRequests(reqRes.data || []);
        // Update browse list (optional, maybe wait for reload)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setRequestingId(null);
    }
  };

  const getDaysInfo = (book) => {
    if (book.status === 'Returned') return null;
    const due = new Date(book.dueDate);
    const today = new Date();
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { label: `${Math.abs(diff)} days overdue`, color: 'text-red-600' };
    if (diff <= 3) return { label: `Due in ${diff} day${diff !== 1 ? 's' : ''}`, color: 'text-amber-600' };
    return { label: `${diff} days left`, color: 'text-green-600' };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-lg p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black mb-0.5 flex items-center gap-2">
              <MdLibraryBooks className="text-2xl" />
              Library Center
            </h1>
            <p className="text-indigo-100 text-[11px] font-bold uppercase tracking-widest opacity-80">
              {activeTab === 'issued' ? 'Issued Records' : activeTab === 'browse' ? 'Browse Catalog' : 'Borrowing Requests'}
            </p>
          </div>
          {stats.fine > 0 && activeTab === 'issued' && (
            <div className="bg-red-500/80 rounded-lg px-3 py-2 text-center border border-red-400">
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 leading-none mb-1">Unpaid Fine</p>
              <p className="text-lg font-black flex items-center gap-0.5">
                <MdCurrencyRupee className="w-4 h-4" />{stats.fine}
              </p>
            </div>
          )}
        </div>
      </div>

      <ChildSelector />

      {/* Modern Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
        {[
          { id: 'issued', label: 'My Books', icon: <MdBook className="w-4 h-4" /> },
          { id: 'browse', label: 'Browse Store', icon: <MdSearch className="w-4 h-4" /> },
          { id: 'requests', label: 'Track Requests', icon: <MdOutlineSend className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearch(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === tab.id
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* Stats Cards - Conditional based on Tab */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {activeTab === 'issued' ? (
          <>
            {[
              { label: 'Total Items', value: stats.total,    color: 'bg-indigo-50', iconColor: 'bg-indigo-500', icon: <MdBook className="w-5 h-5" /> },
              { label: 'Issued', value: stats.issued,   color: 'bg-blue-50',   iconColor: 'bg-blue-500',   icon: <MdHistory className="w-5 h-5" /> },
              { label: 'Ready to Collect', value: stats.approved, color: 'bg-amber-50', iconColor: 'bg-amber-500', icon: <MdCheckCircle className="w-5 h-5" /> },
              { label: 'Returned',      value: stats.returned, color: 'bg-green-50',  iconColor: 'bg-green-500',  icon: <MdCheckCircle className="w-5 h-5" /> },
              { label: 'Overdue',       value: stats.overdue,  color: 'bg-red-50',    iconColor: 'bg-red-500',    icon: <MdWarning className="w-5 h-5" /> },
            ].map((s, i) => (
              <div key={i} className={`${s.color} rounded-xl p-3.5 border border-white shadow-sm`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">{s.label}</p>
                  <div className={`${s.iconColor} text-white p-1.5 rounded-lg`}>{s.icon}</div>
                </div>
                <p className="text-2xl font-black text-gray-900">{s.value}</p>
              </div>
            ))}
          </>
        ) : activeTab === 'requests' ? (
          <>
            {[
              { label: 'Total Requests', value: stats.reqTotal,    color: 'bg-indigo-50', iconColor: 'bg-indigo-500', icon: <MdOutlineSend className="w-5 h-5" /> },
              { label: 'Pending',      value: stats.reqPending,  color: 'bg-amber-50',  iconColor: 'bg-amber-500',  icon: <MdHistory className="w-5 h-5" /> },
              { label: 'Approved',     value: stats.reqApproved, color: 'bg-green-50',  iconColor: 'bg-green-500',  icon: <MdCheckCircle className="w-5 h-5" /> },
              { label: 'Rejected',     value: stats.reqRejected, color: 'bg-red-50',    iconColor: 'bg-red-500',    icon: <MdErrorOutline className="w-5 h-5" /> },
            ].map((s, i) => (
              <div key={i} className={`${s.color} rounded-xl p-3.5 border border-white shadow-sm`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">{s.label}</p>
                  <div className={`${s.iconColor} text-white p-1.5 rounded-lg`}>{s.icon}</div>
                </div>
                <p className="text-2xl font-black text-gray-900">{s.value}</p>
              </div>
            ))}
          </>
        ) : null}
      </div>

      {activeTab === 'issued' && (
        <>
          {/* Issued Search & Cards */}

          {/* Issued Search & Cards */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3">
             <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Filter my books..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredIssued.length > 0 ? filteredIssued.map(book => {
              const style = STATUS_STYLES[book.status] || STATUS_STYLES.Issued;
              const daysInfo = getDaysInfo(book);
              return (
                <div key={book.id} className="bg-white rounded-xl border border-gray-100 p-4 relative group hover:border-indigo-200 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${style.badge}`}>
                      {book.status}
                    </div>
                    {daysInfo && <span className={`text-[9px] font-black ${daysInfo.color}`}>{daysInfo.label}</span>}
                  </div>
                  <h3 className="font-black text-gray-900 text-sm mb-1 leading-tight">{book.bookName}</h3>
                  <p className="text-[10px] text-gray-500 font-medium mb-3 flex items-center gap-1">
                    <MdPerson className="w-3 h-3" /> {book.author}
                  </p>
                  <div className="pt-3 border-t border-gray-50 grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                        <span className="text-gray-400 font-bold uppercase block text-[8px]">Issued On</span>
                        <span className="font-black text-gray-700">{book.issueDate}</span>
                    </div>
                    <div>
                        <span className="text-gray-400 font-bold uppercase block text-[8px]">Due Date</span>
                        <span className="font-black text-gray-700">{book.dueDate}</span>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full py-10 text-center text-gray-400 text-xs font-bold">No books matching your filter.</div>
            )}
          </div>
        </>
      )}

      {activeTab === 'browse' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
             <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search library catalog for new books..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
               [1,2,3].map(i => <div key={i} className="bg-gray-50 h-32 rounded-xl animate-pulse" />)
            ) : browseBooks.length > 0 ? browseBooks.map(book => (
              <div key={book._id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${CATEGORY_COLORS[book.category] || CATEGORY_COLORS.default}`}>
                    {book.category}
                  </span>
                  <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-lg border border-green-100">
                    {book.availableCopies} Left
                  </span>
                </div>
                <h3 className="font-black text-gray-900 text-sm mb-1 leading-tight">{book.title}</h3>
                <p className="text-[10px] text-gray-500 font-medium mb-4">{book.author}</p>
                <button
                  disabled={requestingId === book._id}
                  onClick={() => handleRequestBook(book._id)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {requestingId === book._id ? 'Sending...' : <><MdOutlineSend className="w-3.5 h-3.5" /> Request Book</>}
                </button>
              </div>
            )) : (
              <div className="col-span-full py-16 text-center">
                <MdSearch className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-bold text-sm">No books found in catalog</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-xs font-black text-gray-700 uppercase tracking-wider">My Borrowing Requests</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
               <div className="p-10 text-center animate-pulse text-gray-300 text-xs font-black uppercase">Loading requests...</div>
            ) : requests.length > 0 ? requests.map(req => {
              const style = STATUS_STYLES[req.status] || STATUS_STYLES.Pending;
              return (
                <div key={req._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${style.badge}`}>
                           {req.status}
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase">{new Date(req.requestDate).toLocaleDateString('en-GB')}</span>
                      </div>
                      <h4 className="text-sm font-black text-gray-900 truncate">{req.bookTitle || req.book?.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Priority: {req.priority}</span>
                        {req.rejectionReason && <span className="text-[10px] font-bold text-red-500 italic">Reason: {req.rejectionReason}</span>}
                      </div>
                    </div>
                    {req.status === 'Pending' && (
                      <div className="bg-amber-50 p-2 rounded-lg text-amber-500">
                         <MdHistory className="w-5 h-5 animate-spin-slow" />
                      </div>
                    )}
                  </div>
                </div>
              );
            }) : (
              <div className="py-20 text-center">
                <MdOutlineSend className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">No Active Requests</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Static Footer Guidelines */}
      <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50 flex items-start gap-3">
        <MdErrorOutline className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-[11px] font-black text-indigo-900 mb-1 uppercase tracking-wider">Librarian Note</h3>
          <p className="text-[10px] text-indigo-800/70 font-medium leading-relaxed">
            Requests are usually processed within 24 hours. You will be notified once your book is ready for collection at the library counter.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Library;
