import React, { useState, useEffect } from 'react';
import AyahCard from './AyahCard';
import ShareProgress from './ShareProgress';
import AyahDetails from './AyahDetails';
import NotificationSettings from './NotificationSettings';
import Feedback from './Feedback';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const SURAHS = [
    "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة",
    "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
    "هود", "يوسف", "الرعد", "إبراهيم", "الحجر",
    "النحل", "الإسراء", "الكهف", "مريم", "طه",
    "الأنبياء", "الحج", "المؤمنون", "الفرقان", "الشعراء",
    "النمل", "القصص", "العنكبوت", "الروم", "لقمان",
    "السجدة", "الأحزاب", "سبأ", "فاطر", "يس",
    "الصافات", "ص", "الزمر", "غافر", "فصلت",
    "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف",
    "محمد", "الفتح", "الحجرات", "ق", "الذاريات",
    "الطور", "النجم", "القمر", "الرحمن", "الواقعة",
    "الحديد", "المجادلة", "الحشر", "الممتحنة", "الصف",
    "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم",
    "الملك", "القلم", "الحاقة", "المعارج", "نوح",
    "الجن", "المزمل", "المدثر", "القيامة", "الإنسان",
    "المرسلات", "النبأ", "النازعات", "عبس", "التكوير",
    "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق",
    "الأعلى", "الغاشية", "الفجر", "البلد", "الشمس",
    "الليل", "الضحى", "الشرح", "التين", "العلق",
    "القدر", "البينة", "الزلزلة", "العاديات", "القارعة",
    "التكاثر", "العصر", "الهمزة", "الفيل", "قريش",
    "الماعون", "الكوثر", "الكافرون", "النصر", "المسد",
    "الإخلاص", "الفلق", "الناس"
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
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentAyah, setCurrentAyah] = useState(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [firebaseError, setFirebaseError] = useState(false);

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

  useEffect(() => {
    const testFirebaseConnection = async () => {
      try {
        // Just try to get a collection instead of writing
        const querySnapshot = await getDocs(collection(db, 'test'));
        setFirebaseError(false);
      } catch (error) {
        console.error('Firebase connection error:', error);
        setFirebaseError(true);
      }
    };

    testFirebaseConnection();
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

  // Simplified error message component
  const FirebaseErrorMessage = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-16 left-1/2 transform -translate-x-1/2 bg-red-500/10 text-red-400 px-4 py-2 rounded-lg text-sm backdrop-blur-sm border border-red-500/20 z-50"
    >
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>حدث خطأ في الاتصال</span>
        <button
          onClick={() => window.location.reload()}
          className="underline hover:text-white transition-colors"
        >
          تحديث الصفحة
        </button>
      </div>
    </motion.div>
  );

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
    <div className="min-h-screen bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] text-white flex flex-col">
      {/* Header */}
      <header className="w-full bg-[#1A1A1A]/90 backdrop-blur-sm fixed top-0 z-20 py-3 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Left side */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                onClick={() => setShowNotificationSettings(true)}
                className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white p-2 rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <button
                onClick={() => setShowFeedback(true)}
                className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white p-2 rounded-lg transition-colors"
                aria-label="Feedback"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </button>
            </div>

            {/* Right side - Login/Profile */}
            <div>
              {isLoggedIn ? (
                <button
                  onClick={() => setIsLoggedIn(false)}
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                >
                  تسجيل الخروج
                </button>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                >
                  تسجيل الدخول
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with adjusted padding */}
      <main className="flex-grow container mx-auto px-4 pt-20 pb-8">
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
              onClose={() => setShowAyahDetails(false)}
            />
          )}
          {showNotificationSettings && (
            <NotificationSettings
              onClose={() => setShowNotificationSettings(false)}
            />
          )}
          {showFeedback && (
            <Feedback
              onClose={() => setShowFeedback(false)}
            />
          )}
        </AnimatePresence>

        {/* Show error message if Firebase is blocked */}
        <AnimatePresence>
          {firebaseError && <FirebaseErrorMessage />}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full py-3 sm:py-4 text-center text-zinc-500 text-xs sm:text-sm bg-[#1A1A1A]/50 backdrop-blur-sm">
        Made with ❤️ by <a 
          href="https://www.instagram.com/arthur_sensai/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:text-white transition-colors"
        >
          Arthur Sensai
        </a>
      </footer>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#1A1A1A] rounded-2xl p-6 w-full max-w-md relative"
            >
              <h2 className="text-xl font-bold mb-6 text-center">تسجيل الدخول</h2>
              
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setIsLoggedIn(true);
                    setShowLoginModal(false);
                  }}
                  className="w-full bg-white text-gray-800 px-4 py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-100 transition-colors"
                >
                  <img src="/google-icon.png" alt="Google" className="w-5 h-5" />
                  <span>تسجيل الدخول باستخدام Google</span>
                </button>
                
                <button
                  onClick={() => {
                    setIsLoggedIn(true);
                    setShowLoginModal(false);
                  }}
                  className="w-full bg-[#1877F2] text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-[#1865F2] transition-colors"
                >
                  <img src="/facebook-icon.png" alt="Facebook" className="w-5 h-5" />
                  <span>تسجيل الدخول باستخدام Facebook</span>
                </button>
              </div>

              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Game; 