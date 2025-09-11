import PremiumListings from '@/components/PremiumListings';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Discover Premium Products
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl">
            Shop the latest and greatest products from top brands around the world.
            Exclusive deals and premium quality guaranteed.
          </p>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {['Electronics', 'Fashion', 'Home & Garden', 'Beauty', 'Sports', 'More'].map((category) => (
              <div key={category} className="group relative bg-gray-50 rounded-lg p-6 text-center hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
                  <span className="text-blue-600 text-xl font-bold">{category.charAt(0)}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-900">{category}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Premium Listings */}
      <PremiumListings />

      {/* Call to Action */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            <span className="block">Ready to find your next favorite thing?</span>
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Join thousands of satisfied customers who shop with confidence.
          </p>
          <div className="mt-8 flex justify-center">
            <a
              href="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Browse All Products
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
