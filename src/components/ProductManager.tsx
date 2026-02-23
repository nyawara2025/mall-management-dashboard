import React, { useState, useEffect } from 'react';
import { Package, Plus, Copy, Share2, Search, Trash2, Edit, ArrowLeft, Loader2 } from 'lucide-react';

interface ProductManagerProps {
  shopId: number;
  onBack: () => void;
}

export const ProductManager: React.FC<ProductManagerProps> = ({ shopId, onBack }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Match the trigger logic from your SalesManagement component
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/shop-products-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_products', shop_id: shopId })
      });

      if (!response.ok) throw new Error('Failed to fetch');
      
      const result = await response.json();
      console.log("📦 Raw n8n result:", result);

      // FIX: Look for result.products based on your n8n output
      let productsArray = [];
      if (Array.isArray(result)) {
       productsArray = result[0].products || result;
      } else if (result.products) {
        productsArray = result.products;
      }

      setProducts(productsArray);
    } catch (error) {
      console.error("Webhook trigger failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (shopId) fetchProducts();
  }, [shopId]);


   // --- ADD HANDLER STUBS HERE ---
  const handleEdit = (product: any) => {
    console.log("Editing:", product.product_id);
    // Future: Open a modal or navigate to edit page
  };

  const handleCopy = (product: any) => {
    console.log("Copying:", product.product_id);
    // Future: Trigger n8n webhook with 'duplicate' action
  };

  const handleShare = async (product: any) => {
    // UPDATED: URL now only points to the main Shop ID
    const shareUrl = `https://tenearwhatsappcheckins.pages.dev{shopId}&campaign=General%20Campaign`;
    
    // Exact text structure from your screenshot
    const shareText = 
`🤖 NEW PRODUCT ALERT!

📦 ${product.product_name}
💰 KShs ${product.base_price}
📁 ${product.product_category || 'General'}
📝 ${product.product_description || ''}

🔗 View online: ${shareUrl}

🤖 Available at Shop${shopId}
#${(product.product_category || 'General').replace(/\s+/g, '')} #Shop${shopId} #QualityProducts`;

    if (navigator.share) {
      try {
        const response = await fetch(product.product_image_url);
        const blob = await response.blob();
        const file = new File([blob], 'product.jpg', { type: blob.type });

        await navigator.share({
          title: product.product_name,
          text: shareText,
          files: [file] // This sends the specific Tilapia image
        });
      } catch (error) {
        // Fallback for mobile browser cancels or errors
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      }
    } else {
      // Desktop fallback
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };
 

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      console.log("Delete product:", id);
      // Future: fetch('https://n8n.tenear.com...', { method: 'POST', body: { action: 'delete', id: productId }})
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 max-w-6xl mx-auto min-h-[700px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          <p className="text-gray-500 text-sm">Shop ID: <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 rounded">{shopId}</span></p>
        </div>
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[400px]">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500">Fetching products...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {products.map((product) => (
            <div key={product.product_id} className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
              {/* Product Image Section */}
              <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                {product.product_image_url ? (
                  <img 
                    src={product.product_image_url} 
                    alt={product.product_name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-12 h-12 opacity-20" />
                  </div>
                )}

                {/* Hover Action Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => handleEdit(product)} className="p-2 bg-white rounded-full text-blue-600 hover:bg-blue-50 transition-colors shadow-sm" title="Edit">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleCopy(product)} className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-50 transition-colors shadow-sm" title="Duplicate">
                    <Copy className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleShare(product)} className="p-2 bg-white rounded-full text-green-600 hover:bg-green-50 transition-colors shadow-sm" title="Share">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(product.product_id)} className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors shadow-sm" title="Delete">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-4 flex-grow">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-gray-800 line-clamp-1">{product.product_name}</h3>
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-500 rounded-md uppercase">
                    {product.product_category || 'General'}
                  </span>
                </div>
                <p className="text-blue-600 font-bold text-lg">KES {product.base_price}</p>
                <p className="text-gray-500 text-xs mt-2 line-clamp-2">{product.product_description}</p>
              </div>
            </div>
          ))}


          <button className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-all">
            <Plus className="w-8 h-8 mb-2" />
            <span>Add New Product</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
