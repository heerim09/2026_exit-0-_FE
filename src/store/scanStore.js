import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mockScanHistory, mockAnalysis } from '../utils/mockData';

const useScanStore = create(
  persist(
    (set, get) => ({
      scans: [],
      currentScan: null,
      loading: false,

      // Initialize with mock data if empty
      initializeIfNeeded: () => {
        const state = get();
        if (state.scans.length === 0) {
          // Enrich mock history items so they have the fields needed for AnalysisPage
          const enrichedMockScans = mockScanHistory.map(scan => ({
            ...mockAnalysis,
            id: scan.id,
            date: scan.date,
            area: scan.area,
            skinType: scan.type,
            overallScore: scan.score,
            createdAt: new Date().toISOString(),
          }));

          set({
            scans: enrichedMockScans,
            currentScan: enrichedMockScans[0]
          });
        }
      },

      // 스캔 결과 추가
      addScan: (scanData) => {
        const newScan = {
          ...scanData,
          id: Date.now(),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          scans: [newScan, ...state.scans],
          currentScan: newScan,
        }));

        return newScan;
      },

      // 모든 스캔 기록 가져오기
      getAllScans: () => {
        return get().scans;
      },

      // 특정 스캔 선택
      setCurrentScan: (scan) => {
        set({ currentScan: scan });
      },

      // 스캔 삭제
      removeScan: (scanId) => {
        set((state) => {
          const filtered = state.scans.filter((s) => s.id !== scanId);
          const newCurrent = filtered.length > 0 ? filtered[0] : null;
          return { scans: filtered, currentScan: newCurrent };
        });
      },

      // 로딩 상태
      setLoading: (loading) => set({ loading }),

      // 전체 초기화
      clearAll: () => {
        set({ scans: [], currentScan: null });
      },
    }),
    {
      name: 'skinlab_scan_store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useScanStore;
