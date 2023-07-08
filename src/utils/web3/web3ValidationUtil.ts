import { isAddress } from 'web3-validator';

export const validateAddress = (address: string): boolean => {
  return isAddress(address);
};
