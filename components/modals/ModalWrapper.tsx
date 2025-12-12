import React from 'react';

export const ModalWrapper = ({ children, onClose, id, contentId, customClass }: any) => (
    <div 
        id={id} 
        className={`modal ${customClass || ''}`} 
        style={{ display: 'block' }} 
        onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}
    >
        <div 
            id={contentId} 
            className="modal-content animate-[modalPopIn_0.4s_ease-out]" 
            onClick={(e) => e.stopPropagation()}
        >
            {children}
        </div>
    </div>
);