// Mock 데이터 - 백엔드 연동 전 테스트용

export const mockWeather = {
  temp: 22,
  humidity: 58,
  uv: 'high',
  dust: 'moderate',
};

export const mockUser = {
  nickname: '테스트',
  scanCount: 0,
  lastScan: null,
};

export const mockAnalysis = {
  moisture: 72,
  oil: 45,
  elasticity: 38,
  spots: 63,
  pigmentation: 55,
  overallScore: 74,
  skinType: '복합성 피부',
  date: '2026.04.05',
};

export const mockScanHistory = [
  {
    id: 1,
    date: '2026.04.01',
    area: '얼굴 전체',
    type: '복합성',
    score: 71,
    details: '수분 68% · 모공 우수',
  },
  {
    id: 2,
    date: '2026.03.26',
    area: '볼 부위',
    type: '건성 경향',
    score: 66,
    details: '수분 62%',
  },
];

export const mockProducts = [
  {
    id: 1,
    name: '수분 세럼',
    brand: '라운드어라운드',
    category: '세럼/앰플',
    match: 95,
    reason: '수분 보충에 효과적',
    image: null,
  },
  {
    id: 2,
    name: 'BHA 토너',
    brand: '코스알엑스',
    category: '토너',
    match: 88,
    reason: '모공 관리 추천',
    image: null,
  },
  {
    id: 3,
    name: 'SPF50+ 선크림',
    brand: '아이소이',
    category: '선크림',
    match: 92,
    reason: '자외선 차단 필수',
    image: null,
  },
  {
    id: 4,
    name: '시카 크림',
    brand: '닥터지',
    category: '크림',
    match: 85,
    reason: '민감 피부 진정',
    image: null,
  },
];

export const mockRadarData = [
  { subject: '수분도', value: 72, fullMark: 100 },
  { subject: '유분도', value: 45, fullMark: 100 },
  { subject: '탄력', value: 38, fullMark: 100 },
  { subject: '반점', value: 63, fullMark: 100 },
  { subject: '색소침착', value: 55, fullMark: 100 },
];

export const mockBarData = [
  { name: '수분도', value: 72, color: '#4CAF50' },
  { name: '유분도', value: 45, color: '#66BB6A' },
  { name: '모공', value: 38, color: '#E8A838' },
  { name: '탄력', value: 63, color: '#81C784' },
  { name: '색소침착', value: 55, color: '#A5D6A7' },
];

export const mockCareAdvice = {
  primary: '현재 모공 관리를 위해 BHA 성분 토너 사용을 권장합니다.',
  secondary: '오늘 자외선이 강하니 SPF 50+ 선크림을 꼭 발라주세요.',
};
