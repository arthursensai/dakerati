import React, { useEffect, useState } from "react";
import AyahCard from "./components/AyahCard";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import UserProfile from './components/UserProfile';
import AuthModal from './components/Auth/AuthModal';
import { updateUserScore } from './utils/scoreManager';
import Leaderboard from './components/Leaderboard';
import NavBar from './components/NavBar';
import Game from './components/Game';

const App = () => {
  const [ayahData, setAyahData] = useState(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('highScore');
    return saved ? parseInt(saved) : 0;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuth();

  const allSurahs = [
    "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام",
    "الأعراف", "الأنفال", "التوبة", "يونس", "هود", "يوسف", "الرعد",
    "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه"
  ];

  useEffect(() => {
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('highScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  useEffect(() => {
    // Save high score to localStorage when it changes
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('highScore', score.toString());
    }
  }, [score, highScore]);

  const fetchRandomAyah = async () => {
    try {
      setLoading(true);
      setError(null);
      const randomAyah = Math.floor(Math.random() * 6236) + 1;
      const response = await axios.get(
        `https://api.alquran.cloud/v1/ayah/${randomAyah}/ar.alafasy`
      );

      const { text, surah, audio } = response.data.data;
      setAyahData({ text, surah: surah.name, audio });
      generateOptions(surah.name);
      setTotalQuestions(prev => prev + 1);
    } catch (error) {
      setError("حدث خطأ في تحميل الآية. الرجاء المحاولة مرة أخرى.");
      console.error("Error fetching Ayah:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateOptions = (correctSurah) => {
    const incorrectOptions = allSurahs
      .filter((surah) => surah !== correctSurah)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    const allOptions = [correctSurah, ...incorrectOptions];
    setOptions(allOptions.sort(() => Math.random() - 0.5));
  };

  const handleNext = () => {
    fetchRandomAyah();
  };

  const handleCorrectAnswer = async () => {
    const newScore = score + 1;
    setScore(newScore);
    setStreak(prev => prev + 1);
    
    // Add bonus points for streaks
    if (streak > 0 && streak % 5 === 0) {
      setScore(prev => prev + 2);
    }

    // Update Firebase if user is logged in
    if (user) {
      try {
        await updateUserScore(user.uid, newScore, totalQuestions + 1);
      } catch (error) {
        console.error('Error updating score:', error);
      }
    }
  };

  const handleWrongAnswer = () => {
    setStreak(0);
  };

  useEffect(() => {
    fetchRandomAyah();
  }, []);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#0A0A0A] bg-gradient-to-b from-[#0A0A0A] via-[#111111] to-[#0A0A0A] text-zinc-100">
        <NavBar score={score} highScore={highScore} streak={streak} />
        <div className="pt-20 px-4 py-8">
          <motion.div 
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                className="md:col-span-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div 
                      className="flex flex-col justify-center items-center h-64 gap-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-violet-500 border-t-transparent"></div>
                      <p className="text-zinc-400">جاري التحميل...</p>
                    </motion.div>
                  ) : error ? (
                    <motion.div 
                      className="bg-[#1A1A1A] border border-red-900/50 rounded-2xl p-8 backdrop-blur-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <p className="text-red-400 mb-6 text-lg">{error}</p>
                      <button 
                        onClick={fetchRandomAyah}
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border border-red-500/30"
                      >
                        حاول مرة أخرى
                      </button>
                    </motion.div>
                  ) : (
                    <Game />
                  )}
                </AnimatePresence>
              </motion.div>
              
              <motion.div 
                className="md:col-span-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Leaderboard />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </AuthProvider>
  );
};

export default App;
