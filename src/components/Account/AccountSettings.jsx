import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  updateProfile, 
  updateEmail, 
  updatePassword, 
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider 
} from '@firebase/auth';
import { DatabaseService } from '../../services/database';

const AccountSettings = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    newPassword: '',
    confirmPassword: '',
    currentPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        formData.currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update profile
      if (formData.username !== user.username) {
        await updateProfile(user, {
          displayName: formData.username
        });
        await DatabaseService.updateUserProfile(user.uid, {
          username: formData.username
        });
      }

      // Update email
      if (formData.email !== user.email) {
        await updateEmail(user, formData.email);
      }

      // Update password
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('كلمات المرور غير متطابقة');
        }
        await updatePassword(user, formData.newPassword);
      }

      setSuccess('تم تحديث الحساب بنجاح');
      setFormData({ ...formData, newPassword: '', confirmPassword: '', currentPassword: '' });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      setError('');

      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Delete user data from database
      await DatabaseService.deleteUserData(user.uid);

      // Delete user account
      await deleteUser(user);
      
      // Logout
      await logout();
    } catch (error) {
      setError(error.message);
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
        إعدادات الحساب
      </h2>

      {error && (
        <div className="bg-red-900/20 text-red-400 p-4 rounded-xl mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/20 text-green-400 p-4 rounded-xl mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">اسم المستخدم</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">البريد الإلكتروني</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">كلمة المرور الجديدة</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">تأكيد كلمة المرور الجديدة</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">كلمة المرور الحالية</label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 text-white"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-3 rounded-xl"
        >
          {loading ? 'جاري التحديث...' : 'تحديث الحساب'}
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-[#2A2A2A]">
        <h3 className="text-xl font-bold mb-4 text-red-400">حذف الحساب</h3>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full bg-red-600/20 text-red-400 p-3 rounded-xl border border-red-500/30"
          >
            حذف الحساب نهائياً
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-zinc-400">
              هذا الإجراء نهائي ولا يمكن التراجع عنه. سيتم حذف جميع بياناتك ونتائجك.
            </p>
            <input
              type="password"
              placeholder="أدخل كلمة المرور الحالية للتأكيد"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 text-white"
            />
            <div className="flex gap-4">
              <button
                onClick={handleDeleteAccount}
                disabled={loading || !currentPassword}
                className="flex-1 bg-red-600 text-white p-3 rounded-xl"
              >
                تأكيد الحذف
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setCurrentPassword('');
                }}
                className="flex-1 bg-[#2A2A2A] text-white p-3 rounded-xl"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AccountSettings; 