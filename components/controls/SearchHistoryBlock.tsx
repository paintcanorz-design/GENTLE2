import React from 'react';
import { Icon } from '../UI_Components';
import { ICONS } from '../../constants';

export const SearchHistoryBlock = ({ setShowHistory, setHistoryTab, setShowAchieve, searchQuery, setSearchQuery, handleSearch }: any) => (
    <div className="search-block">
        <div className="history-group">
            <div className="history-btn touch-feedback" onClick={() => { setShowHistory(true); setHistoryTab('history'); }}>
                <Icon path={ICONS.history} /> 歷史
            </div>
            <div className="history-btn touch-feedback" onClick={() => { setShowHistory(true); setHistoryTab('fav'); }}>
                <Icon path={ICONS.add} /> 收藏
            </div>
            <div className="history-btn touch-feedback" onClick={() => setShowAchieve(true)}>
                <Icon path={ICONS.trophy} /> 成就
            </div>
        </div>
        <div className="search-box" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                    type="text" 
                    className="search-input" 
                    placeholder="搜尋關鍵字" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    style={{ paddingRight: '36px', width: '100%' }}
                />
                {searchQuery && (
                    <div 
                        className="touch-feedback"
                        style={{ position: 'absolute', right: '14px', color: 'var(--text)', opacity: 0.5, cursor: 'pointer', padding: '4px' }} 
                        onClick={() => setSearchQuery('')}
                    >
                        <Icon path={ICONS.close} style={{ width: '1em', height: '1em' }} />
                    </div>
                )}
            </div>
            <button className="search-btn touch-feedback" onClick={handleSearch} style={{ marginLeft: '8px' }}>搜尋</button>
        </div>
    </div>
);