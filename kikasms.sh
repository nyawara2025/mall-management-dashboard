#!/bin/bash

# REAL QR SCAN TEST FOR KIKA WINES & SPIRITS
# This tests the complete shop-specific SMS workflow

echo "🍷 Testing REAL QR Scan for Kika Wines & Spirits..."
echo "=================================================="

# Test with Kika Wines QR data (shop_id=6, VIP visitor)
echo "📱 Sending QR scan for Kika Wines & Spirits..."

curl -X POST https://n8n.tenear.com/webhook/visitor-checkins-engagement \
  -H 'Content-Type: application/json' \
  -d '{
    "d": "eyJsIjoia2lrYV93aW5lcyIsInoiOktpa2FfV2luZXNfVlNUX1ZJUF9WaXNpdG9yIiwibSI6MywicyI6NiwidCI6InZpcF92aXNpdG9yX2dwX3hwIiwiY3QiOiJnZW5lcmFsIiwidHMiOjE3NjQwMTA0ODkwMDB9"
  }' \
  --verbose

echo ""
echo "✅ Test Complete - Check response for:"
echo "   • Shop detection (should show 'Kika Wines & Spirits')"
echo "   • Category recognition (should be 'Wine & Spirits')"
echo "   • SMS generation with correct message"
echo "   • Africa'\''s Talking API response"
echo ""
echo "🎯 Expected SMS Message Preview:"
echo "Welcome to Kika Wines & Spirits! 🍷 Discover perfect wines & spirits tailored to your taste. Tell us your preferences for curated selections. Reply with your name and email for exclusive wine & spirits offers. Reply STOP to opt out."
