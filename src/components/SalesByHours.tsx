/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  getSalesByHour,
  type SalesByHourEntry,
} from "../services/analyticsService";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

interface SalesByHoursProps {
  chartConfig: any;
}

export default function SalesByHours({ chartConfig }: SalesByHoursProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [data, setData] = useState<SalesByHourEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    setLoading(true);
    getSalesByHour(selectedDate)
      .then((res) => setData(res.salesByHour || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  const hoursLabels = Array.from({ length: 24 }, (_, i) => `${i}h`);
  const revenueData = hoursLabels.map((label) => {
    const entry = data.find((e) => e.hour === label);
    return entry ? entry.revenue : 0;
  });

  // Adjust labels for better mobile display - show fewer labels on small screens
  const intervalLabels = hoursLabels.map((lbl, idx) =>
    idx % 3 === 0 ? lbl : ""
  );

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
    labels: intervalLabels,
    datasets: [
      {
        label: t("screens.analyticsScreens.analytics.revenue"),
        data: revenueData,
        borderColor: "rgb(67, 233, 123)",
        backgroundColor: "rgba(67, 233, 123, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "rgb(67, 233, 123)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(67, 233, 123)",
        pointRadius: window.innerWidth < 768 ? 3 : 4,
        pointHoverRadius: 6,
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-3">
        <h2 className="text-lg font-bold text-gray-800">
          {t("screens.analyticsScreens.analytics.salesByHour")}
        </h2>
        <div className="w-full md:w-auto">
          <label className="block text-sm font-medium text-gray-700 mb-1 md:sr-only">
            {t("screens.analyticsScreens.analytics.datePickers.selectDate")}
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
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
          <Line options={responsiveChartOptions} data={chartData} />
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 text-center text-sm md:text-base">
            {t("screens.analyticsScreens.analytics.noDataFor")} {selectedDate}
          </p>
        </div>
      )}
    </div>
  );
}
