import React, { useEffect, useState, type ComponentType } from "react";
import type { Props as ReactApexChartProps } from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useRouter } from "next/router";
import config from "../../../utils/config.json";
import { getCookie } from "../../../utils/cookies";
import LoadingCircle from "../../LoadingCircle";

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
    const { default: ReactApexChart } = require("react-apexcharts") as {
      default: ComponentType<ReactApexChartProps>;
    };
    setApexChart(() => ReactApexChart);
  }, []);

  useEffect(() => {
    if (!groupId || !guildId) return;
    fetch(`${config.apiV2}get_group_activity_data`, {
      method: "POST",
      body: JSON.stringify({
        token: getCookie("token"),
        groupId,
        guildId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) =>
      res.json().then((data: { activity?: { date: string; count: number }[] }) => {
        const activity = data.activity;
        if (!activity || activity.length == 0) return setLoading(false);
        const activityDates = activity.map((a) =>
          new Date(a.date).toLocaleDateString(),
        );
        const activityMessages = activity.map((a) => a.count);
        const resDates: string[] = [];
        const resMessages: number[] = [];
        const firstDate = new Date(activity[0].date);
        const today = new Date();
        for (let d = firstDate; d <= today; d.setDate(d.getDate() + 1)) {
          resDates.push(d.toLocaleDateString());
          const index = activityDates.indexOf(d.toLocaleDateString());
          if (index != -1) {
            resMessages.push(activityMessages[index]);
          } else {
            resMessages.push(0);
          }
        }
        setDates(resDates);
        setMessages(resMessages);
        setLoading(false);
      }),
    );
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
