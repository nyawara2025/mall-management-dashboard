import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, CheckCircle, Trash2, Plus, Minus, Package } from 'lucide-react';

interface POSProps {
  shopId: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
}

export const POS: React.FC<POSProps> = ({ shopId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<(Product & { quantity: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Use your existing n8n endpoint
  const N8N_WEBHOOK_URL = 'https://n8n.tenear.com/webhook/pos-transaction';

  useEffect(() => {
    async function fetchProducts() {
      setFetching(true);
      try {
        // We send a GET request to n8n to fetch products for this shop
        // Ensure your n8n workflow handles 'GET' and returns the product list
        const response = await fetch(`${N8N_WEBHOOK_URL}?shop_id=${shopId}&action=get_products`);
        
        if (response.ok) {
          const data = await response.json();
          // Filter out out-of-stock items in-app for safety
          const available = (Array.isArray(data) ? data : []).filter(p => p.stock_quantity > 0);
          setProducts(available);
        } else {
          console.error('n8n returned an error fetching products');
        }
      } catch (err) {
        console.error('Network error fetching products via n8n:', err);
      } finally {
        setFetching(false);
      }
    }
    
    if (shopId) fetchProducts();
  }, [shopId]);

  const addToCart = (product: Product) => {
    setCart(current => {
      const exists = current.find(item => item.id === product.id);
      if (exists) {
        return current.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(current => current.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(current => current.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const calculateTotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process_sale',
          shop_id: shopId,
          items: cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          total: calculateTotal(),
          payment_method: 'cash',
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert('Cash Sale Recorded Successfully!');
        setCart([]);
        // Refresh product list to reflect new stock levels
        window.location.reload(); 
      } else {
        const errData = await response.json();
        alert(`Error: ${errData.message || 'Failed to record sale'}`);
      }
    } catch (err) {
      alert('Network error. Check your connection to TeNEAR n8n.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] gap-4 p-4">
      {/* Product Catalog */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border p-4 overflow-hidden flex flex-col">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-3">
          {fetching ? (
            <div className="col-span-full flex items-center justify-center p-12 text-gray-400">Loading products from n8n...</div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="flex flex-col p-3 text-left border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <span className="font-bold text-gray-800 group-hover:text-blue-700">{product.name}</span>
                <span className="text-blue-600 font-semibold text-sm">KES {product.price}</span>
                <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">In Stock: {product.stock_quantity}</span>
              </button>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-gray-400 italic">
              <Package size={48} className="opacity-10 mb-2" />
              <p>No products found for this shop.</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Summary */}
      <div className="w-full md:w-96 bg-white rounded-xl shadow-sm border flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-gray-600" />
          <h2 className="font-bold text-gray-700">Order Details</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 italic py-20 text-center">
              <p className="text-sm">Empty Cart</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex flex-col border-b border-gray-100 pb-3">
                <div className="flex justify-between font-medium text-sm text-gray-800">
                  <span className="truncate pr-4">{item.name}</span>
                  <span>KES {item.price * item.quantity}</span>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 bg-gray-100 rounded hover:bg-gray-200"><Minus size={14}/></button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 bg-gray-100 rounded hover:bg-gray-200"><Plus size={14}/></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-red-400 hover:text-red-600 rounded transition-colors"><Trash2 size={16}/></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t mt-auto">
          <div className="flex justify-between text-xl font-bold mb-4 text-gray-900">
            <span>Total</span>
            <span className="text-blue-700">KES {calculateTotal()}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || loading}
            className="w-full py-4 bg-green-600 text-white rounded-xl font-bold disabled:bg-gray-300 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
          >
            {loading ? 'Processing...' : <><CheckCircle size={20} /> Complete Cash Sale</>}
          </button>
        </div>
      </div>
    </div>
  );
};
