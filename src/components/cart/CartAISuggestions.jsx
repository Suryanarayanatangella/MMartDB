import { useState, useEffect } from 'react';
import { Sparkles, Loader2, ChevronDown } from 'lucide-react';
import api from '../../api/api';
import UpsellCard from './UpsellCard';
import BundleCard from './BundleCard';

export default function CartAISuggestions({ cartItems, onAddToCart }) {
    const [suggestions, setSuggestions] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
        if (!cartItems || cartItems.length === 0) {
            setSuggestions(null);
            return;
        }

        const fetchSuggestions = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await api.post('/api/cart/ai/suggestions', { cartItems });
                setSuggestions(res);
            } catch (err) {
                console.error('AI suggestions error:', err);
                setError(null); // Silent fail — don't disrupt the cart
                setSuggestions(null);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, [cartItems]);

    if (!suggestions || (suggestions.upsellSuggestions.length === 0 && suggestions.bundleSuggestions.length === 0)) {
        return null;
    }

    const hasUpsells = suggestions.upsellSuggestions.length > 0;
    const hasBundles = suggestions.bundleSuggestions.length > 0;

    return (
        <div className="mt-8 border-t pt-6">
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center justify-between w-full mb-4 group"
            >
                <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-800">
                        AI Shopping Assistant
                    </h3>
                </div>
                <ChevronDown
                    size={20}
                    className={`text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
                />
            </button>

            {loading && (
                <div className="flex items-center justify-center py-6">
                    <Loader2 size={20} className="text-purple-600 animate-spin mr-2" />
                    <p className="text-sm text-gray-600">Finding perfect recommendations...</p>
                </div>
            )}

            {expanded && !loading && (
                <div className="space-y-6">
                    {/* Upsell Section */}
                    {hasUpsells && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <span className="text-lg">⬆️</span>
                                Upgrade Your Order
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {suggestions.upsellSuggestions.map((upsell, idx) => (
                                    <UpsellCard
                                        key={idx}
                                        upsell={upsell}
                                        onAddToCart={onAddToCart}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bundle Section */}
                    {hasBundles && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <span className="text-lg">📦</span>
                                Curated Bundles
                            </h4>
                            <div className="space-y-3">
                                {suggestions.bundleSuggestions.map((bundle, idx) => (
                                    <BundleCard
                                        key={idx}
                                        bundle={bundle}
                                        onAddToCart={onAddToCart}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Powered by AI */}
                    <p className="text-xs text-gray-500 text-center pt-3 border-t">
                        💡 Powered by AI for smarter shopping
                    </p>
                </div>
            )}
        </div>
    );
}
