import { db } from '../firebase';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  collection, 
  addDoc,
  serverTimestamp,
  deleteDoc,
  query,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const storage = getStorage();

export const DatabaseService = {
  // User operations
  async createUser(userId, userData) {
    try {
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        stats: {
          correctAnswers: 0,
          wrongAnswers: 0,
          streakRecord: 0
        },
        achievements: {
          streaks: {
            streak5: false,
            streak10: false,
            streak20: false
          },
          scores: {
            score100: false,
            score500: false,
            score1000: false
          }
        }
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async updateUserScore(userId, newScore, isCorrect) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      // Update stats
      const stats = {
        correctAnswers: userData.stats.correctAnswers + (isCorrect ? 1 : 0),
        wrongAnswers: userData.stats.wrongAnswers + (isCorrect ? 0 : 1),
        streakRecord: Math.max(userData.stats.streakRecord, userData.currentStreak || 0)
      };

      // Check for achievements
      const achievements = { ...userData.achievements };
      if (newScore >= 1000 && !achievements.scores.score1000) {
        achievements.scores.score1000 = true;
      } else if (newScore >= 500 && !achievements.scores.score500) {
        achievements.scores.score500 = true;
      } else if (newScore >= 100 && !achievements.scores.score100) {
        achievements.scores.score100 = true;
      }

      await updateDoc(userRef, {
        highScore: Math.max(userData.highScore || 0, newScore),
        lastUpdated: serverTimestamp(),
        stats,
        achievements,
        [`stats.${isCorrect ? 'correctAnswers' : 'wrongAnswers'}`]: userData.stats[isCorrect ? 'correctAnswers' : 'wrongAnswers'] + 1
      });
    } catch (error) {
      console.error('Error updating user score:', error);
      throw error;
    }
  },

  // Score operations
  async addScore(userId, username, score, surah) {
    try {
      await addDoc(collection(db, 'scores'), {
        userId,
        username,
        score,
        surah,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding score:', error);
      throw error;
    }
  },

  // Achievement checks
  async checkAndUpdateAchievements(userId, streak) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const achievements = userDoc.data().achievements;

      if (streak >= 20 && !achievements.streaks.streak20) {
        await updateDoc(userRef, {
          'achievements.streaks.streak20': true
        });
      } else if (streak >= 10 && !achievements.streaks.streak10) {
        await updateDoc(userRef, {
          'achievements.streaks.streak10': true
        });
      } else if (streak >= 5 && !achievements.streaks.streak5) {
        await updateDoc(userRef, {
          'achievements.streaks.streak5': true
        });
      }
    } catch (error) {
      console.error('Error updating achievements:', error);
      throw error;
    }
  },

  async updateUserProfile(userId, data) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...data,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  async deleteUserData(userId) {
    try {
      // Delete user document
      await deleteDoc(doc(db, 'users', userId));
      
      // Delete user scores
      const scoresQuery = query(
        collection(db, 'scores'),
        where('userId', '==', userId)
      );
      const scoresDocs = await getDocs(scoresQuery);
      const batch = writeBatch(db);
      
      scoresDocs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  },

  async updateUserAvatar(userId, file) {
    try {
      // Create a reference to the storage location
      const storageRef = ref(storage, `avatars/${userId}`);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update user profile with new avatar URL
      await this.updateUserProfile(userId, {
        photoURL: downloadURL
      });
      
      return downloadURL;
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  },

  async deleteUserAvatar(userId) {
    try {
      const storageRef = ref(storage, `avatars/${userId}`);
      await deleteObject(storageRef);
      
      await this.updateUserProfile(userId, {
        photoURL: null
      });
    } catch (error) {
      console.error('Error deleting avatar:', error);
      throw error;
    }
  }
}; 