export const stripEmojis = (str: string): string => {
    if (!str) return "";
    return str.replace(/[^\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u0020-\u007E\u00A0-\u00FF\u3000-\u303F]/g, '').replace(/\s+/g, ' ').trim();
};

export const triggerHaptic = (duration = 10) => {
    if (navigator.vibrate) navigator.vibrate(duration);
};

export const createParticles = (x: number, y: number, pureMode: boolean) => {
    if (pureMode) return;
    const particles = ['❤️', '⭐', '✨', '💕'];
    for (let i = 0; i < 12; i++) {
        const p = document.createElement('div');
        p.textContent = particles[Math.floor(Math.random() * particles.length)];
        p.className = 'particle';
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        p.style.setProperty('--tx', (Math.random() * 100 - 50) + 'px');
        p.style.setProperty('--ty', (Math.random() * 100 - 50) + 'px');
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 800);
    }
};

export const getWeightedRandom = <T,>(sourceArr: T[], count: number, seenIndices: Set<number>): { selected: T[], newIndices: Set<number> } => {
    let pool = sourceArr.map((item, index) => ({ item: item, index: index, weight: seenIndices.has(index) ? 25 : 100 }));
    let result: T[] = [];
    let newSeen = new Set(seenIndices);
    
    for (let i = 0; i < count; i++) {
        if (pool.length === 0) break;
        let totalWeight = pool.reduce((a, b) => a + b.weight, 0);
        let r = Math.random() * totalWeight;
        let selectedIdx = -1;
        
        for (let j = 0; j < pool.length; j++) {
            r -= pool[j].weight;
            if (r <= 0) {
                selectedIdx = j;
                break;
            }
        }
        if (selectedIdx === -1) selectedIdx = pool.length - 1;
        
        result.push(pool[selectedIdx].item);
        newSeen.add(pool[selectedIdx].index);
        pool.splice(selectedIdx, 1);
    }
    return { selected: result, newIndices: newSeen };
};

export const showLockedTooltip = (element: HTMLElement, message: string) => {
    const tooltip = document.createElement('div');
    tooltip.className = 'locked-tooltip';
    tooltip.textContent = message;
    const rect = element.getBoundingClientRect();
    tooltip.style.left = (rect.left + rect.width / 2) + 'px';
    tooltip.style.top = (rect.top - 10) + 'px'; 
    document.body.appendChild(tooltip);
    setTimeout(() => { if (tooltip && tooltip.parentNode) tooltip.parentNode.removeChild(tooltip); }, 2000);
};

export const saveElementAsImage = (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // @ts-ignore
    if (!window.html2canvas) return;

    // @ts-ignore
    window.html2canvas(element, { backgroundColor: null, scale: 2 }).then((canvas: HTMLCanvasElement) => {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
    });
};

export const exportData = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

export const importData = (file: File, callback: (data: any) => void) => {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const result = e.target?.result;
            if (typeof result === 'string') {
                const data = JSON.parse(result);
                callback(data);
            }
        } catch (err) {
            console.error("Import failed", err);
        }
    };
    reader.readAsText(file);
};
