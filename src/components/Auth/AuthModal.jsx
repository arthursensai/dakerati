import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Login from './Login';
import SignUp from './SignUp';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 text-zinc-400 hover:text-white"
          >
            إغلاق
          </button>
          
          {isLogin ? (
            <Login onClose={onClose} />
          ) : (
            <SignUp onClose={onClose} />
          )}
          
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="mt-4 text-violet-400 hover:text-violet-300 text-center w-full"
          >
            {isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal; 