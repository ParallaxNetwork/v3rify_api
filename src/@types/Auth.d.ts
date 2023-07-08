import { SiweMessage } from "siwe";

export interface WalletLoginRequest {
  signature: string;
  address: string;
  message: SiweMessage
}

declare interface UsernameLoginRequest {
  username: string;
  password: string;
}

declare interface MerchantTokenSchema {
  id: string;
  type: 'username' | 'wallet';
}

declare interface GenerateMerchantTokenParams {
  type: 'username' | 'wallet';
  value: string;
}

declare interface DecodedToken {
  id: string;
  type: 'username' | 'wallet';
  seed: string;
}

