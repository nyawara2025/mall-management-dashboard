#!/usr/bin/env node

// Updated QR Code Generator for Live Deployment
// QR codes now point to our live app which will call N8N webhook

const https = require('https');
const fs = require('fs');
const path = require('path');

const QR_IMAGE_API = 'https://api.qrserver.com/v1/create-qr-code/';
const OUTPUT_DIR = '/workspace/qr_codes_live_deployment';
const timestamp = '2025-11-13T13:28:35.000Z';

// Live deployment base URL (UPDATE THIS after Cloudflare Pages deployment)
// Current placeholder - replace with actual deployment URL
const LIVE_APP_BASE_URL = 'https://nyawara2025.pages.dev';

const testShops = [
    {
        name: 'China_Square_Spatial_Barbershop_Spa',
        location: 'china_square_spatial_barbershop_spa_2025',
        zone: 'Spatial_Barbershop',
        mall_id: 3,
        shop_id: 3,
        description: 'China Square Mall - Spatial Barbershop & Spa (Main Entrance)',
        filename: 'china_square_spatial_barbershop_live_qr.png'
    },
    {
        name: 'Langata_Kika_Wines_Spirits',
        location: 'langata_kika_wines_spirits_2025',
        zone: 'Kika_Wines',
        mall_id: 6,
        shop_id: 6,
        description: 'Langata Mall - Kika Wines & Spirits (Front Counter)',
        filename: 'langata_kika_wines_live_qr.png'
    },
    {
        name: 'NHC_Maliet_Salon_Spa',
        location: 'nhc_maliet_salon_spa_2025',
        zone: 'Maliet_Salon',
        mall_id: 7,
        shop_id: 9,
        description: 'NHC Mall - Maliet Salon & Spa (Reception)',
        filename: 'nhc_maliet_salon_live_qr.png'
    }
];

function generateQRUrl(shop) {
    const params = new URLSearchParams({
        location: shop.location,
        zone: shop.zone,
        type: 'shop_checkin',
        mall: shop.mall_id.toString(),
        shop: shop.shop_id.toString(),
        visitor_type: 'first_time_visitor',
        timestamp: timestamp
    });
    
    return `${LIVE_APP_BASE_URL}/multi-mall-qr?${params.toString()}`;
}

function downloadQRCode(qrUrl, filename, description) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(OUTPUT_DIR, filename);
        
        console.log(`\nGenerating QR code for: ${description}`);
        console.log(`URL: ${qrUrl}`);
        
        const file = fs.createWriteStream(filePath);
        
        https.get(qrUrl, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                console.log(`QR code saved: ${filename}`);
                resolve({
                    filename,
                    description,
                    filePath,
                    fileSize: fs.statSync(filePath).size,
                    qrUrl
                });
            });
            
        }).on('error', (err) => {
            fs.unlink(filePath, () => {});
            reject(err);
        });
    });
}

function generateSummaryReport(results) {
    const reportPath = path.join(OUTPUT_DIR, 'LIVE_DEPLOYMENT_QR_PACKAGE.md');
    
    let report = '# Live Deployment QR Code Package\n\n';
    report += '## QR Codes for Live App Testing\n\n';
    report += '**Generated**: 2025-11-13 13:28:35  \n';
    report += `**Live App URL**: ${LIVE_APP_BASE_URL}  \n`;
    report += `**Total QR Codes**: ${results.length}  \n`;
    report += '**Status**: Ready for live testing\n\n';
    
    report += '## How It Works\n\n';
    report += '1. **QR Code Scan**: Visitor scans QR code with smartphone\n';
    report += '2. **App Redirect**: QR code opens our live app at `/multi-mall-qr`\n';
    report += '3. **Check-in Processing**: App calls N8N webhook and shows success page\n';
    report += '4. **Database Record**: Check-in recorded in Supabase database\n\n';
    
    report += '## QR Code Details\n\n';
    
    results.forEach((result, index) => {
        report += `### ${index + 1}. ${result.description}\n\n`;
        report += `**File**: ${result.filename}  \n`;
        report += `**Size**: ${(result.fileSize / 1024).toFixed(1)} KB  \n`;
        report += `**QR URL**: ${result.qrUrl}\n\n`;
        report += '**For Testing**:\n';
        report += '- Print and display at test locations\n';
        report += '- Test by scanning with phone camera\n';
        report += '- Should open live app and process check-in\n\n';
    });
    
    report += '## Deployment Checklist\n\n';
    report += '- [ ] Deploy mall-management-dashboard to Cloudflare Pages\n';
    report += '- [ ] Update LIVE_APP_BASE_URL with actual deployment URL\n';
    report += '- [ ] Generate new QR codes with live URL\n';
    report += '- [ ] Print QR codes for physical locations\n';
    report += '- [ ] Test QR scanning with smartphones\n';
    report += '- [ ] Run N8N workflow compatibility tests\n\n';
    
    report += '## Testing Protocol\n\n';
    report += '1. **Deploy app to Cloudflare Pages**\n';
    report += '2. **Update QR URL base** and regenerate codes\n';
    report += '3. **Test QR scanning** from phone camera\n';
    report += '4. **Verify check-in processing** and success page\n';
    report += '5. **Monitor database records** via real-time dashboard\n\n';
    
    report += '---\n';
    report += 'Generated by MiniMax Agent Live Deployment System\n';

    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`\nSummary report generated: ${path.basename(reportPath)}`);
}

async function generateLiveQRCodes() {
    console.log('🚀 Starting Live Deployment QR Code Generation');
    console.log('=' .repeat(60));
    console.log(`📱 Live App Base URL: ${LIVE_APP_BASE_URL}`);
    console.log('Note: Update this URL after Cloudflare deployment');
    console.log('');
    
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    const results = [];
    
    for (const shop of testShops) {
        try {
            const qrUrl = generateQRUrl(shop);
            const result = await downloadQRCode(qrUrl, shop.filename, shop.description);
            results.push(result);
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.error(`Error generating QR code for ${shop.name}:`, error.message);
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`Generation Complete: ${results.length}/${testShops.length} QR codes created`);
    
    if (results.length > 0) {
        generateSummaryReport(results);
        
        console.log('\n📦 Live Deployment Package Ready:');
        console.log(`📁 Location: ${OUTPUT_DIR}`);
        console.log('\n📋 Files Generated:');
        results.forEach(result => {
            console.log(`   • ${result.filename} (${(result.fileSize / 1024).toFixed(1)} KB)`);
        });
        
        console.log('\n🔧 Next Steps:');
        console.log('1. Deploy mall-management-dashboard to Cloudflare Pages');
        console.log('2. Get actual deployment URL from Cloudflare');
        console.log('3. Update LIVE_APP_BASE_URL and regenerate QR codes');
        console.log('4. Test QR scanning with smartphones');
        console.log('5. Run N8N workflow tests');
        
        return results;
    } else {
        console.error('No QR codes were generated successfully');
        return [];
    }
}

// Execute
generateLiveQRCodes()
    .then(results => {
        if (results.length === testShops.length) {
            console.log('\nAll QR codes generated successfully!');
            process.exit(0);
        } else {
            console.log('\nSome QR codes failed to generate');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
