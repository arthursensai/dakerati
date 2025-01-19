import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const UserProfile = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#111111]/90 px-6 py-4 rounded-xl border border-[#2A2A2A] backdrop-blur-sm flex items-center gap-4"
    >
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-violet-400">{user.username}</h3>
        <p className="text-sm text-zinc-400">{user.email}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm text-zinc-400">أعلى نتيجة</div>
          <div className="text-lg font-bold text-fuchsia-400">{user.highScore}</div>
        </div>
        <button
          onClick={handleLogout}
          className="bg-[#2A2A2A] hover:bg-[#333333] text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          تسجيل خروج
        </button>
      </div>
    </motion.div>
  );
};

export default UserProfile; 