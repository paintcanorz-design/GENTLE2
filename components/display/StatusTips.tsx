import React from 'react';
import { Icon } from '../UI_Components';
import { ICONS } from '../../constants';

export const StatusTips = ({ aiLoading, statusText }: any) => {
    let content;
    if (aiLoading) {
        content = statusText;
    } else if (statusText.startsWith('📍')) {
        const text = statusText.substring(2);
        content = (
            <span style={{ display: 'flex', alignItems: 'center' }}>
                <Icon path={ICONS.subCat} style={{ width: '1.2em', height: '1.2em', marginRight: '4px' }} />
                {text}
            </span>
        );
    } else if (statusText.startsWith('🔍')) {
         content = (
            <span style={{ display: 'flex', alignItems: 'center' }}>
                <Icon path={ICONS.search} style={{ width: '1.2em', height: '1.2em', marginRight: '4px' }} />
                {statusText.substring(2)}
            </span>
        );
    } else {
        content = <span dangerouslySetInnerHTML={{ __html: `<span class="status-dot"></span> ${statusText}` }} />;
    }

    return (
        <div className="status-tips-container">
            <div className={`status-indicator ${aiLoading ? 'pulsing' : ''}`}>
                {content}
            </div>
            <div className="tips-text-right">💡 點選語句可複製，按鈕可刷新</div>
        </div>
    );
};