import React from 'react';
import { Icon } from '../UI_Components';
import { ICONS } from '../../constants';

export const ResultList = ({ displayItems, handleCopy, speakText, toggleFavorite, favorites, settings }: any) => (
    <div className="result-area">
        {displayItems.length === 0 ? (
            <div className="empty-state">
                <Icon path={ICONS.logo} className="empty-icon-svg" />
                <div>等待紳士指令...</div>
            </div>
        ) : (
            displayItems.map((item: any, idx: number) => (
                <div key={idx} className={`result-item animate-in ${item.isUpgraded ? 'ai-upgraded' : ''}`} style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div className={`result-left ${item.isUpgraded ? 'text-upgraded' : ''}`} onClick={(e) => handleCopy(item.base.jp + item.emoji, e)}>
                        {item.base.jp + item.emoji}
                    </div>
                    <div className="result-actions">
                        <div className="action-icon icon-speak" onClick={(e) => speakText(item.base.jp, e)}>
                            <Icon path={ICONS.speak} />
                        </div>
                        <div className={`action-icon icon-star ${favorites.includes(item.base.jp + item.emoji) ? 'active' : ''}`} onClick={(e) => toggleFavorite(item.base.jp + item.emoji, e)}>
                            <Icon path={favorites.includes(item.base.jp + item.emoji) ? ICONS.star : ICONS.starOutline} />
                        </div>
                    </div>
                    {!settings.showCN ? null : (
                        <div className={`result-right ${item.isUpgraded ? 'text-upgraded' : ''}`}>{item.base.cn}</div>
                    )}
                </div>
            ))
        )}
    </div>
);