import React from 'react';
import { Icon, CategoryBtn } from '../UI_Components';
import { ICONS } from '../../constants';

export const DictionaryPanel = ({ 
    loading, 
    dictExpanded, 
    toggleDict, 
    currentMain, 
    setCurrentMain, 
    setCurrentSub,
    currentSub, 
    database, 
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
                <Icon path={ICONS.dict} style={{marginRight: '6px'}} />
                預設辭庫
                <span className={`dict-arrow ${dictExpanded ? 'expanded' : ''}`}><Icon path={ICONS.arrow} /></span>
            </span>
            <button className={`header-small-btn touch-feedback ${currentMain === 'featured' ? 'active' : ''}`} onClick={(e) => {
                e.stopPropagation();
                setCurrentMain('featured');
                setCurrentSub(null);
                toggleDict(true);
            }}>
                <Icon path={ICONS.star} style={{width:'1em', height:'1em'}} /> 精選
            </button>
        </div>
        
        <div className={dictExpanded ? '' : 'hidden'}>
            <div className="panel-content">
                {loading ? <div className="loading">正在讀取資料庫...</div> : (
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
                )}
            </div>
            
            {!loading && (
                <>
                    <hr className="section-divider" style={{ marginTop: '8px' }} />
                    <div className="panel-header sub-header" style={{ cursor: 'default' }}>
                        <span><Icon path={ICONS.subCat} style={{marginRight: '6px'}} /> 細部分類</span>
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
                            <Icon path={savedSubs.find((s:any) => s.main === currentMain && s.sub === currentSub) ? ICONS.remove : ICONS.add} style={{width:'1em', height:'1em'}} /> 
                            {savedSubs.find((s:any) => s.main === currentMain && s.sub === currentSub) ? '移除' : '加入'}
                        </button>
                    </div>
                    <div className="panel-content">
                        <div className="grid-container">
                            {!currentMain && <div className="sub-placeholder" style={{gridColumn: '1 / -1', width: '100%'}}>請選擇上方分類...</div>}
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
                            {currentMain === 'featured' && savedSubs.length === 0 && <div className="sub-placeholder" style={{gridColumn: '1 / -1', width: '100%'}}>尚未有收藏的細項，請去其他分類點擊「加入」</div>}
                        </div>
                    </div>
                </>
            )}
        </div>
    </div>
);