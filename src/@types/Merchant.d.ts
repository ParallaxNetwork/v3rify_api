declare type MerchantRegisterType = 'username' | 'wallet';

declare interface MerchantRegisterRequest {
  type: UserRegisterType;
  username: string;
  password: string;
}