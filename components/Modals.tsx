import React, { useState } from 'react';
import { Icon, Switch } from './UI_Components';
import { ICONS, ACHIEVEMENTS, LEVEL_TITLES, UNLOCKS, DEFAULT_FACES, DEFAULT_DECOR } from '../constants';
import { triggerHaptic, saveElementAsImage, exportData, importData } from '../services/utils';

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

export const AchievementsModal = ({ onClose, userAchieve, showDetail }: any) => {
    const allKeys = Object.keys(ACHIEVEMENTS);
    const unlocked = allKeys.filter(k => userAchieve[k]?.unlocked).sort((a, b) => userAchieve[b].date - userAchieve[a].date);
    const locked = allKeys.filter(k => !userAchieve[k]?.unlocked);

    return (
        <ModalWrapper onClose={onClose} id="achieve-modal" contentId="achieve-content-box">
            <div className="modal-header">
                <div className="modal-title">🏆 成就徽章</div>
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
                    <button className="welcome-btn btn-dl-img touch-feedback" onClick={() => saveElementAsImage('achieve-capture-target', `achievement_${Date.now()}.png`)}>📥 存圖紀念</button>
                    <button className="welcome-btn btn-start touch-feedback" onClick={onClose}>❌ 關閉</button>
                </div>
            </div>
        </div>
    );
};

export const TutorialModal = ({ onClose }: any) => (
    <ModalWrapper onClose={onClose} id="tutorial-modal" contentId="tutorial-content-box">
        <div className="modal-header"><div className="modal-title">📖 使用教學</div><div className="close-x touch-feedback" onClick={onClose}>×</div></div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
            <div className="tutorial-content">
                <div className="tutorial-block">
                    <h3>🚀 1. 快速上手</h3>
                    <p>歡迎來到紳士 AI 讚美產生器！只需三個步驟即可生成：</p>
                    <ul>
                        <li><strong>Step 1：</strong>點擊「📂 預設辭庫」展開分類。</li>
                        <li><strong>Step 2：</strong>在下方選擇情境（細項），系統會立即生成。</li>
                        <li><strong>Step 3：</strong>點擊喜歡的語句即可<strong>自動複製</strong>。</li>
                    </ul>
                </div>
                <div className="tutorial-block">
                    <h3>⚡ 2. 進階功能</h3>
                    <ul>
                        <li><strong>🔄 換一批：</strong>不滿意當前結果？點此重新隨機生成。</li>
                        <li><strong>✨ AI 改寫：</strong>覺得語句太單調？讓 AI 幫你潤飾得更生動！</li>
                        <li><strong>🎨 表情切換：</strong>下方按鈕可切換「顏文字」、「驚嘆號」或「臉+愛心」等風格。</li>
                        <li><strong>🔊 語音朗讀：</strong>點擊語句旁的喇叭圖示，聆聽日語發音。</li>
                    </ul>
                </div>
                <div className="tutorial-block">
                    <h3>📊 3. 等級與收藏</h3>
                    <p>每次複製或收藏語句都能獲得<strong>經驗值 (XP)</strong>。</p>
                    <ul>
                        <li><strong>升級：</strong>隨著等級提升，你可以解鎖更多<strong>介面主題顏色</strong>。</li>
                        <li><strong>收藏：</strong>點擊星星「☆」可將語句加入「我的最愛」。</li>
                    </ul>
                </div>
            </div>
        </div>
        <div className="modal-footer"><button className="close-btn-full touch-feedback" onClick={onClose}>我知道了</button></div>
    </ModalWrapper>
);

