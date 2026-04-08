import React, { useState, useEffect } from 'react';

// Define the structure of a Shop object
interface Shop {
  id: number;
  name: string;
  category: string;
}

// Define the Props for the SokoniModal component
interface SokoniModalProps {
  isOpen: boolean;
  onClose: () => void;
  shops: Shop[];
  onVisitShop: (shopId: number) => Promise<void> | void;
}

const SokoniModal: React.FC<SokoniModalProps> = ({ isOpen, onClose, shops, onVisitShop }) => {
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSelectedShopId('');
      setSearchTerm('');
      setSelectedCategory('');
    }
  }, [isOpen]);

  const generateSessionId = (): string => {
    const storedSession = localStorage.getItem('nhc_session_id');
    if (storedSession) return storedSession;

    const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('nhc_session_id', newSessionId);
    return newSessionId;
  };

  const handleVisitShop = async () => {
    if (!selectedShopId) return;

    const selectedShop = shops.find((shop: Shop) => shop.id.toString() === selectedShopId.toString());
    if (!selectedShop) return;

    setIsLoading(true);

    try {
      // 1. Await the tracking call from parent
      if (onVisitShop) {
        await onVisitShop(Number(selectedShop.id));
      }
      
      // 2. Small safety buffer (100ms)
      await new Promise(resolve => setTimeout(resolve, 100));

      const sessionId = generateSessionId();
      const marketplaceUrl = `https://tenearsocialmedia.pages.dev?shop_id=${selectedShop.id}&session_id=${sessionId}`;

      // 3. Open the shop
      window.open(marketplaceUrl, '_blank');
      
    } catch (error) {
      console.error('Tracking failed, but proceeding to shop:', error);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  // Cast to string array to fix 'unknown' type errors in the JSX map
  const categories = [...new Set(shops.map((shop: Shop) => shop.category).filter(Boolean))].sort() as string[];
  
  const filteredShops = shops.filter((shop: Shop) => {
    const matchesCategory = !selectedCategory || shop.category === selectedCategory;
    const matchesSearch = !searchTerm || shop.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedShop = shops.find((shop: Shop) => shop.id.toString() === selectedShopId.toString());

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px'
    }}>
      <style>
        {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
      </style>
      <div style={{
        backgroundColor: 'white', borderRadius: '16px', width: '100%',
        maxWidth: '400px', display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>🏪 Sokoni</h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#64748b' }}>Select a shop to visit</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
        </div>

        <div style={{ padding: '20px' }}>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', color: '#64748b' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTopColor: '#0891B2', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
              <p>Capturing analytics & opening {selectedShop?.name || 'Sokoni'}...</p>
            </div>
          ) : (
            <>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setSelectedShopId(''); }}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e5e7eb', marginBottom: '16px' }}
              >
                <option value="">All Categories</option>
                {categories.map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
              </select>

              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <input
                  type="text" placeholder="Search shops..." value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '2px solid #e5e7eb', boxSizing: 'border-box' }}
                />
                <span style={{ position: 'absolute', left: '14px', top: '12px' }}>🔍</span>
              </div>

              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                Shop ({filteredShops.length}):
              </label>
              <select
                value={selectedShopId}
                onChange={(e) => setSelectedShopId(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #e5e7eb', marginBottom: '20px' }}
              >
                <option value="">-- Select a shop --</option>
                {filteredShops.map((shop: Shop) => (
                  <option key={shop.id} value={shop.id}>{shop.name}</option>
                ))}
              </select>

              <button
                onClick={handleVisitShop}
                disabled={!selectedShopId}
                style={{
                  width: '100%', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 600,
                  backgroundColor: selectedShopId ? '#0891B2' : '#e5e7eb',
                  color: selectedShopId ? 'white' : '#9ca3af',
                  cursor: selectedShopId ? 'pointer' : 'not-allowed'
                }}
              >
                Visit Shop →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SokoniModal;
