import React from 'react';
import { motion } from 'framer-motion';
import {
  WhatsappShareButton,
  WhatsappIcon,
  TelegramShareButton,
  TelegramIcon,
  TwitterShareButton,
  TwitterIcon,
} from 'react-share';

const ShareProgress = ({ score, streak, onClose }) => {
  const shareUrl = window.location.origin; // Gets the base URL of your app
  const title = `🌟 حققت ${score} نقطة في اختبار القرآن الكريم! سلسلة إجابات صحيحة: ${streak}`;
  
  return (
    <motion.div
      className="fixed bottom-4 right-4 bg-[#1A1A1A] p-6 rounded-xl shadow-lg border border-gray-700 z-50 w-80"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-zinc-400 hover:text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      <div className="text-center mb-4">
        <h3 className="text-white font-bold text-lg mb-2">🎉 مبروك!</h3>
        <p className="text-zinc-400 mb-1">النقاط: {score}</p>
        <p className="text-zinc-400">سلسلة الإجابات الصحيحة: {streak}</p>
      </div>
      
      <div className="flex gap-4 justify-center mb-4">
        <WhatsappShareButton url={shareUrl} title={title}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="hover:opacity-80 transition-opacity"
          >
            <WhatsappIcon size={48} round />
          </motion.div>
        </WhatsappShareButton>

        <TelegramShareButton url={shareUrl} title={title}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="hover:opacity-80 transition-opacity"
          >
            <TelegramIcon size={48} round />
          </motion.div>
        </TelegramShareButton>

        <TwitterShareButton url={shareUrl} title={title}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="hover:opacity-80 transition-opacity"
          >
            <TwitterIcon size={48} round />
          </motion.div>
        </TwitterShareButton>
      </div>

      <button
        onClick={() => {
          navigator.clipboard.writeText(`${shareUrl}?ref=invite`);
          alert('تم نسخ الرابط!');
        }}
        className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all duration-300"
      >
        نسخ رابط الدعوة
      </button>
    </motion.div>
  );
};

export default ShareProgress; 