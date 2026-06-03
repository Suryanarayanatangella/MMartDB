import { ArrowRight, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import {useSelector } from 'react-redux';
import { selectIsLoggedIn } from '../store/authSlice';


export default function HomePage() {
  const navigate = useNavigate();
  const isLoggedIn = useSelector(selectIsLoggedIn);

  
  const categories = [
    {
      name: 'Electronics',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      count: '2,345 products',
      link : '/Store',
    },
    {
      name: 'Fashion',
      image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=300&h=300&fit=crop',
      count: '5,678 products',
      link : '/Store',
    },
    {
      name: 'Home & Living',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=300&fit=crop',
      count: '3,456 products',
      link : '/Store',
    },
    {
      name: 'Sports & Outdoor',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&h=300&fit=crop',
      count: '2,123 products',
      link : '/Store',
    },
  ];
 const moveToStore = (category) => {
  if(isLoggedIn) {
    navigate(`/store?category=${encodeURIComponent(category.name)}`);
    return
  }
    navigate('/login')
};

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Verified Buyer',
      comment: 'Amazing quality and fast delivery. Highly recommended!',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    },
    {
      name: 'Michael Chen',
      role: 'Verified Buyer',
      comment: 'Great customer service and excellent products. Will buy again!',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    },
    {
      name: 'Emma Davis',
      role: 'Verified Buyer',
      comment: 'Best shopping experience ever. Prices are competitive too!',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-t from-blue-600 to-purple-600 text-white py-10 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Hero Content */}
            <div className="space-y-6">
              <div className="inline-block bg-white bg-opacity-20 px-4 py-2 rounded-full">
                <span className="text-sm font-semibold text-blue-600">✨ New Collection Available</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Discover Amazing Products
              </h1>
              <p className="text-lg text-blue-100 max-w-lg">
                Shop from our exclusive collection of high-quality products at unbeatable prices. Find everything you need in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button className="btn-primary bg-white text-blue-600 hover:bg-gray-100">
                  Shop Now
                  <ArrowRight size={20} className="ml-2" />
                </button>
                <button className="btn-outline border-white text-white hover:bg-white hover:bg-opacity-10 hover:text-blue-600">
                  Learn More
                </button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"
                alt="Hero"
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-blue-600 to-transparent opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Truck className="text-blue-600" size={32} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Shipping</h3>
              <p className="text-gray-600 text-sm">
                Free delivery on orders over $50
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Shield className="text-green-600" size={32} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Payment</h3>
              <p className="text-gray-600 text-sm">
                100% secure transactions guaranteed
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <RotateCcw className="text-purple-600" size={32} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy Returns</h3>
              <p className="text-gray-600 text-sm">
                30-day hassle-free return policy
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <Star className="text-yellow-600" size={32} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Best Quality</h3>
              <p className="text-gray-600 text-sm">
                Handpicked products from trusted brands
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse through our wide range of products organized by category
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.name}
                onClick={() => moveToStore(category)}
                className="relative group rounded-lg overflow-hidden cursor-pointer h-56"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all duration-300"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                  <p className="text-sm opacity-90">{category.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Customers Say
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust Maheswari Store
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className="fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.comment}"</p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Shopping?
          </h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
            Explore thousands of products and find exactly what you're looking for
          </p>
          <button className="btn-primary bg-white text-blue-600 hover:bg-gray-100">
            Shop Now
            <ArrowRight size={20} className="ml-2" />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
