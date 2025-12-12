import React, { useState, useEffect } from 'react';
import { Icon } from '../UI_Components';
import { ICONS, DEFAULT_FACES } from '../../constants';
import { saveElementAsImage } from '../../services/utils';

export const WelcomeModal = ({ onClose, database, unlockAchievement }: any) => {
    const [phrase, setPhrase] = useState("");
    const [emoji, setEmoji] = useState("");
    const [starStr, setStarStr] = useState("");
    const [frameClass, setFrameClass] = useState("");
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const mainKeys = Object.keys(database);
        if (mainKeys.length === 0) return;
        
        const randomMain = mainKeys[Math.floor(Math.random() * mainKeys.length)];
        const subKeys = Object.keys(database[randomMain].subs);
        const randomSub = subKeys[Math.floor(Math.random() * subKeys.length)];
        const phrases = database[randomMain].subs[randomSub].phrases;
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        const randomEmoji = DEFAULT_FACES[Math.floor(Math.random() * DEFAULT_FACES.length)];
        
        // Star logic - 20% for 5 stars (Gold), 20% for 4 stars (Silver), else 1-3 stars
        const rand = Math.random();
        let stars = 3;
        let frame = "";
        
        if (rand < 0.2) {
            stars = 5;
            frame = "gold-frame";
            if (unlockAchievement) setTimeout(() => unlockAchievement("five_star_general"), 500);
        } else if (rand < 0.4) {
            stars = 4;
            frame = "silver-frame";
        } else {
            stars = Math.floor(Math.random() * 3) + 1;
        }

        setPhrase(randomPhrase.jp);
        setEmoji(randomEmoji);
        setStarStr("⭐".repeat(stars));
        setFrameClass(frame);
        setLoaded(true);
    }, [database]); 

    if (!loaded) return null;

    const now = new Date();
    const dateStr = `${now.getFullYear()}/${(now.getMonth()+1).toString().padStart(2,'0')}/${now.getDate().toString().padStart(2,'0')}`;

    const copyText = () => {
        navigator.clipboard.writeText(phrase + "！");
    };

    return (
        <div id="welcome-modal" style={{ display: 'block', position: 'fixed', zIndex: 6000, left: 0, top: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }} onClick={onClose}>
            <div className="welcome-content" style={{ top: '15%' }} onClick={e => e.stopPropagation()}>
                <div id="capture-target" className={`welcome-card-inner ${frameClass}`}>
                    <div className="welcome-header-group"><div className="welcome-header-pill">✨ 今日紳士運勢 ✨</div><div className="modal-date-row"><span>{dateStr}</span></div></div>
                    <div className="welcome-body">
                        <div className="welcome-emoji">{emoji}</div>
                        <div className="welcome-text">{phrase}！</div>
                        <div className="welcome-sub">今日紳士指數：{starStr}</div>
                    </div>
                </div>
                <div className="welcome-actions">
                    <button className="welcome-btn btn-dl-img touch-feedback" onClick={() => {
                        saveElementAsImage('capture-target', `gentleman_card_${Date.now()}.jpg`);
                        if(unlockAchievement) unlockAchievement("download_card");
                    }}><Icon path={ICONS.export} style={{marginRight:'4px'}} /> 存圖</button>
                    <button className="welcome-btn btn-copy-txt touch-feedback" onClick={copyText}><Icon path={ICONS.save} style={{marginRight:'4px'}} /> 複製</button>
                    <button className="welcome-btn btn-start touch-feedback" onClick={onClose}>🚀 開始</button>
                </div>
            </div>
        </div>
    );
};