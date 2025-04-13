import { useState, useEffect } from "react";
import axios from "axios";
import {Routes, Route, useNavigate} from "react-router-dom";
import WeatherDetail from "./WeatherDetail";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from "recharts";
import "./App.css";

function App() {
  const [weatherHours, setWeatherHours] = useState([]);
  const [city, setCity] = useState("College Station");
  const [selectedCondition, setSelectedCondition] = useState("All");

  useEffect(() => {
    const fetchPast24Hours = async () => {
      try {
        const API_KEY = "5397b632d9b94c33b3922129250504";

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const formatDate = (date) =>
          date.toISOString().split("T")[0];

        const todayStr = formatDate(today);
        const yesterdayStr = formatDate(yesterday);
        const currentHour = today.getHours();

        const [yesterdayRes, todayRes] = await Promise.all([
          axios.get("https://api.weatherapi.com/v1/history.json", {
            params: { key: API_KEY, q: city, dt: yesterdayStr },
          }),
          axios.get("https://api.weatherapi.com/v1/history.json", {
            params: { key: API_KEY, q: city, dt: todayStr },
          }),
        ]);

        const yesterdayHours = yesterdayRes.data.forecast.forecastday[0].hour;
        const todayHours = todayRes.data.forecast.forecastday[0].hour.slice(
          0,
          currentHour + 1
        );

        const combined = [
          ...yesterdayHours.slice(-24 + todayHours.length),
          ...todayHours,
        ];

        setWeatherHours(combined);
        console.log("Fetched timestamps:", combined.map(w => w.time));
      } catch (error) {
        console.error("Failed to fetch weather data:", error);
        setWeatherHours([]);
      }
    };

    fetchPast24Hours();
  }, [city]);

  const navigate = useNavigate();

  const temps = weatherHours.map((hour) => hour.temp_c);
  const highTemp = temps.length ? Math.max(...temps) : null;
  const lowTemp = temps.length ? Math.min(...temps) : null;

  const conditionCounts = {};
  weatherHours.forEach((hour) => {
    const cond = hour.condition.text;
    conditionCounts[cond] = (conditionCounts[cond] || 0) + 1;
  });

  const conditionData = Object.entries(conditionCounts).map(([name, count]) => ({
    name,
    count,
  }));


  const averageCondition =
    Object.entries(conditionCounts).reduce(
      (a, b) => (b[1] > a[1] ? b : a),
      ["None", 0]
    )[0];

  const uniqueConditions = Array.from(
    new Set(weatherHours.map((hour) => hour.condition.text))
  );

  const filteredWeather =
    selectedCondition === "All"
      ? weatherHours
      : weatherHours.filter(
          (hour) => hour.condition.text === selectedCondition
        );


  return (
    <Routes>
      <Route path="/" element = {
        <div className="Main-Container">
        <h2>Past 24-Hour Weather for: {city}</h2>

        <div>
          <label>Search city: </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        {uniqueConditions.length > 0 && (
          <div>
            <label>Filter by condition: </label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
            >
              <option value="All">All</option>
              {uniqueConditions.map((cond, index) => (
                <option key={index} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>
        )}

        {weatherHours.length > 0 && (
          <div>
            <h3>Summary Stats (Last 24 Hours)</h3>
            <p><strong>High Temp:</strong> {(highTemp * 9/5 + 32).toFixed(1)}°F</p>
<p><strong>Low Temp:</strong> {(lowTemp * 9/5 + 32).toFixed(1)}°F</p>
            <p><strong>Most Common Condition:</strong> {averageCondition}</p>
          </div>
        )}

        <h3 style={{ marginTop: "2rem" }}>Temperature Over Time (Past 24 Hours)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weatherHours} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tickFormatter={(time) => time.split(" ")[1]} />
            <YAxis unit="°C" />
            <Tooltip />
            <Line type="monotone" dataKey="temp_c" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>

        <h3 style={{ marginTop: "2rem" }}>Weather Condition Frequency</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={conditionData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Legend />
            <Bar dataKey="count" fill="#82ca9d"/>
          </BarChart>
        </ResponsiveContainer>


        {filteredWeather.length === 0 ? (
          <p>Loading or no data...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Temp (°C)</th>
                <th>Condition</th>
                <th>Icon</th>
              </tr>
            </thead>
            <tbody>
              {[...filteredWeather].reverse().map((hourData, index) => (
                <tr key={index}
                  onClick = {() => navigate(`/weather/${encodeURIComponent(hourData.time)}`)}
                  style = {{cursor:"pointer"}}
                >
                  <td>{new Date(hourData.time).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true
                  })}</td>
                  <td>{(hourData.temp_c * 9/5 + 32).toFixed(1)}°F</td>
                  <td>{hourData.condition.text}</td>
                  <td>
                    <img src={hourData.condition.icon} alt="icon" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      }/>
      <Route path = "/weather/:timestamp" 
      element ={<WeatherDetail weatherHours = {weatherHours}/>}/>
      
  </Routes>  
  );
}

export default App;