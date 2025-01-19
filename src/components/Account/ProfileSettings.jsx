import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { DatabaseService } from '../../services/database';
import { ImageService } from '../../services/imageService';

const ProfileSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [username, setUsername] = useState(user?.username || '');
  const [previewURL, setPreviewURL] = useState(user?.photoURL || null);
  const fileInputRef = useRef(null);

  const handleUsernameChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await DatabaseService.updateUserProfile(user.uid, {
        username: username
      });
      setSuccess('تم تحديث اسم المستخدم بنجاح');
    } catch (error) {
      setError('حدث خطأ أثناء تحديث اسم المستخدم');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewURL(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      await ImageService.updateUserAvatar(user.uid, file);
      setSuccess('تم تحديث الصورة الشخصية بنجاح');
    } catch (error) {
      setError(error.message);
      setPreviewURL(user?.photoURL || null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user.photoURL) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await DatabaseService.deleteUserAvatar(user.uid);
      setPreviewURL(null);
      setSuccess('تم حذف الصورة الشخصية بنجاح');
    } catch (error) {
      setError('حدث خطأ أثناء حذف الصورة الشخصية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#111111]/90 rounded-2xl border border-[#2A2A2A] p-6 backdrop-blur-sm"
    >
      <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
        الملف الشخصي
      </h2>

      {error && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-900/20 text-red-400 p-4 rounded-xl mb-4"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-green-900/20 text-green-400 p-4 rounded-xl mb-4"
        >
          {success}
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <motion.div 
            className="relative group"
            whileHover={{ scale: 1.05 }}
          >
            <div 
              onClick={handleAvatarClick}
              className="w-32 h-32 rounded-full overflow-hidden cursor-pointer border-4 border-violet-500/30 hover:border-violet-500/50 transition-colors duration-300"
            >
              {previewURL ? (
                <img 
                  src={previewURL} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 flex items-center justify-center">
                  <span className="text-4xl text-violet-400">
                    {username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <AnimatePresence>
              {previewURL && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleRemoveAvatar}
                  className="absolute -bottom-2 right-0 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/gif"
            className="hidden"
          />
          <button
            onClick={handleAvatarClick}
            className="text-violet-400 hover:text-violet-300 text-sm"
          >
            تغيير الصورة الشخصية
          </button>
        </div>

        {/* Username Section */}
        <form onSubmit={handleUsernameChange} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 text-white"
              placeholder="أدخل اسم المستخدم"
              minLength={3}
              maxLength={30}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || username === user?.username}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-3 rounded-xl disabled:opacity-50"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default ProfileSettings; 