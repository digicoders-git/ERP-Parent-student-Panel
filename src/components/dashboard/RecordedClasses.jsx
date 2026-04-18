import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchRecordedClasses, getCurrentStudent } from '../../services/dataService';
import { toast } from 'react-toastify';
import {
  MdVideoLibrary,
  MdPlayCircleFilled,
  MdSearch,
  MdAccessTime,
  MdPerson,
  MdCalendarToday,
  MdSchool,
  MdFilterList,
  MdClose,
  MdPlayArrow
} from 'react-icons/md';
import ChildSelector from './ChildSelector';

const RecordedClasses = () => {
  const { user, selectedChild } = useAuth();
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const currentStudent = getCurrentStudent(user, selectedChild);

  useEffect(() => {
    const loadRecordedClasses = async () => {
      setLoading(true);
      try {
        const studentId = currentStudent?.id;
        if (!studentId) {
          toast.error('Student ID not found');
          setLoading(false);
          return;
        }

        const res = await fetchRecordedClasses(studentId);
        if (res.success && res.data) {
          const formattedVideos = res.data.map(v => ({
            id: v.id,
            title: v.title,
            subject: v.subject,
            teacher: v.teacher,
            duration: v.duration,
            thumbnail: v.thumbnail || 'https://images.unsplash.com/photo-1509228468518-180dd4822955?auto=format&fit=crop&q=80&w=400',
            videoUrl: v.videoUrl,
            uploadedAt: v.uploadedAt,
            views: v.views,
            class: v.class,
            section: v.section
          }));

          setVideos(formattedVideos);

          // Extract unique teachers and subjects
          const uniqueTeachers = [...new Set(formattedVideos.map(v => v.teacher))].filter(Boolean);
          const uniqueSubjects = [...new Set(formattedVideos.map(v => v.subject))].filter(Boolean);

          setTeachers(uniqueTeachers);
          setSubjects(uniqueSubjects);
          setFilteredVideos(formattedVideos);
        } else {
          toast.info('No recorded classes available');
          setVideos([]);
          setFilteredVideos([]);
        }
      } catch (error) {
        console.error('Error loading recorded classes:', error);
        toast.error('Failed to load recorded classes');
      } finally {
        setLoading(false);
      }
    };

    loadRecordedClasses();
  }, [currentStudent?.id]);

  // Filter videos based on search and filters
  useEffect(() => {
    let filtered = videos;

    if (searchTerm) {
      filtered = filtered.filter(v =>
        v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTeacher !== 'all') {
      filtered = filtered.filter(v => v.teacher === selectedTeacher);
    }

    if (selectedSubject !== 'all') {
      filtered = filtered.filter(v => v.subject === selectedSubject);
    }

    setFilteredVideos(filtered);
  }, [searchTerm, selectedTeacher, selectedSubject, videos]);

  const VideoCard = ({ video }) => (
    <div
      onClick={() => setSelectedVideo(video)}
      className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
    >
      <div className="relative aspect-video bg-slate-900 overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <MdPlayCircleFilled className="text-white text-5xl drop-shadow-lg" />
        </div>
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
          {video.duration}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold uppercase">
            {video.subject}
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">
            {video.class}
          </span>
        </div>

        <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 text-sm group-hover:text-blue-600">
          {video.title}
        </h3>

        <div className="space-y-1 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <MdPerson className="text-blue-600" />
            <span className="font-semibold">{video.teacher}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1">
              <MdCalendarToday className="text-slate-400" />
              <span>{video.uploadedAt}</span>
            </div>
            <span className="text-slate-400">{video.views} views</span>
          </div>
        </div>
      </div>
    </div>
  );

  const VideoModal = ({ video, onClose }) => {
    if (!video) return null;

    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex-1">{video.title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MdClose className="text-2xl text-slate-600" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Video Player */}
            <div className="bg-slate-900 rounded-xl overflow-hidden aspect-video">
              {video.videoUrl ? (
                <video
                  controls
                  className="w-full h-full"
                  poster={video.thumbnail}
                >
                  <source src={video.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <MdPlayArrow className="text-6xl text-white/50 mx-auto mb-2" />
                    <p className="text-white/50">Video not available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Subject</p>
                <p className="text-lg font-bold text-blue-600">{video.subject}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Class</p>
                <p className="text-lg font-bold text-purple-600">{video.class}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Duration</p>
                <p className="text-lg font-bold text-green-600">{video.duration}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-xs text-slate-600 font-semibold uppercase mb-1">Views</p>
                <p className="text-lg font-bold text-orange-600">{video.views}</p>
              </div>
            </div>

            {/* Teacher and Date Info */}
            <div className="bg-slate-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <MdPerson className="text-2xl text-blue-600" />
                <div>
                  <p className="text-xs text-slate-600 font-semibold uppercase">Teacher</p>
                  <p className="text-lg font-bold text-slate-900">{video.teacher}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MdCalendarToday className="text-2xl text-slate-600" />
                <div>
                  <p className="text-xs text-slate-600 font-semibold uppercase">Uploaded</p>
                  <p className="text-lg font-bold text-slate-900">{video.uploadedAt}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <MdVideoLibrary className="text-4xl" />
          <div>
            <h1 className="text-3xl font-black">Recorded Classes</h1>
            <p className="text-blue-100 text-sm">
              {currentStudent?.class} - {currentStudent?.section}
            </p>
          </div>
        </div>
        <p className="text-blue-100 font-medium">
          Access all recorded lectures for your class. Learn at your own pace!
        </p>
      </div>

      <ChildSelector />

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input
            type="text"
            placeholder="Search by title or subject..."
            className="w-full bg-slate-50 text-slate-900 pl-12 pr-6 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <MdFilterList /> Filter by Teacher
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Teachers</option>
              {teachers.map(teacher => (
                <option key={teacher} value={teacher}>{teacher}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <MdFilterList /> Filter by Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-semibold">Loading recorded classes...</p>
          </div>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 p-12 text-center">
          <MdVideoLibrary className="text-6xl text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-600 mb-2">No Videos Found</h3>
          <p className="text-slate-500">
            {searchTerm || selectedTeacher !== 'all' || selectedSubject !== 'all'
              ? 'Try adjusting your filters or search term'
              : 'No recorded classes available for your section yet'}
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm font-semibold text-slate-600 mb-4">
            Showing {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      )}

      {/* Video Modal */}
      <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
    </div>
  );
};

export default RecordedClasses;
