import { SERVER_IP } from "../../constants/constants";
import axios from "axios";
import { store } from "../app/redux/store";
import { format } from "date-fns";

export const api = axios.create({
  baseURL: SERVER_IP,
  headers: { "Content-Type": "application/json" },
});

// Interfaces for API responses
export interface TotalRevenueResponse {
  totalRevenue: number;
}

export interface User {
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  gender: string;
  id: number;
}

export interface TopCustomer {
  totalSpent: number;
  orderCount: number;
  user: User;
}

export interface TopCustomersResponse {
  slice(
    arg0: number,
    arg1: number
  ): import("react").SetStateAction<TopCustomer[]>;
  users: TopCustomer[];
}

export interface SalesByHourEntry {
  revenue: number;
  hour: string;
  orderCount: number;
}

export interface SalesByHourResponse {
  salesByHour: SalesByHourEntry[];
}

export interface SalesByDayEntry {
  dayOfWeek: string;
  revenue: number;
  day: string;
  orderCount: number;
}

export interface SalesByDayResponse {
  salesByDay: SalesByDayEntry[];
}

export interface MonthlySalesTrendEntry {
  revenue: number;
  month: string;
  orderCount: number;
}

export interface MonthlySalesTrendResponse {
  monthlySalesTrend: MonthlySalesTrendEntry[];
}

export interface AverageOrderValueResponse {
  averageOrderValue: number;
}

export interface SalesByWeekEntry {
  date: string; // formatted "dd MMM"
  orderCount: number;
  revenue: number;
}

export interface OrderStatusCount {
  status: string;
  count: number;
}

export interface SalesByWeekResponse {
  salesByWeek: SalesByWeekEntry[];
}

export type PaymentMethodStat = {
  paymentMethod: string; // e.g. "CASH_ON_DELIVERY" | "MOLLIE_ONLINE"
  deliveredCount: number; // delivered orders count
  totalCount: number; // all orders in range
  totalRevenue: number; // € total of all orders in range
  deliveredRevenue: number; // € total of delivered orders in range
};

// Helper to get auth header
const getAuthHeader = () => {
  const token = store.getState().auth.accessToken;
  if (!token) {
    throw new Error("No access token found. Please log in.");
  }
  return { Authorization: `Bearer ${token}` };
};

// Analytics Service

/**
 * Fetch total revenue
 */
export const getTotalRevenue = async (): Promise<TotalRevenueResponse> => {
  const response = await axios.get<TotalRevenueResponse>(
    `${SERVER_IP}/api/v1/orders/total-revenue`,
    { headers: { ...getAuthHeader() } }
  );
  return response.data;
};

/**
 * Fetch revenue breakdown by payment method between two dates (inclusive)
 */
export async function getPaymentMethodStats(
  start: string,
  end: string
): Promise<PaymentMethodStat[]> {
  const { data } = await api.get("/api/v1/orders/payment-method-stats", {
    params: { start, end },
    headers: { ...getAuthHeader() },
  });
  return Array.isArray(data) ? data : [];
}

/**
 * Fetch total revenue between two dates (inclusive)
 */
export const getRevenueBetween = async (
  start: Date | string,
  end: Date | string
): Promise<{ revenue: number }> => {
  // ensure dates are yyyy‑MM‑dd strings
  const formattedStart =
    typeof start === "string" ? start : format(start, "yyyy-MM-dd");
  const formattedEnd =
    typeof end === "string" ? end : format(end, "yyyy-MM-dd");

  const response = await axios.get<{ revenue: number }>(
    `${SERVER_IP}/api/v1/orders/revenue`,
    {
      headers: { ...getAuthHeader() },
      params: {
        start: formattedStart,
        end: formattedEnd,
      },
    }
  );
  return response.data;
};

/**
 * Fetch top customers
 */
export const getTopCustomers = async (): Promise<TopCustomersResponse> => {
  const response = await axios.get<TopCustomersResponse>(
    `${SERVER_IP}/api/v1/orders/topCustomers`,
    { headers: { ...getAuthHeader() } }
  );
  return response.data;
};

/**
 * Fetch sales by hour
 */
