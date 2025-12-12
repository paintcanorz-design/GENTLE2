import React from 'react';
import { LEVEL_TITLES, UNLOCKS, ACHIEVEMENTS, XP_FAV } from './constants';
import { createParticles } from './services/utils';
import { Header, DictionaryPanel, AiInputPanel, StatusTips, ResultList, ControlDeck, XPBar, SearchHistoryBlock, Footer } from './components/AppBlocks';
import { HistoryModal, SettingsModal, AchievementsModal, XPPopover, WelcomeModal, TutorialModal, AchievementDetailModal } from './components/Modals';
import { useAppLogic } from './hooks/useAppLogic';

export default function App() {
    const {
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
    } = useAppLogic();

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
                savedSubs={savedSubs}
                setSavedSubs={setSavedSubs}
                addXP={addXP}
                XP_FAV={XP_FAV}
                createParticles={createParticles}
                generatePhrases={generatePhrases}
            />

            <AiInputPanel 
                aiInputValue={aiInputValue}
                setAiInputValue={setAiInputValue}
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

            {showWelcome && (
                <WelcomeModal 
                    onClose={() => { setShowWelcome(false); unlockAchievement("read_tutorial"); }}
                    database={database}
                    unlockAchievement={unlockAchievement}
                />
            )}

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