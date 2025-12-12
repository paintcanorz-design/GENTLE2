import { useState, useEffect, useRef } from 'react';
import { DisplayItem, Phrase } from '../types';
import { DEFAULT_FACES, DEFAULT_DECOR, PUNCTUATIONS, XP_COPY, XP_FAV } from '../constants';
import { triggerHaptic, createParticles, getWeightedRandom, exportData, importData } from '../services/utils';

// Import split hooks
import { useCoreData } from './useCoreData';
import { useUserData } from './useUserData';
import { useGameLogic } from './useGameLogic';

export const useAppLogic = () => {
    // 1. Core Data (Database, Settings)
    const { database, kaomojiList, loading, settings, setSettings } = useCoreData();

    // 2. User Data (History, Favs, Custom Faces)
    const { 
        history, setHistory, favorites, setFavorites, savedSubs, setSavedSubs,
        activeFaces, setActiveFaces, disabledFaces, setDisabledFaces,
        activeDecor, setActiveDecor, disabledDecor, setDisabledDecor
    } = useUserData();

    // 3. Game Logic (XP, Achievements)
    const { userAchieve, setUserAchieve, unlockAchievement, addXP } = useGameLogic(settings, setSettings);

    // 4. Local UI State
    const [currentMain, setCurrentMain] = useState<string | null>(null);
    const [currentSub, setCurrentSub] = useState<string | null>(null);
    const [displayItems, setDisplayItems] = useState<DisplayItem[]>([]);
    const [dictExpanded, setDictExpanded] = useState(true);
    
    const [searchQuery, setSearchQuery] = useState(""); 
    const [aiInputValue, setAiInputValue] = useState(""); 

    const [emojiLevel, setEmojiLevel] = useState<number | string>(3);
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const [statusText, setStatusText] = useState("請選擇預設辭庫或AI生成");
    const [aiLoading, setAiLoading] = useState(false);
    const [aiMode, setAiMode] = useState<'custom' | 'reply' | 'rewrite' | null>(null);
    const [customBg, setCustomBg] = useState<string | null>(null); 
    
    const [showSettings, setShowSettings] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showAchieve, setShowAchieve] = useState(false);
    const [showXP, setShowXP] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);
    const [settingsTab, setSettingsTab] = useState<'general' | 'theme' | 'emoji' | 'data'>('general');
    const [historyTab, setHistoryTab] = useState<'history' | 'fav'>('history');

    // Refs for logic
    const seenIndices = useRef<Set<number>>(new Set());
    const aiStartTime = useRef<number>(0);
    const aiCount = useRef<number>(0);
    const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    
    const lastCopyTime = useRef<number>(0);
    const comboCount = useRef<number>(0);
    const voiceClickCount = useRef<number>(0);
    const regenStreak = useRef<number>(0);
    const eroticStreak = useRef<number>(0);
    const cuteStreak = useRef<number>(0);

    // Initial load effects
    useEffect(() => {
        // Load local data override from useCoreData/useUserData handles basic loads, 
        // but we handle welcome modal here
        setTimeout(() => setShowWelcome(true), 1000);
        window.parent.postMessage({ type: 'REQUEST_LOAD' }, "*");
    }, []);

    // Custom BG effect
    useEffect(() => {
        if (customBg) {
            document.documentElement.style.setProperty('--bg', customBg);
        } else {
            document.documentElement.style.removeProperty('--bg');
        }
    }, [customBg]);

    // Send BG Color to Wix
    useEffect(() => {
        let color = customBg;
        if (!color) {
            if (settings.darkMode) {
                if (settings.userTheme === 'tech') color = '#050A14';
                else if (settings.userTheme === 'plurk') color = '#1A1A1A';
                else color = '#000000';
            } else {
                switch(settings.userTheme) {
                    case 'gold': color = '#FFF9E6'; break;
                    case 'orange': color = '#FFF5EE'; break;
                    case 'twitter': color = '#FFFFFF'; break;
                    case 'fanbox': color = '#F8F8F8'; break;
                    case 'tech': color = '#F0F5FF'; break;
                    case 'plurk': color = '#FDF6E3'; break;
                    default: color = '#F2F2F7'; break;
                }
            }
        }
        window.parent.postMessage({ type: 'CHANGE_BG', color }, "*");
    }, [settings.userTheme, settings.darkMode, customBg]);

    // Sync data to parent (iframe context)
    useEffect(() => {
        const payload = {
            appSettings: settings,
            favorites,
            historyLog: history,
            userAchieve,
            savedSubCategories: savedSubs,
            customFaces: activeFaces,
            disabledFaces,
            customDecor: activeDecor,
            disabledDecor
        };
        window.parent.postMessage({ type: 'SAVE_DATA', payload }, "*");
    }, [settings, favorites, history, userAchieve, savedSubs, activeFaces, disabledFaces, activeDecor, disabledDecor]);


    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 1500);
    };

    // --- Message Listener (AI & Data Sync) ---
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const data = event.data;

            if (data.type === 'CHANGE_BG' && data.color) {
                setCustomBg(data.color);
            }

            if (data.type === 'BATCH_AI_RESULT') {
                const { results } = data;
                setAiLoading(false);
                setAiMode(null);
                if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);

                if (results && results.error === 'RATE_LIMIT') {
                    showToast("⏳ 系統忙碌中，請稍後再試");
                    return;
                }

                if (results && Array.isArray(results)) {
                    setDisplayItems(prev => {
                        const newItems = [...prev];
                        results.forEach((item: any, index: number) => {
                            if (newItems[index]) {
                                newItems[index] = {
                                    ...newItems[index],
                                    base: {
                                        jp: item.text,
                                        cn: item.translation || newItems[index].base.cn
                                    },
                                    isUpgraded: true
                                };
                            }
                        });
                        return newItems;
                    });
                    
                    setStatusText("✅ AI 生成完成");
                    showToast("✨ 全體 AI 擴寫完成！");
                    unlockAchievement("ai_awakening");
                    triggerHaptic(100);
                }
            }

            if (data.type === 'LOAD_DATA' && data.payload) {
                const p = data.payload;
                if (p.appSettings) setSettings(prev => ({...prev, ...p.appSettings}));
                if (p.favorites) setFavorites(p.favorites);
                if (p.historyLog) setHistory(p.historyLog);
                if (p.userAchieve) setUserAchieve(p.userAchieve);
                if (p.savedSubCategories) setSavedSubs(p.savedSubCategories);
                if (p.customFaces) setActiveFaces(p.customFaces);
                if (p.disabledFaces) setDisabledFaces(p.disabledFaces);
                if (p.customDecor) setActiveDecor(p.customDecor);
                if (p.disabledDecor) setDisabledDecor(p.disabledDecor);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [unlockAchievement, setSettings, setFavorites, setHistory, setUserAchieve, setSavedSubs, setActiveFaces, setDisabledFaces, setActiveDecor, setDisabledDecor]); 

    // --- Core Logic ---

    const generateEmoji = () => {
        if (emojiLevel === 'kaomoji') return kaomojiList.length > 0 ? " " + kaomojiList[Math.floor(Math.random() * kaomojiList.length)] : "";
        if (emojiLevel === 0) return PUNCTUATIONS[Math.floor(Math.random() * PUNCTUATIONS.length)];
        
        const faces = activeFaces.length ? activeFaces : DEFAULT_FACES;
        const decor = activeDecor.length ? activeDecor : DEFAULT_DECOR;
        
        let count;
        if (emojiLevel === 3) count = Math.floor(Math.random() * 3) + 1;
        else if (emojiLevel === 1) count = Math.floor(Math.random() * 2) + 1;
        else if (emojiLevel === 2) count = Math.floor(Math.random() * (settings.customMax - settings.customMin + 1)) + settings.customMin;
        else count = Math.floor(Math.random() * 2) + 3;

        const featurePool = [...faces, ...decor];
        const feature = featurePool[Math.floor(Math.random() * featurePool.length)];
        let result = feature;
        for (let i = 1; i < count; i++) {
            result += decor[Math.floor(Math.random() * decor.length)];
        }
        if(emojiLevel === 3) {
             const f = faces[Math.floor(Math.random() * faces.length)];
             const d = decor[Math.floor(Math.random() * decor.length)];
             result = f;
             for(let i=1; i<count; i++) result += d;
        }
        return " " + result;
    };

    const generatePhrases = (mainKey: string, subKey: string, isRefresh = false) => {
        if (!database[mainKey]?.subs[subKey]) return;
        
        if (isRefresh) {
            regenStreak.current += 1;
            if (regenStreak.current >= 20) unlockAchievement("regen_20");
        } else {
            regenStreak.current = 0;
        }

        if (subKey.includes("紳士讚美") || subKey.includes("🔞")) {
            eroticStreak.current += 1;
            if (eroticStreak.current >= 10) unlockAchievement("erotic_fan");
        } else {
            eroticStreak.current = 0;
        }

        if (subKey.includes("單純可愛") || subKey.includes("🥰")) {
            cuteStreak.current += 1;
            if (cuteStreak.current >= 10) unlockAchievement("pure_love");
        } else {
            cuteStreak.current = 0;
        }

        const phrases = database[mainKey].subs[subKey].phrases;
        const count = Math.min(phrases.length, settings.resultCount);
        
        if (!isRefresh) seenIndices.current.clear();

        const { selected, newIndices } = getWeightedRandom(phrases, count, seenIndices.current);
        seenIndices.current = newIndices;

        const newItems = selected.map(p => ({
            base: p,
            emoji: generateEmoji(),
            specificPos: Math.random() < 0.5 ? 1 : 2
        }));

        setDisplayItems(newItems);
        setStatusText(isRefresh ? database[mainKey].subs[subKey].label : `📍 ${database[mainKey].subs[subKey].label}`);
    };

    const handleCopy = (text: string, e?: React.MouseEvent) => {
        if (e) createParticles(e.clientX, e.clientY);
        
        const now = Date.now();
        if (now - lastCopyTime.current < 10000) {
            comboCount.current += 1;
            if (comboCount.current >= 5) unlockAchievement("combo_master");
        } else {
            comboCount.current = 1;
        }
        lastCopyTime.current = now;

        setHistory(prev => {
            const n = [text, ...prev.filter(x => x !== text)];
            if (n.length > 16) n.pop();
            return n;
        });

        addXP(XP_COPY);
        setSettings(s => {
            const newTotal = s.totalCopies + 1;
            if (newTotal >= 50) unlockAchievement("copy_50");
            if (newTotal >= 500) unlockAchievement("copy_500");
            return { ...s, totalCopies: newTotal };
        });
        unlockAchievement("first_copy");

        navigator.clipboard.writeText(text).then(() => showToast("✅ 已複製內容！")).catch(() => {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast("✅ 已複製內容！");
        });
        triggerHaptic(50);
    };

    const toggleFavorite = (text: string, e: React.MouseEvent) => {
        e.stopPropagation();
        triggerHaptic(10);
        if (favorites.includes(text)) {
            setFavorites(prev => prev.filter(f => f !== text));
            unlockAchievement("fav_del");
        } else {
            if (favorites.length >= 24) { alert("我的最愛已滿 (24則)！"); return; }
            setFavorites(prev => [...prev, text]);
            addXP(XP_FAV);
            unlockAchievement("first_fav");
            if (favorites.length + 1 >= 24) unlockAchievement("fav_full");
        }
    };

    const speakText = (text: string, e?: React.MouseEvent) => {
        if(e) e.stopPropagation();
        voiceClickCount.current += 1;
        if (voiceClickCount.current >= 10) unlockAchievement("voice_lover");
        
        const clean = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
        const u = new SpeechSynthesisUtterance(clean);
        u.lang = 'ja-JP';
        u.rate = settings.voiceRate;
        u.pitch = settings.voicePitch;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
        if (settings.voiceRate >= 1.5) unlockAchievement("rap_god");
    };

    const toggleEmojiStatus = (emoji: string, isActive: boolean, type: 'face' | 'decor') => {
        triggerHaptic(10);
        if (type === 'face') {
            if (isActive) {
                setActiveFaces(prev => prev.filter(e => e !== emoji));
                if (!disabledFaces.includes(emoji)) setDisabledFaces(prev => [...prev, emoji]);
            } else {
                setDisabledFaces(prev => prev.filter(e => e !== emoji));
                if (!activeFaces.includes(emoji)) setActiveFaces(prev => [...prev, emoji]);
            }
        } else {
            if (isActive) {
                setActiveDecor(prev => prev.filter(e => e !== emoji));
                if (!disabledDecor.includes(emoji)) setDisabledDecor(prev => [...prev, emoji]);
            } else {
                setDisabledDecor(prev => prev.filter(e => e !== emoji));
                if (!activeDecor.includes(emoji)) setActiveDecor(prev => [...prev, emoji]);
            }
        }
        unlockAchievement("custom_emoji");
    };

    const updateCustomMix = (type: 'min' | 'max', val: number) => {
        val = Math.max(1, Math.min(10, val));
        if (type === 'min') {
            if (val > settings.customMax) {
                setSettings({ ...settings, customMin: val, customMax: val });
            } else {
                setSettings({ ...settings, customMin: val });
            }
        } else {
            if (val < settings.customMin) {
                setSettings({ ...settings, customMax: val, customMin: val });
            } else {
                setSettings({ ...settings, customMax: val });
            }
        }
    };

    const requestAI = (mode: 'custom' | 'reply' | 'rewrite') => {
        const now = Date.now();
        if (now - aiStartTime.current > 60000) { aiCount.current = 0; aiStartTime.current = now; }
        if (aiCount.current === 0) aiStartTime.current = now;
        if (aiCount.current >= (mode === 'rewrite' ? 3 : 5)) {
            showToast(mode === 'rewrite' ? "一次生成太多嘍，請稍後再試 🥺" : "休息一下，靈感正在冷卻中 🧊");
            return;
        }
        aiCount.current++;
        setAiLoading(true);
        setAiMode(mode);
        triggerHaptic(20);

        let phrases: string[] = [];
        let context = { main: "一般", sub: "通用" };

        if (mode === 'rewrite') {
            if (displayItems.length === 0) {
                showToast("⚠️ 清單是空的");
                setAiLoading(false);
                setAiMode(null);
                return;
            }
            phrases = displayItems.map(d => d.base.jp);
            
            if (currentMain === 'featured') {
                context = { main: "精選收藏", sub: "我的最愛" };
            } else if (currentMain && database[currentMain]) {
                context.main = database[currentMain].label;
                if (currentSub && database[currentMain].subs[currentSub]) {
                    context.sub = database[currentMain].subs[currentSub].label;
                }
            }
            setStatusText(`✨ ${context.sub} + AI 改寫中...`);
        } else {
            const val = aiInputValue.trim(); 
            if (!val) {
                showToast(mode === 'reply' ? "⚠️ 請先輸入或貼上要回覆的內容！" : "⚠️ 請先輸入想要生成的關鍵字！");
                setAiLoading(false);
                setAiMode(null);
                return;
            }

            const count = settings.resultCount;
            const placeholderCN = mode === 'reply' ? "AI 繪師正在構思回覆..." : "AI 正在構思色色的描述...";
            
            const newItems = Array(count).fill(0).map(() => ({
                base: { jp: val, cn: placeholderCN },
                emoji: generateEmoji(),
                specificPos: 1
            }));
            
            setDisplayItems(newItems);
            
            if (mode === 'reply') {
                setCurrentMain("自訂生成");
                setCurrentSub("回覆生成");
                context = { main: "ReplyMode", sub: "ArtistReply" };
                setStatusText('✨ 回覆生成中...');
            } else {
                setCurrentMain("自訂生成");
                setCurrentSub(val);
                context = { main: "使用者自訂", sub: val };
                setStatusText('✨ 關鍵語句生成中...');
            }
            phrases = new Array(count).fill(val);
        }

        window.parent.postMessage({
            type: 'REQUEST_BATCH_AI',
            phrases: phrases,
            context: context
        }, "*");

        if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
        aiTimeoutRef.current = setTimeout(() => {
            setAiLoading(false);
            setAiMode(null);
        }, 15000);
    };

    const handleSearch = () => {
        if (!searchQuery.trim()) return; 
        unlockAchievement("first_search");
        const matches: Phrase[] = [];
        Object.values(database).forEach(m => {
            Object.values(m.subs).forEach(s => {
                s.phrases.forEach(p => {
                    if (p.jp.includes(searchQuery) || p.cn.includes(searchQuery)) matches.push(p);
                });
            });
        });
        
        if (matches.length === 0) { alert("找不到相關結果"); return; }
        
        const count = Math.min(matches.length, settings.resultCount);
        const { selected } = getWeightedRandom(matches, count, new Set());
        const newItems = selected.map(p => ({ base: p, emoji: generateEmoji(), specificPos: 1 }));
        setDisplayItems(newItems);
        setCurrentMain(null);
        setCurrentSub(null);
        setStatusText(`🔍 搜尋結果：${searchQuery}`);
        setDictExpanded(false);
    };

    const toggleDict = (forceState?: boolean) => setDictExpanded(typeof forceState === 'boolean' ? forceState : !dictExpanded);

    const exportAllData = () => {
        const data = { appSettings: settings, activeFaces, activeDecor, savedSubCategories: savedSubs, favorites, userAchieve, disabledFaces, disabledDecor };
        exportData(data, "gentleman_settings.json");
    };

    const importAllData = (file: File) => {
        importData(file, (data) => {
            if(data.appSettings) setSettings(prev => ({ ...prev, ...data.appSettings }));
            
            if(data.activeFaces) setActiveFaces(data.activeFaces);
            if(data.activeDecor) setActiveDecor(data.activeDecor);
            if(data.disabledFaces) setDisabledFaces(data.disabledFaces);
            if(data.disabledDecor) setDisabledDecor(data.disabledDecor);
            if(data.savedSubCategories) setSavedSubs(data.savedSubCategories);
            if(data.favorites) setFavorites(data.favorites);
            if(data.userAchieve) setUserAchieve(data.userAchieve);
            alert("✅ 設定匯入成功！");
        });
    };

    const clearAllData = () => {
        if(confirm("確定要清除所有資料嗎？這將重置所有設定、收藏與自訂表符。")) {
            localStorage.clear();
            window.location.href = window.location.href; 
        }
    };

    return {
        database, settings, history, favorites, userAchieve, savedSubs,
        activeFaces, disabledFaces, activeDecor, disabledDecor,
        currentMain, currentSub, displayItems, dictExpanded,
        searchQuery, aiInputValue, emojiLevel, toastMsg, statusText,
        aiLoading, aiMode, showSettings, showHistory, showAchieve,
        showXP, showWelcome, showTutorial, selectedAchievement, settingsTab,
        historyTab, loading,
        setSettings, setHistory, setFavorites, setSavedSubs,
        setActiveFaces, setActiveDecor,
        setCurrentMain, setCurrentSub, setDisplayItems,
        setSearchQuery, setAiInputValue, setEmojiLevel, 
        setShowSettings, setShowHistory,
        setShowAchieve, setShowXP, setShowWelcome, setShowTutorial,
        setSelectedAchievement, setSettingsTab, setHistoryTab,
        addXP, generateEmoji, generatePhrases, handleCopy, toggleFavorite,
        speakText, toggleEmojiStatus, updateCustomMix, requestAI, handleSearch,
        toggleDict, exportAllData, importAllData, clearAllData, unlockAchievement
    };
};