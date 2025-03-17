export {};

declare global {
  interface Window {
    api: {
      ping: () => Promise<string>;
      loadKey: (pin: string) => Promise<string>;
    };
  }
}