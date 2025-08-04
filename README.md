# DECE AI Chatbot Frontend

Modern React.js tabanlı AI chatbot uygulaması. Streaming chat, kullanıcı kimlik doğrulama ve konuşma geçmişi özellikleri içerir.

## 📁 Proje Yapısı

```
src/
├── components/           # React componentleri
│   ├── common/          # Ortak componentler
│   │   ├── Header.jsx   # Ana başlık
│   │   └── SettingsPanel.jsx # Ayarlar paneli
│   ├── chat/            # Chat ile ilgili componentler
│   │   ├── ChatContainer.jsx # Chat ana container
│   │   ├── ChatInput.jsx    # Mesaj input alanı
│   │   ├── Message.jsx      # Tek mesaj component
│   │   └── MessageList.jsx  # Mesaj listesi
│   ├── sidebar/         # Yan panel componentleri
│   │   ├── Sidebar.jsx      # Ana sidebar
│   │   ├── ConversationList.jsx # Konuşma listesi
│   │   ├── NewChatButton.jsx    # Yeni chat butonu
│   │   └── UserSection.jsx     # Kullanıcı bölümü
│   └── auth/            # Kimlik doğrulama componentleri
│       └── AuthModal.jsx    # Giriş/kayıt modal
├── context/             # React Context'ler
│   ├── AuthContext.jsx  # Kimlik doğrulama context
│   └── ThemeContext.jsx # Tema context
├── hooks/               # Custom React hooks
│   ├── useAuth.js       # Kimlik doğrulama hook
│   ├── useChat.js       # Chat hook
│   └── useConversations.js # Konuşmalar hook
├── services/            # API servisleri
│   ├── api.js          # Genel API fonksiyonları
│   └── auth.js         # Kimlik doğrulama API
├── utils/               # Yardımcı fonksiyonlar
│   ├── constants.js    # Sabitler
│   └── helpers.js      # Yardımcı fonksiyonlar
├── assets/             # Medya dosyaları
└── App.jsx             # Ana uygulama component
```

## 🚀 Özellikler

- **Modern Component Mimarisi**: Modüler ve yeniden kullanılabilir componentler
- **Real-time Streaming**: Server-Sent Events ile canlı mesaj akışı
- **Kullanıcı Kimlik Doğrulama**: JWT tabanlı giriş/kayıt sistemi
- **Akıllı Chat Temizleme**: Login sonrası önceki oturum mesajları otomatik temizlenir
- **Konuşma Geçmişi**: Kullanıcı bazlı konuşma kaydetme ve yükleme
- **Dark/Light Tema**: LocalStorage ile kalıcı tema tercihi
- **Responsive Tasarım**: Mobil uyumlu ChatGPT-style arayüz
- **Wave Animasyonları**: Conversation geçişlerinde güzel animasyonlar
- **Context API**: Global state yönetimi
- **Custom Hooks**: Mantık ayrıştırması ve yeniden kullanım

## 🛠 Teknolojiler

- **React 18** - Modern React hooks ve features
- **Vite** - Hızlı geliştirme ortamı
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern iconlar
- **React Markdown** - Markdown render
- **Lottie React** - Animasyonlar

## 📦 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Production build
npm run build
```

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
