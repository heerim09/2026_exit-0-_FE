import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scan as ScanIcon, CheckCircle, AlertTriangle, Circle,
  Thermometer, Droplets, Sun, ChevronDown,
} from 'lucide-react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import BottomNav from '../components/common/BottomNav';
import Button from '../components/common/Button';
import useMockAuth from '../hooks/useMockAuth';
import useWeather from '../hooks/useWeather';
import { mockScanHistory, mockAnalysis } from '../utils/mockData';
import { SCAN_AREAS, LIGHTING_MODES, MEASUREMENT_ITEMS, UV_LEVELS } from '../utils/constants';

const ScanPage = () => {
  const navigate = useNavigate();
  const { user } = useMockAuth(true);
  const { weather } = useWeather();

  const [scanStatus, setScanStatus] = useState('ready'); // ready | countdown | scanning | complete
  const [countdown, setCountdown] = useState(3);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedArea, setSelectedArea] = useState('얼굴 전체');
  const [lightingMode, setLightingMode] = useState('white');
  const [measurements, setMeasurements] = useState(
    MEASUREMENT_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: item.default }), {})
  );

  const uvInfo = UV_LEVELS[weather?.uv] || UV_LEVELS.moderate;

  const toggleMeasurement = (id) => {
    setMeasurements(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const startScan = useCallback(() => {
    setScanStatus('countdown');
    setCountdown(3);
  }, []);

  // Countdown effect
  useEffect(() => {
    if (scanStatus !== 'countdown') return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setScanStatus('scanning');
      setScanProgress(0);
    }
  }, [scanStatus, countdown]);

  // Scan progress effect
  useEffect(() => {
    if (scanStatus !== 'scanning') return;

    if (scanProgress < 100) {
      const timer = setTimeout(() => {
        setScanProgress(p => Math.min(p + 2, 100));
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setScanStatus('complete');
      // Generate mock result and save
      const result = {
        ...mockAnalysis,
        moisture: Math.floor(60 + Math.random() * 30),
        oil: Math.floor(30 + Math.random() * 40),
        elasticity: Math.floor(30 + Math.random() * 40),
        spots: Math.floor(40 + Math.random() * 40),
        pigmentation: Math.floor(40 + Math.random() * 30),
        overallScore: Math.floor(60 + Math.random() * 30),
        date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
        area: selectedArea,
      };
      localStorage.setItem('skinlab_last_scan', JSON.stringify(result));
      
      setTimeout(() => navigate('/analysis'), 1500);
    }
  }, [scanStatus, scanProgress, navigate, selectedArea]);

  const checklist = [
    { icon: CheckCircle, text: '밝은 환경에서 측정하세요', type: 'ok' },
    { icon: CheckCircle, text: '스캐너를 피부에 밀착시켜 주세요', type: 'ok' },
    { icon: CheckCircle, text: '측정 중 움직이지 마세요', type: 'ok' },
    { icon: AlertTriangle, text: '메이크업 상태에서도 측정 가능해요', type: 'warn' },
  ];

  return (
    <div className="min-h-screen bg-background-gray">
      <Header variant="dashboard" />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-4 tablet:p-6 desktop:p-8 pb-24 desktop:pb-8">
          <div className="grid grid-cols-1 desktop:grid-cols-12 gap-6">
            
            {/* Center - Scan Interface */}
            <div className="desktop:col-span-7 space-y-6">
              {/* Scan Visualization */}
              <div className="card overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${scanStatus === 'scanning' ? 'bg-green-500 animate-pulse' : 'bg-orange-400'}`}></span>
                    <span className="text-sm text-text-secondary">
                      {scanStatus === 'scanning' ? '스캐너 연결됨' : '스캐너 미연결'}
                    </span>
                  </div>
                  <span className="text-xs text-text-secondary">UV 모드</span>
                </div>

                {/* Face Guide Area */}
                <div className="bg-gray-900 rounded-2xl aspect-[4/3] relative flex items-center justify-center mb-4 overflow-hidden">
                  {/* Grid lines */}
                  <div className="absolute inset-0 opacity-10">
                    {[...Array(10)].map((_, i) => (
                      <div key={`h${i}`} className="absolute w-full h-px bg-green-400" style={{ top: `${i * 10}%` }}></div>
                    ))}
                    {[...Array(10)].map((_, i) => (
                      <div key={`v${i}`} className="absolute h-full w-px bg-green-400" style={{ left: `${i * 10}%` }}></div>
                    ))}
                  </div>

                  {/* Face outline SVG */}
                  <svg viewBox="0 0 200 280" className="w-48 h-auto opacity-40" fill="none" stroke="#4CAF50" strokeWidth="1.5">
                    <ellipse cx="100" cy="130" rx="70" ry="90" />
                    <ellipse cx="70" cy="115" rx="12" ry="8" />
                    <ellipse cx="130" cy="115" rx="12" ry="8" />
                    <ellipse cx="100" cy="145" rx="8" ry="10" />
                    <path d="M85 175 Q100 185 115 175" />
                  </svg>

                  {/* Scan line animation */}
                  {scanStatus === 'scanning' && (
                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan-line"></div>
                  )}

                  {/* Countdown */}
                  {scanStatus === 'countdown' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <div className="text-center">
                        <div className="text-7xl font-bold text-green-400 animate-pulse">{countdown}</div>
                        <p className="text-green-300 text-sm mt-2">스캔 준비 중...</p>
                      </div>
                    </div>
                  )}

                  {/* Complete */}
                  {scanStatus === 'complete' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <div className="text-center">
                        <CheckCircle size={48} className="text-green-400 mx-auto mb-3" />
                        <p className="text-green-300 text-lg font-semibold">스캔 완료!</p>
                        <p className="text-green-400/60 text-sm mt-1">분석 페이지로 이동 중...</p>
                      </div>
                    </div>
                  )}

                  {/* Guide text */}
                  {scanStatus === 'ready' && (
                    <div className="absolute bottom-6 left-0 right-0 text-center">
                      <p className="text-green-400/80 text-sm">스캔 부위를 중앙에 맞춰주세요</p>
                    </div>
                  )}
                </div>

                {/* Status & Progress */}
                <div>
                  {scanStatus === 'scanning' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-text-secondary mb-1">
                        <span>스캔 진행 중...</span>
                        <span>{scanProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full transition-all duration-100"
                          style={{ width: `${scanProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-text-secondary mb-4">
                    <span>
                      {scanStatus === 'ready' && '스캔 준비 완료'}
                      {scanStatus === 'countdown' && '카운트다운...'}
                      {scanStatus === 'scanning' && '스캔 중 움직이지 마세요'}
                      {scanStatus === 'complete' && '스캔 완료!'}
                    </span>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">조명 조절</span>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">해상도</span>
                    </div>
                  </div>

                  <Button
                    onClick={startScan}
                    disabled={scanStatus === 'scanning' || scanStatus === 'countdown'}
                    className="w-full text-base"
                    size="lg"
                  >
                    <ScanIcon size={20} />
                    {scanStatus === 'ready' ? '스캔 시작하기' : 
                     scanStatus === 'complete' ? '다시 스캔하기' : '스캔 중...'}
                  </Button>
                </div>
              </div>

              {/* Checklist */}
              <div className="card">
                <h3 className="text-sm font-semibold text-text-primary mb-4">스캔 시 주의사항</h3>
                <div className="space-y-3">
                  {checklist.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <Icon
                          size={18}
                          className={item.type === 'ok' ? 'text-primary-500' : 'text-orange-400'}
                        />
                        <span className="text-sm text-text-secondary">{item.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Panel - Settings */}
            <div className="desktop:col-span-5 space-y-6">
              {/* Scan Settings */}
              <div className="card">
                <h3 className="text-sm font-semibold text-text-primary mb-4">스캔 설정</h3>
                
                {/* Area Selection */}
                <div className="mb-5">
                  <p className="text-xs font-medium text-text-secondary mb-2">측정 부위</p>
                  <div className="flex flex-wrap gap-2">
                    {SCAN_AREAS.map((area) => (
                      <button
                        key={area}
                        onClick={() => setSelectedArea(area)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          selectedArea === area
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                        }`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lighting Mode */}
                <div className="mb-5">
                  <p className="text-xs font-medium text-text-secondary mb-2">조명 모드</p>
                  <div className="flex gap-2">
                    {LIGHTING_MODES.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setLightingMode(mode.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          lightingMode === mode.id
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Measurement Toggles */}
                <div>
                  <p className="text-xs font-medium text-text-secondary mb-2">측정 항목</p>
                  <div className="space-y-3">
                    {MEASUREMENT_ITEMS.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <span className="text-sm text-text-primary">{item.label}</span>
                        <button
                          onClick={() => toggleMeasurement(item.id)}
                          className={`relative w-11 h-6 rounded-full transition-colors ${
                            measurements[item.id] ? 'bg-primary-500' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                              measurements[item.id] ? 'translate-x-5' : 'translate-x-0.5'
                            }`}
                          ></span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Scan History */}
              <div className="card">
                <h3 className="text-sm font-semibold text-text-primary mb-4">이전 스캔 기록</h3>
                {mockScanHistory.length > 0 ? (
                  <div className="space-y-3">
                    {mockScanHistory.map((scan) => (
                      <div
                        key={scan.id}
                        className="flex items-center justify-between p-3 bg-background-gray rounded-xl"
                      >
                        <div>
                          <p className="text-xs font-medium text-text-primary">
                            {scan.date} — {scan.area}
                          </p>
                          <p className="text-[11px] text-text-secondary">
                            {scan.type} · {scan.details}
                          </p>
                        </div>
                        <span className="text-lg font-bold text-primary-500">{scan.score}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary text-center py-6">
                    아직 스캔 기록이 없습니다.
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
};

export default ScanPage;
