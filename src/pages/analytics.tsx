import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  getTotalRevenue,
  getRevenueBetween,
  getAverageOrderValue,
  getTopCustomers,
  getSalesByHour,
  getSalesByDay,
  getMonthlySalesTrend,
  type TopCustomer,
  type SalesByHourEntry,
  type SalesByDayEntry,
  type MonthlySalesTrendEntry,
} from "../services/analyticsService";
import { useTranslation } from "react-i18next";
import SalesByWeek from "../components/SalesByWeek";
import OrdersByPaymentMethod from "../components/OrdersByPaymentMethod";
import SalesByHours from "../components/SalesByHours";
import OrderStatusChart from "../components/OrderStatusChart";
import Sidebar from "../components/SideBar";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const cardGradients = [
  ["#6366F1", "#A5B4FC"],
  ["#10B981", "#6EE7B7"],
  ["#F59E42", "#FDE68A"],
];
const cardIcons = ["💰", "📊", "🧾"];

export default function Analytics() {
  const { t } = useTranslation();
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [revenueBetween, setRevenueBetween] = useState<number | null>(null);
  const [averageOrderValue, setAverageOrderValue] = useState<number | null>(
    null
  );
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [salesByHour, setSalesByHour] = useState<SalesByHourEntry[]>([]);
  const [salesByDay, setSalesByDay] = useState<SalesByDayEntry[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlySalesTrendEntry[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [loadingSalesByHour, setLoadingSalesByHour] = useState(false);
  const [loadingSalesByDay, setLoadingSalesByDay] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedDay] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart" as const,
    },
    scales: {
      y: {
        ticks: {
          callback: function (value: number | string) {
            return `€${value}`;
          },
        },
      },
    },
  };

  useEffect(() => {
    getTotalRevenue()
      .then((r) => setTotalRevenue(r?.totalRevenue ?? 0))
      .catch(() => setTotalRevenue(0));
  }, []);

  useEffect(() => {
    getAverageOrderValue()
      .then((r) => setAverageOrderValue(r?.averageOrderValue ?? 0))
      .catch(() => setAverageOrderValue(0));
  }, []);

  useEffect(() => {
    getTopCustomers()
      .then((arr) => setTopCustomers(Array.isArray(arr) ? arr.slice(0, 5) : []))
      .catch(() => setTopCustomers([]));
  }, []);

  useEffect(() => {
    setLoadingSalesByHour(true);
    getSalesByHour(selectedDay)
      .then((r) =>
        setSalesByHour(Array.isArray(r?.salesByHour) ? r.salesByHour : [])
      )
      .catch(() => setSalesByHour([]))
      .finally(() => setLoadingSalesByHour(false));
  }, [selectedDay]);

  useEffect(() => {
    setLoadingSalesByDay(true);
    getSalesByDay(selectedDay)
      .then((r) =>
        setSalesByDay(Array.isArray(r?.salesByDay) ? r.salesByDay : [])
      )
      .catch(() => setSalesByDay([]))
      .finally(() => setLoadingSalesByDay(false));
  }, [selectedDay]);

  useEffect(() => {
    const s = format(startDate, "yyyy-MM-dd");
    const e = format(endDate, "yyyy-MM-dd");
    getRevenueBetween(s, e)
      .then((r) => setRevenueBetween(r?.revenue ?? 0))
      .catch(() => setRevenueBetween(0));
  }, [startDate, endDate]);

  useEffect(() => {
    getMonthlySalesTrend(year)
      .then((res) =>
        setMonthlyTrend(
          Array.isArray(res?.monthlySalesTrend) ? res.monthlySalesTrend : []
        )
      )
      .catch(() => setMonthlyTrend([]));
  }, [year]);

  useEffect(() => {
    const allLoaded =
      totalRevenue !== null &&
      averageOrderValue !== null &&
      revenueBetween !== null &&
      topCustomers.length >= 0 &&
      salesByHour.length >= 0 &&
      salesByDay.length >= 0 &&
      monthlyTrend.length >= 0;
    setLoading(!allLoaded);
  }, [
    totalRevenue,
    averageOrderValue,
    revenueBetween,
    topCustomers,
    salesByHour,
    salesByDay,
    monthlyTrend,
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-screen z-40 lg:z-auto">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      </div>

      <div
        className={`flex-1 flex flex-col transition-all duration-300 lg:ml-72 ${
          sidebarOpen ? "ml-72" : "ml-0"
        }`}
      >
        <header className="bg-white border-b border-gray-200 p-3 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden mr-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label={t("common.openMenu")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <div className="flex items-center">
                <h1 className="text-lg font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] md:max-w-none mr-2">
                  {t("sidebar.analytics")}
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center mb-6">
              <button
                onClick={() => window.history.back()}
                className="mr-4 text-gray-700 hover:text-gray-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                {t("screens.analyticsScreens.analytics.dashboardOverview")}
              </h1>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                {
                  title: t(
                    "screens.analyticsScreens.analytics.cards.totalRevenue"
                  ),
                  value: `€${totalRevenue?.toLocaleString()}`,
                  icon: cardIcons[0],
                  gradient: cardGradients[0],
                },
                {
                  title: t(
                    "screens.analyticsScreens.analytics.cards.avgOrderValue"
                  ),
                  value: `€${averageOrderValue?.toLocaleString()}`,
                  icon: cardIcons[1],
                  gradient: cardGradients[1],
                },
                {
                  title: t(
                    "screens.analyticsScreens.analytics.cards.customRevenue"
                  ),
                  value: `€${revenueBetween?.toLocaleString()}`,
                  icon: cardIcons[2],
                  gradient: cardGradients[2],
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="rounded-xl p-6 text-white shadow-lg transition-transform duration-300 hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${card.gradient[0]}, ${card.gradient[1]})`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{card.value}</p>
                      <p className="text-sm font-medium mt-1">{card.title}</p>
                    </div>
                    <span className="text-3xl">{card.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Date Range Pickers */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t(
                    "screens.analyticsScreens.analytics.datePickers.startDate"
                  )}
                </label>
                <input
                  type="date"
                  value={format(startDate, "yyyy-MM-dd")}
                  onChange={(e) => setStartDate(new Date(e.target.value))}
                  className="w-full p-3 border border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("screens.analyticsScreens.analytics.datePickers.endDate")}
                </label>
                <input
                  type="date"
                  value={format(endDate, "yyyy-MM-dd")}
                  onChange={(e) => setEndDate(new Date(e.target.value))}
                  className="w-full p-3 border border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Order Status Chart Component */}
            <OrderStatusChart startDate={startDate} endDate={endDate} />

            <div className="mb-6">
              <OrdersByPaymentMethod startDate={startDate} endDate={endDate} />
            </div>

            {/* Top Customers */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-yellow-500 mr-2">⭐</span>
                {t("screens.analyticsScreens.analytics.topCustomers")}
              </h2>
              {topCustomers.length ? (
                <div className="space-y-4">
                  {topCustomers.map((c, i) => (
                    <div
                      key={i}
                      className={`flex items-center p-4 rounded-lg ${
                        i === 0 ? "bg-yellow-50 shadow-sm" : "bg-gray-50"
                      }`}
                    >
                      <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white mr-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                          {c.user.firstname} {c.user.lastname}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-blue-600">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                              />
                            </svg>
                            <span className="text-sm">
                              {c.orderCount} {t("common.orders")}
                            </span>
                          </div>
                          <div className="flex items-center text-green-600">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="text-sm">
                              €{c.totalSpent.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {i === 0 && (
                        <span className="text-yellow-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  {t("screens.analyticsScreens.analytics.noCustomerData")}
                </p>
              )}
            </div>

            {/* Sales Charts */}
            {loadingSalesByHour ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm mb-6">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <SalesByHours chartConfig={chartOptions} />
            )}

            {loadingSalesByDay ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm mb-6">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <SalesByWeek chartConfig={chartOptions} />
            )}

            {/* Monthly Trend */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-800">
                  {t("screens.analyticsScreens.analytics.monthlySalesTrend")}
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("screens.analyticsScreens.analytics.datePickers.year")}
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="p-2 border border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Array.from({ length: 5 }, (_, i) => year - 2 + i).map(
                      (y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
              {monthlyTrend.length > 0 ? (
                <Line
                  options={chartOptions}
                  data={{
                    labels: monthlyTrend.map(
                      (item) =>
                        item?.month?.split?.(" ")[0]?.substring(0, 3) || ""
                    ),
                    datasets: [
                      {
                        label: t("screens.analyticsScreens.analytics.revenue"),
                        data: monthlyTrend.map((e) => e.revenue || 0),
                        borderColor: "rgb(91, 134, 229)",
                        backgroundColor: "rgba(91, 134, 229, 0.1)",
                        tension: 0.3,
                        fill: true,
                      },
                    ],
                  }}
                />
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {t("screens.analyticsScreens.analytics.noDataAvailable")}
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
