import React, { useState } from 'react';
import AppContainer from '../AppContainer';
import { User } from '../../types';

interface WeatherAppProps {
  onExit: () => void;
  isVisible: boolean;
  user?: User | null;
}

const weatherData = [
  { city: 'Hanoi', temp: '32°C', condition: 'Sunny', icon: '☀️' },
  { city: 'Ho Chi Minh City', temp: '34°C', condition: 'Partly Cloudy', icon: '⛅️' },
  { city: 'Da Nang', temp: '30°C', condition: 'Showers', icon: '🌦️' },
  { city: 'Tokyo', temp: '25°C', condition: 'Clear', icon: '☀️' },
];

const WeatherApp: React.FC<WeatherAppProps> = ({ onExit, isVisible, user }) => {
  const [currentCityIndex, setCurrentCityIndex] = useState(0);

  const changeCity = () => {
    setCurrentCityIndex((prevIndex) => (prevIndex + 1) % weatherData.length);
  };

  const currentW = weatherData[currentCityIndex];

  return (
    <AppContainer appName="Weather" onExit={onExit} isVisible={isVisible} user={user}>
      <div className="flex flex-col items-center justify-center flex-grow text-center">
        <div className="bg-slate-700 p-8 rounded-2xl shadow-lg w-full max-w-sm">
          <h3 className="text-3xl font-bold text-white">{currentW.city}</h3>
          <div className="text-8xl my-6">{currentW.icon}</div>
          <p className="text-6xl font-light text-blue-300">{currentW.temp}</p>
          <p className="text-xl text-slate-300 mt-2">{currentW.condition}</p>
        </div>
        <button
          onClick={changeCity}
          className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-full text-lg font-semibold transition-transform transform hover:scale-105"
        >
          Next City
        </button>
      </div>
    </AppContainer>
  );
};

export default WeatherApp;