import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  getOrderStatusCounts,
  type OrderStatusCount,
} from "../services/analyticsService";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

interface OrderStatusChartProps {
  startDate: Date;
  endDate: Date;
}

export default function OrderStatusChart({
  startDate,
  endDate,
}: OrderStatusChartProps) {
  const { t } = useTranslation();
  const [statusCounts, setStatusCounts] = useState<OrderStatusCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = format(startDate, "yyyy-MM-dd");
    const e = format(endDate, "yyyy-MM-dd");

    setLoading(true);
    getOrderStatusCounts(s, e)
      .then((arr) => setStatusCounts(Array.isArray(arr) ? arr : []))
      .catch(() => setStatusCounts([]))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  // Filter only relevant statuses for the chart
  const relevantStatuses = statusCounts.filter((st) =>
    [
      "DELIVERED",
      "FAILED",
      "CANCELLED",
      "PAID",
      "ACCEPTED",
      "ON_THE_WAY",
    ].includes(st.status)
  );

  const chartData = {
    labels: relevantStatuses.map((st) =>
      t(`screens.analyticsScreens.analytics.statuses.${st.status}`)
    ),
    datasets: [
      {
        data: relevantStatuses.map((st) => st.count || 0),
        backgroundColor: [
          "rgba(239, 68, 68, 0.9)", // FAILED - Rouge chaud (proche orange-rouge)
          "rgba(34, 197, 94, 0.9)", // DELIVERED - Vert équilibrant
          "rgba(253, 224, 71, 0.9)", // CANCELLED - Jaune lumineux (harmonie avec sidebar)
          "rgba(59, 130, 246, 0.9)", // PAID - Bleu doux, accent contrastant
          "rgba(168, 85, 247, 0.9)", // ACCEPTED - Violet moderne
          "rgba(249, 115, 22, 0.9)", // ON_THE_WAY - Orange vif (lié à la sidebar)
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(255, 205, 86, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: (window.innerWidth < 768 ? "bottom" : "right") as
          | "bottom"
          | "right",
        labels: {
          boxWidth: 12,
          padding: 15,
          usePointStyle: true,
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
      },
    },
    cutout: window.innerWidth < 768 ? "50%" : "60%",
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          {t("screens.analyticsScreens.analytics.orderStatus")}
        </h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        {t("screens.analyticsScreens.analytics.orderStatus")}
      </h2>

      {relevantStatuses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <div className="h-64 md:h-72 lg:h-80">
            <Doughnut data={chartData} options={chartOptions} />
          </div>

          {/* Status badges */}
          <div className="flex flex-wrap gap-2 sm:gap-3 items-start justify-center lg:justify-start">
            {relevantStatuses.map((st, i) => {
              const badgeColors = {
                DELIVERED: { bg: "bg-green-100", color: "text-green-800" },
                FAILED: { bg: "bg-red-100", color: "text-red-800" },
                CANCELLED: { bg: "bg-yellow-100", color: "text-yellow-800" },
                PAID: { bg: "bg-blue-100", color: "text-blue-800" },
                ACCEPTED: { bg: "bg-purple-100", color: "text-purple-800" },
                ON_THE_WAY: { bg: "bg-orange-100", color: "text-orange-800" },
              }[st.status] || { bg: "bg-gray-100", color: "text-gray-800" };

              return (
                <span
                  key={i}
                  className={`${badgeColors.bg} ${badgeColors.color} px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium flex items-center`}
                >
                  <span
                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-1 sm:mr-2 flex-shrink-0"
                    style={{
                      backgroundColor: chartData.datasets[0].backgroundColor[
                        i
                      ] as string,
                    }}
                  ></span>
                  <span className="truncate">
                    {t(
                      `screens.analyticsScreens.analytics.statuses.${st.status}`
                    )}{" "}
                    ({st.count})
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 text-center text-sm md:text-base">
            {t("screens.analyticsScreens.analytics.noDataAvailable")}
          </p>
        </div>
      )}
    </div>
  );
}
