import { useState } from 'react';

export const useSacramentPdf = (shopId: string | number) => {
  const [loadingPdf, setLoadingPdf] = useState(false);

  const downloadReport = async (applicationsList: any[]) => {
    if (!applicationsList || applicationsList.length === 0) return;
    
    setLoadingPdf(true);
    try {
      const response = await fetch('https://n8n.tenear.com/webhook/fetch-sacrament-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          shop_id: shopId, 
          data: applicationsList 
        })
      });

      if (!response.ok) throw new Error('Backend failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Intake_Audit_Log_${shopId}_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Multi-tenant PDF Generation Error:", err);
      alert("Failed to export report via n8n. Please try again.");
    } finally {
      setLoadingPdf(false);
    }
  };

  return { downloadReport, loadingPdf };
};
