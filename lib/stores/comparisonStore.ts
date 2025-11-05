// Simple comparison store using localStorage
export const comparisonStore = {
  get: (): string[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('comparison');
    return stored ? JSON.parse(stored) : [];
  },
  
  add: (productId: string): void => {
    const items = comparisonStore.get();
    if (!items.includes(productId) && items.length < 4) {
      items.push(productId);
      localStorage.setItem('comparison', JSON.stringify(items));
      window.dispatchEvent(new Event('comparison-updated'));
    }
  },
  
  remove: (productId: string): void => {
    const items = comparisonStore.get().filter(id => id !== productId);
    localStorage.setItem('comparison', JSON.stringify(items));
    window.dispatchEvent(new Event('comparison-updated'));
  },
  
  clear: (): void => {
    localStorage.removeItem('comparison');
    window.dispatchEvent(new Event('comparison-updated'));
  },
  
  has: (productId: string): boolean => {
    return comparisonStore.get().includes(productId);
  },
  
  count: (): number => {
    return comparisonStore.get().length;
  }
};
