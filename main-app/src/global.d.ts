export {};

declare global {
  interface Window {
    api: {
      ping: () => Promise<string>;
      loadKey: (pin: string) => Promise< {state: string, message: string, data: string}>;
    };
  }
}