import React, { useState, useEffect } from 'react';
import AyahCard from './AyahCard';
import ShareProgress from './ShareProgress';
import AyahDetails from './AyahDetails';
import NotificationSettings from './NotificationSettings';
import { motion, AnimatePresence } from 'framer-motion';

const SURAHS = [
    "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة",
    "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
    "هود", "يوسف", "الرعد", "إبراهيم", "الحجر",
    "النحل", "الإسراء", "الكهف", "مريم", "طه",
    "الأنبياء", "الحج", "المؤمنون", "الفرقان", "الشعراء",
    "النمل", "العنكبوت", "الروم", "لقمان", "السجدة",
    "الأحزاب", "يس", "الصافات", "فصلت", "الشورى",
    "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد",
    "الفتح", "الحجرات", "ق", "الذاريات", "الطور",
    "النجم", "القمر", "الرحمن", "الواقعة", "الحديد",
    "المجادلة", "الطلاق", "التحريم", "الملك", "القلم",
    "الحاقة", "المؤمن", "فصلت", "الزمر", "غافر",
    "فصلت", "الحديد", "الأعراف", "الكرامة", "التوراة"
  ];
  
const normalizeArabicText = (text) => {
  return text
    .replace(/^سورة\s+/, '') // Remove سورة prefix
    .replace(/^سُورَةُ\s+/, '') // Remove سُورَةُ prefix
    .normalize('NFKC')
    .replace(/[\u064B-\u065F]/g, '') // Remove all tashkeel
    .replace(/[ٱإأآا]/g, 'ا') // Normalize alif
    .replace(/ى/g, 'ي') // Normalize ya
    .replace(/ة$/g, 'ه') // Normalize ta marbuta
    .replace(/ه$/g, 'ة') // Handle reverse ta marbuta
    .replace(/\s+/g, ' ') // Normalize spaces
    .replace(/ـ/g, '') // Remove tatweel
    .trim();
};

const Game = () => {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [showAyahDetails, setShowAyahDetails] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [currentAyah, setCurrentAyah] = useState(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const generateOptions = (correctSurah) => {
    // Normalize the correct surah name
    const cleanCorrectSurah = normalizeArabicText(correctSurah);
    
    // Filter and normalize other surahs
    const otherSurahs = SURAHS.filter(surah => 
      normalizeArabicText(surah) !== cleanCorrectSurah
    );
    
    // Get 3 random wrong options
    const wrongOptions = shuffleArray(otherSurahs).slice(0, 3);
    
    // Add سورة prefix to all options consistently
    return shuffleArray([...wrongOptions, cleanCorrectSurah])
      .map(surah => `سورة ${surah}`);
  };

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial state
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchRandomAyah = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!navigator.onLine) {
        setError('لا يوجد اتصال بالإنترنت');
        setLoading(false);
        return;
      }

      const surahNumber = Math.floor(Math.random() * 114) + 1;
      
      const surahResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
      const surahData = await surahResponse.json();
      
      if (!surahData.data) {
        throw new Error('Failed to fetch surah data');
      }

      const ayahNumber = Math.floor(Math.random() * surahData.data.numberOfAyahs) + 1;
      const ayahResponse = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/ar.alafasy`);
      const ayahData = await ayahResponse.json();

      if (!ayahData.data) {
        throw new Error('Failed to fetch ayah data');
      }

      const normalizedSurahName = normalizeArabicText(ayahData.data.surah.name);
      
      const newAyah = {
        text: ayahData.data.text,
        surah: `سورة ${normalizedSurahName}`,
        surahEnglish: ayahData.data.surah.englishName,
        number: ayahData.data.numberInSurah,
        audio: ayahData.data.audio,
        translation: ayahData.data.translation,
        juz: ayahData.data.juz,
        page: ayahData.data.page
      };

      const newOptions = generateOptions(normalizedSurahName);

      setCurrentAyah(newAyah);
      setOptions(newOptions);
      setLoading(false);
    } catch (err) {
      setError(
        err.message === 'Failed to fetch' 
          ? 'يرجى التحقق من اتصال الإنترنت أو تعطيل مانع الإعلانات'
          : 'حدث خطأ في تحميل الآية. الرجاء المحاولة مرة أخرى.'
      );
      setLoading(false);
    }
  };

  // Load initial question
  useEffect(() => {
    fetchRandomAyah();
  }, []);

  const handleCorrectAnswer = () => {
    const newScore = score + 1;
    const newStreak = streak + 1;
    
    setScore(newScore);
    setStreak(newStreak);

    if (newScore % 3 === 0) {
      setShowShare(true);
      setTimeout(() => setShowShare(false), 5000);
    }

    // Add a small delay before loading the next question
    setTimeout(() => {
      fetchRandomAyah();
    }, 1500);
  };

  const handleWrongAnswer = () => {
    setStreak(0);
    setShowAyahDetails(true);
  };

  const handleCloseAyahDetails = () => {
    setShowAyahDetails(false);
    fetchRandomAyah();
  };

  const handleNext = () => {
    fetchRandomAyah();
  };

  if (isOffline) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] text-white flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">لا يوجد اتصال بالإنترنت</h2>
          <p className="text-zinc-400 mb-6">
            يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-6 py-2 rounded-lg font-bold"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] text-white flex items-center justify-center">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-400 mb-4">{error}</div>
          <button
            onClick={fetchRandomAyah}
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg"
          >
            حاول مرة أخرى
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] text-white">
      <div className="container mx-auto px-4 py-8 relative">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setShowNotificationSettings(true)}
            className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white p-2 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">اختبار القرآن</h1>
          <p className="text-lg">
            النقاط: <span className="text-violet-400">{score}</span> | 
            السلسلة: <span className="text-fuchsia-400">{streak}</span>
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {currentAyah && options.length > 0 && (
            <AyahCard
              ayahData={currentAyah}
              options={options}
              onNext={handleNext}
              onCorrectAnswer={handleCorrectAnswer}
              onWrongAnswer={handleWrongAnswer}
            />
          )}
        </div>

        <AnimatePresence>
          {showShare && (
            <ShareProgress 
              score={score} 
              streak={streak}
              onClose={() => setShowShare(false)}
            />
          )}
          {showAyahDetails && currentAyah && (
            <AyahDetails
              ayah={currentAyah}
              onClose={handleCloseAyahDetails}
            />
          )}
          {showNotificationSettings && (
            <NotificationSettings
              onClose={() => setShowNotificationSettings(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Game; 