import React, { useState, useEffect } from 'react';
import { View } from '@vkontakte/vkui';
import { Catalog } from './panels/Catalog';
import { ChatDetailsPanel } from './panels/ChatDetails';
import { EditDescriptionForm } from './panels/EditDescriptionForm';
import { getUserId, saveUserId } from './utils/getUserId';

type PanelView = 'catalog' | 'chat' | 'edit';

export const App: React.FC = () => {
  const [activePanel, setActivePanel] = useState<PanelView>('catalog');
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    getUserId().then((id) => {
      if (id) saveUserId(id);
    });

    const params = new URLSearchParams(window.location.search);
    const chatIdParam = params.get('chat_id');
    if (chatIdParam) {
      const cid = Number(chatIdParam);
      if (cid > 0) {
        setSelectedChatId(cid);
        setActivePanel('chat');
      }
    }
  }, []);

  const openChat = (chatId: number) => {
    setSelectedChatId(chatId);
    setActivePanel('chat');
  };

  const closeChat = () => {
    setSelectedChatId(null);
    setActivePanel('catalog');
  };

  const openEditDescription = (chatId: number) => {
    setEditDescription('');
    setActivePanel('edit');
  };

  const closeEdit = () => {
    setActivePanel('chat');
  };

  const savedEdit = () => {
    setActivePanel('chat');
  };

  return (
    <View activePanel={activePanel}>
      <Catalog id="catalog" onChatClick={openChat} />
      <ChatDetailsPanel
        id="chat"
        chatId={selectedChatId}
        onBack={closeChat}
        onEditDescription={openEditDescription}
      />
      <EditDescriptionForm
        id="edit"
        chatId={selectedChatId}
        initialDescription={editDescription}
        onBack={closeEdit}
        onSaved={savedEdit}
      />
    </View>
  );
};
