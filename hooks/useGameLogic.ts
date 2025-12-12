import { useState, useEffect, useCallback, useRef } from 'react';
import { UserAchievement, AppSettings } from '../types';
import { ACHIEVEMENTS } from '../constants';
import { triggerHaptic } from '../services/utils';

export const useGameLogic = (settings: AppSettings, setSettings: React.Dispatch<React.SetStateAction<AppSettings>>) => {
    const [userAchieve, setUserAchieve] = useState<Record<string, UserAchievement>>({});
    const themeCount = useRef<Set<string>>(new Set());

    useEffect(() => {
        try {
            const a = localStorage.getItem('userAchieve');
            if (a) setUserAchieve(JSON.parse(a));
        } catch(e) { console.error("Load achievement error", e); }
    }, []);

    useEffect(() => {
        localStorage.setItem('userAchieve', JSON.stringify(userAchieve));
    }, [userAchieve]);

    // 檢查主題成就
    useEffect(() => {
        themeCount.current.add(settings.userTheme);
        if (themeCount.current.size >= 3) unlockAchievement("color_master");
    }, [settings.userTheme]);

    // 檢查等級解鎖
    useEffect(() => {
        if (!settings.showCN) unlockAchievement("n1_japanese");
    }, [settings.showCN]);

    const unlockAchievement = useCallback((id: string) => {
        if (!ACHIEVEMENTS[id]) return;
        
        setUserAchieve(prev => {
            if (prev[id]?.unlocked) return prev;
            
            const newAchieve = { ...prev, [id]: { unlocked: true, date: Date.now() } };
            
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
        
        setTimeout(() => {
            setUserAchieve(current => {
                const allKeys = Object.keys(ACHIEVEMENTS).filter(k => k !== 'all_complete');
                const unlockedCount = allKeys.filter(k => current[k]?.unlocked).length;
                if (unlockedCount === allKeys.length && !current['all_complete']?.unlocked) {
                    return { ...current, ['all_complete']: { unlocked: true, date: Date.now() } };
                }
                return current;
            });
        }, 500);
    }, []);

    const checkUnlocks = (level: number) => {
        let msg = "";
        if (level === 20) msg = "✨ 解鎖 🧘 賢者黑白主題！";
        if (level === 100) msg = "🔓 解鎖主題：🍊 愛馬仕橘！";
        if (msg) {
            setTimeout(() => alert(`恭喜升級到 LV.${level}！\n${msg}\n請到設定頁面查看。`), 500);
        }
    };

    const addXP = (amount: number) => {
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

    return { userAchieve, setUserAchieve, unlockAchievement, addXP };
};