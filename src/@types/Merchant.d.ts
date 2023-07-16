declare type MerchantRegisterType = 'username' | 'wallet';

declare interface MerchantRegisterRequest {
  type: MerchantRegisterType;
  username: string;
  password: string;
}