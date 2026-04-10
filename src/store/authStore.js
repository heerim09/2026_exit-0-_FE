import { create } from 'zustand';

const useAuthStore = create((set, get) => ({
  isLoggedIn: false,
  user: null,
  
  login: (email, password) => {
    // localStorage에서 사용자 확인
    const users = JSON.parse(localStorage.getItem('skinlab_users') || '[]');
    const found = users.find(u => u.email === email && u.password === password);
    
    if (found) {
      const userData = { ...found };
      delete userData.password;
      set({ isLoggedIn: true, user: userData });
      localStorage.setItem('skinlab_current_user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, message: '이메일 또는 비밀번호가 일치하지 않습니다.' };
  },

  signup: (data) => {
    const users = JSON.parse(localStorage.getItem('skinlab_users') || '[]');
    
    // 이메일 중복 체크
    if (users.find(u => u.email === data.email)) {
      return { success: false, message: '이미 등록된 이메일입니다.' };
    }
    
    const newUser = {
      ...data,
      id: Date.now(),
      scanCount: 0,
      lastScan: null,
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    localStorage.setItem('skinlab_users', JSON.stringify(users));
    
    const userData = { ...newUser };
    delete userData.password;
    set({ isLoggedIn: true, user: userData });
    localStorage.setItem('skinlab_current_user', JSON.stringify(userData));
    
    return { success: true };
  },

  logout: () => {
    set({ isLoggedIn: false, user: null });
    localStorage.removeItem('skinlab_current_user');
  },

  checkAuth: () => {
    const userData = localStorage.getItem('skinlab_current_user');
    if (userData) {
      set({ isLoggedIn: true, user: JSON.parse(userData) });
      return true;
    }
    return false;
  },

  updateScanData: (scanData) => {
    const user = get().user;
    if (user) {
      const updatedUser = {
        ...user,
        scanCount: (user.scanCount || 0) + 1,
        lastScan: scanData,
      };
      set({ user: updatedUser });
      localStorage.setItem('skinlab_current_user', JSON.stringify(updatedUser));
      
      // Update in users list too
      const users = JSON.parse(localStorage.getItem('skinlab_users') || '[]');
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updatedUser };
        localStorage.setItem('skinlab_users', JSON.stringify(users));
      }
    }
  },
}));

export default useAuthStore;
