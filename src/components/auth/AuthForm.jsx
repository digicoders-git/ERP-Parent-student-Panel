import { useState } from 'react';
import { FiPhone, FiLock, FiUser, FiCalendar, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

const AuthForm = ({ onSubmit, role, isLoading }) => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [dob, setDob] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role === 'student') {
      onSubmit({ role, admissionNumber, dob });
    } else {
      onSubmit({ role, mobile, password });
    }
  };

  const inputClasses = "w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400";
  const labelClasses = "block text-sm font-semibold text-gray-700 mb-1.5 ml-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {role === 'parent' ? (
        <>
          <div>
            <label className={labelClasses}>Mobile Number</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <FiPhone />
              </div>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className={inputClasses}
                placeholder="Enter registered mobile"
                required
              />
            </div>
          </div>
          
          <div>
            <label className={labelClasses}>Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <FiLock />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClasses}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-500 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <label className={labelClasses}>Enrollment Number</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <FiUser />
              </div>
              <input
                type="text"
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
                className={inputClasses}
                placeholder="e.g. STU-123"
                required
              />
            </div>
          </div>
          
          <div>
            <label className={labelClasses}>Date of Birth</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <FiCalendar />
              </div>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className={inputClasses}
                required
              />
            </div>
            <p className="mt-1.5 text-[11px] text-gray-400 ml-1">
              * Your DOB acts as your password for student access
            </p>
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-[0.98] ${
          isLoading 
          ? 'bg-blue-400 cursor-not-allowed' 
          : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 hover:shadow-blue-500/40 hover:-translate-y-0.5'
        }`}
      >
        {isLoading ? (
          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <>
            <span>Secure Login</span>
            <FiArrowRight className="text-lg" />
          </>
        )}
      </button>
    </form>
  );
};

export default AuthForm;