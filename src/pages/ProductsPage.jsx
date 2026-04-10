import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Star, ExternalLink, Filter, Scan, Heart,
} from 'lucide-react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import BottomNav from '../components/common/BottomNav';
import Button from '../components/common/Button';
import useMockAuth from '../hooks/useMockAuth';
import { mockProducts } from '../utils/mockData';

const ProductsPage = () => {
  const { user } = useMockAuth(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [likedItems, setLikedItems] = useState([]);

  const hasScanData = !!localStorage.getItem('skinlab_last_scan');

  const categories = [
    { id: 'all', label: '전체' },
    { id: '클렌저', label: '클렌저' },
    { id: '토너', label: '토너' },
    { id: '세럼/앰플', label: '세럼/앰플' },
    { id: '크림', label: '크림' },
    { id: '선크림', label: '선크림' },
  ];

  const filteredProducts = activeCategory === 'all'
    ? mockProducts
    : mockProducts.filter((p) => p.category === activeCategory);

  const toggleLike = (id) => {
    setLikedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

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

        <main className="flex-1 p-4 tablet:p-6 desktop:p-8 pb-24 desktop:pb-8 max-w-5xl animate-fadeIn">
          {/* Title */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-text-primary">제품 추천</h1>
              <p className="text-sm text-text-secondary">내 피부에 맞는 화장품을 찾아보세요</p>
            </div>
            <Button variant="outline" size="sm" icon={Filter}>필터</Button>
          </div>

          {/* AI Summary */}
          <div className="card bg-primary-50 border-primary-100 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Star size={18} className="text-primary-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-primary-700 mb-1">AI 추천 요약</h3>
                <p className="text-sm text-primary-600 leading-relaxed">
                  현재 수분 보충과 모공 관리가 필요합니다.
                  BHA 성분의 토너와 히알루론산 기반 세럼을 추천드립니다.
                </p>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
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

          {/* Products Grid */}
          <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="card hover:border-primary-200 transition-colors">
                <div className="flex gap-4">
                  {/* Product Image Placeholder */}
                  <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShoppingBag size={28} className="text-gray-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-text-secondary">{product.brand}</p>
                        <h3 className="text-sm font-semibold text-text-primary mt-0.5">{product.name}</h3>
                      </div>
                      <button
                        onClick={() => toggleLike(product.id)}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Heart
                          size={18}
                          className={likedItems.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-300'}
                        />
                      </button>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">{product.reason}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="badge-green text-[10px]">
                        궁합 {product.match}%
                      </span>
                      <button className="text-xs text-primary-500 font-medium flex items-center gap-1 hover:text-primary-600">
                        자세히 <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProductsPage;
