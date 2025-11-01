#!/bin/bash

echo "🚀 Starting Mall Management Dashboard"
echo "===================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

echo "✅ Dependencies are installed"
echo ""
echo "🌐 Starting development server..."
echo "   URL: http://localhost:3000"
echo ""
echo "👥 Demo Login Credentials:"
echo "   Super Admin: bosco / demo123"
echo "   Mall Admin:  jane  / demo123 (China Square Mall)"
echo "   Mall Admin:  faith / demo123 (Langata Mall)"
echo "   Mall Admin:  ngina / demo123 (NHC Mall)"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm run dev