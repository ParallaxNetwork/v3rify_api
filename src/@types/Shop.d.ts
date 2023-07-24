declare interface ShopCreateRequest {
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
}

interface PeriodicTotal {
  value: 'today' | 'week' | 'month' | 'year';
  total: number;
}

interface ShopAnalytics {
  totalClaimed: {
    total: number;
    periodicTotal: PeriodicTotal[];
    totalAddressClaimed: number;
  };
}