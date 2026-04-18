import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
   const { user } = useAuth();
   const [currentTime, setCurrentTime] = useState(new Date());

   useEffect(() => {
      const timer = setInterval(() => {
         setCurrentTime(new Date());
      }, 1000);

      return () => clearInterval(timer);
   }, []);

   const formatDate = (date) => {
      return date.toLocaleDateString('en-US', {
         weekday: 'long',
         year: 'numeric',
         month: 'long',
         day: 'numeric'
      });
   };

   const formatTime = (date) => {
      return date.toLocaleTimeString('en-US', {
         hour: '2-digit',
         minute: '2-digit',
         second: '2-digit',
         hour12: true
      });
   };

   const getFirstLetter = () => {
      return user?.firstName?.charAt(0).toUpperCase() || 'U';
   };

   return (
      <nav className="bg-white shadow-sm border-b border-gray-200 px-4 py-2.5 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
         <div className="flex justify-end items-center">
            <div className="flex items-center space-x-5">
               <div className="text-right text-xs text-gray-600">
                  <div className="font-black text-gray-800">{formatTime(currentTime)}</div>
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{formatDate(currentTime)}</div>
               </div>

               <div className="flex items-center space-x-2.5 bg-gray-50 px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                     <span className="text-white font-bold text-base">
                        {getFirstLetter()}
                     </span>
                  </div>

                  <div className="text-left">
                     <div className="text-xs font-black text-gray-900 leading-none mb-0.5">
                        {user?.firstName} {user?.lastName}
                     </div>
                     <div className="text-[9px] text-blue-600 font-black uppercase tracking-widest">
                        {user?.role}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </nav>
   );
};

export default Navbar;