export const WelcomeModal = ({ onClose, database }: any) => {
    // Generate content
    const mainKeys = Object.keys(database);
    if (mainKeys.length === 0) return null;
    
    const randomMain = mainKeys[Math.floor(Math.random() * mainKeys.length)];
    const subKeys = Object.keys(database[randomMain].subs);
    const randomSub = subKeys[Math.floor(Math.random() * subKeys.length)];
    const phrases = database[randomMain].subs[randomSub].phrases;
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    const randomEmoji = DEFAULT_FACES[Math.floor(Math.random() * DEFAULT_FACES.length)];
    const now = new Date();
    const dateStr = `${now.getFullYear()}/${(now.getMonth()+1).toString().padStart(2,'0')}/${now.getDate().toString().padStart(2,'0')}`;
    const stars = Math.floor(Math.random() * 3) + 1; // 1-3 stars simple logic for now
    const starStr = "⭐".repeat(stars);

    const [phrase] = useState(randomPhrase.jp);
    const [emoji] = useState(randomEmoji);

    const copyText = () => {
        navigator.clipboard.writeText(phrase + "！");
    };

    return (
        <div id="welcome-modal" style={{ display: 'block', position: 'fixed', zIndex: 6000, left: 0, top: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }} onClick={onClose}>
            <div className="welcome-content" style={{ top: '15%' }} onClick={e => e.stopPropagation()}>
                <div id="capture-target" className="welcome-card-inner">
                    <div className="welcome-header-group"><div className="welcome-header-pill">✨ 今日紳士運勢 ✨</div><div className="modal-date-row"><span>{dateStr}</span></div></div>
                    <div className="welcome-body">
                        <div className="welcome-emoji">{emoji}</div>
                        <div className="welcome-text">{phrase}！</div>
                        <div className="welcome-sub">今日紳士指數：{starStr}</div>
                    </div>
                </div>
                <div className="welcome-actions">
                    <button className="welcome-btn btn-dl-img touch-feedback" onClick={() => saveElementAsImage('capture-target', `gentleman_card_${Date.now()}.jpg`)}>📥 存圖</button>
                    <button className="welcome-btn btn-copy-txt touch-feedback" onClick={copyText}>📋 複製</button>
                    <button className="welcome-btn btn-start touch-feedback" onClick={onClose}>🚀 開始</button>
                </div>
            </div>
        </div>
    );
};

