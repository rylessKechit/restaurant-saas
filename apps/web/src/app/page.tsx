export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🍕 Restaurant SaaS
          </h1>
          <p className="text-xl text-gray-600">
            Multi-tenant ordering platform for UAE restaurants
          </p>
        </div>

        <div className="grid gap-4 mb-8">
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Frontend Ready</h3>
                <p className="text-sm text-green-700">Next.js 14 + TypeScript</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Backend Ready</h3>
                <p className="text-sm text-blue-700">Express + MongoDB</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Tailwind CSS</h3>
                <p className="text-sm text-yellow-700">Configuration test</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
            Sign In
          </button>
          <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 px-6 rounded-lg transition-colors">
            View Pricing
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Worker API: <code className="bg-gray-100 px-2 py-1 rounded text-xs">http://localhost:8000</code>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            If you see colors and styling, Tailwind is working! 🎉
          </p>
        </div>
      </div>
    </div>
  );
}