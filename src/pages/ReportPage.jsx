import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Download, Share2, Calendar, TrendingUp, TrendingDown,
  BarChart3, Scan,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import BottomNav from '../components/common/BottomNav';
import Button from '../components/common/Button';
import useMockAuth from '../hooks/useMockAuth';

const ReportPage = () => {
  const { user } = useMockAuth(true);
  const [period, setPeriod] = useState('week');

  const hasScanData = !!localStorage.getItem('skinlab_last_scan');

  // Mock trend data
  const trendData = [
    { date: '03/26', moisture: 62, oil: 48, score: 66 },
    { date: '03/28', moisture: 65, oil: 46, score: 68 },
    { date: '03/31', moisture: 68, oil: 44, score: 70 },
    { date: '04/01', moisture: 68, oil: 45, score: 71 },
    { date: '04/03', moisture: 70, oil: 43, score: 72 },
    { date: '04/05', moisture: 72, oil: 45, score: 74 },
  ];

  const reports = [
    {
      id: 1,
      date: '2026.04.05',
      score: 74,
      type: '복합성 피부',
      change: '+3',
      trend: 'up',
    },
    {
      id: 2,
      date: '2026.04.01',
      score: 71,
      type: '복합성 피부',
      change: '+1',
      trend: 'up',
    },
    {
      id: 3,
      date: '2026.03.26',
      score: 66,
      type: '건성 경향',
      change: '-2',
      trend: 'down',
    },
  ];

  if (!hasScanData) {
    return (
      <div className="min-h-screen bg-background-gray">
        <Header variant="dashboard" />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4 tablet:p-6 desktop:p-8 pb-24 desktop:pb-8">
            <div className="max-w-lg mx-auto text-center py-20 animate-fadeIn">
              <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText size={36} className="text-primary-300" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-3">
                아직 리포트가 없습니다
              </h2>
              <p className="text-text-secondary mb-8">
                첫 스캔을 완료하면 분석 리포트를 확인할 수 있습니다.
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

        <main className="flex-1 p-4 tablet:p-6 desktop:p-8 pb-24 desktop:pb-8 max-w-5xl animate-fadeIn">
          {/* Title */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-text-primary">분석 리포트</h1>
              <p className="text-sm text-text-secondary">피부 변화 추이를 확인하세요</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" icon={Download}>내보내기</Button>
              <Button variant="outline" size="sm" icon={Share2}>공유</Button>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">피부 점수 추이</h3>
              <div className="flex gap-1">
                {['week', 'month', '3month'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      period === p
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                    }`}
                  >
                    {p === 'week' ? '1주' : p === 'month' ? '1개월' : '3개월'}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#757575' }} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 12, fill: '#757575' }} />
                  <Tooltip
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#4CAF50" strokeWidth={2.5} dot={{ fill: '#4CAF50', r: 4 }} />
                  <Line type="monotone" dataKey="moisture" stroke="#60A5FA" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                  <Line type="monotone" dataKey="oil" stroke="#FBBF24" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-primary-500"></span>
                <span className="text-xs text-text-secondary">종합 점수</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-blue-400 border-dashed"></span>
                <span className="text-xs text-text-secondary">수분도</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-yellow-400"></span>
                <span className="text-xs text-text-secondary">유분도</span>
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div className="card">
            <h3 className="text-sm font-semibold text-text-primary mb-4">리포트 목록</h3>
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 bg-background-gray rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                      <Calendar size={18} className="text-primary-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{report.date}</p>
                      <p className="text-xs text-text-secondary">{report.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary-500">{report.score}점</p>
                      <div className={`flex items-center gap-1 text-xs ${
                        report.trend === 'up' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {report.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        <span>{report.change}점</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
};

export default ReportPage;
