import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Thermometer, Droplets, Sun, Cloud, ArrowRight, Scan,
  BarChart3, FileText, GitCompare,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import BottomNav from '../components/common/BottomNav';
import Button from '../components/common/Button';
import useMockAuth from '../hooks/useMockAuth';
import { mockAnalysis, mockBarData, mockRadarData, mockCareAdvice } from '../utils/mockData';
import { UV_LEVELS } from '../utils/constants';

const AnalysisPage = () => {
  const { user } = useMockAuth(true);
  const [scanData, setScanData] = useState(null);
  const [activeMenu, setActiveMenu] = useState('result');

  useEffect(() => {
    const stored = localStorage.getItem('skinlab_last_scan');
    if (stored) {
      const data = JSON.parse(stored);
      setScanData(data);
    }
  }, []);

  const analysis = scanData || mockAnalysis;
  const hasScanData = !!scanData;

  const barData = [
    { name: '수분도', value: analysis.moisture, color: '#4CAF50' },
    { name: '유분도', value: analysis.oil, color: '#66BB6A' },
    { name: '모공', value: analysis.elasticity, color: '#E8A838' },
    { name: '탄력', value: analysis.spots, color: '#81C784' },
    { name: '색소침착', value: analysis.pigmentation, color: '#A5D6A7' },
  ];

  const radarData = [
    { subject: '수분도', value: analysis.moisture, fullMark: 100 },
    { subject: '유분도', value: analysis.oil, fullMark: 100 },
    { subject: '탄력', value: analysis.elasticity, fullMark: 100 },
    { subject: '반점', value: analysis.spots, fullMark: 100 },
    { subject: '색소침착', value: analysis.pigmentation, fullMark: 100 },
  ];

  const menuItems = [
    { id: 'result', label: '분석 결과', icon: BarChart3 },
    { id: 'detail', label: '지표 상세', icon: FileText },
  ];

  const historyItems = [
    { id: 'compare', label: '이전 결과 보기', icon: GitCompare },
    { id: 'trends', label: '비교 분석', icon: BarChart3 },
  ];

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-primary-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getScoreRingColor = (score) => {
    if (score >= 70) return '#4CAF50';
    if (score >= 50) return '#EAB308';
    return '#F97316';
  };

  // Status badges
  const statusBadges = [];
  if (analysis.moisture >= 60) statusBadges.push({ label: '수분 양호', type: 'green' });
  else statusBadges.push({ label: '수분 주의', type: 'orange' });
  if (analysis.elasticity < 50) statusBadges.push({ label: '모공 주의', type: 'orange' });
  else statusBadges.push({ label: '모공 양호', type: 'green' });

  const CustomBar = (props) => {
    const { x, y, width, height, fill } = props;
    return <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} />;
  };

  return (
    <div className="min-h-screen bg-background-gray">
      <Header variant="dashboard" />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-4 tablet:p-6 desktop:p-8 pb-24 desktop:pb-8">
          {!hasScanData ? (
            /* Empty State */
            <div className="max-w-lg mx-auto text-center py-20 animate-fadeIn">
              <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 size={36} className="text-primary-300" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-3">
                아직 스캔 데이터가 없습니다
              </h2>
              <p className="text-text-secondary mb-8">
                첫 스캔을 완료하면 피부 분석 결과를 확인할 수 있습니다.
              </p>
              <Link to="/scan">
                <Button icon={Scan}>스캔하러 가기</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 desktop:grid-cols-12 gap-6 animate-fadeIn">
              {/* Left Menu */}
              <div className="desktop:col-span-2 flex desktop:flex-col gap-2">
                <div className="mb-4">
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 hidden desktop:block">결과 확인</p>
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveMenu(item.id)}
                        className={`sidebar-item w-full ${activeMenu === item.id ? 'active' : ''}`}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 hidden desktop:block">히스토리</p>
                  {historyItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        className="sidebar-item w-full"
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Content */}
              <div className="desktop:col-span-10 space-y-6">
                {/* Top Row: Chart + Score */}
                <div className="grid grid-cols-1 tablet:grid-cols-3 gap-6">
                  {/* Bar Chart */}
                  <div className="card tablet:col-span-2">
                    <h3 className="text-sm font-semibold text-text-primary mb-4">피부 지표 상세</h3>
                    <div className="space-y-4">
                      {barData.map((item) => (
                        <div key={item.name} className="flex items-center gap-3">
                          <span className="text-xs text-text-secondary w-16 flex-shrink-0">{item.name}</span>
                          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${item.value}%`, backgroundColor: item.color }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-text-primary w-10 text-right">
                            {item.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Score Card */}
                  <div className="card flex flex-col items-center text-center">
                    <div className="relative w-28 h-28 mb-4">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                        <circle
                          cx="60" cy="60" r="52" fill="none"
                          stroke={getScoreRingColor(analysis.overallScore)}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${(analysis.overallScore / 100) * 327} 327`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                          {analysis.overallScore}
                        </span>
                        <span className="text-[10px] text-text-secondary">종합</span>
                      </div>
                    </div>
                    <p className="text-base font-semibold text-text-primary mb-1">
                      {analysis.skinType}
                    </p>
                    <p className="text-xs text-text-secondary mb-3">{analysis.date}</p>
                    <div className="flex gap-2">
                      {statusBadges.map((badge, i) => (
                        <span
                          key={i}
                          className={`badge text-[10px] ${
                            badge.type === 'green' ? 'badge-green' : 'badge-orange'
                          }`}
                        >
                          {badge.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Environment + Care */}
                <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6">
                  {/* Environment Data */}
                  <div className="card">
                    <h3 className="text-sm font-semibold text-text-primary mb-4">환경 데이터 연동</h3>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="text-center p-3 bg-background-gray rounded-xl">
                        <Thermometer size={16} className="mx-auto text-blue-500 mb-1" />
                        <p className="text-sm font-bold text-text-primary">22°C</p>
                        <p className="text-[10px] text-text-secondary">기온</p>
                      </div>
                      <div className="text-center p-3 bg-background-gray rounded-xl">
                        <Droplets size={16} className="mx-auto text-blue-400 mb-1" />
                        <p className="text-sm font-bold text-text-primary">58%</p>
                        <p className="text-[10px] text-text-secondary">습도</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-xl">
                        <Sun size={16} className="mx-auto text-orange-500 mb-1" />
                        <p className="text-sm font-bold text-orange-500">높음</p>
                        <p className="text-[10px] text-text-secondary">자외선</p>
                      </div>
                      <div className="text-center p-3 bg-background-gray rounded-xl">
                        <Cloud size={16} className="mx-auto text-gray-500 mb-1" />
                        <p className="text-sm font-bold text-text-primary">보통</p>
                        <p className="text-[10px] text-text-secondary">미세먼지</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Care Advice */}
                  <div className="card bg-primary-50 border-primary-100">
                    <h3 className="text-sm font-semibold text-primary-700 mb-4">AI 케어 조언</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-primary-700 leading-relaxed">
                        {mockCareAdvice.primary}
                      </p>
                      <p className="text-sm text-primary-700 leading-relaxed">
                        {mockCareAdvice.secondary}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <BottomNav />
    </div>
  );
};

export default AnalysisPage;
