import React from 'react';

export const Icon: React.FC<{ path: string, className?: string, style?: React.CSSProperties }> = ({ path, className, style }) => (
    <svg className={`icon-svg ui-icon ${className || ''}`} viewBox="0 0 24 24" style={style}>
        <path d={path} />
    </svg>
);

export const Switch: React.FC<{ checked: boolean, onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
    <label className="switch">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="slider"></span>
    </label>
);

export const CategoryBtn: React.FC<{ active: boolean, label: string, onClick: (e: React.MouseEvent) => void }> = ({ active, label, onClick }) => (
    <div 
        className={`category-btn touch-feedback ${active ? 'active' : ''}`} 
        onClick={onClick}
    >
        {label}
    </div>
);

export const ActionBtn: React.FC<{ 
    label: React.ReactNode, 
    iconPath: string, 
    disabled?: boolean, 
    onClick: (e: React.MouseEvent) => void,
    className?: string
}> = ({ label, iconPath, disabled, onClick, className }) => (
    <div 
        className={`action-btn touch-feedback ${className} ${disabled ? 'disabled' : ''}`} 
        onClick={disabled ? undefined : onClick}
    >
        <Icon path={iconPath} />
        {label}
    </div>
);