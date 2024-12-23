import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { kv } from '@vercel/kv';

interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children?: React.ReactNode;
    position?: 'center' | 'top' | 'bottom'; // Optional prop
    handleApprove: () => void;
}

export const Popup = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  position = 'center',  // 'center', 'top', 'bottom'
  handleApprove,
}: PopupProps ) => {
  if (!isOpen) return null;

  useEffect(()=>{
    console.log("Children: ", children)
  }, [])

  // Position styles
  const positionStyles = {
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    top: 'top-4 left-1/2 -translate-x-1/2',
    bottom: 'bottom-4 left-1/2 -translate-x-1/2'
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Popup */}
      <div 
        className={`
          fixed ${positionStyles[position]} z-50 
          min-w-[300px] max-w-[90%] max-h-[90vh]
          bg-white rounded-lg shadow-xl 
          flex flex-col overflow-hidden
        `}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto">
            Heeeey
          {children}
        </div>
        <div>
            <button onClick={handleApprove}>Approve</button>
        </div>
      </div>
    </>
  );
};