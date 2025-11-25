#!/bin/bash

# SMS Integration Test Script
# This script tests the SMS integration by sending a sample webhook call

echo "🚀 Testing Langata Mall SMS Integration..."
echo "======================================"

# Test webhook URL
WEBHOOK_URL="https://n8n.tenear.com/webhook/visitor-checkins-engagement"

# Test data for VIP visitor (should trigger immediate SMS)
VIP_TEST_DATA='{
  "d": "eyJsIjoiVklQIExpbmNhbnUiLCJ6IjoiU3BhdGlhbF9CYXJiZXJzaG9wX1pvbmUiLCJtIjozLCJzIjozLCJ0IjoidmlwX3Zpc2l0b3IiLCJjdCI6ImdlbmVyYWwiLCJ0cyI6'$(date +%s000)'"
}'

# Test data for first-time visitor (should trigger delayed email, not SMS)
FIRST_TIME_TEST_DATA='{
  "d": "eyJsIjoiRW50cmFuY2UiLCJ6IjoiRW50cmFuY2VfWm9uZSIsIm0iOjMsInMiOjMsInQiOiJmaXJzdF90aW1lX3Zpc2l0b3IiLCJjdCI6ImdlbmVyYWwiLCJ0cyI6'$(date +%s000)'"
}'

echo "📱 Test 1: VIP Visitor (Should send SMS immediately)"
echo "Testing VIP visitor check-in..."

RESPONSE1=$(curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$VIP_TEST_DATA" \
  -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE1=$(echo "$RESPONSE1" | grep "HTTP_CODE:" | cut -d: -f2)
BODY1=$(echo "$RESPONSE1" | sed '/HTTP_CODE:/d')

echo "Response Code: $HTTP_CODE1"
echo "Response Body: $BODY1"
echo ""

if [ "$HTTP_CODE1" -eq 200 ]; then
    echo "✅ VIP Test: SUCCESS - Check-in processed"
    if echo "$BODY1" | grep -q "success"; then
        echo "✅ SMS Engagement: Likely triggered (VIP visitor detected)"
    fi
else
    echo "❌ VIP Test: FAILED - HTTP $HTTP_CODE1"
fi

echo ""
echo "📧 Test 2: First-Time Visitor (Should schedule email engagement)"
echo "Testing first-time visitor check-in..."

RESPONSE2=$(curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$FIRST_TIME_TEST_DATA" \
  -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE2=$(echo "$RESPONSE2" | grep "HTTP_CODE:" | cut -d: -f2)
BODY2=$(echo "$RESPONSE2" | sed '/HTTP_CODE:/d')

echo "Response Code: $HTTP_CODE2"
echo "Response Body: $BODY2"
echo ""

if [ "$HTTP_CODE2" -eq 200 ]; then
    echo "✅ First-time Test: SUCCESS - Check-in processed"
    if echo "$BODY2" | grep -q "email"; then
        echo "✅ Email Engagement: Scheduled (not SMS for first-time visitors)"
    fi
else
    echo "❌ First-time Test: FAILED - HTTP $HTTP_CODE2"
fi

echo ""
echo "🔍 Next Steps:"
echo "1. Check your n8n execution logs for webhook processing details"
echo "2. Verify Twilio/Africa's Talking credentials are configured"
echo "3. Check Analytics dashboard for engagement tracking"
echo "4. Verify SMS delivery in Twilio console or Africa's Talking dashboard"
echo ""
echo "📊 Analytics URL: (Your dashboard URL)/analytics/engagement"
echo "📱 SMS Dashboard: Check your SMS provider console for delivery reports"
