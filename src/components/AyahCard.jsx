import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AudioPlayer from './AudioPlayer';

const AyahCard = ({ ayahData, options, onNext, onCorrectAnswer, onWrongAnswer }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const normalizeText = (text) => {
    return text
      .replace(/^سورة\s+/, '')
      .normalize('NFKC')
      .replace(/\u0670/g, 'ا')
      .replace(/[ٱإأآا]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة$/g, 'ه')
      .replace(/ه$/g, 'ة')
      .replace(/\s+/g, ' ')
      .replace(/ـ/g, '')
      .trim();
  };

  const compareNames = (selectedOption, correctSurah) => {
    const normalizedSelected = normalizeText(selectedOption);
    const normalizedCorrect = normalizeText(correctSurah);
    return normalizedSelected === normalizedCorrect;
  };

  const handleOptionClick = (option) => {
    if (showResult) return;
    
    setSelectedOption(option);
    setShowResult(true);
    
    const correctSurah = ayahData.surah.startsWith('سورة') 
      ? ayahData.surah 
      : `سورة ${ayahData.surah}`;

    const isCorrect = compareNames(option, correctSurah);
    
    if (isCorrect) {
      onCorrectAnswer();
    } else {
      onWrongAnswer();
    }
  };

  const handleNextClick = () => {
    setSelectedOption(null);
    setShowResult(false);
    if (onNext) {
      onNext();
    }
  };

  const getButtonStyle = (option) => {
    if (!showResult) {
      return 'bg-[#2A2A2A] hover:bg-[#3A3A3A] border-[#3A3A3A]';
    }

    const correctSurah = ayahData.surah.startsWith('سورة') 
      ? ayahData.surah 
      : `سورة ${ayahData.surah}`;

    if (compareNames(option, correctSurah)) {
      return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400';
    }

    if (option === selectedOption) {
      return 'bg-red-500/20 border-red-500/50 text-red-400';
    }

    return 'bg-[#2A2A2A] border-[#3A3A3A] opacity-50';
  };

  return (
    <motion.div 
      className="bg-[#1A1A1A] rounded-xl sm:rounded-2xl p-4 sm:p-8 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="mb-6 sm:mb-8">
        <div className="mb-4 sm:mb-6">
          <AudioPlayer src={ayahData.audio} />
        </div>
        <h2 className="text-lg sm:text-2xl mb-3 sm:mb-4 font-arabic text-center leading-loose">
          {ayahData.text}
        </h2>
        <p className="text-zinc-400 text-center text-sm sm:text-base">
          اختر اسم السورة التي تنتمي إليها هذه الآية
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {options.map((option, index) => (
          <motion.button
            key={index}
            onClick={() => handleOptionClick(option)}
            className={`
              p-3 sm:p-4 rounded-lg sm:rounded-xl text-base sm:text-lg transition-all duration-300
              ${getButtonStyle(option)}
              border
            `}
            whileHover={!showResult ? { scale: 1.02 } : {}}
            whileTap={!showResult ? { scale: 0.98 } : {}}
            disabled={showResult}
          >
            <span className="font-arabic">{option}</span>
          </motion.button>
        ))}
      </div>

      {showResult && (
        <motion.div 
          className="mt-4 sm:mt-6 flex justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={handleNextClick}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold shadow-lg transition-all duration-300 text-sm sm:text-base"
          >
            السؤال التالي
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AyahCard;