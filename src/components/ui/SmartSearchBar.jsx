import { useState, useRef } from "react";
import { Search, Sparkles, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api  from './../../api/api';

export default function SmartSearchBar({ onResults, className = '' }) {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [isAI, setIsAI] = useState(false);
    const navigate = useNavigate();
    const inputRef = useRef(null);

    const looksNatural = (text) => {
        const naturalPatterns = /under|below|above|cheap|affordable|premium|healthy|best|good|for|with|around|₹|\d+/i;
        return naturalPatterns.test(text) || text.trim().split(' ').length >= 3;
    }

    const handleSearch = async (e) => {
        e.preventDefault();
        const q = query.trim();
        if (!q) return;

        const isNaturalLanguage = looksNatural(q);

        if (isNaturalLanguage) {
            // AI smart search
            setLoading(true);
            setIsAI(true);
            try {
                const res = await api.post('/api/search/ai', { query: q });
                if (onResults) {
                    // Pass results back to parent (Store page)
                    onResults(res);
                } else {
                    // Navigate to store with AI query param
                    navigate(`/store?aiQuery=${encodeURIComponent(q)}`);
                }
            } catch {
                // Fallback to regular search
                navigate(`/store?search=${encodeURIComponent(q)}`);
            } finally {
                setLoading(false);
            }
        } else {
            // Regular keyword search
            setIsAI(false);
            navigate(`/store?search=${encodeURIComponent(q)}`);
        }
    };
return (
        <form onSubmit={handleSearch} className={`relative flex items-center ${className}`}>
            <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2 w-full gap-2 border border-transparent focus-within:border-blue-400 focus-within:bg-white transition-all">
                {loading ? (
                    <Loader2 size={16} className="text-blue-500 animate-spin flex-shrink-0" />
                ) : (
                    <Search size={16} className="text-gray-500 flex-shrink-0" />
                )}

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => {
                        setQuery(e.target.value);
                        setIsAI(false);
                    }}
                    placeholder='Try "healthy under ₹300" or "green tea"'
                    className="bg-transparent outline-none text-sm text-gray-700 flex-1 min-w-0"
                />

                {/* AI indicator */}
                {isAI && !loading && (
                    <span className="flex items-center gap-1 text-xs text-purple-600 font-medium flex-shrink-0">
                        <Sparkles size={12} />
                        AI
                    </span>
                )}

                {/* Clear button */}
                {query && (
                    <button
                        type="button"
                        onClick={() => { setQuery(''); setIsAI(false); inputRef.current?.focus(); }}
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        </form>
    );
}