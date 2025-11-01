#!/bin/bash

echo "🚀 Mall Management Dashboard - Installation"
echo "==========================================="

# Check Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js version: $NODE_VERSION"
else
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check npm version
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✅ npm version: $NPM_VERSION"
else
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo ""
echo "📦 Installing project dependencies..."
echo ""

# Install dependencies
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Installation completed successfully!"
    echo ""
    echo "🚀 To start the development server:"
    echo "   npm run dev"
    echo ""
    echo "📱 Application will be available at:"
    echo "   http://localhost:3000"
    echo ""
    echo "👥 Demo Login Credentials:"
    echo "   Super Admin: bosco / demo123"
    echo "   Mall Admin:  jane  / demo123 (China Square Mall)"
    echo "   Mall Admin:  faith / demo123 (Langata Mall)"
    echo "   Mall Admin:  ngina / demo123 (NHC Mall)"
    echo ""
    echo "📖 For more information, see README.md"
else
    echo ""
    echo "❌ Installation failed. Please check the error messages above."
    exit 1
fi