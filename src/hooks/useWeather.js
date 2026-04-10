import { useState, useEffect } from 'react';
import { mockWeather } from '../utils/mockData';

// Mock 날씨 API 훅 - 추후 실제 API로 교체
const useWeather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        // Mock API 호출 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 500));
        setWeather(mockWeather);
      } catch (err) {
        setError('날씨 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  return { weather, loading, error };
};

export default useWeather;
