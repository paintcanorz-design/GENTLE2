import React from 'react';
import { ModalWrapper } from './ModalWrapper';
import { Icon } from '../UI_Components';
import { ICONS, ACHIEVEMENTS } from '../../constants';
import { saveElementAsImage } from '../../services/utils';

export const AchievementsModal = ({ onClose, userAchieve, showDetail }: any) => {
    const allKeys = Object.keys(ACHIEVEMENTS);
    const unlocked = allKeys.filter(k => userAchieve[k]?.unlocked).sort((a, b) => userAchieve[b].date - userAchieve[a].date);
    const locked = allKeys.filter(k => !userAchieve[k]?.unlocked);

    return (
        <ModalWrapper onClose={onClose} id="achieve-modal" contentId="achieve-content-box">
            <div className="modal-header">
                <div className="modal-title"><Icon path={ICONS.trophy} style={{marginRight:'6px'}} /> 成就徽章</div>
                <div className="close-x touch-feedback" onClick={onClose}>×</div>
            </div>
            <div className="history-list" style={{ gap: '8px' }}>
                {[...unlocked, ...locked].map(key => {
                    const def = ACHIEVEMENTS[key];
                    const isUnlocked = !!userAchieve[key]?.unlocked;
                    const dateStr = isUnlocked ? new Date(userAchieve[key].date).toLocaleDateString() : '';
                    
                    return (
                        <div 
                            key={key} 
                            className={`achieve-item ${isUnlocked ? 'unlocked' : ''}`} 
                            style={{ cursor: isUnlocked ? 'pointer' : 'default' }}
                            onClick={() => isUnlocked && showDetail(key)}
                        >
                            <div className="achieve-icon">{isUnlocked ? <span dangerouslySetInnerHTML={{__html: def.icon}}></span> : '🔒'}</div>
                            <div className="achieve-content">
                                <div className="achieve-title">
                                    <span>{def.title}</span>
                                    {isUnlocked && <span className="achieve-date">{dateStr}</span>}
                                </div>
                                <div className="achieve-desc">{def.desc}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="modal-footer"><button className="close-btn-full touch-feedback" onClick={onClose}>關閉視窗</button></div>
        </ModalWrapper>
    );
};

export const AchievementDetailModal = ({ onClose, achievement, userAchieveData }: any) => {
    if (!achievement) return null;
    const dateStr = new Date(userAchieveData.date).toLocaleDateString();

    return (
        <div id="achieve-detail-modal" className="achieve-popover-fixed" style={{ display: 'block' }} onClick={onClose}>
            <div className="achieve-detail-card" onClick={e => e.stopPropagation()} style={{ top: '30%', left: '50%', transform: 'translate(-50%, -30%)' }}>
                <div id="achieve-capture-target" className="welcome-card-inner" style={{ borderRadius: '20px' }}>
                    <div className="welcome-header-group">
                        <div className="welcome-header-pill" style={{ fontSize: '0.75rem', padding: '4px 12px' }}>🏆 成就解鎖證明</div>
                        <div className="modal-date-row"><span>{dateStr}</span></div>
                    </div>
                    <div className="welcome-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className="welcome-emoji" style={{ fontSize: '3.5rem', marginBottom: '10px' }} dangerouslySetInnerHTML={{__html: achievement.icon}}></div>
                        <div className="welcome-text" style={{ fontSize: '1.1rem', textAlign: 'center' }}>{achievement.title}</div>
                        <div className="welcome-sub" style={{ fontSize: '0.8rem', opacity: 0.8, textAlign: 'center' }}>{achievement.desc}</div>
                    </div>
                </div>
                <div className="welcome-actions" style={{ borderRadius: '0 0 20px 20px' }}>
                    <button className="welcome-btn btn-dl-img touch-feedback" onClick={() => saveElementAsImage('achieve-capture-target', `achievement_${Date.now()}.png`)}><Icon path={ICONS.export} style={{marginRight:'4px'}} /> 存圖紀念</button>
                    <button className="welcome-btn btn-start touch-feedback" onClick={onClose}>❌ 關閉</button>
                </div>
            </div>
        </div>
    );
};