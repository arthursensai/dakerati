import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';

const Leaderboard = () => {
  const [topScores, setTopScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopScores = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          orderBy('highScore', 'desc'),
          limit(10)
        );
        
        const querySnapshot = await getDocs(q);
        const scores = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setTopScores(scores);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopScores();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#111111]/90 rounded-2xl border border-[#2A2A2A] p-6 backdrop-blur-sm"
    >
      <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
        لوحة المتصدرين
      </h2>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {topScores.map((score, index) => (
            <motion.div
              key={score.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]"
            >
              <div className="flex items-center gap-3">
                <span className={`text-lg font-bold ${index < 3 ? 'text-yellow-400' : 'text-zinc-400'}`}>
                  #{index + 1}
                </span>
                <span className="text-white">{score.username}</span>
              </div>
              <div className="text-violet-400 font-bold">
                {score.highScore} نقطة
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Leaderboard;
