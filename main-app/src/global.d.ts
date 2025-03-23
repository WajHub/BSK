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
      signFile: (file: string | ArrayBuffer | null | undefined) => Promise<Message>;
      verifyFile: (file: string | ArrayBuffer | null | undefined) => Promise<Message>;
    };
  }
}