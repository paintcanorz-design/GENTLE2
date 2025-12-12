import { useState, useEffect } from 'react';
import { Database, AppSettings } from '../types';
import { SHEET_CSV_URL, KAOMOJI_SHEET_CSV_URL } from '../constants';

export const useCoreData = () => {
    const [database, setDatabase] = useState<Database>({});
    const [kaomojiList, setKaomojiList] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [settings, setSettings] = useState<AppSettings>({
        fontSize: 0, resultCount: 6, showCN: true, showSpeak: true, customMin: 3, customMax: 5,
        voiceRate: 1.1, voicePitch: 1.0, copyAction: 'none', userXP: 0, userLevel: 1,
        userTheme: 'default', hideAd: false, totalCopies: 0,
        darkMode: typeof localStorage !== 'undefined' && localStorage.getItem('theme') === null 
            ? true 
            : localStorage.getItem('theme') === 'dark'
    });

    // 載入 CSV 資料庫
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

            const db: Database = {};
            mainCSV.split(/\r?\n/).slice(1).forEach(row => {
                if (!row.trim()) return;
                const cols = row.split(',');
                if (cols.length < 4) return;
                
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

            const kList: string[] = [];
            kaomojiCSV.split(/\r?\n/).slice(1).forEach(row => {
                const k = row.split(',')[0]?.trim().replace(/^"|"$/g, '');
                if (k) kList.push(k);
            });
            setKaomojiList(kList);
            setLoading(false);
        };

        loadData();
    }, []);

    // 處理外觀與設定的 Side Effects
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('theme-pink', 'theme-gold', 'theme-mono', 'theme-teal', 'theme-silver', 'theme-purple', 'theme-wine', 'theme-colorful', 'theme-twitter', 'theme-fanbox', 'theme-youtube', 'theme-tech', 'theme-plurk', 'theme-melon', 'theme-orange');
        
        if (settings.darkMode) {
            root.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark'); 
        } else {
            root.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }

        if (settings.userTheme !== 'default') {
            root.classList.add(`theme-${settings.userTheme}`);
        }
        
        if (settings.fontSize === 0) { root.style.setProperty('--fs-jp', '0.8rem'); root.style.setProperty('--fs-cn', '0.75rem'); }
        else if (settings.fontSize === 1) { root.style.setProperty('--fs-jp', '0.9rem'); root.style.setProperty('--fs-cn', '0.8rem'); }
        else { root.style.setProperty('--fs-jp', '1.1rem'); root.style.setProperty('--fs-cn', '0.95rem'); }

        if (!settings.showCN) document.body.classList.add('hide-cn');
        else document.body.classList.remove('hide-cn');
        
        if (!settings.showSpeak) document.body.classList.add('hide-speak'); 
        else document.body.classList.remove('hide-speak');

        localStorage.setItem('appSettings', JSON.stringify(settings));
    }, [settings]);

    return {
        database,
        kaomojiList,
        loading,
        settings,
        setSettings
    };
};