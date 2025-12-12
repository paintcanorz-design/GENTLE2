import React from 'react';
import { ModalWrapper } from './ModalWrapper';

export const HistoryModal = ({ onClose, history, favorites, activeTab, setActiveTab, setFavorites, copyToClipboard, addXP, XP_FAV }: any) => {
    return (
        <ModalWrapper onClose={onClose} id="history-modal" contentId="modal-content-box">
            <div className="modal-header">
                <div className="modal-title">紀錄與收藏</div>
                <div className="close-x touch-feedback" onClick={onClose}>×</div>
            </div>
            <div className="tab-group">
                <div className={`tab-btn touch-feedback ${activeTab === 'history' ? 'active' : ''}`} style={{ width: '48%' }} onClick={() => setActiveTab('history')}>📜 歷史紀錄</div>
                <div className={`tab-btn touch-feedback ${activeTab === 'fav' ? 'active' : ''}`} style={{ width: '48%' }} onClick={() => setActiveTab('fav')}>⭐ 我的最愛</div>
            </div>
            <div className="history-list">
                {activeTab === 'history' && history.length === 0 && <div className="history-empty">尚未有複製紀錄</div>}
                {activeTab === 'fav' && favorites.length === 0 && <div className="history-empty">尚未有收藏</div>}
                
                {(activeTab === 'history' ? history : favorites).map((text: string, idx: number) => (
                    <div key={idx} className="history-item" onClick={(e) => {
                        e.currentTarget.classList.add('clicked');
                        setTimeout(() => e.currentTarget.classList.remove('clicked'), 150);
                        copyToClipboard(text);
                    }}>
                        <span className="history-text">{text}</span>
                        {activeTab === 'fav' && (
                            <span className="delete-btn" onClick={(e) => {
                                e.stopPropagation();
                                const newFavs = favorites.filter((f: string) => f !== text);
                                setFavorites(newFavs);
                            }}>🗑️</span>
                        )}
                    </div>
                ))}
            </div>
            <div className="modal-footer">
                {activeTab === 'fav' && favorites.length > 0 && (
                    <button className="clear-btn touch-feedback" onClick={() => {
                        if(confirm("確定要清空所有收藏嗎？")) setFavorites([]);
                    }}>🗑️ 清空所有收藏</button>
                )}
                <button className="close-btn-full touch-feedback" onClick={onClose}>關閉視窗</button>
            </div>
        </ModalWrapper>
    );
};