import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PublicSchoolHub } from './PublicSchoolHub';
import { PublicChurchHub } from './PublicChurchHub';

export const PublicHubRouter = () => {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getBusinessCategory() {
      try {
        // Create a simple n8n webhook to: SELECT business_category FROM shops WHERE id = :id
        const response = await fetch('https://n8n.tenear.com/webhook/select-business-category', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shop_id: id }),
        });
        const data = await response.json();
        setCategory(data.business_category); 
      } catch (err) {
        console.error("Error identifying shop:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) getBusinessCategory();
  }, [id]);

  if (loading) return <div className="p-20 text-center">Loading TeNEAR Space...</div>;

  // Route to the correct UI based on the category in your DB
  switch (category) {
    case 'educational':
      return <PublicSchoolHub shopId={Number(id)} />;
    case 'church':
      return <PublicChurchHub shopId={Number(id)} />;
    default:
      return <div className="p-20 text-center text-gray-500">Business Hub not found.</div>;
  }
};
