import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { fetchAssignments, submitAssignment, getCurrentStudent } from '../../services/dataService';
import ChildSelector from './ChildSelector';
import { 
  MdAttachFile, 
  MdImage, 
  MdPictureAsPdf, 
  MdDescription, 
  MdDownload, 
  MdCheckCircle,
  MdOutlineSend,
  MdClose,
  MdAssignment,
  MdCalendarToday
} from 'react-icons/md';

const Assignment = () => {
  const { user, selectedChild } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStudent = getCurrentStudent(user, selectedChild);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const studentId = currentStudent?.id;
      const res = await fetchAssignments(studentId);
      if (res.success) {
        setAssignments(res.data || []);
      }
    } catch (error) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [currentStudent?.id]);

  const handleSubmitClick = (assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmitModal(true);
  };

  const handleFinalSubmit = async () => {
    if (!submissionContent.trim()) {
      return toast.warn('Please enter some content or link');
    }
    
    setIsSubmitting(true);
    try {
      const res = await submitAssignment(currentStudent.id, selectedAssignment.id, submissionContent);
      if (res.success) {
        toast.success('Assignment submitted successfully!');
        setShowSubmitModal(false);
        setSubmissionContent('');
        loadAssignments(); // Refresh status
      }
    } catch (error) {
      toast.error(error.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return <MdPictureAsPdf className="w-4 h-4 text-red-500" />;
      case 'image': return <MdImage className="w-4 h-4 text-blue-500" />;
      case 'document': return <MdDescription className="w-4 h-4 text-green-500" />;
      default: return <MdAttachFile className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Graded': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-2xl font-black mb-1 flex items-center gap-2">
          <MdAssignment className="text-3xl" /> Assignments
        </h1>
        <p className="text-blue-100 text-xs font-bold uppercase tracking-widest opacity-80">
          Academic Track & Submissions
        </p>
      </div>

      <ChildSelector />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Pending', count: assignments.filter(a => a.status === 'Pending').length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Submitted', count: assignments.filter(a => a.status === 'Submitted').length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Graded', count: assignments.filter(a => a.status === 'Graded').length, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} rounded-xl p-4 border border-white shadow-sm`}>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className={`text-3xl font-black ${stat.color}`}>{stat.count}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          [1,2].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl" />)
        ) : assignments.length > 0 ? assignments.map((assignment, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 group hover:border-blue-200 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-gray-900 group-hover:text-blue-700 transition-colors uppercase tracking-tight">{assignment.title}</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{assignment.subject} • Teacher: {assignment.teacher}</p>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${getStatusColor(assignment.status)}`}>
                  {assignment.status}
                </span>
                {assignment.marks && (
                  <p className="text-sm font-black text-green-600 mt-1">{assignment.marks}/100</p>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-4 font-medium leading-relaxed">{assignment.description}</p>

            {assignment.attachments?.length > 0 && (
              <div className="mb-4 space-y-2">
                {assignment.attachments.map((file, fIdx) => (
                  <div key={fIdx} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.type)}
                      <span className="text-[10px] font-bold text-slate-700">{file.name}</span>
                    </div>
                    <MdDownload className="w-4 h-4 text-slate-400 hover:text-blue-600 cursor-pointer" />
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <span className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1">
                <MdCalendarToday className="text-sm" /> Due: {assignment.dueDate}
              </span>
              {assignment.status === 'Pending' && user?.role === 'student' && (
                <button
                  onClick={() => handleSubmitClick(assignment)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                >
                  <MdOutlineSend className="text-sm" /> Submit Work
                </button>
              )}
            </div>
          </div>
        )) : (
          <div className="text-center py-20">
             <MdAssignment className="w-16 h-16 text-gray-100 mx-auto" />
             <p className="text-gray-400 font-black text-sm uppercase mt-4">No assignments found</p>
          </div>
        )}
      </div>

      {/* Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
              <h3 className="font-black text-sm uppercase tracking-widest">Submit Work</h3>
              <button onClick={() => setShowSubmitModal(false)}><MdClose className="text-xl" /></button>
            </div>
            <div className="p-6">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Assignment</p>
              <h4 className="text-base font-black text-gray-800 mb-6">{selectedAssignment?.title}</h4>
              
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Your Answer / Submission Link</label>
              <textarea
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
                rows={5}
                className="w-full border-2 border-gray-100 rounded-xl p-4 text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Type your answer or paste your Google Drive/OneDrive link here..."
              ></textarea>
              
              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-3 border-2 border-gray-100 rounded-xl text-xs font-black text-gray-500 uppercase tracking-widest hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:bg-gray-300 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Submitting...' : <><MdCheckCircle className="text-base" /> Confirm Submit</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignment;