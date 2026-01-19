"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

type DonutChartProps = {
  labels: string[];
  values: number[];
  title: string;
};

export default function DonutChart({ labels, values, title }: DonutChartProps) {
  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-slate-50">{title}</h2>
      <div className="mt-4 h-64">
        <Doughnut
          data={{
            labels,
            datasets: [
              {
                data: values,
                backgroundColor: [
                  "#34d399",
                  "#60a5fa",
                  "#f472b6",
                  "#fbbf24",
                ],
                borderWidth: 0,
              },
            ],
          }}
          options={{
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: "#e2e8f0" } } },
          }}
        />
      </div>
    </div>
  );
}
