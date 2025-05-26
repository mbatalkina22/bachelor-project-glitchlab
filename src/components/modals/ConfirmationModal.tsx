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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur effect */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        onClick={onCancel}
      ></div>

      {/* Modal content */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full m-4 z-10 border border-gray-200">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Icon icon={iconName} className={`w-8 h-8 ${iconColor} mr-3`} />
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
          
          <p className="mb-6 text-gray-700">{message}</p>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              disabled={isProcessing}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Icon icon="heroicons:arrow-path" className="w-5 h-5 mr-2 animate-spin" />
                  {processingText}
                </>
              ) : (
                <>
                  <Icon icon="heroicons:trash" className="w-5 h-5 mr-2" />
                  {confirmText}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;