export const SettingsModal = ({ 
    onClose, 
    settings, 
    setSettings, 
    activeTab, 
    setActiveTab, 
    activeFaces, 
    setActiveFaces, 
    activeDecor, 
    setActiveDecor, 
    disabledFaces, 
    disabledDecor,
    toggleEmojiStatus,
    updateCustomMix,
    exportAllData, 
    importAllData, 
    clearAllData,
    clearHistory,
    clearFavorites,
    testVoice
}: any) => {
    
    return (
        <ModalWrapper onClose={onClose} id="settings-modal" contentId="settings-content-box">
            <div className="modal-header"><div className="modal-title">⚙️ 詳細設定</div><div className="close-x touch-feedback" onClick={onClose}>×</div></div>
            <div className="tab-group">
                <div className={`tab-btn touch-feedback ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}><Icon path={ICONS.settings} /> 一般</div>
                <div className={`tab-btn touch-feedback ${activeTab === 'theme' ? 'active' : ''}`} onClick={() => setActiveTab('theme')}><Icon path={ICONS.star} /> 外觀</div>
                <div className={`tab-btn touch-feedback ${activeTab === 'emoji' ? 'active' : ''}`} onClick={() => setActiveTab('emoji')}><Icon path={ICONS.emojiReroll} /> 表符</div>
                <div className={`tab-btn touch-feedback ${activeTab === 'data' ? 'active' : ''}`} onClick={() => setActiveTab('data')}><Icon path={ICONS.dict} /> 資料</div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                {activeTab === 'general' && (
                    <>
                        <div className="setting-group">
                            <div className="setting-group-header">👀 顯示與外觀</div>
                            <div className="setting-row">
                                <div className="setting-label">深色模式</div>
                                <Switch checked={localStorage.getItem('theme') === 'dark'} onChange={(c) => {
                                    localStorage.setItem('theme', c ? 'dark' : 'light');
                                    document.documentElement.classList.toggle('dark-mode', c);
                                }} />
                            </div>
                            <div className="setting-row">
                                <div className="setting-label">減少圖像符號模式</div>
                                <Switch checked={settings.pureMode} onChange={(c) => setSettings({...settings, pureMode: c})} />
                            </div>
                            <div className="setting-row">
                                <div className="setting-label">隱藏趣味性要素</div>
                                <Switch checked={settings.hideFun} onChange={(c) => setSettings({...settings, hideFun: c})} />
                            </div>
                            <div className="setting-row">
                                <div className="setting-label">字體大小</div>
                                <div className="setting-control">
                                    {[0, 1, 2].map(s => (
                                        <div key={s} className={`font-btn touch-feedback ${settings.fontSize === s ? 'active' : ''}`} onClick={() => setSettings({...settings, fontSize: s})}>
                                            {s === 0 ? '小' : s === 1 ? '中' : '大'}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="setting-row">
                                <div className="setting-label">一次生成數量</div>
                                <div className="setting-control">
                                    <input type="range" min="1" max="8" value={settings.resultCount} onChange={(e) => setSettings({...settings, resultCount: parseInt(e.target.value)})} />
                                    <span className="slider-val-display">{settings.resultCount}</span>
                                </div>
                            </div>
                            <div className="setting-row">
                                <div className="setting-label">顯示中文翻譯</div>
                                <Switch checked={settings.showCN} onChange={(c) => setSettings({...settings, showCN: c})} />
                            </div>
                        </div>
                        <div className="setting-group">
                            <div className="setting-group-header">🗣️ 語音設定 (TTS)</div>
                            <div className="setting-row">
                                <div className="setting-label">顯示發聲按鈕</div>
                                <Switch checked={settings.showSpeak} onChange={(c) => setSettings({...settings, showSpeak: c})} />
                            </div>
                            <div className="setting-row">
                                <div className="setting-label">語速 (Speed)</div>
                                <div className="setting-control"><input type="range" min="0.5" max="1.5" step="0.1" value={settings.voiceRate} onChange={(e) => setSettings({...settings, voiceRate: parseFloat(e.target.value)})} /></div>
                            </div>
                            <div className="setting-row">
                                <div className="setting-label">音調 (Pitch)</div>
                                <div className="setting-control"><input type="range" min="0.5" max="1.5" step="0.1" value={settings.voicePitch} onChange={(e) => setSettings({...settings, voicePitch: parseFloat(e.target.value)})} /></div>
                            </div>
                            <div className="setting-row" style={{ justifyContent: 'center' }}>
                                <button className="font-btn touch-feedback" onClick={testVoice}>🔊 試聽語音</button>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'theme' && (
                    <div className="setting-group">
                        <div className="setting-group-header">🏆 紳士成就與外觀</div>
                        <div className="setting-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                            <div className="setting-label">介面主題 (需等級解鎖)</div>
                            <div className="theme-grid" style={{ width: '100%' }}>
                                <button className={`theme-btn touch-feedback ${settings.userTheme==='default'?'active':''}`} onClick={()=>setSettings({...settings, userTheme: 'default'})}>🔵 預設藍</button>
                                {Object.entries(UNLOCKS).map(([lvl, name]) => {
                                    const themeKey = name.match(/[\u4e00-\u9fa5]+ ([a-zA-Z]+)/)?.[1]?.toLowerCase() || 'pink'; // Simple extraction fallback
                                    const themeCode = {
                                        "10": "pink", "20": "mono", "30": "teal", "40": "wine", "50": "silver",
                                        "60": "purple", "70": "gold", "80": "colorful", "90": "twitter", "100": "orange",
                                        "110": "fanbox", "120": "youtube", "130": "tech", "140": "plurk", "150": "melon"
                                    }[lvl] || 'pink';
                                    
                                    const unlocked = settings.userLevel >= parseInt(lvl);
                                    
                                    return (
                                        <button 
                                            key={lvl} 
                                            className={`theme-btn touch-feedback ${settings.userTheme===themeCode?'active':''} ${!unlocked ? 'disabled' : ''}`}
                                            onClick={() => unlocked && setSettings({...settings, userTheme: themeCode})}
                                        >
                                            {name.split(" ")[0]} {name.split(" ")[1].replace("主題", "")}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'emoji' && (
                    <>
                        <div className="setting-group">
                            <div className="setting-group-header">🎨 自訂數量</div>
                            <div className="setting-row">
                                <div className="setting-label">最少幾個？</div>
                                <div className="setting-control"><input type="range" min="1" max="10" value={settings.customMin} onChange={(e) => updateCustomMix('min', parseInt(e.target.value))} /><span className="slider-val-display">{settings.customMin}</span></div>
                            </div>
                            <div className="setting-row">
                                <div className="setting-label">最多幾個？</div>
                                <div className="setting-control"><input type="range" min="1" max="10" value={settings.customMax} onChange={(e) => updateCustomMix('max', parseInt(e.target.value))} /><span className="slider-val-display">{settings.customMax}</span></div>
                            </div>
                        </div>
                        
                        <div className="setting-group">
                            <div className="setting-group-header">🙂 臉部表符 (點擊以停用/啟用)</div>
                            <div className="emoji-input-group">
                                <input type="text" id="new-face-input" className="emoji-input" placeholder="貼上或輸入新表符..." />
                                <button className="emoji-add-btn touch-feedback" onClick={() => {
                                    const input = document.getElementById('new-face-input') as HTMLInputElement;
                                    const val = input.value.trim();
                                    if(val) { toggleEmojiStatus(val, false, 'face'); input.value = ''; }
                                }}>新增</button>
                            </div>
                            <div className="emoji-grid">
                                {activeFaces.map((emoji: string) => (
                                    <div key={emoji} className="emoji-chip" onClick={() => toggleEmojiStatus(emoji, true, 'face')}>{emoji}</div>
                                ))}
                                {disabledFaces.map((emoji: string) => (
                                    <div key={emoji} className="emoji-chip disabled" onClick={() => toggleEmojiStatus(emoji, false, 'face')}>{emoji}</div>
                                ))}
                            </div>
                        </div>

                        <div className="setting-group">
                            <div className="setting-group-header">✨ 裝飾符號 (點擊以停用/啟用)</div>
                            <div className="emoji-input-group">
                                <input type="text" id="new-decor-input" className="emoji-input" placeholder="貼上或輸入新符號..." />
                                <button className="emoji-add-btn touch-feedback" onClick={() => {
                                    const input = document.getElementById('new-decor-input') as HTMLInputElement;
                                    const val = input.value.trim();
                                    if(val) { toggleEmojiStatus(val, false, 'decor'); input.value = ''; }
                                }}>新增</button>
                            </div>
                            <div className="emoji-grid">
                                {activeDecor.map((emoji: string) => (
                                    <div key={emoji} className="emoji-chip" onClick={() => toggleEmojiStatus(emoji, true, 'decor')}>{emoji}</div>
                                ))}
                                {disabledDecor.map((emoji: string) => (
                                    <div key={emoji} className="emoji-chip disabled" onClick={() => toggleEmojiStatus(emoji, false, 'decor')}>{emoji}</div>
                                ))}
                            </div>
                        </div>

                        <div style={{textAlign: 'center', marginBottom: '12px'}}>
                            <button className="clear-btn touch-feedback" style={{width:'auto', padding:'8px 16px', fontSize:'0.8rem'}} onClick={() => {
                                if(confirm("確定要恢復預設的表情符號列表嗎？")) {
                                    setActiveFaces(DEFAULT_FACES);
                                    setActiveDecor(DEFAULT_DECOR);
                                    // Reset disabled lists if implemented
                                }
                            }}>🔄 恢復預設表符列表</button>
                        </div>
                    </>
                )}

                {activeTab === 'data' && (
                    <>
                        <div className="setting-group">
                            <div className="setting-group-header">💾 資料備份與還原</div>
                            <div className="backup-grid">
                                <div className="backup-btn touch-feedback" onClick={exportAllData}><span className="backup-icon">📤</span><span className="backup-label">匯出檔案</span></div>
                                <div className="backup-btn touch-feedback" onClick={() => document.getElementById('import-file')?.click()}><span className="backup-icon">📥</span><span className="backup-label">匯入檔案</span></div>
                                <input type="file" id="import-file" style={{display:'none'}} accept=".json" onChange={(e) => {
                                    if(e.target.files?.[0]) importAllData(e.target.files[0]);
                                }} />
                            </div>
                        </div>
                        <div className="setting-group">
                            <div className="setting-group-header">🗑️ 清除資料</div>
                            <div className="setting-row"><div className="setting-label">清除歷史紀錄</div><button className="clear-btn touch-feedback" style={{width:'auto', padding:'6px 12px'}} onClick={clearHistory}>執行</button></div>
                            <div className="setting-row"><div className="setting-label">清除我的最愛</div><button className="clear-btn touch-feedback" style={{width:'auto', padding:'6px 12px'}} onClick={clearFavorites}>執行</button></div>
                            <div className="setting-row" style={{justifyContent:'center', borderBottom:'none', paddingTop:'15px'}}>
                                <button className="clear-btn touch-feedback" style={{width:'100%', border:'2px solid var(--delete-color)', background:'rgba(255, 59, 48, 0.05)'}} onClick={clearAllData}>⚠️ 完全重置所有資料</button>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <div className="modal-footer"><button className="close-btn-full touch-feedback" onClick={onClose}>關閉設定</button></div>
        </ModalWrapper>
    );
};