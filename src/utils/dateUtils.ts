export const manyMinutesAgo = (minutes: number):Date => {
  const now = new Date();
  return new Date(now.getTime() - minutes * 60000);
}

// convert unix to date
export const unixToDate = (unix: number):Date => {
  return new Date(unix * 1000);
}