import React, { useState } from 'react';
import {
  ModalPage,
  ModalPageHeader,
  PanelHeaderButton,
  CellButton,
  Separator,
} from '@vkontakte/vkui';
import { Icon28CancelOutline } from '@vkontakte/icons';
import { CATEGORIES } from '../types';

interface Props {
  selected: number[];
  onChange: (ids: number[]) => void;
  onClose: () => void;
}

export const CategoryFilterModal: React.FC<Props> = ({
  selected,
  onChange,
  onClose,
}) => {
  const [local, setLocal] = useState<number[]>([...selected]);

  const toggle = (id: number) => {
    if (local.includes(id)) {
      setLocal(local.filter((x) => x !== id));
    } else if (local.length < 3) {
      setLocal([...local, id]);
    }
  };

  const apply = () => {
    onChange(local);
    onClose();
  };

  return (
    <ModalPage
      header={
        <ModalPageHeader
          after={
            <PanelHeaderButton onClick={onClose}>
              <Icon28CancelOutline />
            </PanelHeaderButton>
          }
        >
          Категории
        </ModalPageHeader>
      }
      onClose={onClose}
    >
      <div style={{ padding: 16 }}>
        {CATEGORIES.map((cat) => {
          const active = local.includes(cat.id);
          return (
            <React.Fragment key={cat.id}>
              <CellButton
                onClick={() => toggle(cat.id)}
                style={{
                  fontWeight: active ? 600 : 400,
                  color: active
                    ? 'var(--vkui--color_text_accent)'
                    : undefined,
                }}
              >
                {active ? '✅ ' : ''}
                {cat.name}
              </CellButton>
              <Separator />
            </React.Fragment>
          );
        })}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <CellButton onClick={apply} centered>
            Применить
          </CellButton>
          <CellButton onClick={onClose} centered>
            Отмена
          </CellButton>
        </div>
      </div>
    </ModalPage>
  );
};
