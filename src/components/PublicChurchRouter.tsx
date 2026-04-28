import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { PublicGivingPage } from './PublicGivingPage';
import { MemberLogin } from './MemberLogin';
// Comment this out until we create the file in the next step
// import { PublicServiceOrder } from './PublicServiceOrder'; 

export const PublicChurchRouter = ({ shopId }: { shopId: number }) => {
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view');

  switch (view) {
    case 'give':
      return <PublicGivingPage />;
    // Comment this out until the file exists
    /* 
    case 'services':
      return <PublicServiceOrder shopId={shopId} />; 
    */
    default:
      // Fix: Convert number to string to match MemberLogin's expected type
      return <MemberLogin shopId={shopId.toString()} />;
  }
};
