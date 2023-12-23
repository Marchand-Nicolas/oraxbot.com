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
        console.log(data);
        const activity = data.activity;
        setDates(activity.map((a) => new Date(a.date).toLocaleDateString()));
        setMessages(activity.map((a) => a.count));
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
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "vertical",
        shadeIntensity: 0.6,
        gradientToColors: "", // optional, if not defined - uses the shades of same color in series
        inverseColors: false,
        opacityFrom: 0.9,
        opacityTo: 1,
        stops: [0, 50, 100],
      },
    },
    stroke: {
      curve: "smooth",
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
  };

  const series = [
    {
      name: "Messages sent",
      data: messages,
    },
  ];

  return (
    <>
      <h2>Activity graph</h2>
      {loading ? (
        <LoadingCircle />
      ) : (
        <ApexChart options={options} series={series} type="line" height={320} />
      )}
    </>
  );
};

export default ActivityGraph;
