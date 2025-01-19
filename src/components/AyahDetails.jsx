import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AyahDetails = ({ ayah, onClose }) => {
  const [activeTab, setActiveTab] = useState('tafsir');

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-[#1A1A1A] rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">معلومات عن الآية</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Ayah Text */}
        <div className="p-6 border-b border-gray-700 bg-[#2A2A2A]">
          <p className="text-xl text-center font-arabic leading-loose">
            {ayah.text}
          </p>
          <p className="text-center text-zinc-400 mt-2">
            {ayah.surah} - الآية {ayah.number}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'tafsir'
                ? 'text-white border-b-2 border-violet-500'
                : 'text-zinc-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('tafsir')}
          >
            التفسير
          </button>
          <button
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'translation'
                ? 'text-white border-b-2 border-violet-500'
                : 'text-zinc-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('translation')}
          >
            الترجمة
          </button>
          <button
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'tips'
                ? 'text-white border-b-2 border-violet-500'
                : 'text-zinc-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('tips')}
          >
            نصائح للحفظ
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[40vh]">
          <AnimatePresence mode="wait">
            {activeTab === 'tafsir' && (
              <motion.div
                key="tafsir"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-zinc-300 leading-relaxed"
              >
                <h3 className="font-bold text-white mb-2">تفسير الآية</h3>
                <p className="text-justify">{ayah.tafsir || 'جاري تحميل التفسير...'}</p>
                <a
                  href={`https://quran.com/${ayah.surahNumber}/${ayah.number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-violet-400 hover:text-violet-300"
                >
                  اقرأ المزيد في موقع Quran.com ←
                </a>
              </motion.div>
            )}

            {activeTab === 'translation' && (
              <motion.div
                key="translation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="font-bold text-white mb-2">English</h3>
                  <p className="text-zinc-300">{ayah.englishTranslation || 'Loading translation...'}</p>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2">Français</h3>
                  <p className="text-zinc-300">{ayah.frenchTranslation || 'Chargement de la traduction...'}</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'tips' && (
              <motion.div
                key="tips"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <h3 className="font-bold text-white mb-2">نصائح للحفظ</h3>
                <ul className="list-disc list-inside text-zinc-300 space-y-2">
                  <li>استمع إلى الآية مرارًا وتكرارًا</li>
                  <li>اكتب الآية عدة مرات</li>
                  <li>افهم معنى الآية وسياقها</li>
                  <li>قسّم الآية إلى أجزاء صغيرة</li>
                  <li>راجع الآية بشكل منتظم</li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AyahDetails; 