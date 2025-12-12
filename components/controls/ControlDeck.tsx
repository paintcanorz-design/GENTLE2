import React from 'react';
import { ActionBtn } from '../UI_Components';
import { ICONS } from '../../constants';

export const ControlDeck = ({ 
    displayItems, 
    currentMain, 
    currentSub, 
    generatePhrases, 
    settings, 
    setDisplayItems, 
    generateEmoji, 
    aiLoading, 
    aiMode,
    requestAI, 
    emojiLevel, 
    setEmojiLevel, 
    unlockAchievement,
    createParticles
}: any) => (
    <div className="unified-control-panel">
        <div className="action-row">
            <ActionBtn 
                label="換一批" 
                iconPath={ICONS.regen} 
                disabled={displayItems.length === 0 || aiLoading}
                onClick={(e) => {
                    if(currentMain && currentSub) generatePhrases(currentMain, currentSub, true);
                    createParticles(e.clientX, e.clientY);
                }}
                className="btn-regen"
            />
            <ActionBtn 
                label="換表符" 
                iconPath={ICONS.emojiReroll}
                disabled={displayItems.length === 0}
                onClick={(e) => {
                    setDisplayItems((prev: any) => prev.map((item: any) => ({ ...item, emoji: generateEmoji() })));
                    createParticles(e.clientX, e.clientY);
                }}
                className="btn-emoji-reroll"
            />
            <ActionBtn 
                label={aiLoading && aiMode === 'rewrite' ? "思考中" : "AI 改寫"}
                iconPath={ICONS.ai}
                disabled={displayItems.length === 0 || aiLoading}
                onClick={() => requestAI('rewrite')}
                className="btn-ai-batch"
            />
        </div>
        <div className="control-group">
            <div className={`control-option touch-feedback ${emojiLevel === 3 ? 'active' : ''}`} onClick={() => setEmojiLevel(3)}>臉+♡</div>
            <div className={`control-option touch-feedback ${emojiLevel === 'kaomoji' ? 'active' : ''}`} onClick={() => { setEmojiLevel('kaomoji'); unlockAchievement("kaomoji_fan"); }}>顏文字</div>
            <div className={`control-option touch-feedback ${emojiLevel === 0 ? 'active' : ''}`} onClick={() => setEmojiLevel(0)}>驚嘆號</div>
            <div className={`control-option touch-feedback ${emojiLevel === 2 ? 'active' : ''}`} onClick={() => setEmojiLevel(2)}>自訂</div>
        </div>
    </div>
);