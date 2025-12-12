import { useState, useEffect } from 'react';
import { SavedSubCategory } from '../types';
import { DEFAULT_FACES, DEFAULT_DECOR } from '../constants';

export const useUserData = () => {
    const [history, setHistory] = useState<string[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [savedSubs, setSavedSubs] = useState<SavedSubCategory[]>([]);
    
    const [activeFaces, setActiveFaces] = useState<string[]>(DEFAULT_FACES);
    const [disabledFaces, setDisabledFaces] = useState<string[]>([]);
    const [activeDecor, setActiveDecor] = useState<string[]>(DEFAULT_DECOR);
    const [disabledDecor, setDisabledDecor] = useState<string[]>([]);

    useEffect(() => {
        try {
            const h = localStorage.getItem('historyLog');
            if (h) {
                const parsedH = JSON.parse(h);
                if(Array.isArray(parsedH)) setHistory(parsedH);
            }
            const f = localStorage.getItem('favorites');
            if (f) {
                const parsedF = JSON.parse(f);
                if(Array.isArray(parsedF)) setFavorites(parsedF);
            }
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
        } catch (e) { console.error("Load user data error:", e); }
    }, []);

    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
        localStorage.setItem('historyLog', JSON.stringify(history));
        localStorage.setItem('savedSubCategories', JSON.stringify(savedSubs));
        
        localStorage.setItem('customFaces', JSON.stringify(activeFaces));
        localStorage.setItem('disabledFaces', JSON.stringify(disabledFaces));
        localStorage.setItem('customDecor', JSON.stringify(activeDecor));
        localStorage.setItem('disabledDecor', JSON.stringify(disabledDecor));
    }, [favorites, history, savedSubs, activeFaces, disabledFaces, activeDecor, disabledDecor]);

    return {
        history, setHistory,
        favorites, setFavorites,
        savedSubs, setSavedSubs,
        activeFaces, setActiveFaces,
        disabledFaces, setDisabledFaces,
        activeDecor, setActiveDecor,
        disabledDecor, setDisabledDecor
    };
};