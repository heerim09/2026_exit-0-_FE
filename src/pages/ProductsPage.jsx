import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Scan, ArrowRight, Leaf, Sparkles,
} from 'lucide-react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import BottomNav from '../components/common/BottomNav';
import Button from '../components/common/Button';
import useMockAuth from '../hooks/useMockAuth';
import { mockProducts, calculateCompatibility } from '../utils/mockData';

// ─── 카테고리 정의 ─────────────────────────────────────
const categories = [
  { id: 'all', label: '전체' },
  { id: '클렌저', label: '클렌저' },
  { id: '토너', label: '토너' },
  { id: '세럼/앰플', label: '세럼/앰플' },
  { id: '크림', label: '크림' },
  { id: '선크림', label: '선크림' },
];

// ─── 제품 카드 컴포넌트 ───────────────────────────────────
const ProductCard = ({ product }) => {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden
                 hover:shadow-lg hover:border-primary-200 transition-all duration-300 group"
    >
      {/* 제품 이미지 영역 */}
      <div
        className="aspect-square flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: product.bgColor || '#F5F5F5' }}
      >
        <div
          className="w-20 h-20 rounded-2xl opacity-70 group-hover:scale-110 transition-transform duration-500"
          style={{ backgroundColor: product.accentColor || '#A5D6A7' }}
        />
      </div>

      {/* 제품 정보 영역 */}
      <div className="p-4">
        {/* 카테고리 배지 */}
        <span className="inline-block text-[10px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded mb-2">
          {product.badgeLabel || product.category}
        </span>

        {/* 브랜드 */}
        <p className="text-[11px] text-text-secondary mb-0.5">{product.brand}</p>

        {/* 제품명 */}
        <h3 className="text-sm font-bold text-text-primary mb-1 leading-snug line-clamp-2">
          {product.name}
        </h3>

        {/* 주요 성분 */}
        <p className="text-[11px] text-text-secondary mb-3 line-clamp-1">
          {product.ingredients.join(', ')}
        </p>

        {/* 하단: 궁합도 + 자세히 버튼 */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full">
            궁합 {product.compatibility}%
          </span>
          <button className="text-[11px] text-text-secondary font-medium flex items-center gap-0.5 hover:text-primary-600 transition-colors">
            자세히 <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── 사이드바 카테고리 메뉴 (데스크톱) ─────────────────────
const CategorySidebar = ({ categories, active, onSelect, lowStim, onLowStim, vegan, onVegan }) => {
  return (
    <div className="hidden desktop:block w-40 flex-shrink-0 mr-6">
      {/* 카테고리 섹션 */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-3 px-2">
          카테고리
        </p>
        <nav className="flex flex-col gap-0.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                active === cat.id
                  ? 'bg-primary-50 text-primary-600 font-semibold'
                  : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
              }`}
            >
              <span
                className={`w-3 h-3 rounded flex-shrink-0 ${
                  active === cat.id ? 'bg-primary-400' : 'bg-gray-200'
                }`}
              />
              {cat.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 필터 섹션 */}
      <div>
        <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-3 px-2">
          필터
        </p>
        <div className="flex flex-col gap-0.5">
          <button
            onClick={onLowStim}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
              lowStim
                ? 'bg-primary-50 text-primary-600 font-semibold'
                : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
            }`}
          >
            <span className={`w-3 h-3 rounded flex-shrink-0 ${lowStim ? 'bg-primary-400' : 'bg-gray-200'}`} />
            저자극
          </button>
          <button
            onClick={onVegan}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
              vegan
                ? 'bg-primary-50 text-primary-600 font-semibold'
                : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
            }`}
          >
            <span className={`w-3 h-3 rounded flex-shrink-0 ${vegan ? 'bg-primary-400' : 'bg-gray-200'}`} />
            비건
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── ProductsPage 메인 ─────────────────────────────────
const ProductsPage = () => {
  const { user } = useMockAuth(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [lowStimulation, setLowStimulation] = useState(false);
  const [veganOnly, setVeganOnly] = useState(false);

  const hasScanData = !!localStorage.getItem('skinlab_last_scan');

  // 유저 프로필 (localStorage에서 가져오기)
  const userProfile = useMemo(() => {
    const stored = localStorage.getItem('skinlab_current_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        skinType: parsed.skinType || '복합성',
        concerns: parsed.concerns || ['모공', '건조'],
      };
    }
    return { skinType: '복합성', concerns: ['모공', '건조'] };
  }, []);

  // 궁합도 계산 후 정렬 + 필터
  const filteredProducts = useMemo(() => {
    let list = mockProducts.map((p) => ({
      ...p,
      compatibility: calculateCompatibility(p, userProfile),
    }));

    // 카테고리 필터
    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category === activeCategory);
    }

    // 저자극 필터
    if (lowStimulation) {
      list = list.filter((p) => p.isLowStimulation);
    }

    // 비건 필터
    if (veganOnly) {
      list = list.filter((p) => p.isVegan);
    }

    // 궁합도 순 정렬 (높은 순)
    list.sort((a, b) => b.compatibility - a.compatibility);

    return list;
  }, [activeCategory, lowStimulation, veganOnly, userProfile]);

  const toggleLowStim = useCallback(() => setLowStimulation((v) => !v), []);
  const toggleVegan = useCallback(() => setVeganOnly((v) => !v), []);

  // ─── 스캔 데이터 없을 때 Empty State ────────────────
  if (!hasScanData) {
    return (
      <div className="min-h-screen bg-background-gray">
        <Header variant="dashboard" />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4 tablet:p-6 desktop:p-8 pb-24 desktop:pb-8">
            <div className="max-w-lg mx-auto text-center py-20 animate-fadeIn">
              <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={36} className="text-primary-300" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-3">
                맞춤 제품을 추천받으세요
              </h2>
              <p className="text-text-secondary mb-8">
                피부 스캔을 완료하면 AI가 맞춤 제품을 추천해드립니다.
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
            {/* ── 안내 배너 ─────────────────────────────── */}
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 tablet:p-5 mb-6">
              <div className="flex items-start gap-3">
                <Sparkles size={18} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-primary-700 leading-relaxed">
                  모공 개선 + 수분 보습이 필요한 복합성 피부에 맞는 제품이에요.
                  피부 분석 결과를 기반으로 궁합 점수를 계산했어요.
                </p>
              </div>
            </div>

            {/* ── 모바일 카테고리 탭 + 필터 ──────────────── */}
            <div className="desktop:hidden mb-6">
              {/* 카테고리 탭 (모바일/태블릿) */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      activeCategory === cat.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-white border border-gray-200 text-text-secondary hover:border-primary-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              {/* 필터 토글 (모바일/태블릿) */}
              <div className="flex gap-2">
                <button
                  onClick={toggleLowStim}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    lowStimulation
                      ? 'bg-primary-500 text-white'
                      : 'bg-white border border-gray-200 text-text-secondary'
                  }`}
                >
                  <Leaf size={12} />
                  저자극
                </button>
                <button
                  onClick={toggleVegan}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    veganOnly
                      ? 'bg-primary-500 text-white'
                      : 'bg-white border border-gray-200 text-text-secondary'
                  }`}
                >
                  🌱 비건
                </button>
              </div>
            </div>

            {/* ── 메인 컨텐츠: 사이드바 + 그리드 ─────────── */}
            <div className="flex">
              {/* 데스크톱 사이드 카테고리 */}
              <CategorySidebar
                categories={categories}
                active={activeCategory}
                onSelect={setActiveCategory}
                lowStim={lowStimulation}
                onLowStim={toggleLowStim}
                vegan={veganOnly}
                onVegan={toggleVegan}
              />

              {/* 제품 그리드 */}
              <div className="flex-1 min-w-0">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag size={28} className="text-gray-300" />
                    </div>
                    <p className="text-sm text-text-secondary">
                      해당 조건에 맞는 제품이 없습니다.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-4">
                    {filteredProducts.map((product, idx) => (
                      <div
                        key={product.id}
                        className="animate-fadeIn"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
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

export default ProductsPage;
