import { Sparkles, Package, RefreshCw, ShoppingCart } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';

export default function CartAISuggestions({ suggestions, loading, onRefresh }) {
    const dispatch = useDispatch();

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-400 text-sm">
                <Sparkles size={20} className="mx-auto mb-2 animate-pulse text-purple-400" />
                AI is analyzing your cart...
            </div>
        );
    }

    if (!suggestions) return null;

    const { upsellSuggestions, bundleSuggestions } = suggestions;

    if (upsellSuggestions.length === 0 && bundleSuggestions.length === 0) return null;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-purple-600" />
                    <h2 className="text-lg font-bold text-gray-900">AI Recommendations</h2>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                        Powered by Gemini
                    </span>
                </div>
                <button onClick={onRefresh}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-600 transition-colors">
                    <RefreshCw size={13} /> Refresh
                </button>
            </div>

            {/* Upsell suggestions */}
            {upsellSuggestions.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        ✨ You might also like
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upsellSuggestions.map((u, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-3">
                                <img
                                    src={u.product.image || 'https://placehold.co/64x64'}
                                    alt={u.product.name}
                                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                    onError={e => { e.target.src = 'https://placehold.co/64x64'; }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-blue-600 font-medium mb-0.5">{u.product.category}</p>
                                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{u.product.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 italic">"{u.reason}"</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-sm font-bold text-gray-900">
                                            ₹{Number(u.product.price).toFixed(2)}
                                        </span>
                                        <button
                                            onClick={() => dispatch(addToCart(u.product.id))}
                                            className="flex items-center gap-1 text-xs bg-blue-600 text-white px-2.5 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <ShoppingCart size={12} /> Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bundle suggestions */}
            {bundleSuggestions.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        <Package size={14} className="inline mr-1" />
                        Bundle & Save
                    </h3>
                    <div className="space-y-4">
                        {bundleSuggestions.map((b, i) => (
                            <div key={i} className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <span className="font-semibold text-gray-900 text-sm">{b.bundleName}</span>
                                        <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">
                                            Save {b.savingsPercent}%
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 line-through">₹{Number(b.totalPrice).toFixed(2)}</p>
                                        <p className="text-sm font-bold text-green-600">₹{Number(b.bundlePrice).toFixed(2)}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 italic mb-3">"{b.reason}"</p>
                                <div className="flex gap-2 flex-wrap">
                                    {b.products.map(p => (
                                        <div key={p.id} className="flex items-center gap-1.5 bg-white rounded-lg px-2 py-1 border border-gray-100">
                                            <img src={p.image || 'https://placehold.co/24x24'}
                                                alt={p.name}
                                                className="w-6 h-6 object-cover rounded"
                                                onError={e => { e.target.src = 'https://placehold.co/24x24'; }} />
                                            <span className="text-xs font-medium text-gray-800 line-clamp-1 max-w-[100px]">{p.name}</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => b.products.forEach(p => dispatch(addToCart(p.id)))}
                                    className="mt-3 w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                                >
                                    <ShoppingCart size={14} />
                                    Add Bundle to Cart
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
