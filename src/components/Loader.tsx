import React from 'react';
import { Spinner } from '@vkontakte/vkui';

export const Loader: React.FC = () => (
  <Spinner size="large" style={{ margin: '24px auto' }} />
);
