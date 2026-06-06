import { ShoppingCart } from 'lucide-react';

export default function UpsellCard({ upsell, onAddToCart }) {
    const { product, reason } = upsell;

    const handleAdd = () => {
        onAddToCart({
            productId: product.id,
            quantity: 1
        });
    };

    return (
        <div className="border border-purple-200 bg-purple-50 rounded-lg p-3 hover:shadow-md transition-shadow">
            <div className="flex gap-3">
                {/* Product Image */}
                <div className="w-16 h-16 flex-shrink-0">
                    <img
                        src={product.image || product.images?.[0] || '/placeholder.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover rounded"
                    />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-semibold text-gray-800 truncate">
                        {product.name}
                    </h5>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                        {reason}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-purple-700">
                                ₹{product.price}
                            </span>
                            {product.avgRating > 0 && (
                                <span className="text-xs text-yellow-600">
                                    ★ {product.avgRating}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleAdd}
                            className="p-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                            title="Add to cart"
                        >
                            <ShoppingCart size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
