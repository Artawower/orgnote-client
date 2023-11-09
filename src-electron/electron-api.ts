export interface ElectronApi {
  auth: (url: string) => Promise<{ redirectUrl: string }>;
  minimize: () => void;
  toggleMaximize: () => void;
  close: () => void;
}
