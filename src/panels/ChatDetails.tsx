import React, { useEffect, useState } from 'react';
import {
  Panel,
  PanelHeader,
  PanelHeaderBack,
  Group,
  Headline,
  Text,
  Button,
  CellButton,
  Snackbar,
} from '@vkontakte/vkui';
import { Icon28EditOutline } from '@vkontakte/icons';
import { Loader } from '../components/Loader';
import { fetchChatDetail, toggleLike, reportChat } from '../services/api';
import { getUserId } from '../utils/getUserId';
import type { ChatDetail } from '../types';

interface Props {
  id: string;
  chatId: number | null;
  onBack: () => void;
  onEditDescription: (chatId: number) => void;
}

export const ChatDetailsPanel: React.FC<Props> = ({
  id,
  chatId,
  onBack,
  onEditDescription,
}) => {
  const [chat, setChat] = useState<ChatDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLiked, setUserLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<React.ReactNode>(null);

  useEffect(() => {
    getUserId().then(setUserId);
  }, []);

  useEffect(() => {
    if (!chatId) return;
    setLoading(true);
    fetchChatDetail(chatId)
      .then((data) => {
        setChat(data);
        setLikesCount(data.likes_count);
      })
      .catch(() => setSnackbar(<Snackbar onClose={() => setSnackbar(null)}>Ошибка загрузки</Snackbar>))
      .finally(() => setLoading(false));
  }, [chatId]);

  if (loading || !chat) {
    return (
      <Panel id={id}>
        <PanelHeader before={<PanelHeaderBack onClick={onBack} />}>
          Загрузка…
        </PanelHeader>
        <Loader />
      </Panel>
    );
  }

  const handleLike = async () => {
    try {
      const res = await toggleLike(chat.chat_id);
      setUserLiked(res.liked);
      setLikesCount(res.likes_count);
    } catch {
      setSnackbar(<Snackbar onClose={() => setSnackbar(null)}>Ошибка</Snackbar>);
    }
  };

  const handleReport = async () => {
    try {
      await reportChat(chat.chat_id);
      setSnackbar(
        <Snackbar onClose={() => setSnackbar(null)}>Жалоба отправлена</Snackbar>,
      );
    } catch {
      setSnackbar(
        <Snackbar onClose={() => setSnackbar(null)}>Ошибка при отправке</Snackbar>,
      );
    }
  };

  const isAdmin = userId != null && chat.chat_id != null;

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={onBack} />}>
        {chat.title || `Беседа ${chat.chat_id}`}
      </PanelHeader>
      <Group>
        <div style={{ padding: 16 }}>
          <Headline level="2" weight="2">
            {chat.title || `Беседа ${chat.chat_id}`}
          </Headline>

          {chat.categories.length > 0 && (
            <Text style={{ marginTop: 8, color: 'var(--vkui--color_text_secondary)' }}>
              {chat.categories.join(', ')}
            </Text>
          )}

          <Text style={{ marginTop: 12 }}>{chat.description || 'Нет описания'}</Text>

          <div style={{ marginTop: 12 }}>
            <Text>❤️ {likesCount}</Text>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <Button onClick={handleLike} mode="secondary">
              {userLiked ? '💔 Убрать лайк' : '❤️ Лайк'}
            </Button>

            {chat.invite_link && (
              <Button
                mode="primary"
                onClick={() => window.open(chat.invite_link!, '_blank')}
              >
                Присоединиться
              </Button>
            )}

            <Button onClick={handleReport} mode="outline">
              Пожаловаться
            </Button>

            {isAdmin && (
              <CellButton
                before={<Icon28EditOutline />}
                onClick={() => onEditDescription(chat.chat_id)}
              >
                Редактировать описание
              </CellButton>
            )}
          </div>
        </div>
      </Group>
      {snackbar}
    </Panel>
  );
};