export const getSalesByHour = async (
  day: string
): Promise<SalesByHourResponse> => {
  // Optionally ensure the date is formatted as yyyy-MM-dd:
  // const formattedDay = format(new Date(day), 'yyyy-MM-dd');
  const response = await axios.get<SalesByHourEntry[]>(
    `${SERVER_IP}/api/v1/orders/sales-by-hour`,
    {
      headers: { ...getAuthHeader() },
      params: { day },
    }
  );
  // Backend returns the bare array, so wrap it:
  return { salesByHour: response.data };
};

/**
 * Fetch sales by day
 */
export const getSalesByDay = async (
  day: string
): Promise<SalesByDayResponse> => {
  const response = await axios.get<SalesByDayResponse>(
    `${SERVER_IP}/api/v1/orders/sales-by-day`,
    {
      headers: { ...getAuthHeader() },
      params: { day },
    }
  );
  return response.data;
};
/**
 * get orders cound between two dates
 */
export const getOrderCountBetween = async (
  start: string,
  end: string
): Promise<{ orderCount: number }> => {
  const response = await axios.get<{ orderCount: number }>(
    `${SERVER_IP}/api/v1/orders/count-between-dates`,
    {
      headers: { ...getAuthHeader() },
      params: { start, end },
    }
  );
  return response.data;
};

/**
 * Fetch monthly sales trend for a full calendar year
 */
export const getMonthlySalesTrend = async (
  year: number | string
): Promise<MonthlySalesTrendResponse> => {
  const response = await axios.get<MonthlySalesTrendResponse>(
    `${SERVER_IP}/api/v1/orders/monthly-sales-trend`,
    {
      headers: { ...getAuthHeader() },
      params: { year }, // <-- now sending `year`, not `month`
    }
  );
  return response.data;
};

/**
 * Fetch average order value
 */
export const getAverageOrderValue =
  async (): Promise<AverageOrderValueResponse> => {
    const response = await axios.get<AverageOrderValueResponse>(
      `${SERVER_IP}/api/v1/orders/average`,
      { headers: { ...getAuthHeader() } }
    );
    return response.data;
  };

/**
 * Order frequency
 */
export const getCustomerOrderFrequency = async (): Promise<
  Array<{ user: User; orderCount: number }>
> => {
  const response = await axios.get(
    `${SERVER_IP}/api/v1/orders/customerOrderFrequency`,
    { headers: { ...getAuthHeader() } }
  );
  return response.data;
};

/**
 * Orders count by status
 */

export const getOrderStatusCounts = async (
  start: string,
  end: string
): Promise<OrderStatusCount[]> => {
  const response = await axios.get<OrderStatusCount[]>(
    `${SERVER_IP}/api/v1/orders/count-by-status`,
    {
      headers: { ...getAuthHeader() },
      params: { start, end },
    }
  );
  return response.data;
};

/**
 * Fetch sales for the week containing `anyDateInWeek` (Mon→Sun)
 */
export const getSalesByWeek = async (
  anyDateInWeek: string // YYYY-MM-DD
): Promise<SalesByWeekResponse> => {
  const resp = await axios.get<{ salesByWeek: SalesByWeekEntry[] }>(
    `${SERVER_IP}/api/v1/orders/sales-by-week`,
    { headers: getAuthHeader(), params: { anyDateInWeek } }
  );

  const raw = resp.data.salesByWeek || [];
  // console.log("Sales by week response:", raw);
  // compute this week's Monday
  const monday = startOfWeek(parseISO(anyDateInWeek), { weekStartsOn: 1 });

  // build Mon→Sun
  const week = Array.from({ length: 7 }).map((_, idx) => {
    const dateObj = addDays(monday, idx);
    const label = format(dateObj, "dd MMM");
    const found = raw.find((e) => e.date === label);
    return found ? found : { date: label, orderCount: 0, revenue: 0 };
  });

  return { salesByWeek: week };
};

function startOfWeek(date: Date, options: { weekStartsOn: number }): Date {
  const day = date.getDay();
  const diff =
    (day < options.weekStartsOn ? 7 : 0) + day - options.weekStartsOn;
  const result = new Date(date);
  result.setDate(date.getDate() - diff);
  return result;
}

function parseISO(dateString: string): Date {
  const parsedDate = new Date(dateString);
  if (isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date string");
  }
  return parsedDate;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
