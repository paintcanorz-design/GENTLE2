
import React from 'react';
import { Icon, Switch, CategoryBtn, ActionBtn } from './UI_Components';
import { ICONS } from '../constants';

export const Header = ({ onSettingsClick }: { onSettingsClick: () => void }) => (
    <div className="header-row">
        <h1><Icon path={ICONS.logo} /> 紳士ＡＩ讚美產生器</h1>
        <div className="settings-hitbox" onClick={onSettingsClick}>
            <div className="settings-visual"><Icon path={ICONS.settings} /></div>
        </div>
    </div>
);

export const DictionaryPanel = ({ 
    loading, 
    dictExpanded, 
    toggleDict, 
    currentMain, 
    setCurrentMain, 
    currentSub,
    setCurrentSub, 
    database, 
    settings, 
    savedSubs, 
    setSavedSubs, 
    addXP, 
    XP_FAV, 
    createParticles, 
    generatePhrases 
}: any) => (
    <div className="group-section">
        <div className="panel-header" onClick={toggleDict}>
            <span>
                <Icon path={ICONS.dict} className="mr-2" />
                預設辭庫
                <span className={`dict-arrow ${dictExpanded ? 'expanded' : ''}`}><Icon path={ICONS.arrow} /></span>
            </span>
            <button className={`header-small-btn touch-feedback ${currentMain === 'featured' ? 'active' : ''}`} onClick={(e) => {
                e.stopPropagation();
                setCurrentMain('featured');
                setCurrentSub(null);
                toggleDict(true);
            }}>
                <Icon path={ICONS.star} /> 精選
            </button>
        </div>
        
        <div className={`panel-content ${dictExpanded ? '' : 'hidden'}`}>
            {loading ? <div className="loading">正在讀取資料庫...</div> : (
                <>
                    <div className="grid-container">
                        {Object.keys(database).map(key => (
                            <CategoryBtn 
                                key={key} 
                                active={currentMain === key} 
                                label={database[key].label} 
                                onClick={(e) => { 
                                    setCurrentMain(key); 
                                    setCurrentSub(null); 
                                    createParticles(e.clientX, e.clientY);
                                }} 
                            />
                        ))}
                    </div>
                    <hr className="section-divider" />
                    <div className="panel-header sub-header" style={{ cursor: 'default' }}>
                        <span><Icon path={ICONS.subCat} className="mr-2" /> 細部分類</span>
                        <button 
                            className={`header-small-btn touch-feedback ${(!currentMain || !currentSub) ? 'disabled' : ''} ${savedSubs.find((s:any) => s.main === currentMain && s.sub === currentSub) ? 'active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if(!currentMain || !currentSub) return;
                                const exists = savedSubs.findIndex((s:any) => s.main === currentMain && s.sub === currentSub);
                                if(exists > -1) {
                                    const n = [...savedSubs]; n.splice(exists, 1); setSavedSubs(n);
                                } else {
                                    setSavedSubs([...savedSubs, { main: currentMain, sub: currentSub, label: database[currentMain].subs[currentSub].label }]);
                                    addXP(XP_FAV);
                                }
                            }}
                        >
                            <Icon path={savedSubs.find((s:any) => s.main === currentMain && s.sub === currentSub) ? ICONS.remove : ICONS.add} /> 
                            {savedSubs.find((s:any) => s.main === currentMain && s.sub === currentSub) ? '移除' : '加入'}
                        </button>
                    </div>
                    <div className="grid-container">
                        {currentMain && currentMain !== 'featured' && database[currentMain] && Object.keys(database[currentMain].subs).map(subKey => (
                            <CategoryBtn 
                                key={subKey} 
                                active={currentSub === subKey} 
                                label={database[currentMain].subs[subKey].label} 
                                onClick={(e) => { 
                                    createParticles(e.clientX, e.clientY);
                                    setCurrentSub(subKey); 
                                    generatePhrases(currentMain, subKey); 
                                }} 
                            />
                        ))}
                        {currentMain === 'featured' && savedSubs.map((s:any) => (
                            <CategoryBtn 
                                key={s.sub}
                                active={currentSub === s.sub}
                                label={s.label}
                                onClick={(e) => {
                                    createParticles(e.clientX, e.clientY);
                                    setCurrentSub(s.sub);
                                    generatePhrases(s.main, s.sub);
                                }}
                            />
                        ))}
                        {currentMain && !currentSub && <div className="sub-placeholder w-full col-span-3">請選擇上方分類...</div>}
                    </div>
                </>
            )}
        </div>
    </div>
);

export const AiInputPanel = ({ aiInputValue, setAiInputValue, aiLoading, aiMode, requestAI }: any) => (
    <div className="ai-input-container">
        <div className="custom-ai-block">
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                    type="text" 
                    id="custom-gen-input" 
                    className="custom-ai-input" 
                    placeholder="✨ 輸入關鍵字句 或 貼上粉絲留言..." 
                    value={aiInputValue} 
                    onChange={(e) => setAiInputValue(e.target.value)}
                    style={{ paddingRight: '36px' }}
                />
                {aiInputValue && (
                    <div 
                        className="touch-feedback"
                        style={{ position: 'absolute', right: '10px', color: 'var(--sub-text)', cursor: 'pointer', padding: '4px' }} 
                        onClick={() => setAiInputValue('')}
                    >
                        <Icon path={ICONS.close} style={{ width: '1em', height: '1em' }} />
                    </div>
                )}
            </div>
            <div className="custom-btn-group flex gap-2 w-full sm:w-auto">
                <button 
                    className={`btn-custom-ai touch-feedback ${aiLoading ? 'disabled' : ''}`} 
                    onClick={() => requestAI('custom')}
                >
                    {aiLoading && aiMode === 'custom' ? '詠唱中...' : 'AI 生成'}
                </button>
                <button 
                    className={`btn-custom-ai touch-feedback ${aiLoading ? 'disabled' : ''}`} 
                    onClick={() => requestAI('reply')}
                >
                    {aiLoading && aiMode === 'reply' ? '思考中...' : 'AI 回覆'}
                </button>
            </div>
        </div>
    </div>
);

export const StatusTips = ({ aiLoading, statusText }: any) => (
    <div className="status-tips-container">
        <div className={`status-indicator ${aiLoading ? 'pulsing' : ''}`}>
            {aiLoading ? statusText : <span dangerouslySetInnerHTML={{ __html: statusText.startsWith('📍') || statusText.startsWith('🔍') ? statusText : `<span class="status-dot"></span> ${statusText}` }} />}
        </div>
        <div className="tips-text-right">💡 點選語句可複製，按鈕可刷新</div>
    </div>
);

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
                        style={{ position: 'absolute', right: '10px', color: 'var(--text)', opacity: 0.5, cursor: 'pointer', padding: '4px' }} 
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

export const Footer = () => (
    <div className="footer-control-area">
        <div className="footer-btn-grid">
            <a href="https://x.com/orz_can" target="_blank" className="footer-action-btn touch-feedback"><Icon path={ICONS.twitter} /> Twitter</a>
            <a href="https://www.paintcanfarm.com/" target="_blank" className="footer-action-btn touch-feedback"><Icon path={ICONS.home} /> Home</a>
            <a href="https://www.paypal.com/paypalme/paintcanfarm" target="_blank" className="footer-action-btn touch-feedback"><Icon path={ICONS.paypal} /> PayPal</a>
            <a href="https://orzcan.fanbox.cc/" target="_blank" className="footer-action-btn touch-feedback"><Icon path={ICONS.fanbox} /> Fanbox</a>
        </div>
        <div className="footer-desc">AI 運算與伺服器維護皆需要持續的資金成本。如果您喜歡這項服務，懇請考慮小額贊助。<br/>Copyright ©2017-2026. 缶子牧場 All Rights Reserved.</div>
    </div>
);
