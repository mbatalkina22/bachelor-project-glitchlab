"use client";

import React from "react";
import { Icon } from "@iconify/react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
  processingText?: string;
  iconName?: string;
  iconColor?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isProcessing = false,
  processingText = "Deleting...",
  iconName = "heroicons:exclamation-triangle",
  iconColor = "text-red-500"
}) => {
  if (!isOpen) return null;

  // Animation styles
  const modalAnimation = {
    animation: 'fadeIn 0.3s ease-out',
  };

  const modalContentAnimation = {
    animation: 'scaleIn 0.3s ease-out',
  };

  // CSS keyframes for animations
  const keyframes = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `;

  return (
    <>
      <style jsx global>{keyframes}</style>
      <div 
        className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4"
        style={modalAnimation}
      >
        <div 
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          style={modalContentAnimation}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button 
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500"
            >
              <Icon icon="heroicons:x-mark" className="h-5 w-5" />
            </button>
          </div>
          <div className="mb-6">
            <div className="flex items-center text-red-600 mb-4">
              <Icon icon={iconName} className={`h-6 w-6 mr-2 ${iconColor}`} />
              <p className="font-medium">{title}</p>
            </div>
            <p className="text-gray-600 text-sm">
              {message}
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              disabled={isProcessing}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Icon icon="heroicons:arrow-path" className="h-4 w-4 mr-2 animate-spin" />
                  {processingText}
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmationModal;