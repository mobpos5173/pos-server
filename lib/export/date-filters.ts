import { DateRange, Transaction } from "@/types";
import {
  subDays,
  subWeeks,
  subMonths,
  subYears,
  startOfDay,
  endOfDay,
  isWithinInterval,
} from "date-fns";

export const getDateRange = (
  dateRange: DateRange
): { startDate: Date; endDate: Date } => {
  const now = new Date();
  let startDate: Date;
  let endDate = endOfDay(now);

  switch (dateRange) {
    case "daily":
      startDate = startOfDay(now);
      break;
    case "yesterday":
      startDate = startOfDay(subDays(now, 1));
      endDate = endOfDay(subDays(now, 1));
      break;
    case "week":
      startDate = subWeeks(now, 1);
      break;
    case "month":
      startDate = subMonths(now, 1);
      break;
    case "3months":
      startDate = subMonths(now, 3);
      break;
    case "annual":
      startDate = subYears(now, 1);
      break;
    default:
      startDate = subWeeks(now, 1);
  }

  return { startDate, endDate };
};

export const filterTransactionsByDate = (
  transactions: Transaction[],
  dateRange: DateRange
) => {
  const { startDate, endDate } = getDateRange(dateRange);

  return transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.dateOfTransaction);
    return isWithinInterval(transactionDate, {
      start: startDate,
      end: endDate,
    });
  });
};
