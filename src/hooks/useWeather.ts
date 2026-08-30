'use client';

import { useState, useEffect } from 'react';

interface WeatherData {
  location: {
    name: string;
    country: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
  };
}

interface UseWeatherResult {
  data: WeatherData | null;
  isLoading: boolean;
  isError: boolean;
}

export function useWeather(): UseWeatherResult {
  const [data, setData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
      
      if (!apiKey) {
        setIsLoading(false);
        setIsError(true);
        return;
      }

      try {
        // Get user's location or use default (Abidjan, Côte d'Ivoire - AfDB HQ)
        let lat = 5.3167;
        let lon = -4.0333;
        
        // Try to get user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              lat = position.coords.latitude;
              lon = position.coords.longitude;
              fetchWeatherData(lat, lon, apiKey);
            },
            () => {
              // Use default location if permission denied
              fetchWeatherData(lat, lon, apiKey);
            }
          );
        } else {
          fetchWeatherData(lat, lon, apiKey);
        }
      } catch {
        setIsLoading(false);
        setIsError(true);
      }
    };

    const fetchWeatherData = async (lat: number, lon: number, key: string) => {
      try {
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${key}&q=${lat},${lon}&aqi=no`
        );
        
        if (!response.ok) {
          throw new Error('Weather API error');
        }
        
        const weatherData = await response.json();
        setData(weatherData);
        setIsError(false);
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, []);

  return { data, isLoading, isError };
}
