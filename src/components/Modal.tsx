import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  preventClose?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer, 
  preventClose = false,
  size = 'md'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (preventClose) {
        // Trigger shake animation
        setShouldShake(true);
        setTimeout(() => setShouldShake(false), 500);
      } else {
        onClose();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (preventClose) {
        // Trigger shake animation
        setShouldShake(true);
        setTimeout(() => setShouldShake(false), 500);
      } else {
        onClose();
      }
    }
  };

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl'
  };

  return (
    <div 
      className={`fixed inset-0 z-50 overflow-y-auto transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className={`fixed inset-0 bg-black transition-all duration-300 ${
            isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
          }`}
          onClick={handleBackdropClick}
        />
        
        <div 
          className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full transition-all duration-300 transform ${
            sizeClasses[size]
          } ${
            isVisible 
              ? 'scale-100 translate-y-0 opacity-100' 
              : 'scale-95 translate-y-4 opacity-0'
          } ${
            shouldShake 
              ? 'animate-shake' 
              : ''
          }`}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 hover:scale-110"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          <div className="p-6">
            {children}
          </div>
          
          {footer && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;