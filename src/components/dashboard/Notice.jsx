import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchNotices, getCurrentStudent } from '../../services/dataService';
import { toast } from 'react-toastify';
import ChildSelector from './ChildSelector';
import { MdAttachFile, MdImage, MdPictureAsPdf, MdDescription, MdDownload } from 'react-icons/md';

const Notice = () => {
  const { user, selectedChild } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentStudent = getCurrentStudent(user, selectedChild);

  useEffect(() => {
    const loadNotices = async () => {
      setLoading(true);
      try {
        const res = await fetchNotices(currentStudent?.id);
        if (res.success) {
          const transformed = (res.data || []).map(n => ({
            title: n.title,
            content: n.content,
            date: new Date(n.publishDate).toISOString().split('T')[0],
            priority: n.priority?.charAt(0).toUpperCase() + (n.priority?.slice(1) || 'Medium'),
            category: n.type || 'General',
            attachments: n.attachments || []
          }));
          setNotices(transformed);
        } else {
          toast.error(res.message || 'Failed to load notices');
        }
      } catch (error) {
        console.error('Notice fetch error:', error);
        toast.error('Failed to load notices');
      } finally {
        setLoading(false);
      }
    };

    if (currentStudent?.id) {
      loadNotices();
    }
  }, [currentStudent?.id]);

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return <MdPictureAsPdf className="w-4 h-4 text-red-500" />;
      case 'image': return <MdImage className="w-4 h-4 text-blue-500" />;
      case 'document': return <MdDescription className="w-4 h-4 text-green-500" />;
      default: return <MdAttachFile className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Holiday': return 'bg-purple-100 text-purple-800';
      case 'Meeting': return 'bg-blue-100 text-blue-800';
      case 'Event': return 'bg-orange-100 text-orange-800';
      case 'Library': return 'bg-indigo-100 text-indigo-800';
      case 'General': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Notice Board
        </h1>
        <p className="text-gray-600">
          {user?.role === 'student'
            ? 'Important notices and announcements'
            : currentStudent
              ? `Important notices for ${currentStudent.name} (${currentStudent.class} ${currentStudent.section})`
              : 'School notices and announcements'
          }
        </p>
      </div>

      <ChildSelector />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <div className="ml-3 md:ml-4 min-w-0">
              <h3 className="text-sm md:text-lg font-semibold text-gray-900 truncate">High Priority</h3>
              <p className="text-xl md:text-2xl font-bold text-red-600">
                {notices.filter(n => n.priority === 'High').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <div className="ml-3 md:ml-4 min-w-0 flex-1">
              <h3 className="text-sm md:text-base font-semibold text-gray-900">Medium Priority</h3>
              <p className="text-xl md:text-2xl font-bold text-yellow-600">
                {notices.filter(n => n.priority === 'Medium').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <div className="ml-3 md:ml-4 min-w-0">
              <h3 className="text-sm md:text-lg font-semibold text-gray-900 truncate">Low Priority</h3>
              <p className="text-xl md:text-2xl font-bold text-green-600">
                {notices.filter(n => n.priority === 'Low').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <div className="ml-3 md:ml-4 min-w-0">
              <h3 className="text-sm md:text-lg font-semibold text-gray-900 truncate">Total Notices</h3>
              <p className="text-xl md:text-2xl font-bold text-blue-600">{notices.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notices Available</h3>
            <p className="text-gray-600">There are no notices to display at the moment.</p>
          </div>
        ) : (
          notices.map((notice, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <h3 className="text-lg font-semibold text-gray-900 break-words">{notice.title}</h3>
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(notice.category)}`}>
                    {notice.category}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(notice.priority)}`}>
                    {notice.priority}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 mb-3">{notice.content}</p>

              {notice.attachments && notice.attachments.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments:</h4>
                  <div className="space-y-2">
                    {notice.attachments.map((file, fileIndex) => (
                      <div key={fileIndex} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          {getFileIcon(file.type)}
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">({file.size})</span>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800">
                          <MdDownload className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Published: {notice.date}</span>
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  Read More
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notice;
