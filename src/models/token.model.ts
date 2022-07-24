export interface Token {
  id: string;
  token: string;
  permissions: 'read' | 'write';
}
