/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  getSalesByDay,
  type SalesByDayEntry,
} from "../services/analyticsService";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

interface SalesByDayProps {
  chartConfig: any;
}

export default function SalesByDay({ chartConfig }: SalesByDayProps) {
  const [selectedDay, setSelectedDay] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [data, setData] = useState<SalesByDayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    setLoading(true);
    getSalesByDay(selectedDay)
      .then((res) => {
        if (res?.salesByDay) {
          setData(res.salesByDay);
        } else {
          setData([]);
        }
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [selectedDay]);

  const labels = data.map((entry) => entry.dayOfWeek || "N/A");
  const values = data.map((entry) => entry.revenue || 0);

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
        backgroundColor: "rgba(167, 112, 239, 0.6)",
        borderColor: "rgb(167, 112, 239)",
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
          {t("screens.analyticsScreens.analytics.salesByDay")}
        </h2>
        <div className="w-full md:w-auto">
          <label className="block text-sm font-medium text-gray-700 mb-1 md:sr-only">
            {t("screens.analyticsScreens.analytics.datePickers.selectDate")}
          </label>
          <input
            type="date"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="w-full md:w-auto p-2 border border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
            aria-label={t(
              "screens.analyticsScreens.analytics.datePickers.selectDate"
            )}
          />
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : data.length > 0 ? (
        <div className="h-64 md:h-80 lg:h-96 relative">
          <Bar options={responsiveChartOptions} data={chartData} />
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 text-center text-sm md:text-base">
            {t("screens.analyticsScreens.analytics.noDataFor")} {selectedDay}
          </p>
        </div>
      )}
    </div>
  );
}
