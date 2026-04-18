import { useState, useEffect } from 'react';
import { FaRupeeSign } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { fetchFees, initiatePayment, confirmPayment, getCurrentStudent } from '../../services/dataService';
import { toast } from 'react-toastify';
import ChildSelector from './ChildSelector';
import {
  MdCheckCircle,
  MdPending,
  MdAccountBalance,
  MdReceipt,
  MdCalendarToday,
  MdPayment,
  MdDownload,
  MdHistory,
  MdWarning,
  MdPendingActions,
  MdClose,
  MdShield
} from 'react-icons/md';

const Fee = () => {
  const { user, selectedChild } = useAuth();
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [isPaying, setIsPaying] = useState(false);

  const currentStudent = getCurrentStudent(user, selectedChild);

  const loadFees = async () => {
    setLoading(true);
    try {
      const studentId = currentStudent?.id;
      const res = await fetchFees(studentId);
      if (res.success) {
        setFeeData(res.data);
      }
    } catch (error) {
      toast.error('Failed to load fee information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, [currentStudent?.id]);

  const handlePayClick = (fee) => {
    setSelectedFee(fee);
    setShowPayModal(true);
  };

  const handleFinalPayment = async () => {
    setIsPaying(true);
    try {
      // 1. Initiate
      const initRes = await initiatePayment(selectedFee.id, selectedFee.amount);
      if (initRes.success) {
        // 2. Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 3. Confirm
        const confirmRes = await confirmPayment(selectedFee.id, selectedFee.amount, initRes.data.transactionId);
        if (confirmRes.success) {
          toast.success('Payment successful!');
          setShowPayModal(false);
          loadFees(); // Refresh
        }
      }
    } catch (error) {
      toast.error(error.message || 'Payment failed');
    } finally {
      setIsPaying(false);
    }
  };

  const feeDetails = feeData?.feeDetails || [];
  const summary = feeData?.summary || { totalPaid: 0, totalPending: 0 };
  const paymentHistory = feeDetails.filter(f => f.amountPaid > 0).map(p => ({
    description: p.description,
    date: p.paidDate || p.dueDate,
    method: p.paymentMode || 'Online',
    transactionId: p.transactionId || p.id?.toString().slice(-8).toUpperCase() || 'TRX-XXXX',
    amount: p.amountPaid,
    status: p.status
  }));

  const totalPaid = summary.totalPaid;
  const totalPending = summary.totalPending;
  const totalOverdue = summary.totalOverdue || 0;
  const totalAmount = totalPaid + totalPending;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Overdue': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white overflow-hidden relative">
        <MdAccountBalance className="absolute -right-4 -bottom-4 text-[8rem] opacity-10 rotate-12" />
        <div className="relative z-10">
          <h1 className="text-2xl font-black mb-1 flex items-center gap-2">
            <FaRupeeSign /> Fee Management
          </h1>
          <p className="text-teal-100 text-xs font-bold uppercase tracking-widest opacity-80">
            Secure Payments & Invoices
          </p>
        </div>
      </div>

      <ChildSelector />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Paid', value: totalPaid, color: 'text-green-600', bg: 'bg-green-50', icon: <MdCheckCircle /> },
          { label: 'Pending', value: totalPending, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: <MdPending /> },
          { label: 'Overdue', value: totalOverdue, color: 'text-red-600', bg: 'bg-red-50', icon: <MdWarning /> },
          { label: 'Total Base', value: totalAmount, color: 'text-blue-600', bg: 'bg-blue-50', icon: <MdHistory /> },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-xl p-4 border border-white shadow-sm`}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{s.label}</p>
              <span className={`${s.color} opacity-50`}>{s.icon}</span>
            </div>
            <p className={`text-2xl font-black text-gray-900`}>₹{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Fee Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <h2 className="text-xs font-black text-gray-700 uppercase tracking-wider">Tuition & Extras</h2>
          {user?.role === 'parent' && <button className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1 hover:underline"><MdDownload /> Get Statement</button>}
        </div>

        <div className="divide-y divide-gray-100">
          {feeDetails.map((fee) => (
            <div key={fee.id} className="p-5 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-3 rounded-xl text-blue-600 shadow-inner">
                    <MdPayment className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">{fee.description}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><MdCalendarToday /> {fee.dueDate}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusColor(fee.status)}`}>{fee.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:text-right gap-6">
                  <div>
                    <p className="text-lg font-black text-gray-900 leading-none">₹{fee.amount.toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Due Amount</p>
                  </div>
                  {fee.status !== 'Paid' && (
                    <button 
                      onClick={() => handlePayClick(fee)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all flex items-center gap-2"
                    >
                      <MdPayment className="text-sm" /> Pay Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
          <MdHistory className="text-gray-400" />
          <h2 className="text-xs font-black text-gray-700 uppercase tracking-wider">Payment Timeline</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {paymentHistory.map((payment, i) => (
            <div key={i} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-black shadow-inner">
                  <MdCheckCircle />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-800 uppercase leading-none mb-1">{payment.description}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{payment.date} • {payment.method}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-green-600">+ ₹{payment.amount.toLocaleString()}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1 justify-end"><MdReceipt /> {payment.transactionId}</p>
              </div>
            </div>
          ))}
          {paymentHistory.length === 0 && (
            <div className="p-10 text-center text-gray-300 text-xs font-black uppercase tracking-widest">No previous payments found</div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-indigo-600 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black text-sm uppercase tracking-widest">Secure Checkout</h3>
                <p className="text-indigo-200 text-[10px] font-bold uppercase mt-0.5">Finalize your transaction</p>
              </div>
              <button onClick={() => setShowPayModal(false)} className="hover:bg-white/20 p-2 rounded-xl"><MdClose className="text-xl" /></button>
            </div>
            <div className="p-6">
              <div className="bg-indigo-50 rounded-2xl p-5 mb-6 border border-indigo-100">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Due</p>
                <p className="text-4xl font-black text-indigo-700 leading-none flex items-baseline gap-1">
                  <span className="text-xl font-medium opacity-60">₹</span>{selectedFee?.amount.toLocaleString()}
                </p>
                <div className="mt-4 pt-4 border-t border-indigo-100/50">
                  <p className="text-xs font-black text-indigo-900 uppercase">{selectedFee?.description}</p>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase mt-0.5">Admission: {currentStudent?.id.slice(-6)}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 p-4 border-2 border-indigo-600 rounded-2xl bg-indigo-50/30">
                  <div className="w-4 h-4 rounded-full border-4 border-indigo-600" />
                  <div className="flex-1">
                    <p className="text-xs font-black text-gray-900 uppercase">Online Payment (UPI/Cards)</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Processed via Secure Gateway</p>
                  </div>
                  <MdShield className="text-2xl text-indigo-600" />
                </div>
              </div>

              <button 
                disabled={isPaying}
                onClick={handleFinalPayment}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
              >
                {isPaying ? 'Processing...' : <><MdShield className="text-lg" /> Authorize & Pay</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fee;