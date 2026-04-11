import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Scan, BarChart3, FileText, GitCompare, Sparkles,
  ShoppingBag, Image, Download, Users, Grid3X3,
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Legend,
} from 'recharts';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import BottomNav from '../components/common/BottomNav';
import Button from '../components/common/Button';
import useMockAuth from '../hooks/useMockAuth';
import useScanStore from '../store/scanStore';
import { mockCareAdvice } from '../utils/mockData';

// ─── 지표별 상세 분석 데이터 ────────────────────────────────
const getMetricDetails = (analysis) => [
  {
    label: '수분도',
    value: analysis.moisture,
    color: '#4CAF50',
    status: analysis.moisture >= 60 ? '정상' : analysis.moisture >= 40 ? '보통' : '주의',
    statusColor: analysis.moisture >= 60 ? 'green' : analysis.moisture >= 40 ? 'yellow' : 'orange',
    description: `정상 범위 (60-90%), 지난 측정 대비 +8% 개선`,
  },
  {
    label: '유분도',
    value: analysis.oil,
    color: '#4CAF50',
    status: analysis.oil <= 55 ? '보통' : '주의',
    statusColor: analysis.oil <= 55 ? 'yellow' : 'orange',
    description: '보통 범위, T존 이후 유분 분포 감지',
  },
  {
    label: '모공',
    value: analysis.elasticity,
    color: '#F97316',
    status: analysis.elasticity >= 50 ? '보통' : '주의',
    statusColor: analysis.elasticity >= 50 ? 'yellow' : 'orange',
    description: '주의 필요, 코 주변 모공 확장 감지, BHA 성분 관리 권장',
  },
  {
    label: '탄력',
    value: analysis.spots,
    color: '#4CAF50',
    status: analysis.spots >= 60 ? '정상' : analysis.spots >= 40 ? '보통' : '주의',
    statusColor: analysis.spots >= 60 ? 'green' : analysis.spots >= 40 ? 'yellow' : 'orange',
    description: '양호, 볼 부위 탄력 지수 관찰식',
  },
  {
    label: '색소침착',
    value: analysis.pigmentation,
    color: '#4CAF50',
    status: analysis.pigmentation >= 50 ? '보통' : '주의',
    statusColor: analysis.pigmentation >= 50 ? 'yellow' : 'orange',
    description: '보통, 이마 및 볼 상단 부위 자연 검사 감지',
  },
];

// ─── 상태 배지 색상 매핑 ────────────────────────────────────
const statusColorMap = {
  green: { bg: 'bg-primary-50', text: 'text-primary-600', label: '정상' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', label: '보통' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', label: '주의' },
};

// ─── 지표 배지 색상 ─────────────────────────────────────────
const getMetricBadgeStyle = (value) => {
  if (value >= 60) return { bg: 'bg-primary-50', text: 'text-primary-600', border: 'border-primary-100' };
  if (value >= 40) return { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100' };
  return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' };
};

// ─── 종합 점수 서클 ─────────────────────────────────────────
const ScoreCircle = ({ score }) => {
  const getColor = (s) => {
    if (s >= 70) return '#4CAF50';
    if (s >= 50) return '#EAB308';
    return '#F97316';
  };
  const color = getColor(score);
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-28 h-28">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" strokeWidth="8" />
        <circle
          cx="60" cy="60" r="52" fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs text-text-secondary">종합 피부 점수</span>
        <span className="text-4xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[10px] text-text-secondary">/100</span>
      </div>
    </div>
  );
};

