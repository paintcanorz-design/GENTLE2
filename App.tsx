import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Database, AppSettings, Phrase, DisplayItem, SavedSubCategory, UserAchievement } from './types';
import { SHEET_CSV_URL, KAOMOJI_SHEET_CSV_URL, DEFAULT_FACES, DEFAULT_DECOR, PUNCTUATIONS, LEVEL_TITLES, UNLOCKS, ACHIEVEMENTS, XP_COPY, XP_FAV } from './constants';
import { stripEmojis, triggerHaptic, createParticles, getWeightedRandom, exportData, importData } from './services/utils';
import { Header, DictionaryPanel, AiInputPanel, StatusTips, ResultList, ControlDeck, XPBar, SearchHistoryBlock, Footer } from './components/AppBlocks';
import { HistoryModal, SettingsModal, AchievementsModal, XPPopover, WelcomeModal, TutorialModal, AchievementDetailModal } from './components/Modals';

export default function App() {
    // --- State ---
    const [database, setDatabase] = useState<Database>({});
    const [kaomojiList, setKaomojiList] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<AppSettings>({
        fontSize: 0, resultCount: 6, showCN: true, showSpeak: true, customMin: 3, customMax: 5,
        voiceRate: 1.1, voicePitch: 1.0, copyAction: 'none', userXP: 0, userLevel: 1,
        userTheme: 'default', hideAd: false, pureMode: false, hideFun: false, totalCopies: 0
    });
    const [history, setHistory] = useState<string[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [userAchieve, setUserAchieve] = useState<Record<string, UserAchievement>>({});
    const [savedSubs, setSavedSubs] = useState<SavedSubCategory[]>([]);
    
    // Emoji Lists
    const [activeFaces, setActiveFaces] = useState<string[]>(DEFAULT_FACES);
    const [disabledFaces, setDisabledFaces] = useState<string[]>([]);
    const [activeDecor, setActiveDecor] = useState<string[]>(DEFAULT_DECOR);
    const [disabledDecor, setDisabledDecor] = useState<string[]>([]);
    
    // UI State
    const [currentMain, setCurrentMain] = useState<string | null>(null);
    const [currentSub, setCurrentSub] = useState<string | null>(null);
    const [displayItems, setDisplayItems] = useState<DisplayItem[]>([]);
    const [dictExpanded, setDictExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [emojiLevel, setEmojiLevel] = useState<number | string>(3);
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const [statusText, setStatusText] = useState("請選擇預設辭庫或AI生成");
    const [aiLoading, setAiLoading] = useState(false);
    const [aiMode, setAiMode] = useState<'custom' | 'reply' | 'rewrite' | null>(null);
    
    // Modals
    const [showSettings, setShowSettings] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showAchieve, setShowAchieve] = useState(false);
    const [showXP, setShowXP] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);
    const [settingsTab, setSettingsTab] = useState<'general' | 'theme' | 'emoji' | 'data'>('general');
    const [historyTab, setHistoryTab] = useState<'history' | 'fav'>('history');

    // Logic Refs
    const seenIndices = useRef<Set<number>>(new Set());
    const aiStartTime = useRef<number>(0);
    const aiCount = useRef<number>(0);
    const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    
    // Achievement Refs
    const lastCopyTime = useRef<number>(0);
    const comboCount = useRef<number>(0);
    const voiceClickCount = useRef<number>(0);
    const regenStreak = useRef<number>(0);
    const eroticStreak = useRef<number>(0);
    const cuteStreak = useRef<number>(0);
    const themeCount = useRef<Set<string>>(new Set());

    // --- Data Fetching ---
    useEffect(() => {
        const loadData = async () => {
            const fetchText = async (url: string, key: string) => {
                const cached = localStorage.getItem(key);
                if (cached) return cached;
                try {
                    const res = await fetch(url);
                    if (!res.ok) throw new Error("Fetch failed");
                    const text = await res.text();
                    localStorage.setItem(key, text);
                    return text;
                } catch (e) { return ""; }
            };

            const [mainCSV, kaomojiCSV] = await Promise.all([
                fetchText(SHEET_CSV_URL, 'mainDB'),
                fetchText(KAOMOJI_SHEET_CSV_URL, 'kaomojiDB')
            ]);

            // Parse Main DB
            const db: Database = {};
            mainCSV.split(/\r?\n/).slice(1).forEach(row => {
                if (!row.trim()) return;
                const cols = row.split(',');
                if (cols.length < 4) return;
                
                // Keep emojis in keys and content during parsing
                const mainKey = cols[0].trim().replace(/^"|"$/g, '');
                const subKey = cols[1].trim().replace(/^"|"$/g, '');
                const jp = cols[2].trim().replace(/^"|"$/g, '');
                const cn = cols[3].trim().replace(/^"|"$/g, '');
                
                if (!mainKey || !subKey) return;
                if (!db[mainKey]) db[mainKey] = { label: mainKey, subs: {} };
                if (!db[mainKey].subs[subKey]) db[mainKey].subs[subKey] = { label: subKey, phrases: [] };
                if (jp) db[mainKey].subs[subKey].phrases.push({ jp, cn });
            });
            setDatabase(db);

            // Parse Kaomoji
            const kList: string[] = [];
            kaomojiCSV.split(/\r?\n/).slice(1).forEach(row => {
                const k = row.split(',')[0]?.trim().replace(/^"|"$/g, '');
                if (k) kList.push(k);
            });
            setKaomojiList(kList);
            setLoading(false);
        };

        // Load local storage settings
        const loadLocal = () => {
            try {
                const s = localStorage.getItem('appSettings');
                if (s) setSettings(prev => ({ ...prev, ...JSON.parse(s) }));
                const h = localStorage.getItem('historyLog');
                if (h) setHistory(JSON.parse(h));
                const f = localStorage.getItem('favorites');
                if (f) setFavorites(JSON.parse(f));
                const a = localStorage.getItem('userAchieve');
                if (a) setUserAchieve(JSON.parse(a));
                const sub = localStorage.getItem('savedSubCategories');
                if (sub) setSavedSubs(JSON.parse(sub));
                
                const faces = localStorage.getItem('customFaces');
                if (faces) setActiveFaces(JSON.parse(faces));
                const disFaces = localStorage.getItem('disabledFaces');
                if (disFaces) setDisabledFaces(JSON.parse(disFaces));
                
                const decor = localStorage.getItem('customDecor');
                if (decor) setActiveDecor(JSON.parse(decor));
                const disDecor = localStorage.getItem('disabledDecor');
                if (disDecor) setDisabledDecor(JSON.parse(disDecor));

            } catch (e) { console.error(e); }
        };

        loadData();
        loadLocal();
        setTimeout(() => setShowWelcome(true), 1000);
    }, []);

    // --- Effect: AI Result Listener ---
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const data = event.data;
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
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []); 

    // --- Effect: Apply Settings (Theme, Font, etc) ---
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('dark-mode', 'theme-pink', 'theme-gold', 'theme-mono', 'theme-teal', 'theme-silver', 'theme-purple', 'theme-wine', 'theme-colorful', 'theme-twitter', 'theme-fanbox', 'theme-youtube', 'theme-tech', 'theme-plurk', 'theme-melon', 'theme-orange');
        
        if (settings.userTheme === 'default') {
            // Default blue
        } else {
            root.classList.add(`theme-${settings.userTheme}`);
        }
        
        themeCount.current.add(settings.userTheme);
        if (themeCount.current.size >= 3) unlockAchievement("color_master");
        
        // Font Size
        if (settings.fontSize === 0) { root.style.setProperty('--fs-jp', '0.8rem'); root.style.setProperty('--fs-cn', '0.75rem'); }
        else if (settings.fontSize === 1) { root.style.setProperty('--fs-jp', '0.9rem'); root.style.setProperty('--fs-cn', '0.8rem'); }
        else { root.style.setProperty('--fs-jp', '1.1rem'); root.style.setProperty('--fs-cn', '0.95rem'); }

        if (settings.pureMode) {
            document.body.classList.add('pure-mode');
            unlockAchievement("pure_mode");
        } else {
            document.body.classList.remove('pure-mode');
        }
        
        if (settings.hideFun) document.body.classList.add('hide-fun'); else document.body.classList.remove('hide-fun');
        if (!settings.showCN) {
            document.body.classList.add('hide-cn');
            unlockAchievement("n1_japanese");
        } else {
            document.body.classList.remove('hide-cn');
        }
        
        if (!settings.showSpeak) document.body.classList.add('hide-speak'); else document.body.classList.remove('hide-speak');

        // Persist
        localStorage.setItem('appSettings', JSON.stringify(settings));
        localStorage.setItem('favorites', JSON.stringify(favorites));
        localStorage.setItem('historyLog', JSON.stringify(history));
        localStorage.setItem('userAchieve', JSON.stringify(userAchieve));
        localStorage.setItem('savedSubCategories', JSON.stringify(savedSubs));
        
        localStorage.setItem('customFaces', JSON.stringify(activeFaces));
        localStorage.setItem('disabledFaces', JSON.stringify(disabledFaces));
        localStorage.setItem('customDecor', JSON.stringify(activeDecor));
        localStorage.setItem('disabledDecor', JSON.stringify(disabledDecor));

    }, [settings, favorites, history, userAchieve, savedSubs, activeFaces, disabledFaces, activeDecor, disabledDecor]);

    // --- Logic ---
    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 1500);
    };

    const unlockAchievement = useCallback((id: string) => {
        if (settings.hideFun || !ACHIEVEMENTS[id]) return;
        
        setUserAchieve(prev => {
            if (prev[id]?.unlocked) return prev;
            
            const newAchieve = { ...prev, [id]: { unlocked: true, date: Date.now() } };
            
            // Show toast
            const t = document.getElementById('achieve-toast');
            if (t) {
                const iconEl = t.querySelector('.achieve-toast-icon');
                if (iconEl) iconEl.innerHTML = ACHIEVEMENTS[id].icon;
                const titleEl = t.querySelector('.achieve-toast-title');
                if (titleEl) titleEl.textContent = "成就解鎖！";
                const descEl = t.querySelector('.achieve-toast-desc');
                if (descEl) descEl.textContent = ACHIEVEMENTS[id].title;
                
                t.classList.add('show');
                triggerHaptic(200);
                setTimeout(() => t.classList.remove('show'), 3000);
            }
            return newAchieve;
        });
        
        // Check for all_complete
        setTimeout(() => {
            setUserAchieve(current => {
                const allKeys = Object.keys(ACHIEVEMENTS).filter(k => k !== 'all_complete');
                const unlockedCount = allKeys.filter(k => current[k]?.unlocked).length;
                if (unlockedCount === allKeys.length && !current['all_complete']?.unlocked) {
                    const finalAchieve = { ...current, ['all_complete']: { unlocked: true, date: Date.now() } };
                    return finalAchieve;
                }
                return current;
            });
        }, 500);
    }, [settings.hideFun]);

    const checkUnlocks = (level: number) => {
        if (settings.hideFun) return;
        let msg = "";
        if (level === 20) msg = "✨ 解鎖 🧘 賢者黑白主題！";
        if (level === 100) msg = "🔓 解鎖主題：🍊 愛馬仕橘！";
        if (msg) {
            setTimeout(() => alert(`恭喜升級到 LV.${level}！\n${msg}\n請到設定頁面查看。`), 500);
        }
    };

    const addXP = (amount: number) => {
        if (settings.hideFun) return;
        let newXP = settings.userXP + amount;
        let level = 1;
        const getXPForLevel = (lvl: number) => (lvl >= 200 ? 50 : lvl >= 100 ? 20 : 5);
        while (true) {
            let needed = getXPForLevel(level);
            if (newXP >= needed) { newXP -= needed; level++; } else break;
        }

        if (level > settings.userLevel) {
            const toast = document.getElementById('levelup-toast');
            if (toast) {
                toast.textContent = `🎉 升級啦！LV.${level}`;
                toast.className = "toast show";
                setTimeout(() => toast.className = toast.className.replace("show", ""), 2000);
            }
            triggerHaptic(100);
            checkUnlocks(level);
            if (level >= 50) unlockAchievement("level_50");
            if (level >= 100) unlockAchievement("level_100");
        }
        setSettings(s => ({ ...s, userXP: newXP, userLevel: level }));
    };

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
        
        // Streak Logic
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
        if (e) createParticles(e.clientX, e.clientY, settings.pureMode);
        
        // Combo Logic
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
                // Moving from Active to Disabled
                setActiveFaces(prev => prev.filter(e => e !== emoji));
                if (!disabledFaces.includes(emoji)) setDisabledFaces(prev => [...prev, emoji]);
            } else {
                // Moving from Disabled to Active, OR adding new
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
            const val = searchQuery.trim();
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
            if(data.appSettings) setSettings(data.appSettings);
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
        if(confirm("確定要清除所有資料嗎？")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="container">
            <Header onSettingsClick={() => { setShowSettings(true); setSettingsTab('general'); }} />

            <DictionaryPanel 
                loading={loading}
                dictExpanded={dictExpanded}
                toggleDict={toggleDict}
                currentMain={currentMain}
                setCurrentMain={setCurrentMain}
                setCurrentSub={setCurrentSub}
                currentSub={currentSub}
                database={database}
                settings={settings}
                stripEmojis={stripEmojis}
                savedSubs={savedSubs}
                setSavedSubs={setSavedSubs}
                addXP={addXP}
                XP_FAV={XP_FAV}
                createParticles={createParticles}
                generatePhrases={generatePhrases}
            />

            <AiInputPanel 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                aiLoading={aiLoading}
                aiMode={aiMode}
                requestAI={requestAI}
            />

            <StatusTips aiLoading={aiLoading} statusText={statusText} />

            <ResultList 
                displayItems={displayItems}
                handleCopy={handleCopy}
                speakText={speakText}
                toggleFavorite={toggleFavorite}
                favorites={favorites}
                settings={settings}
            />

            <ControlDeck 
                displayItems={displayItems}
                currentMain={currentMain}
                currentSub={currentSub}
                generatePhrases={generatePhrases}
                settings={settings}
                setDisplayItems={setDisplayItems}
                generateEmoji={generateEmoji}
                aiLoading={aiLoading}
                aiMode={aiMode}
                requestAI={requestAI}
                emojiLevel={emojiLevel}
                setEmojiLevel={setEmojiLevel}
                unlockAchievement={unlockAchievement}
                createParticles={createParticles}
            />

            <XPBar 
                settings={settings}
                setShowXP={setShowXP}
                LEVEL_TITLES={LEVEL_TITLES}
            />

            <SearchHistoryBlock 
                setShowHistory={setShowHistory}
                setHistoryTab={setHistoryTab}
                setShowAchieve={setShowAchieve}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearch={handleSearch}
            />

            <Footer />

            {/* Modals */}
            {showSettings && (
                <SettingsModal 
                    onClose={() => setShowSettings(false)}
                    settings={settings}
                    setSettings={setSettings}
                    activeTab={settingsTab}
                    setActiveTab={setSettingsTab}
                    activeFaces={activeFaces}
                    setActiveFaces={setActiveFaces}
                    activeDecor={activeDecor}
                    setActiveDecor={setActiveDecor}
                    disabledFaces={disabledFaces}
                    disabledDecor={disabledDecor}
                    toggleEmojiStatus={toggleEmojiStatus}
                    updateCustomMix={updateCustomMix}
                    exportAllData={exportAllData}
                    importAllData={importAllData}
                    clearAllData={clearAllData}
                    clearHistory={() => setHistory([])}
                    clearFavorites={() => setFavorites([])}
                    testVoice={() => speakText("大好き")}
                />
            )}

            {showHistory && (
                <HistoryModal 
                    onClose={() => setShowHistory(false)}
                    history={history}
                    favorites={favorites}
                    activeTab={historyTab}
                    setActiveTab={setHistoryTab}
                    setFavorites={setFavorites}
                    copyToClipboard={(t: string) => handleCopy(t)}
                    addXP={addXP}
                    XP_FAV={XP_FAV}
                />
            )}

            {showAchieve && (
                <AchievementsModal 
                    onClose={() => setShowAchieve(false)}
                    userAchieve={userAchieve}
                    showDetail={(id: string) => setSelectedAchievement(id)}
                />
            )}

            {selectedAchievement && (
                <AchievementDetailModal 
                    onClose={() => setSelectedAchievement(null)}
                    achievement={ACHIEVEMENTS[selectedAchievement]}
                    userAchieveData={userAchieve[selectedAchievement]}
                />
            )}

            {showXP && (
                <XPPopover 
                    onClose={() => setShowXP(false)}
                    userLevel={settings.userLevel}
                    userXP={settings.userXP}
                    LEVEL_TITLES={LEVEL_TITLES}
                    UNLOCKS={UNLOCKS}
                />
            )}

            {showWelcome && !settings.hideFun && (
                <WelcomeModal 
                    onClose={() => { setShowWelcome(false); unlockAchievement("read_tutorial"); }}
                    database={database}
                    unlockAchievement={unlockAchievement}
                />
            )}

            {/* Tutorial can be triggered from settings, needs logic to show */}
            {showTutorial && (
                <TutorialModal onClose={() => setShowTutorial(false)} />
            )}

            <div id="toast" className={`toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
            <div id="levelup-toast" className="toast" style={{ backgroundColor: 'var(--primary)', fontWeight: 800 }}></div>
            <div id="achieve-toast">
                <div className="achieve-toast-icon"></div>
                <div className="achieve-toast-title"></div>
                <div className="achieve-toast-desc"></div>
            </div>
        </div>
    );
}