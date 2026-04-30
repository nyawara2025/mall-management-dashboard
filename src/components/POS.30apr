import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Trash2, X, Smartphone, Banknote, Image as ImageIcon } from 'lucide-react';
import { registerSW } from 'virtual:pwa-register'
registerSW({ immediate: true })

interface Variant {
  id: string;
  variant_name: string;
  price_impact: number;
  variant_stock: number;
}

interface Product {
  product_id: number;
  product_name: string;
  base_price: number;
  product_image_url?: string;
  variants?: Variant[];
}

interface CartItem extends Product {
  quantity: number;
  selectedVariantName?: string;
  final_price: number;
}

interface POSProps {
  shopId: number;
}

// Sub-component for Product Tiles to handle local variant selection
const ProductTile = ({ product, onAddToCart }: { product: Product, onAddToCart: (p: Product, v: Variant | null) => void }) => {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  
  const currentPrice = Number(product.base_price) + (selectedVariant?.price_impact || 0);

  return (
    <div className="p-3 border rounded-xl bg-white shadow-sm flex flex-col gap-2 hover:border-blue-400 transition-all">
      <div className="flex gap-3 items-center">
        {/* 1. Small Image Icons */}
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border">
          {product.product_image_url ? (
            <img src={product.product_image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <ImageIcon size={20} />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-bold truncate text-sm text-gray-900">{product.product_name}</div>
          <div className="text-blue-600 font-black text-xs">KES {currentPrice.toLocaleString()}</div>
        </div>
      </div>

      {/* 2. Dropdown for Variants */}
      {product.variants && product.variants.length > 0 ? (
        <select 
          className="text-[10px] p-2 border rounded-lg bg-gray-50 font-bold uppercase tracking-tight outline-none focus:ring-1 focus:ring-blue-500"
          onChange={(e) => {
            const v = product.variants?.find(v => v.id === e.target.value);
            setSelectedVariant(v || null);
          }}
        >
          <option value="">Standard (KES {product.base_price})</option>
          {product.variants.map(v => (
            <option key={v.id} value={v.id}>
              {v.variant_name} (+{v.price_impact})
            </option>
          ))}
        </select>
      ) : (
        <div className="h-8"></div> // Spacer to keep buttons aligned
      )}

      <button 
        onClick={() => onAddToCart(product, selectedVariant)}
        className="w-full py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black hover:bg-blue-700 transition-colors uppercase tracking-widest"
      >
        Add to Cart
      </button>
    </div>
  );
};

export const POS: React.FC<POSProps> = ({ shopId }) => {
  // 1. URLs must be defined inside the component or at the very top of the file
  const CASH_SALE_URL = 'https://n8n.tenear.com/webhook/pos-sale-cash';

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false); // <--- THIS WAS MISSING OR OUT OF SCOPE
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa'>('cash');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
 
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  
  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the default mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleDownloadApp = async () => {
    if (!installPrompt) return;
    // Show the native install prompt
    installPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    // Clear the prompt so it can't be used again
    setInstallPrompt(null);
  };

  useEffect(() => {
    const handleStatusChange = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) syncOfflineTransactions();
    };

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    // Initial check for pending items
    const pending = JSON.parse(localStorage.getItem(`pending_sales_${shopId}`) || '[]');
    setPendingCount(pending.length);

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, [shopId]);

  // 3. Function to push saved sales to n8n
  const syncOfflineTransactions = async () => {
    const storageKey = `pending_sales_${shopId}`;
    const pending = JSON.parse(localStorage.getItem(storageKey) || '[]');
  
    if (pending.length === 0) return;

    console.log(`Syncing ${pending.length} offline transactions...`);
  
    for (const sale of pending) {
      try {
        const response = await fetch(sale.targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sale.payload)
        });
        if (response.ok) {
          // Remove processed sale from local storage
          const currentPending = JSON.parse(localStorage.getItem(storageKey) || '[]');
          const updated = currentPending.filter((s: any) => s.id !== sale.id);
          localStorage.setItem(storageKey, JSON.stringify(updated));
          setPendingCount(updated.length);
        }
      } catch (err) {
        console.error("Sync failed for a record, will retry later.");
        break; // Stop if still having network issues
      }
    }
  };

  const executeFinalSale = async () => {
    if (cart.length === 0) return;
    
    setLoading(true);
    console.log("Transaction Started..."); // Check F12 Console for this

    const payload = {
      // Use crypto if available, otherwise fallback to a timestamp-based ID
      id: (typeof crypto.randomUUID === 'function') 
          ? crypto.randomUUID() 
          : `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      shop_id: shopId,
      items: cart,
      total: calculateTotal(),
      payment_method: paymentMethod,
      phone_number: phoneNumber,
      timestamp: new Date().toISOString()
    };

    // Determine the direct URL based on payment method
    const targetUrl = paymentMethod === 'mpesa' 
      ? 'https://n8n.tenear.com/webhook/pos-transaction-push' 
      : 'https://n8n.tenear.com/webhook/pos-transaction-push';

    console.log("Sending to:", targetUrl);

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log("Response OK");
        alert(paymentMethod === 'mpesa' ? 'M-PESA Push Sent!' : 'Cash Sale Recorded!');
        setCart([]);
      } else {
        console.error("Server Error:", response.status);
        throw new Error("Server error");
      }
    } catch (err) {
      console.warn("Network issue detected, saving locally...");
      // OFFLINE FALLBACK
      const storageKey = `pending_sales_${shopId}`;
      const pending = JSON.parse(localStorage.getItem(storageKey) || '[]');
      pending.push({ id: payload.id, payload, targetUrl });
      localStorage.setItem(storageKey, JSON.stringify(pending));
      setPendingCount(pending.length);
      
      alert('Internet connection weak. Sale saved locally and will sync later!');
      setCart([]);
    } finally {
      setLoading(false);
    }
  };


  const FETCH_PRODUCTS_URL = 'https://n8n.tenear.com/webhook/pos-transaction';

  useEffect(() => {
    async function fetchProducts() {
      setFetching(true);
      try {
        const response = await fetch(FETCH_PRODUCTS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: { shop_id: shopId.toString(), action: "get_products" } })
        });
        
        if (response.ok) {
          const rawData: any[] = await response.json();
  
          const grouped = rawData.reduce((acc: Product[], item: any) => {
            // 1. Find if the product already exists in our accumulator
            let existingProduct = acc.find(p => p.product_id === item.product_id);
    
            // 2. Define what constitutes a variant based on your n8n output
            // We use variant_name as a fallback ID if variant_id is missing
            const vId = item.variant_id || item.variant_name; 
            const hasVariant = item.variant_name && item.variant_name.trim() !== "";

            const variantObj: Variant | null = hasVariant ? {
              id: vId.toString(),
              variant_name: item.variant_name,
              price_impact: Number(item.price_impact) || 0,
              variant_stock: Number(item.variant_stock) || 0
            } : null;

            if (existingProduct) {
              // 3. If product exists, add the variant to its array
              if (variantObj && !existingProduct.variants?.some(v => v.id === variantObj.id)) {
                existingProduct.variants = [...(existingProduct.variants || []), variantObj];
              }
            } else {
              // 4. If product is new, create it
              acc.push({
                product_id: item.product_id,
                product_name: item.product_name,
                base_price: Number(item.base_price) || 0,
                product_image_url: item.product_image_url?.trim(), // Clean up the URL
                variants: variantObj ? [variantObj] : []
              });
            }
            return acc;
          }, []);

          setProducts(grouped);
        }


      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setFetching(false);
      }
    }
    if (shopId) fetchProducts();
  }, [shopId]);
    


  // 3 & 4. Alphabetical Sorting + Fixed Search Function
  const filteredProducts = products
    .filter(p => (p.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.product_name.localeCompare(b.product_name));

  const handleAddToCart = (product: Product, variant: Variant | null) => {
    const final_price = Number(product.base_price) + (variant?.price_impact || 0);
    const cartKey = variant ? `${product.product_id}-${variant.id}` : `${product.product_id}-base`;

    const newItem: CartItem = {
      ...product,
      final_price,
      selectedVariantName: variant?.variant_name,
      quantity: 1
    };

    setCart([...cart, newItem]);
  };

  const calculateTotal = () => cart.reduce((sum, item) => sum + (item.final_price * item.quantity), 0);

  return (
    <div className="flex flex-col md:flex-row h-screen gap-4 p-4 bg-gray-50 text-gray-800 relative">
      {/* Product Grid Section */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border p-4 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products by name..."
              className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 font-medium"
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* 1. DOWNLOAD APP BUTTON */}
          {installPrompt && (
            <button 
              onClick={handleDownloadApp}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-green-100 hover:bg-green-700 transition-all shrink-0"
            >
              <Smartphone size={16} /> Download App
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {fetching ? (
            <div className="flex items-center justify-center h-full italic text-gray-400">Loading shop inventory...</div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map(product => (
                <ProductTile 
                  key={product.product_id} 
                  product={product} 
                  onAddToCart={handleAddToCart} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full md:w-96 bg-white rounded-2xl shadow-sm border p-4 flex flex-col">
        {/* 2. ONLINE/OFFLINE STATUS INDICATOR */}
        <div className="mb-2 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
              {isOnline ? 'System Online' : 'System Offline'}
            </span>
          </div>
          {pendingCount > 0 && (
            <span className="bg-orange-100 text-orange-600 text-[9px] px-2 py-0.5 rounded-full font-black animate-bounce">
              {pendingCount} PENDING SYNC
            </span>
          )}
        </div>

        <h2 className="text-lg font-black mb-4 flex items-center gap-2 border-b pb-4 uppercase tracking-tight">
          <ShoppingCart size={20} className="text-blue-600"/> Checkout Cart
        </h2>
        
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 opacity-50">
              <ShoppingCart size={40} />
              <p className="text-xs font-bold uppercase">Cart is Empty</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="flex-1">
                  <div className="font-bold text-sm text-gray-900">{item.product_name}</div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase">
                    {item.selectedVariantName ? item.selectedVariantName : 'Standard'} • KES {item.final_price.toLocaleString()}
                  </div>
                </div>
                <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="p-2 hover:bg-red-50 rounded-lg group">
                  <Trash2 size={16} className="text-gray-300 group-hover:text-red-500 transition-colors" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="border-t pt-4 space-y-4">
          <div className="flex justify-between items-end">
            <span className="text-xs font-black text-gray-400 uppercase">Total Payable</span>
            <span className="text-2xl font-black text-blue-600">KES {calculateTotal().toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
            <button 
              onClick={() => setPaymentMethod('cash')} 
              className={`py-2.5 rounded-lg text-xs font-black uppercase transition-all ${paymentMethod === 'cash' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500'}`}
            >
              Cash
            </button>
            <button 
              onClick={() => setPaymentMethod('mpesa')} 
              className={`py-2.5 rounded-lg text-xs font-black uppercase transition-all ${paymentMethod === 'mpesa' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500'}`}
            >
              M-PESA
            </button>
          </div>

          {paymentMethod === 'mpesa' && (
            <input 
              type="text" 
              placeholder="07XX XXX XXX" 
              className="w-full p-3 border rounded-xl font-bold text-center bg-purple-50 border-purple-100 outline-none focus:ring-2 focus:ring-purple-500"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          )}

          {/* 3. FINAL TRANSACTION BUTTON WITH LOADING STATE */}
          <button 
            disabled={cart.length === 0 || loading}
            onClick={executeFinalSale}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:bg-gray-200 disabled:shadow-none transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>Processing...</>
            ) : (
              <>Complete Transaction</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
