#!/bin/bash

# Local deployment script for testing PWA deployment
# Usage: ./deploy-local.sh [target_directory]

TARGET_DIR="${1:-./deploy-test}"

echo "🏗️  Building PWA..."
npm run build

echo "📁 Creating deployment directory: $TARGET_DIR"
mkdir -p "$TARGET_DIR/assets"
mkdir -p "$TARGET_DIR/icons"

echo "📋 Copying files..."

# Copy robots.txt from root
cp robots.txt "$TARGET_DIR/" 2>/dev/null || echo "⚠️  robots.txt not found"

# Copy all main files from dist
cp dist/*.html "$TARGET_DIR/" 2>/dev/null || true
cp dist/*.js "$TARGET_DIR/" 2>/dev/null || true
cp dist/*.json "$TARGET_DIR/" 2>/dev/null || true
cp dist/*.webmanifest "$TARGET_DIR/" 2>/dev/null || true
cp dist/*.svg "$TARGET_DIR/" 2>/dev/null || true
cp dist/*.ico "$TARGET_DIR/" 2>/dev/null || true
cp dist/*.png "$TARGET_DIR/" 2>/dev/null || true

# Copy assets directory
if [ -d "dist/assets" ]; then
    cp -r dist/assets/* "$TARGET_DIR/assets/"
    echo "✅ Assets copied"
else
    echo "⚠️ No assets directory found"
fi

# Copy icons directory
if [ -d "dist/icons" ]; then
    cp -r dist/icons/* "$TARGET_DIR/icons/"
    echo "✅ Icons copied"
else
    echo "⚠️ No icons directory found"
fi

# Copy any additional PWA assets
if [ -d "dist/pwa-assets" ]; then
    cp -r dist/pwa-assets "$TARGET_DIR/"
    echo "✅ PWA assets copied"
fi

echo "🔍 Verifying PWA files..."
echo "Service Worker: $(test -f "$TARGET_DIR/sw.js" && echo '✅ FOUND' || echo '❌ MISSING')"
echo "Manifest (JSON): $(test -f "$TARGET_DIR/manifest.json" && echo '✅ FOUND' || echo '❌ MISSING')"
echo "Manifest (WebManifest): $(test -f "$TARGET_DIR/manifest.webmanifest" && echo '✅ FOUND' || echo '❌ MISSING')"
echo "Register SW: $(test -f "$TARGET_DIR/registerSW.js" && echo '✅ FOUND' || echo '❌ MISSING')"
echo "Icons directory: $(test -d "$TARGET_DIR/icons" && echo '✅ FOUND' || echo '❌ MISSING')"

echo ""
echo "📊 Deployment Summary:"
echo "Target: $TARGET_DIR"
echo "Files: $(find "$TARGET_DIR" -type f | wc -l)"
echo "Size: $(du -sh "$TARGET_DIR" | cut -f1)"

if [ -d "$TARGET_DIR/icons" ]; then
    echo "Icon files: $(ls "$TARGET_DIR/icons" | wc -l)"
fi

echo ""
echo "🚀 Deployment complete! You can serve the PWA with:"
echo "   cd $TARGET_DIR && python3 -m http.server 8080"
echo "   or npx serve $TARGET_DIR"