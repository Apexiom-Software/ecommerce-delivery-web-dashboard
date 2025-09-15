/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  getSalesByWeek,
  type SalesByWeekEntry,
} from "../services/analyticsService";
import { useTranslation } from "react-i18next";
import { format, startOfWeek, addDays } from "date-fns";

interface SalesByWeekProps {
  chartConfig: any;
}

export default function SalesByWeek({ chartConfig }: SalesByWeekProps) {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [data, setData] = useState<SalesByWeekEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSalesByWeek(selectedDate)
      .then((res) => setData(res.salesByWeek || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  // Generate week days if no data
  const weekStart = startOfWeek(new Date(selectedDate));
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i);
    return format(day, "EEE");
  });

  const labels = data.length > 0 ? data.map((entry) => entry.date) : weekDays;
  const values =
    data.length > 0 ? data.map((entry) => entry.revenue) : Array(7).fill(0);

  const responsiveChartOptions = {
    ...chartConfig,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      ...chartConfig.plugins,
      legend: {
        ...chartConfig.plugins?.legend,
        position: window.innerWidth < 768 ? "bottom" : "top",
      },
    },
    scales: {
      ...chartConfig.scales,
      x: {
        ...chartConfig.scales?.x,
        ticks: {
          maxRotation: window.innerWidth < 768 ? 45 : 0,
          minRotation: window.innerWidth < 768 ? 45 : 0,
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
      },
      y: {
        ...chartConfig.scales?.y,
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
          // Ajout du callback pour formater les valeurs avec le symbole €
          callback: function (value: any) {
            return "€" + value;
          },
        },
      },
    },
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: t("screens.analyticsScreens.analytics.revenue"),
        data: values,
        backgroundColor: "#21ba45",
        borderColor: "rgb(54, 109, 96)",
        borderWidth: 2,
        borderRadius: 5,
        barPercentage: window.innerWidth < 768 ? 0.6 : 0.8,
        categoryPercentage: 0.8,
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-3">
        <h2 className="text-lg font-bold text-gray-800">
          {t("screens.analyticsScreens.analytics.salesByWeek")}
        </h2>
        <div className="w-full md:w-auto">
          <label className="block text-sm font-medium text-gray-700 mb-1 md:sr-only">
            {t("screens.analyticsScreens.analytics.datePickers.selectWeek")}
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full md:w-auto p-2 border border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
            aria-label={t(
              "screens.analyticsScreens.analytics.datePickers.selectWeek"
            )}
          />
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="h-64 md:h-80 lg:h-96 relative">
          <Bar options={responsiveChartOptions} data={chartData} />
        </div>
      )}
    </div>
  );
}
