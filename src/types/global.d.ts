interface Navigator extends Navigator {
  standalone: boolean;
  userAgentData?: {
    platform: string;
  };
}
