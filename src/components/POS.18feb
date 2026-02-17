import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Trash2, Smartphone, Banknote, X, Printer, CheckCircle, Mail, Send } from 'lucide-react';

interface POSProps {
  shopId: number;
}

interface Product {
  product_id: number;
  product_name: string;
  base_price: number;
}

export const POS: React.FC<POSProps> = ({ shopId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<(Product & { quantity: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa'>('cash');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Digital Receipt States
  const [email, setEmail] = useState('');
  const [sendDigital, setSendDigital] = useState(false);
  
  // Modal State
  const [showPreview, setShowPreview] = useState<any | null>(null);

  // Webhook URLs
  const FETCH_PRODUCTS_URL = 'https://n8n.tenear.com/webhook/pos-transaction';
  const CASH_SALE_URL = 'https://n8n.tenear.com/webhook/pos-sale-cash';
  const MPESA_PUSH_URL = 'https://n8n.tenear.com/webhook/pos-transaction-push';

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
          const data = await response.json();
          setProducts(Array.isArray(data) ? data : (data ? [data] : []));
        }
      } catch (err) { console.error('Fetch error:', err); }
      finally { setFetching(false); }
    }
    if (shopId) fetchProducts();
  }, [shopId]);

  const calculateTotal = () => cart.reduce((sum, item) => sum + ((item.base_price ?? 0) * item.quantity), 0);

  const initiateCheckout = () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'mpesa' && !phoneNumber.match(/^(254|0)\d{8,9}$/)) {
      alert('Valid M-PESA number required.');
      return;
    }

    const previewData = {
      shop_id: shopId,
      items: cart,
      total: calculateTotal(),
      payment_method: paymentMethod,
      phone_number: phoneNumber || null,
      customer_email: email || null,
      send_digital_receipt: sendDigital,
      timestamp: new Date().toISOString()
    };
    setShowPreview(previewData);
  };

  const executeFinalSale = async () => {
    if (!showPreview) return;
    setLoading(true);
    const targetUrl = showPreview.payment_method === 'mpesa' ? MPESA_PUSH_URL : CASH_SALE_URL;

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(showPreview)
      });

      if (response.ok) {
        // Trigger print window
        const receiptWindow = window.open('', '_blank', 'width=300,height=600');
        if (receiptWindow) {
           const itemsList = showPreview.items.map((i: any) => `<div>${i.product_name} x${i.quantity} - KES ${(i.base_price ?? 0) * i.quantity}</div>`).join('');
           receiptWindow.document.write(`<html><body style="font-family:monospace;width:72mm;padding:5mm;"><h3>SHOP #${shopId}</h3><hr/>${itemsList}<hr/><b>TOTAL: KES ${showPreview.total}</b><script>window.print();window.close();</script></body></html>`);
           receiptWindow.document.close();
        }
        
        // Reset Form
        setCart([]);
        setPhoneNumber('');
        setEmail('');
        setSendDigital(false);
        setShowPreview(null);
        alert(showPreview.payment_method === 'mpesa' ? 'STK Push Sent & Recorded!' : 'Cash Sale Recorded!');
      }
    } catch (err) { alert('Transaction failed. Check connection.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen gap-4 p-4 bg-gray-50 text-gray-800">
      {/* Product List Section */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border p-4 flex flex-col overflow-hidden">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input 
            type="text" placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-3">
          {fetching ? <div className="text-center py-10 italic text-gray-400">Loading shop products...</div> : 
            products.filter(p => (p.product_name || '').toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
              <button key={product.product_id} onClick={() => setCart([...cart, {...product, quantity: 1}])}
                className="p-3 text-left border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
                <div className="font-bold">{product.product_name}</div>
                <div className="text-blue-600 text-sm">KES {(product.base_price ?? 0).toLocaleString()}</div>
              </button>
          ))}
        </div>
      </div>

      {/* Checkout Sidebar Section */}
      <div className="w-full md:w-96 bg-white rounded-xl shadow-sm border p-4 flex flex-col">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-2"><ShoppingCart size={20}/> Cart</h2>
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {cart.length === 0 ? <div className="text-center text-gray-400 mt-10">Cart Empty</div> : 
            cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm border-b pb-2">
                <div className="flex-1">
                  <div className="font-medium">{item.product_name}</div>
                  <div className="text-xs text-gray-500">KES {(item.base_price ?? 0).toLocaleString()} x {item.quantity}</div>
                </div>
                <button onClick={() => setCart(cart.filter((_, i) => i !== idx))}>
                  <Trash2 size={16} className="text-red-400 hover:text-red-600"/>
                </button>
              </div>
            ))}
        </div>

        <div className="border-t pt-4 space-y-4">
          <div className="flex justify-between font-bold text-xl">
            <span>Total</span><span>KES {calculateTotal().toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setPaymentMethod('cash')} className={`py-2 rounded-lg border font-semibold ${paymentMethod === 'cash' ? 'bg-green-600 text-white border-green-600' : 'bg-white'}`}>Cash</button>
            <button onClick={() => setPaymentMethod('mpesa')} className={`py-2 rounded-lg border font-semibold ${paymentMethod === 'mpesa' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white'}`}>M-PESA</button>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl space-y-3 border border-gray-100">
            <div className="flex items-center justify-between">
               <label className="text-[10px] font-bold text-gray-400 tracking-wider">SEND DIGITAL RECEIPT</label>
               <input type="checkbox" checked={sendDigital} onChange={(e) => setSendDigital(e.target.checked)} className="h-4 w-4 rounded text-blue-600" />
            </div>
            
            {paymentMethod === 'mpesa' && (
              <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
                <Smartphone size={16} className="text-gray-400"/>
                <input type="text" placeholder="M-PESA Phone No." className="w-full text-sm outline-none" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </div>
            )}

            {sendDigital && (
              <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 animate-in fade-in zoom-in duration-200">
                <Mail size={16} className="text-gray-400"/>
                <input type="email" placeholder="Customer Email" className="w-full text-sm outline-none" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            )}
          </div>

          <button disabled={cart.length === 0} onClick={initiateCheckout} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:bg-gray-300">
            Proceed to Payment
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Final Confirmation</h3>
              <button onClick={() => setShowPreview(null)}><X className="text-gray-400"/></button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm border-2 border-dashed border-gray-200 mb-6">
               <div className="flex justify-between font-bold border-b pb-2 mb-2">
                  <span>Grand Total</span>
                  <span className="text-blue-600 text-lg">KES {(showPreview.total ?? 0).toLocaleString()}</span>
               </div>
               <div className="max-h-32 overflow-y-auto space-y-1 mb-4">
                 {showPreview.items?.map((item: any, i: number) => (
                   <div key={i} className="flex justify-between text-[11px] text-gray-600">
                     <span>{item.product_name} x{item.quantity}</span>
                     <span>KES {((item.base_price ?? 0) * item.quantity).toLocaleString()}</span>
                   </div>
                 ))}
               </div>
               <div className="text-[10px] space-y-1 pt-2 border-t text-gray-500">
                  <p>PAYMENT: <span className="font-bold text-gray-700">{showPreview.payment_method?.toUpperCase()}</span></p>
                  {showPreview.phone_number && <p>CONTACT: <span className="font-bold text-gray-700">{showPreview.phone_number}</span></p>}
                  {showPreview.send_digital_receipt && (
                    <p className="text-blue-600 flex items-center gap-1 font-semibold mt-1">
                      <Send size={10}/> DIGITAL COPY: {showPreview.customer_email || 'No email set'}
                    </p>
                  )}
               </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowPreview(null)} className="flex-1 py-3 border rounded-xl font-semibold hover:bg-gray-50 transition-colors">Back</button>
              <button onClick={executeFinalSale} disabled={loading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-md">
                {loading ? 'Processing...' : <><CheckCircle size={18} /> Finalize</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
