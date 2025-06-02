declare module '@react-native-community/netinfo' {
  export interface NetInfoState {
    isConnected: boolean;
    isInternetReachable?: boolean;
    details?: any;
    type?: string;
  }
  const NetInfo: {
    fetch(): Promise<NetInfoState>;
    addEventListener(
      handler: (state: NetInfoState) => void
    ): () => void;
  };
  export default NetInfo;
} 