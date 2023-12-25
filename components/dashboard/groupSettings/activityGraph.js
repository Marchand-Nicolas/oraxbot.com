import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import config from "../../../utils/config";
import { getCookie } from "../../../utils/cookies";
import LoadingCircle from "../../LoadingCircle";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const ActivityGraph = ({}) => {
  const router = useRouter();
  const params = new URLSearchParams(router.asPath.split("?")[1]);
  const guildId = params.get("guild");
  const [dates, setDates] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { groupId } = router.query;

  useEffect(() => {
    if (!groupId || !guildId) return;
    fetch(`${config.apiV2}get_group_activity_data`, {
      method: "POST",
      body: `{ "token": "${getCookie(
        "token"
      )}", "groupId": ${groupId}, "guildId":"${guildId}" }`,
    }).then((res) =>
      res.json().then((data) => {
        const activity = data.activity;
        const dates = activity.map((a) =>
          new Date(a.date).toLocaleDateString()
        );
        const messages = activity.map((a) => a.count);
        const resDates = [];
        const resMessages = [];
        const firstDate = new Date(activity[0].date);
        const today = new Date();
        for (let d = firstDate; d <= today; d.setDate(d.getDate() + 1)) {
          resDates.push(d.toLocaleDateString());
          const index = dates.indexOf(d.toLocaleDateString());
          if (index != -1) {
            resMessages.push(messages[index]);
          } else {
            resMessages.push(0);
          }
        }
        setDates(resDates);
        setMessages(resMessages);
        setLoading(false);
      })
    );
  }, [groupId, guildId]);

  const options = {
    chart: {
      id: "apexchart",
    },
    xaxis: {
      categories: dates,
      tickAmount: 10, // Set the desired number of ticks to display on the x-axis
      show: false,
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
    chart: {
      toolbar: {
        show: false,
      },
      foreColor: "#fff",
    },
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

  const series = [
    {
      name: "Messages sent by the bot",
      data: messages,
    },
  ];

  return (
    <>
      <h2>Activity graph</h2>
      {loading ? (
        <LoadingCircle />
      ) : (
        <ApexChart options={options} series={series} type="line" height={150} />
      )}
    </>
  );
};

export default ActivityGraph;
