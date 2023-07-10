export const manyMinutesAgo = (minutes: number):Date => {
  const now = new Date();
  return new Date(now.getTime() - minutes * 60000);
}