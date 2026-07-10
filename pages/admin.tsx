import { useState, useEffect, type ComponentType } from "react";
import type { Props as ReactApexChartProps } from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import styles from "../styles/Admin.module.css";
import config from "../utils/config.json";
import { getCookie, setCookie } from "../utils/cookies";
import LoadingCircle from "../components/LoadingCircle";

type CommandStat = {
  command: string;
  count: number;
};

type ActivityPoint = {
  date: string;
  count: number;
};

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateKey: string) => {
  const d = new Date(dateKey + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function Admin() {
  const [token, setToken] = useState<string | undefined>(undefined);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
  const [dayStats, setDayStats] = useState<CommandStat[]>([]);
  const [dayTotal, setDayTotal] = useState(0);
  const [monthActivity, setMonthActivity] = useState<ActivityPoint[]>([]);
  const [monthTotal, setMonthTotal] = useState(0);
  const [messageActivity, setMessageActivity] = useState<ActivityPoint[]>([]);
  const [messageTotal, setMessageTotal] = useState(0);
  const [guildCount, setGuildCount] = useState<number | null>(null);
  const [dayMessageCount, setDayMessageCount] = useState(0);
  const [loadingDay, setLoadingDay] = useState(false);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [ApexChart, setApexChart] =
    useState<ComponentType<ReactApexChartProps> | null>(null);

  const apiBase = config.apiV2;

  useEffect(() => {
    const saved = getCookie("admin_token");
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    const { default: ReactApexChart } = require("react-apexcharts") as {
      default: ComponentType<ReactApexChartProps>;
    };
    setApexChart(() => ReactApexChart);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const res = await fetch(`${apiBase}admin_login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.result && data.token) {
        setCookie("admin_token", data.token, 86400);
        setToken(data.token);
      } else {
        setLoginError(data.error || "Invalid credentials");
      }
    } catch {
      setLoginError("Network error");
    }
    setLoggingIn(false);
  };

  const handleLogout = () => {
    setCookie("admin_token", "", 0);
    setToken(undefined);
  };

  useEffect(() => {
    if (!token) return;
    setLoadingMonth(true);
    fetch(`${apiBase}admin_get_command_stats_month`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.result) {
          setMonthActivity(data.activity || []);
          setMonthTotal(data.total || 0);
          setMessageActivity(data.messageActivity || []);
          setMessageTotal(data.messageTotal || 0);
          setGuildCount(data.guildCount ?? null);
        }
        setLoadingMonth(false);
      })
      .catch(() => setLoadingMonth(false));
  }, [token, apiBase]);

  useEffect(() => {
    if (!token) return;
    setLoadingDay(true);
    fetch(`${apiBase}admin_get_command_stats_day`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, date: selectedDate }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.result) {
          setDayStats(data.stats || []);
          setDayTotal(data.total || 0);
          setDayMessageCount(data.messageCount || 0);
        }
        setLoadingDay(false);
      })
      .catch(() => setLoadingDay(false));
  }, [token, selectedDate, apiBase]);

  if (!token) {
    return (
      <>
        <div className={styles.background} />
        <div className={`${styles.page} ${styles.pageLogin}`}>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <form className={styles.loginForm} onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {loginError && <div className={styles.error}>{loginError}</div>}
            <button
              type="submit"
              className={styles.loginButton}
              disabled={loggingIn || !username || !password}
            >
              {loggingIn ? "Loading..." : "Login"}
            </button>
          </form>
        </div>
      </>
    );
  }

  const countsByDate = new Map(monthActivity.map((a) => [a.date, a.count]));

  const today = new Date();
  const firstDate = new Date(today);
  firstDate.setDate(today.getDate() - 29);

  const chartDates: string[] = [];
  const chartCounts: number[] = [];
  const chartDateKeys: string[] = [];

  for (let d = new Date(firstDate); d <= today; d.setDate(d.getDate() + 1)) {
    const dateKey = formatDateKey(d);
    chartDateKeys.push(dateKey);
    chartDates.push(
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    );
    chartCounts.push(countsByDate.get(dateKey) || 0);
  }

  const chartOptions: ApexOptions = {
    chart: {
      id: "command-usage-chart",
      toolbar: { show: false },
      foreColor: "#fff",
      events: {
        click: (_event, _chartContext, config) => {
          const pointIndex = config?.dataPointIndex;
          if (
            pointIndex !== undefined &&
            pointIndex >= 0 &&
            chartDateKeys[pointIndex]
          ) {
            setSelectedDate(chartDateKeys[pointIndex]);
          }
        },
      },
    },
    xaxis: {
      categories: chartDates,
      tickAmount: 10,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      show: true,
      labels: { show: true },
      axisBorder: { show: true },
      axisTicks: { show: false },
    },
    fill: {
      type: "gradient",
      gradient: {
        type: "vertical",
        shadeIntensity: 0.5,
        gradientToColors: ["white"],
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
    grid: { show: false },
    tooltip: {
      enabled: true,
      theme: "dark",
      x: {
        formatter: function (_val: number, opts: any) {
          const idx = opts?.dataPointIndex;
          if (idx !== undefined && chartDateKeys[idx]) {
            return formatDisplayDate(chartDateKeys[idx]);
          }
          return "";
        },
      },
    },
    dataLabels: { enabled: false },
    markers: {
      size: 0,
      hover: { size: 6 },
    },
  };

  const series: ApexOptions["series"] = [
    {
      name: "Commands used",
      data: chartCounts,
    },
  ];

  const messageCountsByDate = new Map(
    messageActivity.map((a) => [a.date, a.count]),
  );
  const chartMessageCounts = chartDateKeys.map(
    (key) => messageCountsByDate.get(key) || 0,
  );

  const messageChartOptions: ApexOptions = {
    chart: {
      id: "message-usage-chart",
      toolbar: { show: false },
      foreColor: "#fff",
      events: {
        click: (_event, _chartContext, config) => {
          const pointIndex = config?.dataPointIndex;
          if (
            pointIndex !== undefined &&
            pointIndex >= 0 &&
            chartDateKeys[pointIndex]
          ) {
            setSelectedDate(chartDateKeys[pointIndex]);
          }
        },
      },
    },
    xaxis: {
      categories: chartDates,
      tickAmount: 10,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      show: true,
      labels: { show: true },
      axisBorder: { show: true },
      axisTicks: { show: false },
    },
    fill: {
      type: "gradient",
      gradient: {
        type: "vertical",
        shadeIntensity: 0.5,
        gradientToColors: ["white"],
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
    colors: ["#00a1e8"],
    grid: { show: false },
    tooltip: {
      enabled: true,
      theme: "dark",
      x: {
        formatter: function (_val: number, opts: any) {
          const idx = opts?.dataPointIndex;
          if (idx !== undefined && chartDateKeys[idx]) {
            return formatDisplayDate(chartDateKeys[idx]);
          }
          return "";
        },
      },
    },
    dataLabels: { enabled: false },
    markers: {
      size: 0,
      hover: { size: 6 },
    },
  };

  const messageSeries: ApexOptions["series"] = [
    {
      name: "Messages relayed",
      data: chartMessageCounts,
    },
  ];

  const isToday = selectedDate === formatDateKey(new Date());

  return (
    <>
      <div className={styles.background} />
      <div className={styles.page}>
        <div className={styles.statsHeader}>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className={styles.statCards}>
          <div className={styles.statCard}>
            <span className={styles.statCardLabel}>Total Servers</span>
            <span className={styles.statCardValue}>
              {guildCount !== null ? guildCount.toLocaleString() : "—"}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statCardLabel}>Commands (30 days)</span>
            <span className={styles.statCardValue}>
              {monthTotal.toLocaleString()}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statCardLabel}>Messages relayed (30 days)</span>
            <span className={styles.statCardValue}>
              {messageTotal.toLocaleString()}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statCardLabel}>
              {isToday ? "Commands today" : `Commands on ${formatDisplayDate(selectedDate)}`}
            </span>
            <span className={styles.statCardValue}>
              {dayTotal.toLocaleString()}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statCardLabel}>
              {isToday ? "Messages relayed today" : `Messages on ${formatDisplayDate(selectedDate)}`}
            </span>
            <span className={styles.statCardValue}>
              {dayMessageCount.toLocaleString()}
            </span>
          </div>
        </div>

        <div className={styles.chartContainer}>
          <h2>Command usage (30 days)</h2>
          <span className={styles.chartTotal}>
            {monthTotal} commands used in the last 30 days
          </span>
          {loadingMonth || !ApexChart ? (
            <LoadingCircle />
          ) : (
            <ApexChart
              options={chartOptions}
              series={series}
              type="line"
              height={200}
            />
          )}
        </div>

        <div className={styles.chartContainer}>
          <h2>Messages relayed (30 days)</h2>
          <span className={styles.chartTotal}>
            {messageTotal.toLocaleString()} messages relayed in the last 30 days
          </span>
          {loadingMonth || !ApexChart ? (
            <LoadingCircle />
          ) : (
            <ApexChart
              options={messageChartOptions}
              series={messageSeries}
              type="line"
              height={200}
            />
          )}
        </div>

        <div className={styles.dayStats}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <h2>{isToday ? "Today" : formatDisplayDate(selectedDate)}</h2>
            {!isToday && (
              <button
                className={styles.backToToday}
                onClick={() => setSelectedDate(formatDateKey(new Date()))}
              >
                Back to today
              </button>
            )}
          </div>
          <span className={styles.dayStatsTotal}>
            {dayTotal.toLocaleString()} command{dayTotal !== 1 ? "s" : ""} used
            {" • "}
            {dayMessageCount.toLocaleString()} message{dayMessageCount !== 1 ? "s" : ""} relayed
            {!isToday && " on this day"}
          </span>
          {loadingDay ? (
            <div className={styles.loadingContainer}>
              <LoadingCircle />
            </div>
          ) : dayStats.length === 0 ? (
            <div className={styles.noData}>
              No commands were used on this day.
            </div>
          ) : (
            dayStats.map((stat) => (
              <div key={stat.command} className={styles.statRow}>
                <span className={styles.commandName}>/{stat.command}</span>
                <span className={styles.commandCount}>{stat.count}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
