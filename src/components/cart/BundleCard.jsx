import { useState } from 'react';
import { ShoppingCart, ChevronDown } from 'lucide-react';

export default function BundleCard({ bundle, onAddToCart }) {
    const { bundleName, reason, products, bundlePrice, totalPrice, discountAmount, savingsPercent } = bundle;
    const [expanded, setExpanded] = useState(false);

    const handleAddBundle = () => {
        products.forEach(product => {
            onAddToCart({
                productId: product.id,
                quantity: 1
            });
        });
    };

    return (
        <div className="border border-green-200 bg-green-50 rounded-lg p-4 hover:shadow-md transition-shadow">
            {/* Bundle Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h5 className="text-sm font-bold text-gray-900">
                            {bundleName}
                        </h5>
                        <span className="inline-block bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                            Save {savingsPercent}%
                        </span>
                    </div>
                    <p className="text-xs text-gray-600">
                        {reason}
                    </p>
                </div>

                {/* Price Summary */}
                <div className="text-right flex-shrink-0">
                    <div className="text-xs text-gray-500 line-through">
                        ₹{totalPrice}
                    </div>
                    <div className="text-lg font-bold text-green-700">
                        ₹{bundlePrice}
                    </div>
                    <div className="text-xs text-green-600 font-semibold">
                        Save ₹{discountAmount}
                    </div>
                </div>
            </div>

            {/* Products Mini List */}
            <div className="mb-3">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 font-medium"
                >
                    {products.length} items
                    <ChevronDown
                        size={14}
                        className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
                    />
                </button>

                {expanded && (
                    <div className="mt-2 space-y-1 pl-2 border-l border-green-300">
                        {products.map((product, idx) => (
                            <div key={idx} className="text-xs flex items-center justify-between">
                                <span className="text-gray-700 truncate flex-1">
                                    {product.name}
                                </span>
                                <span className="text-gray-600 font-semibold flex-shrink-0 ml-2">
                                    ₹{product.price}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Products Grid (collapsed view) */}
            {!expanded && (
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                    {products.slice(0, 3).map((product, idx) => (
                        <div key={idx} className="flex-shrink-0 w-12 h-12">
                            <img
                                src={product.image || product.images?.[0] || '/placeholder.jpg'}
                                alt={product.name}
                                className="w-full h-full object-cover rounded"
                                title={product.name}
                            />
                        </div>
                    ))}
                    {products.length > 3 && (
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs font-semibold text-gray-700">
                            +{products.length - 3}
                        </div>
                    )}
                </div>
            )}

            {/* Add Bundle Button */}
            <button
                onClick={handleAddBundle}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded flex items-center justify-center gap-2 transition-colors"
            >
                <ShoppingCart size={16} />
                Add Bundle to Cart
            </button>
        </div>
    );
}
