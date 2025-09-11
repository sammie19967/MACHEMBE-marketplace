'use client';

import Image from 'next/image';
import Link from 'next/link';

// Sample product data
const premiumProducts = [
  {
    id: 1,
    name: 'Premium Smartphone X',
    price: 999.99,
    originalPrice: 1199.99,
    rating: 4.8,
    reviewCount: 124,
    image: '/images/phone.jpg',
    category: 'Electronics',
    isNew: true,
    isFeatured: true,
  },
  {
    id: 2,
    name: 'Wireless Noise-Canceling Headphones',
    price: 349.99,
    originalPrice: 429.99,
    rating: 4.9,
    reviewCount: 89,
    image: '/images/headphones.jpg',
    category: 'Audio',
    isFeatured: true,
  },
  {
    id: 3,
    name: '4K Ultra HD Smart TV',
    price: 1299.99,
    originalPrice: 1499.99,
    rating: 4.7,
    reviewCount: 67,
    image: '/images/tv.jpg',
    category: 'Televisions',
    isNew: true,
  },
  {
    id: 4,
    name: 'Professional DSLR Camera',
    price: 1899.99,
    originalPrice: 2199.99,
    rating: 4.9,
    reviewCount: 42,
    image: '/images/camera.jpg',
    category: 'Photography',
    isFeatured: true,
  },
  {
    id: 5,
    name: 'Gaming Laptop Pro',
    price: 1799.99,
    originalPrice: 1999.99,
    rating: 4.8,
    reviewCount: 156,
    image: '/images/laptop.jpg',
    category: 'Computers',
    isNew: true,
  },
  {
    id: 6,
    name: 'Smart Watch Series 5',
    price: 299.99,
    originalPrice: 349.99,
    rating: 4.6,
    reviewCount: 231,
    image: '/images/smartwatch.jpg',
    category: 'Wearables',
  },
];

const PremiumListings = ({ limit = 6, showHeader = true }) => {
  const displayedProducts = premiumProducts.slice(0, limit);

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showHeader && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Premium Listings
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Discover our exclusive selection of premium products
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {displayedProducts.map((product) => (
            <div 
              key={product.id}
              className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="w-full h-full object-cover object-center group-hover:opacity-90 transition-opacity duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-0 right-0 p-2 flex space-x-2">
                  {product.isNew && (
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                  {product.isFeatured && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <p className="text-sm font-medium text-white">{product.category}</p>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      <Link href={`/products/${product.id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {product.name}
                      </Link>
                    </h3>
                    <div className="mt-1 flex items-center">
                      {[0, 1, 2, 3, 4].map((rating) => (
                        <svg
                          key={rating}
                          className={`h-5 w-5 ${
                            rating < Math.floor(product.rating - 0.5)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-2 text-sm text-gray-500">
                        {product.rating} ({product.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</p>
                    {product.originalPrice > product.price && (
                      <p className="text-sm text-gray-500 line-through">${product.originalPrice.toFixed(2)}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link
                    href={`/products/${product.id}`}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showHeader && limit < premiumProducts.length && (
          <div className="mt-12 text-center">
            <Link
              href="/premium"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View All Premium Products
              <svg
                className="ml-2 -mr-1 w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default PremiumListings;
