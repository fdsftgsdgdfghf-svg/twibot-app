import React from 'react';
import ReactDOM from 'react-dom/client';
import { AdaptivityProvider, ConfigProvider, AppRoot } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import { App } from './App';
import { initBridge } from './bridge';

initBridge();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider appearance="light">
      <AdaptivityProvider>
        <AppRoot>
          <App />
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  </React.StrictMode>,
);
