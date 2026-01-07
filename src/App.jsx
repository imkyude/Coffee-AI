import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-zinc-100 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-3xl text-white font-bold">☕</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-4">
            COFFEE AI
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Modern AI coding assistant
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-amber-200 p-8 max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🚀 Proje Hazır!
          </h2>
          
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3">✅ Vite Development Server</h3>
              <p className="text-gray-700">
                <code className="bg-green-100 px-2 py-1 rounded">npm run dev</code>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Development server <code>http://localhost:3000</code> adresinde çalışır
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">📱 Test Sayfası</h3>
              <p className="text-gray-700">
                <code className="bg-blue-100 px-2 py-1 rounded">open index.html</code>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Tarayıcıda test edilebilir
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-800 mb-3">⚙️ Kurulum Tamamlandı</h3>
              <ul className="text-gray-700 space-y-2">
                <li>✅ <strong>package.json</strong> - Vite + React bağımlılıkları</li>
                <li>✅ <strong>vite.config.js</strong> - Path alias ayarları (@/)</li>
                <li>✅ <strong>src/main.jsx</strong> - React giriş noktası</li>
                <li>✅ <strong>src/App.jsx</strong> - Ana uygulama bileşeni</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-amber-800 mb-3">🎯 Sonraki Adımlar</h3>
              <ul className="text-gray-700 space-y-2">
                <li><strong>Development:</strong> <code>npm run dev</code></li>
                <li><strong>Test:</strong> <code>open index.html</code> (tarayıcıda)</li>
                <li><strong>Production:</strong> Base44 platformuna deploy</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  </div>
  );
}

export default App;
