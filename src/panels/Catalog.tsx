import React, { useEffect, useRef, useState } from 'react';
import { Panel, PanelHeader, CellButton, Group } from '@vkontakte/vkui';
import { Icon24Filter } from '@vkontakte/icons';
import { ChatCard } from '../components/ChatCard';
import { CategoryFilterModal } from '../components/CategoryFilterModal';
import { Loader } from '../components/Loader';
import { fetchCatalog, toggleLike } from '../services/api';
import type { ChatSummary } from '../types';

interface Props {
  id: string;
  onChatClick: (chatId: number) => void;
}

const SORT_OPTIONS = [
  { value: 'likes', label: 'По лайкам' },
  { value: 'activity', label: 'По активности' },
];

export const Catalog: React.FC<Props> = ({ id, onChatClick }) => {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [categories, setCategories] = useState<number[]>([]);
  const [sort, setSort] = useState('likes');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});
  const offsetRef = useRef(0);

  const load = async (reset: boolean) => {
    if (loading) return;
    setLoading(true);

    try {
      const data = await fetchCatalog(
        categories,
        sort,
        20,
        reset ? 0 : offsetRef.current,
      );
      if (reset) {
        setChats(data.items);
      } else {
        setChats((prev) => [...prev, ...data.items]);
      }
      setHasMore(data.items.length >= 20);
      offsetRef.current = reset ? data.items.length : offsetRef.current + data.items.length;
    } catch (e) {
      console.error('Catalog load error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    offsetRef.current = 0;
    load(true);
  }, [categories, sort]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop - target.clientHeight < 200 && hasMore && !loading) {
      load(false);
    }
  };

  const handleLike = async (chatId: number) => {
    try {
      const res = await toggleLike(chatId);
      setLikedMap((prev) => ({ ...prev, [chatId]: res.liked }));
      setChats((prev) =>
        prev.map((c) =>
          c.chat_id === chatId ? { ...c, likes_count: res.likes_count } : c,
        ),
      );
    } catch {
      console.error('Like error');
    }
  };

  return (
    <Panel id={id}>
      <PanelHeader>TwiBOT — Каталог</PanelHeader>
      <Group>
        <div style={{ padding: 12, display: 'flex', gap: 8 }}>
          <CellButton onClick={() => setModalOpen(true)} before={<Icon28FilterOutline />}>
            Фильтр
          </CellButton>
          {SORT_OPTIONS.map((o) => (
            <CellButton
              key={o.value}
              onClick={() => setSort(o.value)}
              style={{
                fontWeight: sort === o.value ? 600 : 400,
                color:
                  sort === o.value
                    ? 'var(--vkui--color_text_accent)'
                    : undefined,
              }}
            >
              {o.label}
            </CellButton>
          ))}
        </div>
        <div
          onScroll={handleScroll}
          style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 140px)', padding: '0 12px' }}
        >
          {chats.map((chat) => (
            <ChatCard
              key={chat.chat_id}
              chat={chat}
              liked={likedMap[chat.chat_id]}
              onLike={handleLike}
              onClick={onChatClick}
            />
          ))}
          {loading && <Loader />}
          {!hasMore && chats.length > 0 && (
            <div style={{ textAlign: 'center', padding: 16, color: 'var(--vkui--color_text_secondary)' }}>
              Все чаты загружены
            </div>
          )}
        </div>
      </Group>

      {modalOpen && (
        <CategoryFilterModal
          selected={categories}
          onChange={setCategories}
          onClose={() => setModalOpen(false)}
        />
      )}
    </Panel>
  );
};
