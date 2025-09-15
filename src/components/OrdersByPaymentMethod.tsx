/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  getPaymentMethodStats,
  type PaymentMethodStat,
} from "../services/analyticsService";
import { useTranslation } from "react-i18next";
import { Doughnut } from "react-chartjs-2";

type Props = {
  startDate: Date;
  endDate: Date;
};

export default function OrdersByPaymentMethod({ startDate, endDate }: Props) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<PaymentMethodStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [printing, setPrinting] = useState(false);

  const s = useMemo(() => format(startDate, "yyyy-MM-dd"), [startDate]);
  const e = useMemo(() => format(endDate, "yyyy-MM-dd"), [endDate]);

  const currency = (n?: number) => `€${Number(n ?? 0).toFixed(2)}`;

  const prettyPaymentLabel = (pm: string | null | undefined) => {
    if (!pm) return t("component.OrdersByPaymentMethod.unknown");

    const map: Record<string, string> = {
      CASH_ON_DELIVERY: t("component.OrdersByPaymentMethod.cashOnDelivery"),
      MOLLIE_ONLINE: t("component.OrdersByPaymentMethod.onlinePayment"),
    };

    return (
      map[pm] ||
      pm
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase())
    );
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    getPaymentMethodStats(s, e)
      .then((arr) => {
        if (mounted) setRows(arr || []);
      })
      .catch(() => {
        if (mounted) setRows([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [s, e]);

  // Prepare data for the chart
  const chartData = {
    labels: rows.map((r) => prettyPaymentLabel(r.paymentMethod)),
    datasets: [
      {
        data: rows.map((r) => r.deliveredCount || 0),
        backgroundColor: [
          "rgba(54, 162, 235, 0.8)",
          "rgba(249, 115, 22, 0.9)",
          "rgba(255, 159, 64, 0.8)",
          "rgba(153, 102, 255, 0.8)",
          "rgba(255, 99, 132, 0.8)",
          "rgba(201, 203, 207, 0.8)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 0.8)",
          "rgba(249, 115, 22, 0.9)",
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
        position: (window.innerWidth < 1024 ? "bottom" : "right") as
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

  const buildHtml = (data: PaymentMethodStat[]) => {
    const delivered = (data || []).filter((d) => (d?.deliveredCount ?? 0) > 0);

    const rangePretty = `${format(startDate, "dd.MM.yyyy")} – ${format(
      endDate,
      "dd.MM.yyyy"
    )}`;

    const totalDeliveredCount = delivered.reduce(
      (sum, x) => sum + (x.deliveredCount ?? 0),
      0
    );
    const totalDeliveredRevenue = delivered.reduce(
      (sum, x) => sum + (x.deliveredRevenue ?? 0),
      0
    );

    const rowsHtml = delivered
      .map((r) => {
        const label = prettyPaymentLabel(r.paymentMethod);
        return `
          <tr>
            <td>${label}</td>
            <td style="text-align:center;">${r.deliveredCount}</td>
            <td style="text-align:right;">${currency(r.deliveredRevenue)}</td>
          </tr>
        `;
      })
      .join("");

    return `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color:#111; }
            .header { text-align: center; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; }
            .info { margin-bottom: 16px; text-align:center; color:#444; }
            .section { margin-top: 16px; }
            .section-title { font-weight: bold; font-size: 18px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #e5e7eb; padding: 10px; font-size: 14px; }
            th { background-color: #f8fafc; text-align: left; }
            .totals { margin-top: 12px; display:flex; justify-content:flex-end; gap:18px; }
            .pill { display:inline-block; background:#f3f4f6; border:1px solid #e5e7eb; padding:6px 10px; border-radius:999px; font-size:12px; color:#374151; }
            .foot { margin-top: 16px; font-size: 11px; color:#6b7280; text-align:center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Rechnung nach Zahlungsmethode</div>
          </div>

          <div class="info">
            <div><strong>Zeitraum:</strong> ${rangePretty}</div>
            <div><strong>Umfang:</strong> Nur gelieferte Bestellungen</div>
          </div>

          <div class="section">
            <div class="section-title">Übersicht</div>
            <table>
              <thead>
                <tr>
                  <th>Zahlungsmethode</th>
                  <th style="text-align:center;">Gelieferte Bestellungen</th>
                  <th style="text-align:right;">Gelieferter Umsatz</th>
                </tr>
              </thead>
              <tbody>
                ${
                  rowsHtml ||
                  `
                  <tr>
                    <td colspan="3" style="text-align:center; color:#6b7280;">Keine gelieferten Bestellungen in diesem Zeitraum.</td>
                  </tr>
                `
                }
              </tbody>
            </table>

            <div class="totals">
              <span class="pill">Geliefert: ${totalDeliveredCount}</span>
              <span class="pill">Gesamt: ${currency(
                totalDeliveredRevenue
              )}</span>
            </div>
          </div>

          <div class="foot">
            Erstellt am ${new Date().toLocaleString("de-DE")}
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = async () => {
    try {
      setPrinting(true);
      const html = buildHtml(rows);

      // Create a new window for printing
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();

        // Wait for content to load before printing
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
          setPrinting(false);
        };
      }
    } catch (error: any) {
      alert(error?.message ?? "Bericht konnte nicht erstellt werden.");
      setPrinting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
        <h2 className="text-lg font-bold text-gray-800 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-600 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          {t("component.OrdersByPaymentMethod.title")}
        </h2>
        <span className="text-gray-500 text-sm">
          {format(startDate, "MMM dd, yyyy")} –{" "}
          {format(endDate, "MMM dd, yyyy")}
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : rows.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          {t("component.OrdersByPaymentMethod.noData")}
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Section */}
          <div className="lg:order-2">
            <div className="h-64 md:h-72 lg:h-80">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Data Section */}
          <div className="lg:order-1 space-y-3">
            {rows.map((r, i) => {
              const label = prettyPaymentLabel(r.paymentMethod);
              return (
                <div
                  key={`${r.paymentMethod}-${i}`}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg ${
                    i % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } border border-gray-100 gap-2 sm:gap-0`}
                >
                  {/* Left: label */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                      {label}
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">
                      {t("component.OrdersByPaymentMethod.totalOrders", {
                        count: r.totalCount,
                      })}
                    </p>
                  </div>

                  {/* Right: delivered + total € (delivered) */}
                  <div className="text-right">
                    <p className="text-green-600 font-semibold text-sm sm:text-base">
                      {t("component.OrdersByPaymentMethod.delivered", {
                        count: r.deliveredCount,
                      })}
                    </p>
                    <p className="text-gray-700 text-sm sm:text-base">
                      {t("component.OrdersByPaymentMethod.totalAmountPrefix")}
                      {Number(r.deliveredRevenue ?? 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Print/Share PDF button */}
      <div className="mt-6">
        <button
          onClick={handlePrint}
          disabled={printing || loading}
          className={`w-full flex items-center justify-center py-2 sm:py-3 px-4 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
            printing || loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 sm:h-5 sm:w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          {printing
            ? t("component.OrdersByPaymentMethod.generatePdfPreparing")
            : t("component.OrdersByPaymentMethod.generatePdf")}
        </button>

        {/* Small caption with the chosen dates */}
        <p className="text-center mt-3 text-gray-500 text-xs sm:text-sm">
          {format(startDate, "MMM dd, yyyy")} –{" "}
          {format(endDate, "MMM dd, yyyy")}
        </p>
      </div>
    </div>
  );
}
