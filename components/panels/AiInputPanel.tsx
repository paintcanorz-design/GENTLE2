import React from 'react';
import { Icon } from '../UI_Components';
import { ICONS } from '../../constants';

export const AiInputPanel = ({ aiInputValue, setAiInputValue, aiLoading, aiMode, requestAI }: any) => (
    <div className="ai-input-container">
        <div className="custom-ai-block">
            <div style={{ flex: 1, position: 'relative', width: '100%' }}>
                <input 
                    type="text" 
                    id="custom-gen-input" 
                    className="custom-ai-input" 
                    placeholder="輸入關鍵字，句或貼上想回應的留言..." 
                    value={aiInputValue} 
                    onChange={(e) => setAiInputValue(e.target.value)}
                    style={{ paddingRight: '36px' }}
                />
                {aiInputValue && (
                    <div 
                        className="touch-feedback"
                        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--sub-text)', cursor: 'pointer', padding: '4px' }} 
                        onClick={() => setAiInputValue('')}
                    >
                        <Icon path={ICONS.close} style={{ width: '1em', height: '1em' }} />
                    </div>
                )}
            </div>
            <div className="custom-btn-group">
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