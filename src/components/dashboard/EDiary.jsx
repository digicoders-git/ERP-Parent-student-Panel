import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchEDiary, getCurrentStudent } from '../../services/dataService';
import { toast } from 'react-toastify';
import ChildSelector from './ChildSelector';
import {
  MdMenuBook,
  MdCalendarToday,
  MdSchool,
  MdAssignment,
  MdNoteAdd,
  MdBook,
  MdScience,
  MdCalculate,
  MdLanguage,
  MdHistory,
  MdStar,
  MdCheckCircle,
  MdPendingActions,
  MdAccessTime
} from 'react-icons/md';

const EDiary = () => {
  const { user, selectedChild } = useAuth();
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentStudent = getCurrentStudent(user, selectedChild);

  useEffect(() => {
    const loadEDiary = async () => {
      setLoading(true);
      try {
        const studentId = currentStudent?.id;
        const res = await fetchEDiary(studentId);
        if (res.success) {
          setDiaryEntries(res.data || []);
        }
      } catch (error) {
        toast.error('Failed to load diary entries');
      } finally {
        setLoading(false);
      }
    };

    loadEDiary();
  }, [currentStudent?.id]);

  const getSubjectIcon = (type) => {
    switch (type) {
      case 'math': return <MdCalculate className="w-5 h-5" />;
      case 'english': return <MdLanguage className="w-5 h-5" />;
      case 'science': return <MdScience className="w-5 h-5" />;
      case 'history': return <MdHistory className="w-5 h-5" />;
      default: return <MdBook className="w-5 h-5" />;
    }
  };

  const getSubjectColor = (type) => {
    switch (type) {
      case 'math': return 'from-blue-500 to-blue-600';
      case 'english': return 'from-green-500 to-green-600';
      case 'science': return 'from-purple-500 to-purple-600';
      case 'history': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    return status === 'completed'
      ? <MdCheckCircle className="w-5 h-5 text-green-500" />
      : <MdPendingActions className="w-5 h-5 text-orange-500" />;
  };

  const completedCount = diaryEntries.filter(entry => entry.status === 'completed').length;
  const pendingCount = diaryEntries.filter(entry => entry.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              E-Diary
            </h1>
            <p className="text-indigo-100 text-lg">
              {user?.role === 'student'
                ? 'Your daily learning progress'
                : currentStudent
                  ? `${currentStudent.name}'s daily learning progress (${currentStudent.class} ${currentStudent.section})`
                  : 'Student daily learning progress'
              }
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <MdMenuBook className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Child Selector for Parent */}
      <ChildSelector />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Entries</p>
              <p className="text-3xl font-bold text-gray-900">{diaryEntries.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <MdMenuBook className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-900">{completedCount}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <MdCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <MdPendingActions className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Diary Entries */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Recent Entries</h2>

        <div className="grid gap-6">
          {diaryEntries.map((entry, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
              {/* Card Header */}
              <div className={`bg-gradient-to-r ${getSubjectColor(entry.type)} p-4`}>
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      {getSubjectIcon(entry.type)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{entry.subject}</h3>
                      <p className="text-sm opacity-90">by {entry.teacher}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <MdCalendarToday className="w-4 h-4" />
                      <span className="text-sm font-medium">{entry.date}</span>
                    </div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(entry.priority)}`}>
                      <MdStar className="w-3 h-3 mr-1" />
                      {entry.priority.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <MdSchool className="w-5 h-5 text-blue-600 mr-2" />
                        <h4 className="font-semibold text-blue-900">Topic Covered</h4>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{entry.topic}</p>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <MdAssignment className="w-5 h-5 text-orange-600 mr-2" />
                        <h4 className="font-semibold text-orange-900">Homework</h4>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{entry.homework}</p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <MdNoteAdd className="w-5 h-5 text-purple-600 mr-2" />
                        <h4 className="font-semibold text-purple-900">Teacher's Notes</h4>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{entry.notes}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getStatusIcon(entry.status)}
                          <span className={`ml-2 font-medium ${entry.status === 'completed' ? 'text-green-700' : 'text-orange-700'
                            }`}>
                            {entry.status === 'completed' ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-500 text-sm">
                          <MdAccessTime className="w-4 h-4 mr-1" />
                          <span>Updated today</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EDiary;