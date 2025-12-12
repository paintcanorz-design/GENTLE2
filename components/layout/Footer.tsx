import React from 'react';
import { Icon } from '../UI_Components';
import { ICONS } from '../../constants';

export const Footer = () => (
    <div className="footer-control-area">
        <div className="footer-btn-grid">
            <a href="https://x.com/orz_can" target="_blank" className="footer-action-btn touch-feedback"><Icon path={ICONS.twitter} /> Twitter</a>
            <a href="https://www.paintcanfarm.com/" target="_blank" className="footer-action-btn touch-feedback"><Icon path={ICONS.home} /> Home</a>
            <a href="https://www.paypal.com/paypalme/paintcanfarm" target="_blank" className="footer-action-btn touch-feedback"><Icon path={ICONS.paypal} /> PayPal</a>
            <a href="https://orzcan.fanbox.cc/" target="_blank" className="footer-action-btn touch-feedback"><Icon path={ICONS.fanbox} /> Fanbox</a>
        </div>
        <div className="footer-desc">AI 運算與伺服器維護皆需要持續的資金成本。如果您喜歡這項服務，懇請考慮小額贊助。<br/>Copyright ©2017-2026. 缶子牧場 All Rights Reserved.</div>
    </div>
);