import dayjs from 'dayjs';

export const formatNumber = (num: number, decimals = 2): string => {
  if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
  if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
  if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
  return num.toFixed(decimals);
};

export const formatCurrency = (
  num: number,
  currency = 'USD',
  decimals = 2,
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatPercent = (num: number, decimals = 2): string => {
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(decimals)}%`;
};

export const formatDate = (
  date: string | Date,
  fmt = 'YYYY-MM-DD HH:mm:ss',
): string => {
  return dayjs(date).format(fmt);
};
