import React from 'react';

export const XPPopover = ({ onClose, userLevel, userXP, LEVEL_TITLES, UNLOCKS }: any) => {
    return (
        <div className="xp-popover" style={{ display: 'block' }}>
            <div className="xp-popover-header">
                <span>📊 紳士等級與獎勵</span>
                <span className="xp-popover-close" onClick={onClose}>×</span>
            </div>
            <div className="xp-popover-content">
                <div className="xp-list-title" style={{ marginTop: 0 }}>經驗獲取</div>
                <div className="xp-rule-row"><span>複製句子</span><span className="xp-rule-val">+1 XP</span></div>
                <div className="xp-rule-row"><span>收藏 / 精選</span><span className="xp-rule-val">+3 XP</span></div>
                
                <div className="xp-list-title">解鎖獎勵</div>
                {Object.keys(UNLOCKS).map(Number).sort((a,b)=>a-b).map(lvl => (
                    <div key={lvl} className={`xp-list-item ${userLevel >= lvl ? 'unlocked' : 'locked'}`}>
                        <span>LV.{lvl}</span><span>{UNLOCKS[lvl]}</span>
                    </div>
                ))}

                <div className="xp-list-title">稱號一覽</div>
                {Object.keys(LEVEL_TITLES).map(Number).sort((a,b)=>a-b).map(lvl => (
                    <div key={lvl} className={`xp-list-item ${userLevel >= lvl ? 'unlocked' : 'locked'}`}>
                        <span>LV.{lvl}</span><span>{LEVEL_TITLES[lvl]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};