export interface ChatSummary {
  chat_id: number;
  title: string | null;
  categories: string[];
  description: string;
  likes_count: number;
}

export interface ChatDetail {
  chat_id: number;
  title: string | null;
  invite_link: string | null;
  description: string;
  categories: string[];
  likes_count: number;
}

export interface LikeResponse {
  liked: boolean;
  likes_count: number;
}

export interface CatalogResponse {
  items: ChatSummary[];
}

export interface ReportResponse {
  status: string;
  message: string;
}

export const CATEGORIES: { id: number; name: string }[] = [
  { id: 1, name: 'Игры' },
  { id: 2, name: 'Фильмы' },
  { id: 3, name: 'Сериалы' },
  { id: 4, name: 'Аниме' },
  { id: 5, name: 'Музыка' },
  { id: 6, name: 'Спорт' },
  { id: 7, name: 'Политика' },
  { id: 8, name: '18+' },
  { id: 9, name: 'Ролевые' },
  { id: 10, name: 'Книги' },
];
