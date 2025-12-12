import React from 'react';
import { ModalWrapper } from './ModalWrapper';

export const TutorialModal = ({ onClose }: any) => (
    <ModalWrapper onClose={onClose} id="tutorial-modal" contentId="tutorial-content-box">
        <div className="modal-header"><div className="modal-title">📖 使用教學</div><div className="close-x touch-feedback" onClick={onClose}>×</div></div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
            <div className="tutorial-content">
                <div className="tutorial-block">
                    <h3>🚀 1. 快速上手</h3>
                    <p>歡迎來到紳士 AI 讚美產生器！只需三個步驟即可生成：</p>
                    <ul>
                        <li><strong>Step 1：</strong>點擊「📂 預設辭庫」展開分類。</li>
                        <li><strong>Step 2：</strong>在下方選擇情境（細項），系統會立即生成。</li>
                        <li><strong>Step 3：</strong>點擊喜歡的語句即可<strong>自動複製</strong>。</li>
                    </ul>
                </div>
                <div className="tutorial-block">
                    <h3>⚡ 2. 進階功能</h3>
                    <ul>
                        <li><strong>🔄 換一批：</strong>不滿意當前結果？點此重新隨機生成。</li>
                        <li><strong>✨ AI 改寫：</strong>覺得語句太單調？讓 AI 幫你潤飾得更生動！</li>
                        <li><strong>🎨 表情切換：</strong>下方按鈕可切換「顏文字」、「驚嘆號」或「臉+愛心」等風格。</li>
                        <li><strong>🔊 語音朗讀：</strong>點擊語句旁的喇叭圖示，聆聽日語發音。</li>
                    </ul>
                </div>
                <div className="tutorial-block">
                    <h3>📊 3. 等級與收藏</h3>
                    <p>每次複製或收藏語句都能獲得<strong>經驗值 (XP)</strong>。</p>
                    <ul>
                        <li><strong>升級：</strong>隨著等級提升，你可以解鎖更多<strong>介面主題顏色</strong>。</li>
                        <li><strong>收藏：</strong>點擊星星「☆」可將語句加入「我的最愛」。</li>
                    </ul>
                </div>
            </div>
        </div>
        <div className="modal-footer"><button className="close-btn-full touch-feedback" onClick={onClose}>我知道了</button></div>
    </ModalWrapper>
);