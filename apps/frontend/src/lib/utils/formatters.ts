/* eslint-disable no-restricted-imports */
import { format } from 'date-fns';

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount);

const formatPercentage = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'percent',
        minimumFractionDigits: 2,
    }).format(amount);

const formatNumber = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'decimal',
        minimumFractionDigits: 2,
    }).format(amount);

// Date formatters
const formatDate = (date: Date, formatStr: string = 'PP') => format(date, formatStr);

export { formatCurrency, formatPercentage, formatNumber, formatDate };
