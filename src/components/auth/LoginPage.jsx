import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AuthForm from './AuthForm';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiUser, FiUsers, FiShield } from 'react-icons/fi';

const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState('student'); // 'student', 'parent'
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (credentials) => {
    setIsLoading(true);
    const result = await login(credentials);
    setIsLoading(false);
    
    if (!result.success) {
      toast.error(result.message || 'Invalid credentials');
    } else {
      toast.success(`Welcome back! Logging in as ${selectedRole}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-60"></div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        hideProgressBar={false}
      />

      <div className="max-w-md w-full mx-4 z-10">
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-[2rem] p-8 md:p-10 relative">
          {/* Logo/Icon Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/20 mb-6 transform -rotate-6">
              <FiShield className="text-white text-4xl" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              Edu<span className="text-blue-600">Portal</span>
            </h1>
            <p className="text-gray-500 font-medium">Access your educational dashboard</p>
          </div>

          {/* Role Switcher */}
          <div className="flex p-1.5 bg-gray-100 rounded-2xl mb-8 space-x-1">
            <button
              onClick={() => setSelectedRole('student')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                selectedRole === 'student' 
                ? 'bg-white text-blue-600 shadow-md' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiUser className={selectedRole === 'student' ? 'text-blue-600' : 'text-gray-400'} />
              Student
            </button>
            <button
              onClick={() => setSelectedRole('parent')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                selectedRole === 'parent' 
                ? 'bg-white text-blue-600 shadow-md' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiUsers className={selectedRole === 'parent' ? 'text-blue-600' : 'text-gray-400'} />
              Parent
            </button>
          </div>
          
          <AuthForm 
            onSubmit={handleLogin} 
            role={selectedRole} 
            isLoading={isLoading} 
          />
          
          <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Need assistance? <span className="text-blue-600 font-bold cursor-pointer hover:underline">Contact School Admin</span>
            </p>
          </div>

          {/* Quick Help for Dev/Demo */}
          <div className="mt-6 flex flex-col items-center gap-1.5 group opacity-30 hover:opacity-100 transition-opacity duration-300">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Demo Credentials</p>
            {selectedRole === 'student' ? (
              <p className="text-[11px] text-gray-500">Enroll: <span className="text-blue-600 font-mono">STU-101</span> / DOB: <span className="text-blue-600 font-mono">2008-05-15</span></p>
            ) : (
              <p className="text-[11px] text-gray-500">Mobile: <span className="text-blue-600 font-mono">9876543210</span> / Pass: <span className="text-blue-600 font-mono">parent123</span></p>
            )}
          </div>
        </div>
        
        {/* Footer info */}
        <div className="mt-8 flex justify-center space-x-6 text-gray-400 text-xs font-medium">
          <span className="hover:text-gray-600 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-gray-600 cursor-pointer">Terms of Service</span>
          <span className="hover:text-gray-600 cursor-pointer">© 2024 Optivexa</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;