// ─── 커스텀 레이더 Tooltip ──────────────────────────────────
const CustomRadarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {p.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── AnalysisPage 메인 ──────────────────────────────────────
const AnalysisPage = () => {
  const { user } = useMockAuth(true);
  const { currentScan, initializeIfNeeded } = useScanStore();
  const [activeMenu, setActiveMenu] = useState('overview');

  useEffect(() => {
    initializeIfNeeded();
  }, [initializeIfNeeded]);

  const analysis = currentScan;
  const hasScanData = !!currentScan;

  // 오늘 측정 5각형 데이터
  const radarData = [
    { subject: '수분', current: analysis.moisture, previous: Math.max(analysis.moisture - 8, 30) },
    { subject: '유분', current: analysis.oil, previous: Math.max(analysis.oil + 5, 30) },
    { subject: '모공', current: analysis.elasticity, previous: Math.max(analysis.elasticity - 3, 25) },
    { subject: '탄력', current: analysis.spots, previous: Math.max(analysis.spots - 4, 35) },
    { subject: '색소침착', current: analysis.pigmentation, previous: Math.max(analysis.pigmentation - 2, 35) },
  ];

  // 지표별 상세
  const metricDetails = getMetricDetails(analysis);

  // 5개 지표 배지 데이터
  const metricBadges = [
    { label: '수분%', value: analysis.moisture },
    { label: '유분도', value: analysis.oil },
    { label: '모공', value: analysis.elasticity },
    { label: '탄력', value: analysis.spots },
    { label: '색소침착', value: analysis.pigmentation },
  ];

  // 좌측 사이드 메뉴
  const sideMenuSections = [
    {
      title: '결과 보기',
      items: [
        { id: 'overview', label: '종합 분석', icon: BarChart3 },
        { id: 'heatmap', label: '항목 히트맵', icon: Grid3X3 },
        { id: 'ai-care', label: 'AI 케어 조언', icon: Sparkles },
        { id: 'products', label: '제품 추천', icon: ShoppingBag },
      ],
    },
    {
      title: '비교',
      items: [
        { id: 'compare', label: '이전 결과 비교', icon: GitCompare },
        { id: 'type-compare', label: '동일 피부 타입 비교', icon: Users },
      ],
    },
    {
      title: '내보내기',
      items: [
        { id: 'pdf', label: 'PDF 리포트', icon: Download },
        { id: 'image', label: '이미지 저장', icon: Image },
      ],
    },
  ];

  // ─── Empty State ────────────────────────────────────────
  if (!hasScanData) {
    return (
      <div className="min-h-screen bg-background-gray">
        <Header variant="dashboard" />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4 tablet:p-6 desktop:p-8 pb-24 desktop:pb-8">
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
          </main>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-gray">
      <Header variant="dashboard" />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-4 tablet:p-6 desktop:p-8 pb-24 desktop:pb-8 animate-fadeIn">
          <div className="max-w-6xl mx-auto">
            {/* ── 상단: 종합 점수 + 5개 지표 배지 ───────── */}
            <div className="flex flex-col tablet:flex-row items-center gap-5 mb-5">
              {/* 종합 점수 원형 */}
              <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 flex flex-col items-center">
                <ScoreCircle score={analysis.overallScore} />
                <span className="mt-2 inline-block bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {analysis.skinType}
                </span>
              </div>

              {/* 5개 지표 배지 */}
              <div className="flex flex-wrap gap-3 justify-center tablet:justify-start flex-1">
                {metricBadges.map((m) => {
                  const style = getMetricBadgeStyle(m.value);
                  return (
                    <div
                      key={m.label}
                      className={`flex flex-col items-center px-5 py-3 rounded-2xl border ${style.bg} ${style.border} min-w-[90px]`}
                    >
                      <span className={`text-2xl font-bold ${style.text}`}>{m.value}%</span>
                      <span className="text-[11px] text-text-secondary mt-0.5">{m.label}</span>
                      <span className={`text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                        {m.value >= 60 ? '정상' : m.value >= 40 ? '보통' : '주의'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── AI 안내 배너 ──────────────────────────── */}
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Sparkles size={18} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-primary-700 leading-relaxed">
                  모공 관리가 가장 시급해요. 수분과 탄력은 양호한 편이에요.
                  BHA 성분 토너를 루틴에 추가해보세요.
                </p>
              </div>
            </div>

            {/* ── 본문: 사이드 메뉴 + 메인 콘텐츠 ───────── */}
            <div className="flex gap-6">
              {/* 좌측 사이드 메뉴 (데스크톱) */}
              <div className="hidden desktop:block w-44 flex-shrink-0">
                {sideMenuSections.map((section) => (
                  <div key={section.title} className="mb-5">
                    <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2 px-2">
                      {section.title}
                    </p>
                    <nav className="flex flex-col gap-0.5">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setActiveMenu(item.id)}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left w-full ${
                              activeMenu === item.id
                                ? 'bg-primary-50 text-primary-600 font-semibold'
                                : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                            }`}
                          >
                            <span
                              className={`w-3 h-3 rounded flex-shrink-0 ${
                                activeMenu === item.id ? 'bg-primary-400' : 'bg-gray-200'
                              }`}
                            />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                ))}
              </div>

              {/* 메인 콘텐츠 */}
              <div className="flex-1 min-w-0">
                {/* ── 레이더 차트 + 지표별 상세 분석 ─────── */}
                <div className="grid grid-cols-1 desktop:grid-cols-2 gap-6">
                  {/* 피부 상태 레이더 차트 (오각형) */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <h3 className="text-sm font-semibold text-text-primary mb-2">
                      피부 상태 레이더 차트
                    </h3>
                    <div className="h-72 tablet:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                          <PolarGrid stroke="#E5E7EB" />
                          <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fontSize: 12, fill: '#757575', fontWeight: 500 }}
                          />
                          <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={{ fontSize: 9, fill: '#9CA3AF' }}
                            tickCount={5}
                            axisLine={false}
                          />
                          {/* 지난 측정 (연한 회색) */}
                          <Radar
                            name="지난 측정"
                            dataKey="previous"
                            stroke="#BDBDBD"
                            fill="#E0E0E0"
                            fillOpacity={0.25}
                            strokeWidth={1.5}
                            strokeDasharray="4 4"
                          />
                          {/* 오늘 측정 (초록) */}
                          <Radar
                            name="오늘 측정"
                            dataKey="current"
                            stroke="#4CAF50"
                            fill="#4CAF50"
                            fillOpacity={0.2}
                            strokeWidth={2}
                            dot={{ r: 4, fill: '#4CAF50', stroke: '#fff', strokeWidth: 2 }}
                          />
                          <Legend
                            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                            iconType="circle"
                            iconSize={8}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-[11px] text-text-secondary text-center mt-1">
                      꼭짓점이 바깥일수록<br />해당 지표가 높아요
                    </p>
                  </div>

                  {/* 지표별 상세 분석 */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <h3 className="text-sm font-semibold text-text-primary mb-4">
                      지표별 상세 분석
                    </h3>
                    <div className="space-y-5">
                      {metricDetails.map((m) => {
                        const statusStyle = statusColorMap[m.statusColor];
                        return (
                          <div key={m.label}>
                            {/* 라벨 + 프로그레스 바 + 값 */}
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-xs font-semibold text-text-primary w-14 flex-shrink-0">
                                {m.label}
                              </span>
                              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-1000 ease-out"
                                  style={{ width: `${m.value}%`, backgroundColor: m.color }}
                                />
                              </div>
                              <span className="text-sm font-bold text-text-primary w-10 text-right">
                                {m.value}%
                              </span>
                            </div>
                            {/* 설명 + 상태 배지 */}
                            <div className="flex items-start gap-2 ml-[68px]">
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${statusStyle.bg} ${statusStyle.text}`}
                              >
                                {m.status}
                              </span>
                              <p className="text-[11px] text-text-secondary leading-relaxed">
                                {m.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
};

export default AnalysisPage;
