import React from 'react';

export const XPBar = ({ settings, setShowXP, LEVEL_TITLES }: any) => (
    <div className="xp-container" onClick={() => setShowXP(true)}>
        <div className="xp-info">
            <div className="xp-title">
                <span className="xp-badge">LV.{settings.userLevel}</span>
                <span>{LEVEL_TITLES[settings.userLevel] || "變態紳士王"}</span>
            </div>
            <span>{settings.userXP} XP</span>
        </div>
        <div className="xp-bar-bg">
            <div className="xp-bar-fill" style={{ width: `${Math.min(100, (settings.userXP % (settings.userLevel >= 200 ? 50 : settings.userLevel >= 100 ? 20 : 5)) / (settings.userLevel >= 200 ? 50 : settings.userLevel >= 100 ? 20 : 5) * 100)}%` }}></div>
        </div>
    </div>
);