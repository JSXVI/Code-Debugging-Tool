export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64 encoded image
  timestamp: number;
  groundingMetadata?: {
    groundingChunks?: Array<{
      web?: {
        uri?: string;
        title?: string;
      };
    }>;
  };
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}
