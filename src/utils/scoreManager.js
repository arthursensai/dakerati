import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const updateUserScore = async (userId, newScore, totalQuestions) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const currentData = userDoc.data();
      const currentHighScore = currentData.highScore || 0;
      
      if (newScore > currentHighScore) {
        await updateDoc(userRef, {
          highScore: newScore,
          totalQuestions: totalQuestions,
          lastUpdated: new Date().toISOString()
        });
      } else {
        await updateDoc(userRef, {
          totalQuestions: totalQuestions,
          lastUpdated: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error('Error updating score:', error);
    throw error;
  }
};

export const getUserStats = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
}; 