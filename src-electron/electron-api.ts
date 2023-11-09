export interface ElectronApi {
  auth: (url: string) => Promise<{ redirectUrl: string }>;
}
