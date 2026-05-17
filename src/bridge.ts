import bridge from '@vkontakte/vk-bridge';

export function initBridge(): void {
  bridge.send('VKWebAppInit');
}
