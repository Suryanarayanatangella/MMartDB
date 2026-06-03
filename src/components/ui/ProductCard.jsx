import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/cartSlice';
import { selectIsLoggedIn } from '../../store/authSlice';

import { ShoppingCart, Star, ImageOff, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { selectCurrentUser } from '../../store/authSlice';

const FALLBACK = 'https://placehold.co/400x400?text=No+Image';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const [isAdding, setIsAdding] = useState(false);
  const [addedMsg, setAddedMsg] = useState('');
  const [imgError, setImgError] = useState(false);

  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const isAdmin = user?.role === 'ADMIN';

  const handleAddToCart = async () => {
    if(!isLoggedIn) {
      navigate('/login');
      return;
    }
    setIsAdding(true)
    setAddedMsg('');
    const result = await dispatch(addToCart(product.id));
    if(addToCart.fulfilled.match(result)) {
      setAddedMsg('Item added to cart');
      setTimeout(()=>{
        setAddedMsg('')
      }, 2000)
    }
    setIsAdding(false)
  };

  const price = Number(product.price) || 0;
  const discountPercent = Number(product.discount) || 0;
  const finalPrice = price - (price * discountPercent / 100);

  const imageSrc = imgError || !product.image ? FALLBACK : product.image;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col">
      <div className="relative">
        {imgError || !product.image ? (
          <div className="w-full h-48 rounded-lg bg-gray-100 flex flex-col items-center justify-center text-gray-400">
            <ImageOff size={36} />
            <span className="text-xs mt-2">No image</span>
          </div>
        ) : (
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-48 object-cover rounded-lg"
            onError={() => setImgError(true)}
          />
        )}
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            -{discountPercent}% OFF
          </div>
        )}
        {/* Admin edit button — top-right corner of image */}
        {isAdmin && (
          <button
            onClick={() => navigate(`/admin/products/${product.id}/edit`)}
            title="Edit product"
            className="absolute top-2 right-2 bg-white border border-gray-200 text-gray-700 rounded-full p-1.5 shadow hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>

      <div className="flex items-center flex-col mt-2 gap-2">
        <div className="mb-2">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
            {product.category}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 text-center">
          {product.name}
        </h3>

        <p className={`text-xs mb-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
        </p>

        <div className="mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              ₹{finalPrice.toFixed(2)}
            </span>
            {discountPercent > 0 && (
              <span className="text-sm text-gray-500 line-through">
                ₹{price.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < Math.floor(product.avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">
            {product.avgRating} ({product.reviewCount})
          </span>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={product.stock === 0 || isAdding}
        className={`mt-auto flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors disabled:opacity-50
        ${addedMsg ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
      >
        <ShoppingCart size={16} />
        {isAdding ? 'Adding...' : addedMsg ? '✓ Added!' : 'Add to Cart' }
      </button>
    </div>
  );
}
