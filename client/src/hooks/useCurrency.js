import { useSelector } from 'react-redux';
import { formatCurrency } from '../utils/formatters';

export const useCurrency = () => {
  const settings = useSelector((state) => state.settings?.settings);
  const defaultCurrency = settings?.defaultCurrency || 'USD';
  const currencySymbol = settings?.currencySymbol || '$';

  const format = (amount, currency = defaultCurrency) => {
    return formatCurrency(amount, currency);
  };

  return {
    currency: defaultCurrency,
    symbol: currencySymbol,
    format,
  };
};

