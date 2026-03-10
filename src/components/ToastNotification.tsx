import { useEffect, useState } from 'react';
import { X, Newspaper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ToastNotificationProps {
  message: string;
  link?: string;
  onClose: () => void;
}

export default function ToastNotification({ message, link, onClose }: ToastNotificationProps) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);

    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleClick = () => {
    if (link) {
      navigate(link);
      handleClose();
    }
  };

  return (
    <div
      className={`fixed top-20 right-6 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      <div
        onClick={handleClick}
        className={`bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 border-2 border-blue-400 rounded-xl shadow-2xl p-5 min-w-[320px] ${
          link ? 'cursor-pointer hover:shadow-blue-500/50 hover:border-blue-300' : ''
        } transition-all`}
      >
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-white/20 rounded-lg flex-shrink-0 ring-2 ring-white/30">
            <Newspaper className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-base">{message}</p>
            {link && (
              <p className="text-blue-50 text-sm mt-1.5 font-medium">Click to view</p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="text-white/80 hover:text-white transition-colors flex-shrink-0 p-1 hover:bg-white/10 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
