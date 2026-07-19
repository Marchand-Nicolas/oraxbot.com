import React, { useEffect, useState, type ComponentType } from "react";
import type { Props as ReactApexChartProps } from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useRouter } from "next/router";
import { platformApi } from "../../../utils/platformApi";
import LoadingCircle from "../../LoadingCircle";

type ActivityPoint = {
  date: string;
  count: number | string;
};

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getActivityDateKey = (date: string) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  return formatDateKey(new Date(date));
};

const ActivityGraph = () => {
  const router = useRouter();
  const params = new URLSearchParams(router.asPath.split("?")[1]);
  const guildId = params.get("guild") || "";
  const [dates, setDates] = useState<string[]>([]);
  const [messages, setMessages] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [ApexChart, setApexChart] = useState<ComponentType<ReactApexChartProps> | null>(null);
  const { groupId } = router.query;

  const totalCount = messages.reduce((a, b) => a + b, 0);

  useEffect(() => {
    const mod = require("react-apexcharts") as ComponentType<ReactApexChartProps> & {
      default?: ComponentType<ReactApexChartProps>;
    };
    setApexChart(() => mod.default || mod);
  }, []);

  useEffect(() => {
    if (!groupId || !guildId) return;
    platformApi<{ activity?: ActivityPoint[] }>("get_group_activity_data", {
      groupId,
      guildId,
    })
      .then((data) => {
        const activity = data.activity;
        const countsByDate = new Map(
          (activity || []).map((a) => [
            getActivityDateKey(a.date),
            Number(a.count) || 0,
          ]),
        );
        const resDates: string[] = [];
        const resMessages: number[] = [];

        const today = new Date();
        const firstDate = new Date(today);
        firstDate.setDate(today.getDate() - 29);

        for (let d = firstDate; d <= today; d.setDate(d.getDate() + 1)) {
          const dateKey = formatDateKey(d);
          resDates.push(d.toLocaleDateString());
          resMessages.push(countsByDate.get(dateKey) || 0);
        }
        setDates(resDates);
        setMessages(resMessages);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [groupId, guildId]);

  const options: ApexOptions = {
    chart: {
      id: "apexchart",
      toolbar: {
        show: false,
      },
      foreColor: "#fff",
    },
    xaxis: {
      categories: dates,
      tickAmount: 10, // Set the desired number of ticks to display on the x-axis
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: true,
      labels: {
        show: true,
      },
      axisBorder: {
        show: true,
      },
      axisTicks: {
        show: false,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        type: "vertical",
        shadeIntensity: 0.5,
        gradientToColors: ["white"], // optional, if not defined - uses the shades of same color in series
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 50, 100],
      },
    },
    stroke: {
      curve: "smooth",
      width: 4,
      lineCap: "round",
    },
    colors: ["#8151fc"],
    grid: {
      show: false,
    },
    tooltip: {
      enabled: true,
      theme: "dark",
    },
    dataLabels: {
      enabled: false,
    },
  };

  const series: ApexOptions["series"] = [
    {
      name: "Messages sent in the interserv",
      data: messages,
    },
  ];

  return (
    <>
      <h2>Activity graph (30 days)</h2>
      <span>{totalCount} messages sent in the last 30 days.</span>
      {loading || !ApexChart ? (
        <LoadingCircle />
      ) : (
        <ApexChart options={options} series={series} type="line" height={150} />
      )}
    </>
  );
};

export default ActivityGraph;
