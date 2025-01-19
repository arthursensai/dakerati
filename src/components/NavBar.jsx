import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import AccountSettings from './Account/AccountSettings';
import ProfileSettings from './Account/ProfileSettings';

const NavBar = ({ score, highScore, streak }) => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const handleLogout = async () => {
    try {
      await logout();
      setShowDropdown(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const openModal = (content) => {
    setModalContent(content);
    setShowModal(true);
    setShowDropdown(false);
  };

  return (
    <>
      <nav className="bg-[#111111]/90 border-b border-[#2A2A2A] backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center md:justify-between">
            {/* Title and Stats Section */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                اختبار حفظ القرآن
              </h1>
            </div>

            {/* Stats Display */}
            

            {/* User Profile Section */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-3 bg-[#1A1A1A] hover:bg-[#2A2A2A] rounded-xl px-4 py-2 transition-colors duration-200"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 flex items-center justify-center">
                        <span className="text-lg text-violet-400">
                          {user.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-zinc-200">{user.username}</span>
                  </button>

                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-lg overflow-hidden"
                      >
                        <button
                          onClick={() => openModal('profile')}
                          className="w-full text-right px-4 py-2 text-zinc-200 hover:bg-[#2A2A2A] transition-colors duration-200"
                        >
                          الملف الشخصي
                        </button>
                        <button
                          onClick={() => openModal('settings')}
                          className="w-full text-right px-4 py-2 text-zinc-200 hover:bg-[#2A2A2A] transition-colors duration-200"
                        >
                          إعدادات الحساب
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-right px-4 py-2 text-red-400 hover:bg-[#2A2A2A] transition-colors duration-200"
                        >
                          تسجيل الخروج
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => {}} // Add your login modal here
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-6 py-2 rounded-xl"
                >
                  تسجيل الدخول
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <div className="relative max-w-md w-full">
              <button
                onClick={() => setShowModal(false)}
                className="absolute -top-12 right-0 text-zinc-400 hover:text-white"
              >
                إغلاق
              </button>
              
              {modalContent === 'profile' ? (
                <ProfileSettings onClose={() => setShowModal(false)} />
              ) : (
                <AccountSettings onClose={() => setShowModal(false)} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavBar; 