# Slask Finder UI - Progressive Web App

A modern React + TypeScript + Vite application with full PWA (Progressive Web App) support for offline functionality and installable experience.

## 🚀 PWA Features

This application is a fully functional Progressive Web App that includes:

### Installation
- **Installable**: Users can install the app on their device like a native app
- **Install Prompt**: Automatic prompt appears after 3 seconds for eligible users
- **Cross-platform**: Works on desktop, mobile, and tablet devices
- **App-like Experience**: Runs in standalone mode without browser UI

### Offline Support
- **Service Worker**: Caches resources for offline access
- **Cache Strategy**: Network-first for API calls, cache-first for static assets
- **Offline Fallback**: Graceful degradation when network is unavailable
- **Background Sync**: Handles offline actions when connection is restored

### Performance
- **Fast Loading**: Pre-cached critical resources
- **Optimized Caching**: Strategic caching of API responses and static assets
- **Asset Optimization**: Automatic compression and optimization

## 📱 Installation Instructions

### Desktop (Chrome, Edge, Safari)
1. Visit the website
2. Look for the install prompt or click the install icon in the address bar
3. Click "Install" to add to your desktop

### Mobile (iOS/Android)
1. Open in your mobile browser
2. For iOS Safari: Tap Share → Add to Home Screen
3. For Android Chrome: Tap the install prompt or menu → Add to Home Screen

### Manual Installation
If you don't see the automatic prompt:
- **Chrome/Edge**: Look for the install icon (⊕) in the address bar
- **Firefox**: Menu → Install this site as an app
- **Safari**: Share → Add to Dock

## 🛠️ Technical Implementation

### PWA Components
- `manifest.json` - App metadata and configuration
- `sw.js` - Service worker for caching and offline functionality  
- `PWAInstallPrompt.tsx` - React component for install prompts
- `usePWA.ts` - React hook for PWA status and functionality

### Build Configuration
- **Vite PWA Plugin**: Handles service worker generation and manifest
- **Workbox**: Advanced caching strategies and offline support
- **Icon Generation**: Multiple icon sizes for different devices

## 🔧 Development

### PWA Development
```bash
# Install dependencies
npm install

# Development with PWA features
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
