import React from 'react';
import { Icon } from '../UI_Components';
import { ICONS } from '../../constants';

export const Header = ({ onSettingsClick }: { onSettingsClick: () => void }) => (
    <div className="header-row">
        <h1><Icon path={ICONS.logo} style={{marginRight: '8px'}} /> 紳士ＡＩ讚美產生器</h1>
        <div className="settings-hitbox" onClick={onSettingsClick}>
            <div className="settings-visual"><Icon path={ICONS.settings} /></div>
        </div>
    </div>
);