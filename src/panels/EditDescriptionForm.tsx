import React, { useState } from 'react';
import {
  Panel,
  PanelHeader,
  PanelHeaderBack,
  Group,
  FormItem,
  Textarea,
  Button,
  Snackbar,
} from '@vkontakte/vkui';
import { updateDescription } from '../services/api';

interface Props {
  id: string;
  chatId: number | null;
  initialDescription: string;
  onBack: () => void;
  onSaved: () => void;
}

export const EditDescriptionForm: React.FC<Props> = ({
  id,
  chatId,
  initialDescription,
  onBack,
  onSaved,
}) => {
  const [text, setText] = useState(initialDescription);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<React.ReactNode>(null);
  const MAX = 1000;

  const handleSave = async () => {
    if (!chatId) return;
    if (text.length > MAX) {
      setSnackbar(
        <Snackbar onClose={() => setSnackbar(null)}>
          Описание не может быть длиннее {MAX} символов
        </Snackbar>,
      );
      return;
    }
    setSaving(true);
    try {
      await updateDescription(chatId, text);
      setSnackbar(
        <Snackbar onClose={() => setSnackbar(null)}>Описание сохранено</Snackbar>,
      );
      onSaved();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Ошибка сохранения';
      setSnackbar(<Snackbar onClose={() => setSnackbar(null)}>{msg}</Snackbar>);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={onBack} />}>
        Редактировать описание
      </PanelHeader>
      <Group>
        <div style={{ padding: 16 }}>
          <FormItem
            top={`Описание (${text.length}/${MAX})`}
            status={text.length > MAX ? 'error' : 'default'}
          >
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
            />
          </FormItem>
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={text.length > MAX || text === initialDescription}
            stretched
            style={{ marginTop: 16 }}
          >
            Сохранить
          </Button>
        </div>
      </Group>
      {snackbar}
    </Panel>
  );
};
