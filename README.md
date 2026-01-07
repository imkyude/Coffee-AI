# COFFEE AI - Proje Kurulum ve Çalıştırma Kılavuzu

## 📋 Proje Yapısı

```
deneme/
├── Pages/
│   └── Home.jsx              # Ana uygulama (Base44 entegrasyonlu)
├── Components/
│   ├── chat/
│   │   ├── ChatInput.jsx
│   │   ├── MessageBubble.jsx
│   │   ├── ModelIndicator.jsx
│   │   ├── TypingIndicator.jsx
│   │   └── WelcomeScreen.jsx
│   ├── common/
│   │   └── UsageIndicator.jsx
│   ├── modals/
│   │   ├── NewProjectModal.jsx
│   │   └── UpgradeModal.jsx
│   └── sidebar/
│       ├── ChatList.jsx
│       └── ProjectList.jsx
├── Entities/
│   ├── Chat.js                 # ✅ JS sınıfları
│   ├── Project.js
│   └── Usage.js
├── Functions/
│   ├── callHuggingFace.js      # ✅ Base44 uyumlu, env token
│   └── webSearch.js           # ✅ Base44 uyumlu, LLM fallback
└── index.html                  # ✅ Test sayfası (CORS çözümlü)
```

## 🚀 Çalıştırma Yöntemleri

### 1️⃣ **Ücretsiz Site Olarak (Fln)**
```bash
# Yöntem 1: Python ile basit HTTP server
python -m http.server 5500

# Yöntem 2: Node.js ile Express server
npm install express
node server.js

# Yöntem 3: Vite/Next ile development server
npm install
npm run dev
```

### 2️⃣ **Base44 Entegrasyonlu Olarak**
Bu proje şu an **Base44 platformu** için hazır:
- ✅ Auth sistemi (`base44.auth.*`)
- ✅ Veritabanı (`base44.entities.*`)
- ✅ AI fonksiyonları (`base44.functions.*`)
- ✅ LLM fallback (`base44.integrations.Core.InvokeLLM`)

**Base44 ile çalıştırmak için:**
1. Proje Base44'e deploy et
2. `Home.jsx` içindeki `base44` çağrıları çalışır
3. `HF_TOKEN` environment variable'ı Base44 secrets'e tanımla

### 3️⃣ **Test Etme**
```bash
# Test sayfasını aç
open index.html

# Tarayıcıda test et
# "Bağlantı Test Et" butonlarına tıkla
```

## 🔧 Gerekli Kurulumlar

### **Node.js Gerekli (Local Development)**
```bash
# Proje kök dizininde
npm install react react-dom @tanstack/react-query framer-motion lucide-react sonner

# Eğer Next.js kullanacaksan
npm install next
```

### **Tailwind CSS**
```bash
# Proje kök dizininde
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### **VS Code Ayarları** (`.vscode/settings.json`)
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  }
}
```

## 🎯 Hızlı Başlangıç

### **Adım 1: Local Development**
```bash
# 1. Proje dizinine git
cd deneme

# 2. Gerekli paketler
npm install

# 3. Development server'ı başlat
npm run dev  # Vite/Next
# veya
python -m http.server 5500  # Python server
```

### **Adım 2: Test**
```bash
# Test sayfasını tarayıcıda aç
open index.html

# Test butonlarını kullanarak bağlantı ve UI'yi test et
```

### **Adım 3: Base44 Entegrasyonu**
```bash
# Eğer Base44 hesabın varsa
# 1. Proje deploy et
# 2. HF_TOKEN environment variable'ı tanımla
export HF_TOKEN=hf_xxxxxxxxxx

# 3. Uygulamayı çalıştır
# Home.jsx içindeki base44 entegrasyonu çalışacaktır
```

## ⚠️ Önemli Notlar

- **CORS Sorunu:** `index.html` test sayfası CORS nedeniyle bazı API'leri test edemiyor. Bu normaldir - production'da backend üzerinden çalışır.
- **Base44:** Local development'te Base44 fonksiyonları çalışmaz. Production/Deploy ortamı gereklidir.
- **Tailwind:** Components Tailwind class'ları kullanıyor. `tailwind.config.js` gerekli.

## 🎉 Başarı

Proje artık **ücretsiz site olarak test edilebilir**:
- Local development server ile
- Veya statik `index.html` ile  
- Base44 entegrasyonu hazır

**İyi testler!** 🚀
