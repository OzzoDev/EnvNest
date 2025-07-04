export type Session = {
  state: string;
  code?: string;
};

const sessions = new Map<string, Session>();

export { sessions };
