export const convertChainStringToId = (chain): number => {
  if (chain === 'ethereum') {
    return 1;
  } else if (chain === 'matic') {
    return 137;
  }else{
    throw new Error('Invalid chain');
  }
};
