"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";
import { useMemo } from "react";
import jsPDF from "jspdf";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

type SeriesPoint = {
  date: string;
  income: number;
  expense: number;
};

type ChartsProps = {
  pieData: Record<string, number>;
  lineData: SeriesPoint[];
  from: string;
  to: string;
};

export default function Charts({ pieData, lineData, from, to }: ChartsProps) {
  const pie = useMemo(() => {
    const labels = Object.keys(pieData);
    return {
      labels,
      datasets: [
        {
          data: labels.map((label) => pieData[label]),
          backgroundColor: [
            "#60a5fa",
            "#34d399",
            "#f472b6",
            "#fbbf24",
            "#a78bfa",
            "#fb7185",
          ],
        },
      ],
    };
  }, [pieData]);

  const line = useMemo(
    () => ({
      labels: lineData.map((point) => point.date),
      datasets: [
        {
          label: "Income",
          data: lineData.map((point) => point.income),
          borderColor: "#10b981",
          backgroundColor: "rgba(16,185,129,0.2)",
          tension: 0.3,
          fill: true,
        },
        {
          label: "Expense",
          data: lineData.map((point) => point.expense),
          borderColor: "#f43f5e",
          backgroundColor: "rgba(244,63,94,0.2)",
          tension: 0.3,
          fill: true,
        },
      ],
    }),
    [lineData]
  );

  function exportPdf() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Finance Summary Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`Period: ${from} to ${to}`, 14, 30);

    let y = 40;
    lineData.forEach((row) => {
      doc.text(
        `${row.date} | Income: ${row.income.toFixed(2)} | Expense: ${row.expense.toFixed(
          2
        )}.`,
        14,
        y
      );
      y += 7;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`finance-report-${from}-to-${to}.pdf`);
  }

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Income vs expense
          </h2>
          <button
            onClick={exportPdf}
            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-brand-400 hover:text-brand-600"
          >
            Export PDF
          </button>
        </div>
        <div className="mt-4 h-72">
          <Line data={line} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Spending by category
        </h2>
        <div className="mt-4 h-72">
          <Pie data={pie} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
    </section>
  );
}
