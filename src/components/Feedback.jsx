import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';

const Feedback = ({ onClose }) => {
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    
    try {
      // Get user's timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Get screen size
      const screenSize = `${window.innerWidth}x${window.innerHeight}`;
      
      // Get current time in Arabic format
      const time = new Date().toLocaleString('ar-SA', {
        timeZone: timezone,
        dateStyle: 'full',
        timeStyle: 'long'
      });

      await emailjs.send(
        'service_hm08rqz',
        'template_frdr49l',
        {
          message: message.trim(),
          user_agent: navigator.userAgent,
          language: navigator.language,
          timezone: timezone,
          screen_size: screenSize,
          time: time
        },
        '2Wh0SeulW2iFz_UPV'
      );

      setShowSuccess(true);
      setMessage('');
      
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      alert('حدث خطأ. الرجاء المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#1A1A1A] rounded-2xl p-6 w-full max-w-md relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">تواصل معنا</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            className="w-full h-32 bg-[#2A2A2A] rounded-lg p-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            required
            disabled={isSubmitting}
          />
          
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                bg-gradient-to-r from-violet-600 to-fuchsia-600 
                hover:from-violet-700 hover:to-fuchsia-700 
                text-white px-8 py-2 rounded-lg font-bold 
                transition-all duration-300
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
            </button>
          </div>
        </form>

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg"
            >
              تم إرسال رسالتك بنجاح
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default Feedback; 