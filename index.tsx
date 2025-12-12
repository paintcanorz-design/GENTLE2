import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// 引入拆分後的樣式表 (順序很重要)
import './styles/variables.css';   // 變數與主題顏色
import './styles/animations.css';  // 動畫關鍵影格
import './styles/base.css';        // 基礎 HTML 與 Body 設定
import './styles/layout.css';      // 整體佈局 (Container, Header, Footer)
import './styles/components.css';  // UI 元件 (按鈕, 輸入框, 列表)
import './styles/modals.css';      // 彈窗與浮動提示

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);