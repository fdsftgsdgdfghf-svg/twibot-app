import bridge from '@vkontakte/vk-bridge';

export async function getUserId(): Promise<number> {
  try {
    const data = await bridge.send('VKWebAppGetUserInfo');
    return data.id;
  } catch {
    const stored = sessionStorage.getItem('twibot_user_id');
    return stored ? Number(stored) : 0;
  }
}

export function saveUserId(id: number): void {
  sessionStorage.setItem('twibot_user_id', String(id));
}
