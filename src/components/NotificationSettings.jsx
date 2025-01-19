import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationSettings = ({ onClose }) => {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('18:00');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Check if notifications are already enabled
    if ('Notification' in window) {
      setIsNotificationsEnabled(Notification.permission === 'granted');
    }

    // Load saved reminder time
    const savedTime = localStorage.getItem('reminderTime');
    if (savedTime) {
      setReminderTime(savedTime);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('متصفحك لا يدعم الإشعارات');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setIsNotificationsEnabled(permission === 'granted');
      
      if (permission === 'granted') {
        // Schedule notification
        scheduleNotification();
        // Show success message
        new Notification('تم تفعيل الإشعارات', {
          body: 'سنذكرك بموعد المراجعة اليومي'
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const scheduleNotification = () => {
    const [hours, minutes] = reminderTime.split(':');
    const now = new Date();
    const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    
    // If time has passed today, schedule for tomorrow
    if (scheduledTime < now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilNotification = scheduledTime.getTime() - now.getTime();

    // Save to localStorage
    localStorage.setItem('reminderTime', reminderTime);

    // Schedule notification
    setTimeout(() => {
      new Notification('وقت المراجعة! 📖', {
        body: 'حان موعد مراجعة القرآن الكريم',
        icon: '/quran-icon.png', // Add your icon path
      });
      // Schedule next day's notification
      scheduleNotification();
    }, timeUntilNotification);
  };

  const handleSave = () => {
    if (isNotificationsEnabled) {
      scheduleNotification();
    }
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-[#1A1A1A] rounded-2xl w-full max-w-md shadow-xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">إعدادات الإشعارات</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-white">تفعيل الإشعارات</span>
            <button
              onClick={requestNotificationPermission}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isNotificationsEnabled
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
              }`}
            >
              {isNotificationsEnabled ? 'مفعّل' : 'تفعيل'}
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-white">وقت التذكير اليومي</label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full bg-[#2A2A2A] text-white border border-gray-700 rounded-lg px-4 py-2"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all duration-300"
          >
            حفظ الإعدادات
          </button>
        </div>

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg"
            >
              تم حفظ الإعدادات بنجاح
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default NotificationSettings; 