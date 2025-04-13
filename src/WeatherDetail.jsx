import {useParams,useNavigate} from "react-router-dom";

function WeatherDetail({weatherHours}){
    const { timestamp } = useParams(); 
    const decodedTimestamp = decodeURIComponent(timestamp); 
    const navigate = useNavigate();
    const weatherData = weatherHours.find(w => w.time === decodedTimestamp);

    if (!weatherData) {
        return <p>Loading data or no data found for this time.</p>;
    }

    return(
        <div className = "Main-Container">
            <h2>Weather Details for {timestamp}</h2>
            <p><strong>Temperature:</strong> {(weatherData.temp_c * 9/5 + 32).toFixed(1)}°F</p>
            <p><strong>Condition:</strong> {weatherData.condition.text}</p>
            <p><strong>Feels Like:</strong> {(weatherData.feelslike_c * 9/5 + 32).toFixed(1)}°F</p>
            <p><strong>Humidity:</strong> {weatherData.humidity}%</p>
            <p><strong>Wind Speed:</strong> {weatherData.wind_kph} kph</p>
            <p><strong>Pressure:</strong> {weatherData.pressure_mb} mb</p>
            <img src={weatherData.condition.icon} alt="icon" />
            <button onClick={() => navigate(-1)} style={{ marginBottom: "1rem" }}>
                ← Back to Dashboard
            </button>
        </div>
    );
}

export default WeatherDetail;