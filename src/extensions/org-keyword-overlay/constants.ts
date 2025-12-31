export const SUPPORTED_KEYWORDS = ['title', 'author', 'date', 'email', 'description'] as const;

export type SupportedKeyword = (typeof SUPPORTED_KEYWORDS)[number];

export const KEYWORD_PLACEHOLDERS: Record<SupportedKeyword, string> = {
  title: 'Untitled',
  author: 'Author name',
  date: 'Date',
  email: 'Email',
  description: 'Description',
};
