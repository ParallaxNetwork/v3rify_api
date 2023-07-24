export const manyMinutesAgo = (minutes: number): Date => {
  const now = new Date();
  return new Date(now.getTime() - minutes * 60000);
};

// convert unix to date
export const unixToDate = (unix: number): Date => {
  return new Date(unix * 1000);
};

export function getTimeLimitByPeriod(period: 'today' | 'week' | 'month' | 'year'): Date {
  const timeLimit = new Date();

  switch (period) {
    case 'today':
      timeLimit.setHours(0, 0, 0, 0);
      break;
    case 'week':
      timeLimit.setDate(timeLimit.getDate() - 7);
      break;
    case 'month':
      timeLimit.setDate(timeLimit.getDate() - 30);
      break;
    case 'year':
      timeLimit.setDate(timeLimit.getDate() - 365);
      break;
    default:
      break;
  }

  return timeLimit;
}
