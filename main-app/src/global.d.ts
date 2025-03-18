export {};

declare global {
  interface Message {
    state: string;
    message: string;
    data: string;
  }
  interface Window {
    api: {
      ping: () => Promise<string>;
      loadKey: (pin: string) => Promise< Message>;
      signFile: (file: FileReader | null) => Promise<Message>;
    };
  }
}