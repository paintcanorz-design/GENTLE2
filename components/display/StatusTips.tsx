import React from 'react';
import { Icon } from '../UI_Components';
import { ICONS } from '../../constants';

export const StatusTips = ({ aiLoading, statusText }: any) => {
    let iconPath = ICONS.logo;
    let displayText = statusText;
    let isPulsing = false;

    if (aiLoading) {
        iconPath = ICONS.sparkle;
        isPulsing = true;
    } else {
        if (statusText.startsWith('📍')) {
            iconPath = ICONS.subCat;
            displayText = statusText.substring(2).trim();
        } else if (statusText.startsWith('✅')) {
            iconPath = ICONS.star;
            displayText = statusText.substring(2).trim();
        } else if (statusText.startsWith('✨')) {
            iconPath = ICONS.ai;
            displayText = statusText.substring(2).trim();
        } else if (statusText.startsWith('🔍')) {
            iconPath = ICONS.search;
            displayText = statusText.substring(2).trim();
        }
    }

    return (
        <div className="status-tips-container">
            <div className={`status-indicator ${isPulsing ? 'pulsing' : ''}`}>
                <Icon path={iconPath} style={{ marginRight: '6px' }} />
                {displayText}
            </div>
            {!aiLoading && (
                <div className="tips-text-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Icon path={ICONS.lightbulb} style={{ marginRight: '4px', width: '0.9em', height: '0.9em' }} />
                    <span>點擊語句可複製</span>
                </div>
            )}
        </div>
    );
};