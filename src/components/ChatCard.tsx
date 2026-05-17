import React from 'react';
import { Card, Cell, Headline, Text, IconButton } from '@vkontakte/vkui';
import { Icon28FavoriteOutline, Icon28Favorite } from '@vkontakte/icons';
import type { ChatSummary } from '../types';

interface Props {
  chat: ChatSummary;
  liked?: boolean;
  onLike?: (chatId: number) => void;
  onClick: (chatId: number) => void;
}

export const ChatCard: React.FC<Props> = ({ chat, liked, onLike, onClick }) => {
  const categories = chat.categories.join(', ');

  return (
    <Card style={{ marginBottom: 12 }} onClick={() => onClick(chat.chat_id)}>
      <div style={{ padding: 12 }}>
        <Headline level="2" weight="2">
          {chat.title || `Беседа ${chat.chat_id}`}
        </Headline>
        {categories && (
          <Text style={{ color: 'var(--vkui--color_text_secondary)', marginTop: 4 }}>
            {categories}
          </Text>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 8,
          }}
        >
          <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
            ❤️ {chat.likes_count}
          </Text>
          {onLike && (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onLike(chat.chat_id);
              }}
              aria-label="Лайк"
            >
              {liked ? <Icon28Heart fill="#E64646" /> : <Icon28HeartOutline />}
            </IconButton>
          )}
        </div>
      </div>
    </Card>
  );
};
