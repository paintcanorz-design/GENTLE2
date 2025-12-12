import React from 'react';
import { ModalWrapper } from './ModalWrapper';
import { Icon, Switch } from '../UI_Components';
import { ICONS, UNLOCKS, DEFAULT_FACES, DEFAULT_DECOR } from '../../constants';

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
            <div className="modal-header">
                <div className="modal-title" style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon path={ICONS.settings} style={{ marginRight: '6px' }} /> 詳細設定
                </div>
                <div className="close-x touch-feedback" onClick={onClose}>×</div>
            </div>
            <div className="tab-group">
                <div className={`tab-btn touch-feedback ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}><Icon path={ICONS.settings} /> 一般</div>
                <div className={`tab-btn touch-feedback ${activeTab === 'theme' ? 'active' : ''}`} onClick={() => setActiveTab('theme')}><Icon path={ICONS.palette} /> 外觀</div>
                <div className={`tab-btn touch-feedback ${activeTab === 'emoji' ? 'active' : ''}`} onClick={() => setActiveTab('emoji')}><Icon path={ICONS.emojiReroll} /> 表符</div>
                <div className={`tab-btn touch-feedback ${activeTab === 'data' ? 'active' : ''}`} onClick={() => setActiveTab('data')}><Icon path={ICONS.save} /> 資料</div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                {activeTab === 'general' && (
                    <>
                        <div className="setting-group">
                            <div className="setting-group-header"><Icon path={ICONS.appearance} style={{marginRight:'6px'}} /> 顯示與外觀</div>
                            <div className="setting-row">
                                <div className="setting-label">深色模式</div>
                                <Switch checked={settings.darkMode} onChange={(c) => setSettings({...settings, darkMode: c})} />
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
                            <div className="setting-group-header"><Icon path={ICONS.voice} style={{marginRight:'6px'}} /> 語音設定 (TTS)</div>
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
                                <button className="font-btn touch-feedback" onClick={testVoice}><Icon path={ICONS.speak} style={{marginRight:'4px'}} /> 試聽語音</button>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'theme' && (
                    <div className="setting-group">
                        <div className="setting-group-header"><Icon path={ICONS.trophy} style={{marginRight:'6px'}} /> 紳士成就與外觀</div>
                        <div className="setting-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                            <div className="setting-label">介面主題 (需等級解鎖)</div>
                            <div className="theme-grid" style={{ width: '100%' }}>
                                <button className={`theme-btn touch-feedback ${settings.userTheme==='default'?'active':''}`} onClick={()=>setSettings({...settings, userTheme: 'default'})}>🔵 預設藍</button>
                                {Object.entries(UNLOCKS).map(([lvl, name]) => {
                                    const themeKey = name.match(/[\u4e00-\u9fa5]+ ([a-zA-Z]+)/)?.[1]?.toLowerCase() || 'pink';
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
                            <div className="setting-group-header"><Icon path={ICONS.palette} style={{marginRight:'6px'}} /> 自訂數量</div>
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
                            <div className="setting-group-header"><Icon path={ICONS.face} style={{marginRight:'6px'}} /> 臉部表符 (點擊以停用/啟用)</div>
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
                            <div className="setting-group-header"><Icon path={ICONS.sparkle} style={{marginRight:'6px'}} /> 裝飾符號 (點擊以停用/啟用)</div>
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
                                }
                            }}><Icon path={ICONS.refresh} style={{marginRight:'4px'}} /> 恢復預設表符列表</button>
                        </div>
                    </>
                )}

                {activeTab === 'data' && (
                    <>
                        <div className="setting-group">
                            <div className="setting-group-header"><Icon path={ICONS.save} style={{marginRight:'6px'}} /> 資料備份與還原</div>
                            <div className="backup-grid">
                                <div className="backup-btn touch-feedback" onClick={exportAllData}><span className="backup-icon"><Icon path={ICONS.export} /></span><span className="backup-label">匯出檔案</span></div>
                                <div className="backup-btn touch-feedback" onClick={() => document.getElementById('import-file')?.click()}><span className="backup-icon"><Icon path={ICONS.import} /></span><span className="backup-label">匯入檔案</span></div>
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
                                <button className="clear-btn touch-feedback" style={{width:'100%', border:'2px solid var(--delete-color)', background:'rgba(255, 59, 48, 0.05)'}} onClick={clearAllData}><Icon path={ICONS.reset} style={{marginRight:'4px'}} /> 完全重置所有資料</button>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <div className="modal-footer"><button className="close-btn-full touch-feedback" onClick={onClose}>關閉設定</button></div>
        </ModalWrapper>
    );
};