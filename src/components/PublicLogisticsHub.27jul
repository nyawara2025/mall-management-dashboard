import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Truck, MapPin, FileText, Fuel, ShieldAlert, 
  DollarSign, UserCheck, Briefcase, ChevronRight, X, Lock, Phone, User
} from 'lucide-react';

interface Opportunity {
  id: string;
  client_company_name: string;
  origin_city: string;
  destination_city: string;
  cargo_type: string;
  offered_rate: number;
}

export const PublicLogisticsHub: React.FC = () => {
  const [searchParams] = useSearchParams();

  // 💾 State Management Layer (Mirrors PublicAgricHub logic perfectly)
  const [shopId, setShopId] = useState<string | null>(() => {
    return searchParams.get('shop_id') || localStorage.getItem('__native_shop_id') || '90';
  });
  
  const [view, setView] = useState<'login' | 'register' | 'dashboard'>(() => {
    return localStorage.getItem('remembered_logistics_name') ? 'dashboard' : 'login';
  });

  // 📋 Real Database State Layer for Corporate Applications
  const [appliedContracts, setAppliedContracts] = useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = useState<boolean>(false);

  // Auth & Session Trackers
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [category, setCategory] = useState('driver');
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [routeItinerary, setRouteItinerary] = useState('');
  const [submittingManifest, setSubmittingManifest] = useState(false);

  // Real-Time GPS Tracking Session Managers
  const [isTrackingActive, setIsTrackingActive] = useState<boolean>(false);
  const [geoWatchId, setGeoWatchId] = useState<number | null>(null);

  // Executive Fleet Location Monitor State tracking layers
  const [activeTrackingLogs, setActiveTrackingLogs] = useState<any[]>([]);

  // Fuel Voucher & Expenses State Layer
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [vouchersOpen, setVouchersOpen] = useState(false);
  const [fuelFormOpen, setFuelFormOpen] = useState(false);
  const [fuelManifest, setFuelManifest] = useState('');
  const [fuelStation, setFuelStation] = useState('');
  const [fuelAmount, setFuelAmount] = useState('');
  const [fuelLiters, setFuelLiters] = useState('');
  const [submittingVoucher, setSubmittingVoucher] = useState(false);

  // Emergency & Breakdown State Layer
  const [breakdowns, setBreakdowns] = useState<any[]>([]);
  const [breakdownsOpen, setBreakdownsOpen] = useState(false);
  const [emergencyFormOpen, setEmergencyFormOpen] = useState(false);
  const [emManifest, setEmManifest] = useState('');
  const [emType, setEmType] = useState('MECHANICAL');
  const [emLocation, setEmLocation] = useState('');
  const [emComments, setEmComments] = useState('');
  const [submittingEmergency, setSubmittingEmergency] = useState(false);

  // Weighbridge & Port Docs State Layer
  const [portDocs, setPortDocs] = useState<any[]>([]);
  const [portDocsOpen, setPortDocsOpen] = useState(false);
  const [docFormOpen, setDocFormOpen] = useState(false);
  const [docManifest, setDocManifest] = useState('');
  const [docType, setDocType] = useState('PORT_CLEARANCE');
  const [stationName, setStationName] = useState('');
  const [grossWeight, setGrossWeight] = useState('');
  const [clearanceStatus, setClearanceStatus] = useState('CLEARED');
  const [submittingDoc, setSubmittingDoc] = useState(false);

  // M-Pesa / Freight Payments State Layer
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [payFormOpen, setPayFormOpen] = useState(false);
  const [payManifest, setPayManifest] = useState('');
  const [payerName, setPayerName] = useState('');
  const [payMethod, setPayMethod] = useState('M-PESA');
  const [payAmount, setPayAmount] = useState('');
  const [payPurpose, setPayPurpose] = useState('Freight Clearance');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // State variables for the Trip Manifest system
  const [manifests, setManifests] = useState<any[]>([]);
  const [manifestsOpen, setManifestsOpen] = useState(false);

  // Waybill & Cargo Status State Layer
  const [waybills, setWaybills] = useState<any[]>([]);
  const [waybillsOpen, setWaybillsOpen] = useState(false);

  // Waybill Form Generation State Layer
  const [wbFormOpen, setWbFormOpen] = useState(false);
  const [selectedManifest, setSelectedManifest] = useState('');
  const [cargoDesc, setCargoDesc] = useState('');
  const [currentLoc, setCurrentLoc] = useState('');
  const [submittingWaybill, setSubmittingWaybill] = useState(false);

  const [userSession, setUserSession] = useState<{ name: string; role: string } | null>(() => {
    const cachedName = localStorage.getItem('remembered_logistics_name');
    const cachedRole = localStorage.getItem('remembered_logistics_role');
    return cachedName && cachedRole ? { name: cachedName, role: cachedRole } : null;
  });

  // 📊 Live Telemetry Data Layers & Modal Visibility Controllers
  const [marketIntel, setMarketIntel] = useState<Opportunity[]>([]);
  const [intelOpen, setIntelOpen] = useState(false);

  // Sync shop_id down if URL context overrides state mid-session
  useEffect(() => {
    const urlId = searchParams.get('shop_id');
    if (urlId && urlId !== shopId) {
      setShopId(urlId);
    }
  }, [searchParams]);

  // Helper utility extracting driver initials safely
  const getInitials = () => {
    if (!userSession || !userSession.name) return 'TR';
    return userSession.name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0]) // Extracts the first character of each name segment safely
      .join('')
      .toUpperCase();
  };

  // 💾 Explicit URL Resolver Utility Function
  const resolveCurrentShopId = (): string | null => {
    const urlId = new URLSearchParams(window.location.search).get('shop_id');
    if (urlId) return urlId;
    
    // Natively look for the explicit high-level fallback parameters backed up by App.tsx
    return localStorage.getItem('__native_shop_id') || localStorage.getItem('remembered_logistics_shop_id');
  };


  const toggleTripTracking = () => {
    const activeShopId = resolveCurrentShopId() || shopId || '92';
    const savedPhone = localStorage.getItem('remembered_logistics_phone') || '';

    if (isTrackingActive) {
      // 🛑 Halt Active Tracking Session
      if (geoWatchId !== null) {
        navigator.geolocation.clearWatch(geoWatchId);
        setGeoWatchId(null);
      }
      setIsTrackingActive(false);
      alert("Trip tracking halted. Fleet location stream deactivated.");
    } else {
      // 🚀 Initialize Real-Time Tracking Session
      if (!navigator.geolocation) {
        return alert("Your device does not support geolocation mapping tracking.");
      }

      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            await fetch('https://n8n.tenear.com/webhook/track-truck-driver', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                shop_id: parseInt(activeShopId, 10),
                driver_phone: savedPhone.replace(/\D/g, '').replace(/^0/, '254').replace(/^(?=)/, '254'),
                latitude,
                longitude,
                timestamp: new Date().toISOString()
              })
            });
          } catch (err) {
            console.error("Failed to stream real-time coordinate node data:", err);
          }
        },
        (error) => alert(`GPS Failure: ${error.message}. Please check application localization settings.`),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );

      setGeoWatchId(watchId);
      setIsTrackingActive(true);
      alert("🚀 Voyage manifest started! Live transit tracking stream is now broadcasting to dispatch controllers.");
    }
  };

  // Pull real live telemetry datasets from your n8n workflows
  const fetchDashboardData = async (targetShopId?: string) => {
    // Resolve identity strictly: passed value -> state value -> localStorage value -> null
    const activeShopId = targetShopId || shopId || localStorage.getItem('remembered_logistics_shop_id');
    
    if (!activeShopId) {
      console.warn("Telemetry fetch skipped: Missing valid shop_id context identifier.");
      return;
    }

    try {
      const res = await fetch('https://n8n.tenear.com/webhook/logistics-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: parseInt(activeShopId, 10) })
      });
      const data = await res.json();
      if (data && data.opportunities) {
        setMarketIntel(data.opportunities);
      }
    } catch (err) {
      console.error("Error pulling database telemetry logs:", err);
    }
  };

  // 🔄 Unified Real-Time Lifecycle Orchestrator Hook
  // Fires instantly on login view changes OR multi-tenant workspace context shifts
  useEffect(() => {
    if (view === 'dashboard') {
      // 1. Resolve identity instantly (bypasses asynchronous React state delays)
      const isolatedId = resolveCurrentShopId() || shopId;
      
      if (isolatedId) {
        // 2. Synchronously blast the resolved identity down to all three data views
        fetchDashboardData(isolatedId);
        fetchAppliedHistory(isolatedId);
        fetchManifestLogs(isolatedId);
        fetchWaybillLogs(isolatedId);
        fetchFuelVouchers(isolatedId);
        fetchFreightPayments(isolatedId);
        fetchPortDocuments(isolatedId);
        fetchBreakdownAlerts(isolatedId);
      
        // 🔒 Run live fleet tracking sync strictly for executive roles
        if (['owner', 'manager', 'supervisor'].includes(userSession?.role || '')) {
          fetchLiveFleetTracking(isolatedId);
          // Set up a 1-minute automated polling refresh loop for real-time tracking
          const pollInterval = setInterval(() => fetchLiveFleetTracking(isolatedId), 60000);
          return () => clearInterval(pollInterval);
        }
      }
    }
  }, [view, shopId, userSession]);

  
  // Function to pull real contract application rows from your database retrieval node
  const fetchAppliedHistory = async (targetShopId?: string) => {
    const activeShopId = targetShopId || resolveCurrentShopId();
    if (!activeShopId) return;

    setLoadingApplications(true);
    try {
      const res = await fetch('https://n8n.tenear.com/webhook/logs-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: parseInt(activeShopId, 10) })
      });
      const data = await res.json();
      if (data && data.applications) {
        setAppliedContracts(data.applications);
      }
    } catch (err) {
      console.error("Error pulling contract application rows:", err);
    } finally {
      setLoadingApplications(false);
    }
  };


  const handleCompanyBid = async (opportunity: Opportunity) => {
    const activeShopId = shopId || localStorage.getItem('remembered_logistics_shop_id');
    const companyName = localStorage.getItem('remembered_logistics_company') || 'Fleet Operator';
    
    if (!activeShopId) return alert("Workspace context lost.");

    if (!window.confirm(`Submit formal freight contract bid to ${opportunity.client_company_name}?`)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/claim-logs-opportunity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: parseInt(activeShopId, 10),
          company_name: companyName,
          opportunity_id: opportunity.id,
          client_name: opportunity.client_company_name,
          origin_city: opportunity.origin_city,
          destination_city: opportunity.destination_city,
          cargo_type: opportunity.cargo_type,
          offered_rate: opportunity.offered_rate,
          route: `${opportunity.origin_city} to ${opportunity.destination_city}`
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Corporate bid submitted successfully to the client panel!");
        setIntelOpen(false);
      } else {
        alert(data.message || "Claim processing conflict exception.");
      }
    } catch (err) {
      console.error(err);
      alert("Network gateway execution dropped.");
    } finally {
      setLoading(false);
    }
  };

  // Pull real live trip manifest datasets from your n8n workflows
  const fetchManifestLogs = async (targetShopId?: string) => {
    const activeShopId = targetShopId || shopId || localStorage.getItem('remembered_logistics_shop_id');
    
    if (!activeShopId) {
      console.warn("Manifest logs fetch skipped: Missing valid shop_id context identifier.");
      return;
    }

    try {
      const res = await fetch('https://n8n.tenear.com/webhook/fetch-manifest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: parseInt(activeShopId, 10) })
      });
      const data = await res.json();
      if (data && data.manifests) {
        setManifests(data.manifests);
      }
    } catch (err) {
      console.error("Error pulling database manifest logs:", err);
    }
  };

  const fetchWaybillLogs = async (targetShopId?: string) => {
    const activeShopId = targetShopId || shopId || localStorage.getItem('remembered_logistics_shop_id');
    if (!activeShopId) return;

    try {
      const res = await fetch('https://n8n.tenear.com/webhook/fetch-waybill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: parseInt(activeShopId, 10) })
      });
      const data = await res.json();
      if (data && data.waybills) {
        setWaybills(data.waybills);
      }
    } catch (err) {
      console.error("Error pulling database waybill logs:", err);
    }
  };

  const fetchFuelVouchers = async (targetShopId?: string) => {
    const activeShopId = targetShopId || resolveCurrentShopId();
    if (!activeShopId) return;

    try {
      const res = await fetch('https://n8n.tenear.com/webhook/fetch-fuel-voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: parseInt(activeShopId, 10) })
      });
      const data = await res.json();
      if (data && data.vouchers) {
        setVouchers(data.vouchers);
      }
    } catch (err) {
      console.error("Error pulling database fuel vouchers:", err);
    }
  };

  const fetchFreightPayments = async (targetShopId?: string) => {
    const activeShopId = targetShopId || resolveCurrentShopId();
    if (!activeShopId) return;

    try {
      const res = await fetch('https://n8n.tenear.com/webhook/fetch-logs-freight-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: parseInt(activeShopId, 10) })
      });
      const data = await res.json();
      if (data && data.payments) {
        setPayments(data.payments);
      }
    } catch (err) {
      console.error("Error pulling database freight payments:", err);
    }
  };

  const fetchPortDocuments = async (targetShopId?: string) => {
    const activeShopId = targetShopId || resolveCurrentShopId();
    if (!activeShopId) return;

    try {
      const res = await fetch('https://n8n.tenear.com/webhook/fetch-port-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: parseInt(activeShopId, 10) })
      });
      const data = await res.json();
      if (data && data.documents) {
        setPortDocs(data.documents);
      }
    } catch (err) {
      console.error("Error pulling database port/weighbridge logs:", err);
    }
  };

  const fetchBreakdownAlerts = async (targetShopId?: string) => {
    const activeShopId = targetShopId || resolveCurrentShopId();
    if (!activeShopId) return;

    try {
      const res = await fetch('https://n8n.tenear.com/webhook/fetch-breakdowns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: parseInt(activeShopId, 10) })
      });
      const data = await res.json();
      if (data && data.breakdowns) {
        setBreakdowns(data.breakdowns);
      }
    } catch (err) {
      console.error("Error pulling database emergency logs:", err);
    }
  };

  const handleCreateBreakdownAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeShopId = resolveCurrentShopId();
    if (!activeShopId) return alert("Multi-tenant tracking token lost.");
    if (!emManifest || !emLocation.trim()) {
      return alert("Please select a manifest reference and pinpoint your current location.");
    }

    setSubmittingEmergency(true);
    const generatedAlertNo = `SOS-${Date.now().toString().slice(-6).toUpperCase()}`;

    try {
      const res = await fetch('https://n8n.tenear.com/webhook/breakdown-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: parseInt(activeShopId, 10),
          alert_no: generatedAlertNo,
          manifest_no: emManifest,
          breakdown_type: emType,
          current_location: emLocation.trim(),
          driver_comments: emComments.trim()
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert(`CRITICAL ALERT ${generatedAlertNo} Broadcasted to Fleet Control!`);
        setEmLocation('');
        setEmComments('');
        setEmManifest('');
        setEmergencyFormOpen(false);
        fetchBreakdownAlerts(activeShopId);
      } else {
        alert(data.message || "Emergency tracking synchronization processing fault.");
      }
    } catch (err) {
      console.error(err);
      alert("Emergency network alert gateway failure.");
    } finally {
      setSubmittingEmergency(false);
    }
  };

  const handleCreatePortDocRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeShopId = resolveCurrentShopId();
    if (!activeShopId) return alert("Multi-tenant tracking token lost.");
    if (!docManifest || !stationName.trim() || !clearanceStatus) {
      return alert("Please fill in all mandatory clearance log elements.");
    }

    setSubmittingDoc(true);
    const generatedClNo = `DOC-${Date.now().toString().slice(-6).toUpperCase()}`;

    try {
      const res = await fetch('https://n8n.tenear.com/webhook/generate-port-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: parseInt(activeShopId, 10),
          clearance_no: generatedClNo,
          manifest_no: docManifest,
          document_type: docType,
          station_name: stationName.trim(),
          gross_weight_kg: grossWeight ? parseFloat(grossWeight) : null,
          clearance_status: clearanceStatus
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert(`Port clearance entry ${generatedClNo} registered successfully!`);
        setStationName('');
        setGrossWeight('');
        setDocManifest('');
        setDocFormOpen(false);
        fetchPortDocuments(activeShopId);
      } else {
        alert(data.message || "Clearance document processing entry execution error.");
      }
    } catch (err) {
      console.error(err);
      alert("Network checkpoint gateway synchronization dropped.");
    } finally {
      setSubmittingDoc(false);
    }
  };

  const handleCreatePaymentRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeShopId = resolveCurrentShopId();
    if (!activeShopId) return alert("Multi-tenant tracking token lost.");
    if (!payManifest || !payerName.trim() || !payAmount || !payPurpose) {
      return alert("Please fill in all transaction ledger details.");
    }

    setSubmittingPayment(true);
    // Generate a unique system tracking string if it's not a verified M-Pesa input code
    const generatedTxNo = payMethod === 'M-PESA' ? `MP-${Date.now().toString().slice(-6).toUpperCase()}` : `TX-${Date.now().toString().slice(-6)}`;

    try {
      const res = await fetch('https://n8n.tenear.com/webhook/logs-mpesa-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: parseInt(activeShopId, 10),
          transaction_no: generatedTxNo,
          manifest_no: payManifest,
          payer_name: payerName.trim(),
          payment_method: payMethod,
          amount_kes: parseFloat(payAmount),
          payment_purpose: payPurpose,
          payment_status: 'COMPLETED'
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert(`Transaction Ledger ${generatedTxNo} mapped and registered cleanly!`);
        setPayerName('');
        setPayAmount('');
        setPayManifest('');
        setPayFormOpen(false);
        fetchFreightPayments(activeShopId);
      } else {
        alert(data.message || "Payment transaction execution failure.");
      }
    } catch (err) {
      console.error(err);
      alert("Network finance gateway synchronization drop error.");
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleCreateFuelVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeShopId = resolveCurrentShopId();
    if (!activeShopId) return alert("Multi-tenant tracking token lost.");
    if (!fuelManifest || !fuelStation.trim() || !fuelAmount || !fuelLiters) {
      return alert("Please complete all tracking entry parameters.");
    }

    setSubmittingVoucher(true);
    const generatedVoucherNo = `VCH-${Date.now().toString().slice(-6)}`;

    try {
      const res = await fetch('https://n8n.tenear.com/webhook/generate-logs-voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: parseInt(activeShopId, 10),
          voucher_no: generatedVoucherNo,
          manifest_no: fuelManifest,
          fuel_station: fuelStation.trim(),
          amount_kes: parseFloat(fuelAmount),
          allocated_liters: parseFloat(fuelLiters)
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert(`Fuel Voucher ${generatedVoucherNo} logged successfully for allocation vetting!`);
        setFuelStation('');
        setFuelAmount('');
        setFuelLiters('');
        setFuelManifest('');
        setFuelFormOpen(false);
        fetchFuelVouchers(activeShopId);
      } else {
        alert(data.message || "Voucher generation execution failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Network gateway failed to sync budget allocation data.");
    } finally {
      setSubmittingVoucher(false);
    }
  };

  const handleCreateWaybill = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeShopId = resolveCurrentShopId();
    if (!activeShopId) return alert("Multi-tenant tracking token lost.");
    if (!selectedManifest || !cargoDesc.trim() || !currentLoc.trim()) {
      return alert("Please select a manifest and complete all fields.");
    }

    setSubmittingWaybill(true);
    const generatedWbNo = `WAY-${Date.now().toString().slice(-6)}`;

    try {
      const res = await fetch('https://n8n.tenear.com/webhook/create-waybill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: parseInt(activeShopId, 10),
          waybill_no: generatedWbNo,
          manifest_no: selectedManifest,
          cargo_description: cargoDesc.trim(),
          current_location: currentLoc.trim(),
          transit_status: 'DISPATCHED'
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert(`Waybill ${generatedWbNo} created and driver notification queued!`);
        setCargoDesc('');
        setCurrentLoc('');
        setSelectedManifest('');
        setWbFormOpen(false);
        fetchWaybillLogs(activeShopId); // Instantly refresh the viewport list
      } else {
        alert(data.message || "Waybill generation execution failure.");
      }
    } catch (err) {
      console.error(err);
      alert("Network gateway failed to push waybill processing metrics.");
    } finally {
      setSubmittingWaybill(false);
    }
  };

  const handleCreateManifest = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeShopId = shopId || localStorage.getItem('remembered_logistics_shop_id');
    const savedName = localStorage.getItem('remembered_logistics_name') || 'Unknown Driver';
    const savedPhone = localStorage.getItem('remembered_logistics_phone') || '';

    if (!activeShopId) return alert("Multi-tenant tracking token lost.");
    if (!vehiclePlate.trim() || !routeItinerary.trim()) return alert("Please fill in all layout text fields.");

    setSubmittingManifest(true);
    // Auto-generate a clean manifest tracking string using timestamp numbers
    const generatedNo = `MNF-${Date.now().toString().slice(-6)}`;

    try {
      const res = await fetch('https://n8n.tenear.com/webhook/create-trip-manifest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id: parseInt(activeShopId, 10),
          manifest_no: generatedNo,
          vehicle_plate: vehiclePlate.toUpperCase().trim(),
          route_itinerary: routeItinerary.trim(),
          driver_name: savedName,
          driver_phone: savedPhone
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert(`Trip Manifest ${generatedNo} successfully logged and synchronized!`);
        // Reset local form input layers
        setVehiclePlate('');
        setRouteItinerary('');
        setFormOpen(false);
        // Instantly sync layout viewport logs down
        fetchManifestLogs(activeShopId);
      } else {
        alert(data.message || "Manifest submission execution error.");
      }
    } catch (err) {
      console.error(err);
      alert("Network gateway failed to upload trip logging details.");
    } finally {
      setSubmittingManifest(false);
    }
  };


  const fetchLiveFleetTracking = async (targetShopId?: string) => {
    const activeShopId = targetShopId || resolveCurrentShopId();
    if (!activeShopId) return;

    try {
      const res = await fetch('https://n8n.tenear.com/webhook/live-fleet-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: parseInt(activeShopId, 10) })
      });
      const data = await res.json();
      if (data && data.tracking) {
        setActiveTrackingLogs(data.tracking);
      }
    } catch (err) {
      console.error("Error pulling real-time platform tracking logs:", err);
    }
  };

  // 🔐 Multi-Tenant Webhook POST Auth Engine
  const handleAuth = async (e: React.FormEvent, type: 'login' | 'register') => {
    e.preventDefault();
    const targetShopId = shopId || '6';
    setLoading(true);

    const combinedFullName = `${firstName.trim()} ${lastName.trim()}`;
    const payload = type === 'register'
      ? { action: 'register', shop_id: parseInt(targetShopId, 10), phone_number: phone, password, full_name: combinedFullName, user_category: category }
      : { action: 'login', phone_number: phone, password }; // Architecture B login payload

    try {
      const response = await fetch('https://n8n.tenear.com/webhook/logistics-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success && data.user) {
        const verifiedShopId = String(data.user.shop_id);
      
        localStorage.setItem('remembered_logistics_shop_id', verifiedShopId);
        localStorage.setItem('remembered_logistics_name', data.user.full_name);
        localStorage.setItem('remembered_logistics_role', data.user.user_category);
        localStorage.setItem('remembered_logistics_phone', phone);
        localStorage.setItem('remembered_logistics_company', data.user.company_name || 'Fleet Operator');
 
        setShopId(verifiedShopId);
        setUserSession({ name: data.user.full_name, role: data.user.user_category });

        // 3. Trigger database fetching directly using the verified string token
        fetchDashboardData(verifiedShopId);
        fetchAppliedHistory(verifiedShopId);
        fetchManifestLogs(verifiedShopId);
        fetchWaybillLogs(verifiedShopId);
        fetchFuelVouchers(verifiedShopId);
        fetchFreightPayments(verifiedShopId);
        fetchPortDocuments(verifiedShopId);


        setView('dashboard');
      } else {
        alert(data.message || "Authentication verification match failure exception.");
      }
    } catch (err) {
      console.error(err);
      alert("Network gateway connection dropped.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('remembered_logistics_name');
    localStorage.removeItem('remembered_logistics_role');
    localStorage.removeItem('remembered_logistics_phone');
    setUserSession(null);
    setView('login');
  };

  const hubActions = [
    { id: 'trip_manifest', label: 'TRIP MANIFEST & NTSA LOG', icon: <FileText className="w-5 h-5" />, color: 'bg-blue-600', allowedRoles: ['driver', 'manager', 'owner', 'supervisor'] },
    { id: 'fuel_allocation', label: 'FUEL VOUCHER & EXPENSES', icon: <Fuel className="w-5 h-5" />, color: 'bg-blue-600', allowedRoles: ['driver', 'manager', 'owner', 'supervisor'] },
    { id: 'cargo_tracking', label: 'WAYBILL & CARGO STATUS', icon: <MapPin className="w-5 h-5" />, color: 'bg-blue-600', allowedRoles: ['driver', 'manager', 'owner', 'supervisor'] },
    { id: 'weighbridge_clearance', label: 'WEIGHBRIDGE & PORT DOCS', icon: <UserCheck className="w-5 h-5" />, color: 'bg-blue-600', allowedRoles: ['driver', 'manager', 'owner', 'supervisor'] },
    { id: 'payments_invoicing', label: 'M-PESA / FREIGHT PAYMENTS', icon: <DollarSign className="w-5 h-5" />, color: 'bg-blue-600', allowedRoles: ['manager', 'owner'] }, // 🔒 Hidden from Drivers
    { id: 'market_intel', label: 'MARKET OPPORTUNITIES', icon: <Briefcase className="w-5 h-5" />, color: 'bg-emerald-600', allowedRoles: ['manager', 'owner'] }, // 🔒 Hidden from Drivers
    { id: 'breakdown_alert', label: 'EMERGENCY & BREAKDOWN', icon: <ShieldAlert className="w-5 h-5" />, color: 'bg-red-600', allowedRoles: ['driver', 'manager', 'owner', 'supervisor'] }
  ];

  // =========================================================================
  // 🔘 FRONTEND LAYOUT VIEW ROUTING SECTION
  // =========================================================================
  if (view === 'login' || view === 'register') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto text-white mb-2 shadow-md">
              <Truck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Logistics Workspace</h2>
            <p className="text-xs text-slate-400 mt-1">Workspace Tenant Context Profile ID: #{shopId}</p>
          </div>

          <form onSubmit={(e) => handleAuth(e, view === 'login' ? 'login' : 'register')} className="space-y-3.5">
            {view === 'register' && (
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 border rounded-xl p-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input type="text" placeholder="First Name" required className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div className="bg-slate-50 border rounded-xl p-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input type="text" placeholder="Last Name" required className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
                <div className="col-span-2 bg-slate-50 border rounded-xl p-2">
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Functional Designation</label>
                  <select className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="driver">Commercial Driver</option>
                    <option value="manager">Fleet Manager</option>
                    <option value="owner">Business Owner</option>
                    <option value="supervisor">Route Supervisor</option>
                    <option value="mechanic">Fleet Mechanic</option>
                    <option value="clearing_agent">Port Clearing Agent</option>
                  </select>
                </div>
              </div>
            )}

            <div className="bg-slate-50 border rounded-xl p-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input type="tel" placeholder="Phone Number" required className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>

            <div className="bg-slate-50 border rounded-xl p-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input type="password" placeholder="Password" required className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md disabled:opacity-50">
              {loading ? 'Processing System Gateway...' : view === 'login' ? 'Sign In to Fleet Panel' : 'Register Operator Credentials'}
            </button>
          </form>

          <div className="text-center mt-5 pt-4 border-t border-slate-100">
            <button onClick={() => setView(view === 'login' ? 'register' : 'login')} className="text-xs text-blue-600 font-bold hover:underline">
              {view === 'login' ? "New platform driver? Register details" : "Already registered? Login to portal"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-10 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Sidebar Element */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm h-fit">

          {/* Dynamic Company Banner Element on top left corner of the card container */}
          <div className="w-full text-left mb-4 px-1 pb-3 border-b border-slate-100">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">LOGISTICS FIRM</span>
            <h1 className="text-base font-black text-slate-900 tracking-tight uppercase">
              {localStorage.getItem('remembered_logistics_company') || 'TeNEAR Transporters'}
            </h1>
          </div>

          <div className="flex flex-col items-center border-b border-slate-100 pb-4 mb-4">
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg font-black mb-3 shadow-inner">
              {getInitials()}
            </div>
            <span className="bg-blue-50 text-blue-700 text-[9px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border border-blue-100 uppercase">
              {userSession?.role}
            </span>
            <h2 className="text-lg font-bold text-slate-800 mt-2">{userSession?.name}</h2>
          </div>

          {/* 📡 Driver Geolocation Tracking Controller Switch Card (Visible strictly to logged drivers) */}
          {userSession?.role === 'driver' && (
            <div className="mb-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                Active Transit Dispatch Link
              </p>
              <button
                onClick={toggleTripTracking}
                className={`w-full font-black text-xs uppercase tracking-wider py-2 rounded-xl transition-all shadow-md ${
                  isTrackingActive 
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isTrackingActive ? "🛑 Stop Trip / Stop Live Stream" : "🚀 Start Trip / Go Live"}
              </button>
              {isTrackingActive && (
                <span className="inline-block text-[9px] text-emerald-600 font-bold uppercase tracking-widest mt-1.5 animate-pulse">
                  📡 Broadcasting GPS Telemetry
                </span>
              )}
            </div>
          )}


          <button onClick={handleLogout} className="w-full text-center text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100/70 border border-red-100 py-1.5 rounded-lg transition-colors uppercase tracking-wide">
            Exit Workspace
          </button>
        </div>

        {/* Right Hand Column Container Parent - Stacks Matrix and Table vertically */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Grid Functional Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hubActions
              .filter(action => action.allowedRoles.includes(userSession?.role || ''))
              .map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    if (action.id === 'market_intel') setIntelOpen(true);
                    else if (action.id === 'trip_manifest') setManifestsOpen(true); // Activated!
                    else if (action.id === 'cargo_tracking') setWaybillsOpen(true);
                    else if (action.id === 'fuel_allocation') setVouchersOpen(true);
                    else if (action.id === 'payments_invoicing') setPaymentsOpen(true);
                    else if (action.id === 'weighbridge_clearance') setPortDocsOpen(true);
                    else if (action.id === 'breakdown_alert') setBreakdownsOpen(true); 
                    else console.log(`Triggering POST workflow API node allocation context for option: ${action.id}`);
                  }}
                  className="transition-all duration-150 rounded-xl p-4 text-white flex items-center gap-4 text-left shadow-xs hover:brightness-95 group font-medium"
                  style={{ backgroundColor: action.id === 'breakdown_alert' ? '#DC2626' : action.id === 'market_intel' ? '#059669' : '#2563EB' }}
                >
                  <div className="p-2 bg-white/20 rounded-lg group-hover:scale-105 transition-transform">
                    {action.icon}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">{action.label}</span>
                </button>
            ))}
          </div>

          {/* 📡 EXECUTIVE MANAGEMENT LIVE TELEMETRY RADAR CONTROL PANEL */}
          {['owner', 'manager', 'supervisor'].includes(userSession?.role || '') && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
              <div className="border-b border-slate-100 pb-3 mb-3">
                <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase flex items-center gap-1.5 text-blue-600">
                  📡 Live Fleet Tracking Radar
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Real-time driver smartphone coordinate updates polled from logstrip_gps_pings</p>
              </div>

              {activeTrackingLogs.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-6 italic border border-dashed rounded-xl bg-slate-50/50">
                  No active driver location transit streams broadcasting on this workspace channel right now.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeTrackingLogs.map((log) => (
                    <div key={log.driver_phone} className="p-3 border border-slate-100 rounded-xl bg-slate-50/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-blue-200 transition-colors">
                      <div>
                        <span className="block text-xs font-bold text-slate-800">{log.driver_name || 'Active Operator Line'}</span>
                        <span className="block text-[10px] font-mono text-slate-400 mt-0.5">📞 Ref: +{log.driver_phone}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 justify-between sm:justify-end">
                        <span className="text-[10px] font-semibold text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded-md">
                          Last Ping: {new Date(log.pinged_at).toLocaleTimeString()}
                        </span>
                        <a 
                          href={`https://google.com{log.latitude},${log.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] tracking-wider px-3 py-1.5 rounded-lg uppercase transition-colors"
                        >
                          🗺️ View Map Location
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


          {/* 📋 LIVE DATABASE CONTRACT APPLICATIONS VIEWPORT PANEL */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Submitted Contract Status Logs</h3>
                <p className="text-[11px] text-slate-400 font-medium">Real-time applications archive pulled from public.contract_applications</p>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md border border-blue-100">
                TOTAL: {appliedContracts.length}
              </span>
            </div>

            {loadingApplications ? (
              <div className="text-center text-xs text-slate-400 py-6 italic font-medium">Interrogating application logs...</div>
            ) : appliedContracts.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 italic">
                No active contract applications logged for this corporate workspace profile.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-black uppercase tracking-wider">
                      <th className="pb-2">Client / Agency</th>
                      <th className="pb-2">Route Itinerary Details</th>
                      <th className="pb-2 text-right">Offered Rate</th>
                      <th className="pb-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                    {appliedContracts.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 pr-2">
                          <span className="block font-bold text-slate-800">{app.client_company_name}</span>
                          <span className="block text-[9px] text-slate-400 font-mono tracking-tight">{app.opportunity_id}</span>
                        </td>
                        <td className="py-3 pr-2">
                          <span className="block text-slate-600 truncate max-w-[200px]">{app.cargo_type}</span>
                          <span className="block text-[9px] text-slate-400 font-semibold">{app.origin_city} → {app.destination_city}</span>
                        </td>
                        <td className="py-3 pr-2 text-right font-black text-slate-900">
                          KES {Number(app.offered_rate).toLocaleString()}
                        </td>
                        <td className="py-3 text-center">
                          <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            app.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div> {/* Right Hand Column Container Parent Close */}
      </div> {/* Main Grid Row Close */}


      {/* Dynamic Slide-Over Panel displaying active database entries */}
      {intelOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Regional Freight Opportunities</h3>
                <p className="text-xs text-slate-400">Live operational data queried matching system records</p>
              </div>
              <button onClick={() => setIntelOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {marketIntel.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-10 italic">No available transport queries loaded in data viewport pipeline.</div>
              ) : (
                marketIntel.map((job) => (
                  <div key={job.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:border-emerald-200 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-slate-800">{job.client_company_name}</span>
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        KES {job.offered_rate.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                      <MapPin className="w-3 h-3 text-slate-400" /> {job.origin_city} → {job.destination_city}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 pl-4">• Load Spec: {job.cargo_type}</p>
                    
                    {/* B2B Multi-Role Action Gatekeeper */}
                    {['owner', 'manager'].includes(userSession?.role || '') ? (
                      <button 
                        onClick={() => handleCompanyBid(job)}
                        disabled={loading}
                        className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] tracking-wider py-1.5 rounded-lg flex items-center justify-center gap-1 uppercase transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Submitting Bid...' : 'Submit Contract Bid'} <ChevronRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <div className="mt-3 text-center text-[10px] bg-slate-100 text-slate-500 py-1 rounded-md font-bold uppercase tracking-wider">
                       Viewing Only (Requires Manager Dispatch)
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>

        </div>
      )}

      {/* Dynamic Slide-Over Panel displaying active Trip Manifests & NTSA status */}
      {manifestsOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Trip Manifests & NTSA Logs</h3>
                <p className="text-xs text-slate-400">Live multi-tenant dispatch records tracking system approvals</p>
              </div>
              <button onClick={() => setManifestsOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* CTA action layer allowing authorized logged drivers to toggle form options */}
            <div className="mb-4">
              <button 
                onClick={() => setFormOpen(!formOpen)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-2 rounded-xl transition-colors shadow-xs"
              >
                {formOpen ? "← View Running Logs" : "+ File New Dispatch Manifest"}
              </button>
            </div>
            
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {formOpen ? (
                /* Dynamic Creation Form Element Layer */
                <form onSubmit={handleCreateManifest} className="space-y-4 p-1">
                  <div className="bg-slate-50 border rounded-xl p-2.5">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Vehicle Registration Plate</label>
                    <input 
                      type="text" 
                      placeholder="e.g. KCX 123A" 
                      required 
                      className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" 
                      value={vehiclePlate} 
                      onChange={e => setVehiclePlate(e.target.value)} 
                    />
                  </div>
                  <div className="bg-slate-50 border rounded-xl p-2.5">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Route Itinerary Details</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mombasa Port to Nairobi Inland Container Depot" 
                      required 
                      className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" 
                      value={routeItinerary} 
                      onChange={e => setRouteItinerary(e.target.value)} 
                    />
                  </div>
                  <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-700 font-medium">
                    Signing manifest as driver: <span className="font-bold">{userSession?.name || 'Authorized Operator'}</span>
                  </div>
                  <button 
                    type="submit" 
                    disabled={submittingManifest} 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    {submittingManifest ? 'Registering Logs...' : 'Submit to NTSA Verification Node'}
                  </button>
                </form>
              ) : (

                manifests.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-10 italic">No available active trip manifests or log runs found for this shop.</div>
                ) : (
                  manifests.map((manifest) => (
                    <div key={manifest.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:border-blue-200 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-800">Manifest: #{manifest.manifest_no}</span>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          manifest.ntsa_status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          manifest.ntsa_status === 'FAILED' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          NTSA: {manifest.ntsa_status || 'PENDING'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                        <Truck className="w-3 h-3 text-slate-400" /> Fleet Vehicle: <span className="font-bold text-slate-800">{manifest.vehicle_plate}</span>
                      </p>
                      <p className="text-xs text-slate-600 flex items-center gap-1 font-medium mt-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> Route: {manifest.route_itinerary}
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-500">
                        <span>Driver: {manifest.driver_name}</span>
                        <span className="font-mono text-slate-400">{manifest.dispatch_date ? new Date(manifest.dispatch_date).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Slide-Over Panel displaying active Waybill & Cargo Status */}
      {waybillsOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Waybill & Cargo Status</h3>
                <p className="text-xs text-slate-400">Real-time live multi-tenant transit tracking indexes</p>
              </div>
              <button onClick={() => setWaybillsOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* CTA Option Toggle Header available only to Corporate Fleet Operators */}
            {['owner', 'manager', 'supervisor'].includes(userSession?.role || '') && (
              <div className="mb-4">
                <button 
                  onClick={() => setWbFormOpen(!wbFormOpen)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-2 rounded-xl transition-colors shadow-xs"
                >
                  {wbFormOpen ? "← View Waybill Archive" : "+ Issue Cargo Waybill Document"}
                </button>
              </div>
            )}
            
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {wbFormOpen ? (
                /* Interactive Waybill Form Component Layer */
                <form onSubmit={handleCreateWaybill} className="space-y-4 p-1">
                  <div className="bg-slate-50 border rounded-xl p-2.5">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Link to Approved Trip Manifest</label>
                    <select 
                      required
                      className="bg-transparent w-full text-xs font-semibold focus:outline-hidden"
                      value={selectedManifest}
                      onChange={e => setSelectedManifest(e.target.value)}
                    >
                      <option value="">-- Choose Running Trip Manifest --</option>
                      {manifests.map(m => (
                        <option key={m.id} value={m.manifest_no}>
                          {m.manifest_no} ({m.vehicle_plate})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-slate-50 border rounded-xl p-2.5">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Cargo Consignment Description</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 20ft Container - Electronics & Spares" 
                      required 
                      className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" 
                      value={cargoDesc} 
                      onChange={e => setCargoDesc(e.target.value)} 
                    />
                  </div>

                  <div className="bg-slate-50 border rounded-xl p-2.5">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Current Transit Dispatch Node</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mombasa Port Gate 18" 
                      required 
                      className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" 
                      value={currentLoc} 
                      onChange={e => setCurrentLoc(e.target.value)} 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={submittingWaybill} 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    {submittingWaybill ? 'Generating Documentation...' : 'Authorize Waybill & Alert Driver'}
                  </button>
                </form>
              ) : (
                /* Waybill Display Cards Layer Template */
                waybills.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-10 italic">No cargo manifests or tracking waybills recorded for this shop.</div>
                ) : (
                  waybills.map((wb) => (
                    <div key={wb.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:border-blue-200 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-800">Waybill: #{wb.waybill_no}</span>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          wb.transit_status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          wb.transit_status === 'DELAYED' ? 'bg-red-50 text-red-700 border-red-200' :
                          wb.transit_status === 'EN_ROUTE' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {wb.transit_status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        📦 Cargo Spec: <span className="text-slate-800 font-semibold">{wb.cargo_description}</span>
                      </p>
                      <p className="text-xs text-slate-600 font-medium mt-1">
                        📄 Ref Manifest: <span className="font-mono text-slate-500 font-semibold">#{wb.manifest_no}</span>
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-blue-600">
                          📍 Live Loc: {wb.current_location}
                        </span>
                        <span className="font-mono text-slate-400">
                          {wb.last_updated ? new Date(wb.last_updated).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Slide-Over Panel displaying Fuel Vouchers & Allocations */}
      {vouchersOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Fuel Vouchers & Expenses</h3>
                <p className="text-xs text-slate-400">Multi-tenant fleet fueling limits and payment allocations</p>
              </div>
              <button onClick={() => { setVouchersOpen(false); setFuelFormOpen(false); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <button 
                onClick={() => setFuelFormOpen(!fuelFormOpen)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-2 rounded-xl transition-colors shadow-xs"
              >
                {fuelFormOpen ? "← View Voucher History" : "+ Request Refueling Voucher"}
              </button>
            </div>
            
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {fuelFormOpen ? (
                <form onSubmit={handleCreateFuelVoucher} className="space-y-4 p-1">
                  <div className="bg-slate-50 border rounded-xl p-2.5">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Target Trip Manifest Link</label>
                    <select 
                      required
                      className="bg-transparent w-full text-xs font-semibold focus:outline-hidden"
                      value={fuelManifest}
                      onChange={e => setFuelManifest(e.target.value)}
                    >
                      <option value="">-- Select Active Voyage Ref --</option>
                      {manifests.map(m => (
                        <option key={m.id} value={m.manifest_no}>{m.manifest_no} ({m.vehicle_plate})</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-slate-50 border rounded-xl p-2.5">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Fuel Station Station/Brand</label>
                    <input type="text" placeholder="e.g. Rubis Mombasa Road" required className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" value={fuelStation} onChange={e => setFuelStation(e.target.value)} />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 border rounded-xl p-2.5">
                      <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Total Amount (KES)</label>
                      <input type="number" placeholder="e.g. 25000" required className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" value={fuelAmount} onChange={e => setFuelAmount(e.target.value)} />
                    </div>
                    <div className="bg-slate-50 border rounded-xl p-2.5">
                      <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Volume (Liters)</label>
                      <input type="number" step="0.01" placeholder="e.g. 148.5" required className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" value={fuelLiters} onChange={e => setFuelLiters(e.target.value)} />
                    </div>
                  </div>

                  <button type="submit" disabled={submittingVoucher} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors disabled:opacity-50">
                    {submittingVoucher ? 'Processing Voucher allocation...' : 'Authorize Station Fuel Expense'}
                  </button>
                </form>
              ) : (
                vouchers.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-10 italic">No historical fuel vouchers logged for this tenant profile.</div>
                ) : (
                  vouchers.map((v) => (
                    <div key={v.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:border-blue-200 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-800">Voucher: #{v.voucher_no}</span>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          v.approval_status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          v.approval_status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>{v.approval_status}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">⛽ Station: <span className="text-slate-800 font-semibold">{v.fuel_station}</span></p>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">📄 Manifest Ref: <span className="font-mono text-slate-500 font-semibold">#{v.manifest_no}</span></p>
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] font-bold text-slate-900">
                        <span className="text-blue-600 font-mono">{Number(v.allocated_liters).toFixed(1)} L</span>
                        <span>KES {Number(v.amount_kes).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Slide-Over Panel displaying M-Pesa / Freight Payments */}
      {paymentsOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">M-Pesa / Freight Payments</h3>
                <p className="text-xs text-slate-400">Multi-tenant transport collection accounts and revenue log books</p>
              </div>
              <button onClick={() => { setPaymentsOpen(false); setPayFormOpen(false); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <button 
                onClick={() => setPayFormOpen(!payFormOpen)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-2 rounded-xl transition-colors shadow-xs"
              >
                {payFormOpen ? "← View Transaction Ledger" : "+ Log Fresh Freight Payment"}
              </button>
            </div>
            
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {payFormOpen ? (
                <form onSubmit={handleCreatePaymentRecord} className="space-y-4 p-1">
                  <div className="bg-slate-50 border rounded-xl p-2.5">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Link Voyage Trip Manifest</label>
                    <select 
                      required
                      className="bg-transparent w-full text-xs font-semibold focus:outline-hidden"
                      value={payManifest}
                      onChange={e => setPayManifest(e.target.value)}
                    >
                      <option value="">-- Choose Target Manifest --</option>
                      {manifests.map(m => (
                        <option key={m.id} value={m.manifest_no}>{m.manifest_no} ({m.vehicle_plate})</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-slate-50 border rounded-xl p-2.5">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Payer Client / Entity Name</label>
                    <input type="text" placeholder="e.g. East African Breweries Ltd" required className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" value={payerName} onChange={e => setPayerName(e.target.value)} />
                  </div>

                  <div className="bg-slate-50 border rounded-xl p-2.5">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Settlement Method</label>
                    <select className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                      <option value="M-PESA">M-Pesa Mobile Wallet</option>
                      <option value="BANK_TRANSFER">Direct Commercial Bank Wire</option>
                      <option value="CASH">Spot Cash Remittance</option>
                    </select>
                  </div>

                  <div className="bg-slate-50 border rounded-xl p-2.5">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Payment Purpose Allocation</label>
                    <select className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" value={payPurpose} onChange={e => setPayPurpose(e.target.value)}>
                      <option value="Freight Clearance">Freight Clearance Fee</option>
                      <option value="Demurrage Settlement">Demurrage & Port Charges</option>
                      <option value="Fuel Advance Repayment">Fuel Advance Re-payment</option>
                      <option value="Balance Clearance">Milestone Balance Settlement</option>
                    </select>
                  </div>

                  <div className="bg-slate-50 border rounded-xl p-2.5">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Total Remitted Amount (KES)</label>
                    <input type="number" placeholder="e.g. 185000" required className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
                  </div>

                  <button type="submit" disabled={submittingPayment} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors disabled:opacity-50">
                    {submittingPayment ? 'Securing Transaction Entry...' : 'Post Financial Record Entry'}
                  </button>
                </form>
              ) : (
                payments.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-10 italic">No registered financial receipts found for this workspace.</div>
                ) : (
                  payments.map((p) => (
                    <div key={p.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:border-emerald-200 transition-colors">
                      <div className="flex justify-between items-start mb-1.5">
                        <div>
                          <span className="text-xs font-bold text-slate-800block">{p.payer_name}</span>
                          <span className="text-[10px] font-mono font-medium text-slate-400 block mt-0.5">Ref: #{p.transaction_no}</span>
                        </div>
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          KES {Number(p.amount_kes).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1.5 border-t border-slate-100/60 mt-2">
                        <span className="font-medium text-slate-600">🎯 {p.payment_purpose} ({p.payment_method})</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">MNF: #{p.manifest_no}</span>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Slide-Over Panel displaying Weighbridge & Port Docs */}
      {portDocsOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Weighbridge & Port Docs</h3>
                <p className="text-xs text-slate-400">Multi-tenant checkpoint clearances, axle weighings, and gate logs</p>
              </div>
              <button onClick={() => { setPortDocsOpen(false); setDocFormOpen(false); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <button 
                onClick={() => setDocFormOpen(!docFormOpen)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-2 rounded-xl transition-colors shadow-xs"
              >
                {docFormOpen ? "← View Clearance Logs" : "+ File Checkpoint Clearance Ticket"}
              </button>
            </div>
            
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {docFormOpen ? (
                <form onSubmit={handleCreatePortDocRecord} className="space-y-4 p-1">
                  <div className="bg-slate-50 border rounded-xl p-2.5">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Target Trip Manifest Link</label>
                    <select 
                      required
                      className="bg-transparent w-full text-xs font-semibold focus:outline-hidden"
                      value={docManifest}
                      onChange={e => setDocManifest(e.target.value)}
                    >
                      <option value="">-- Choose Target Voyage --</option>
                      {manifests.map(m => (
                        <option key={m.id} value={m.manifest_no}>{m.manifest_no} ({m.vehicle_plate})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 border rounded-xl p-2.5">
                      <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Document Category</label>
                      <select className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" value={docType} onChange={e => setDocType(e.target.value)}>
                        <option value="PORT_CLEARANCE">Port Gate Release</option>
                        <option value="WEIGHBRIDGE_TICKET">Weighbridge Axle Ticket</option>
                        <option value="CUSTOMS_BOND">Customs Bond Entry</option>
                        <option value="EXPORT_RELEASE">Export Transit Release</option>
                      </select>
                    </div>
                    <div className="bg-slate-50 border rounded-xl p-2.5">
                      <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Inspection Status Outcome</label>
                      <select className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" value={clearanceStatus} onChange={e => setClearanceStatus(e.target.value)}>
                        <option value="CLEARED">PASSED / CLEARED</option>
                        <option value="PENDING">AWAITING REVIEW</option>
                        <option value="REJECTED_OVERWEIGHT">FAIL - OVERWEIGHT</option>
                        <option value="HELD_FOR_INSPECTION">HELD / SUSPENDED</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-50 border rounded-xl p-2.5">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Checkpoint / Station Name Location</label>
                    <input type="text" placeholder="e.g. Mariakani Weighbridge (A109)" required className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" value={stationName} onChange={e => setStationName(e.target.value)} />
                  </div>

                  <div className="bg-slate-50 border rounded-xl p-2.5">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Gross Freight Mass Weight (KG) - Optional</label>
                    <input type="number" placeholder="e.g. 42500" className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" value={grossWeight} onChange={e => setGrossWeight(e.target.value)} />
                  </div>

                  <button type="submit" disabled={submittingDoc} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors disabled:opacity-50">
                    {submittingDoc ? 'Saving Document Verification Logs...' : 'Post Gate Checkpoint Record'}
                  </button>
                </form>
              ) : (
                portDocs.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-10 italic">No historical checkpoint clearance parameters recorded for this workspace.</div>
                ) : (
                  portDocs.map((d) => (
                    <div key={d.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:border-blue-200 transition-colors">
                      <div className="flex justify-between items-start mb-1.5">
                        <div>
                          <span className="text-xs font-black bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono uppercase tracking-wide">{d.document_type.replace('_', ' ')}</span>
                          <span className="text-[10px] font-mono font-medium text-slate-400 block mt-1">Doc Code: #{d.clearance_no}</span>
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          d.clearance_status === 'CLEARED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          d.clearance_status === 'REJECTED_OVERWEIGHT' ? 'bg-red-50 text-red-700 border-red-200' :
                          d.clearance_status === 'HELD_FOR_INSPECTION' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>{d.clearance_status.replace('_', ' ')}</span>
                      </div>
                      
                      <div className="text-xs text-slate-600 font-medium space-y-0.5 mt-2">
                        <p>📍 Location Point: <span className="text-slate-800 font-semibold">{d.station_name}</span></p>
                        {d.gross_weight_kg && (
                          <p>⚖️ Verified Weight: <span className="text-slate-900 font-black font-mono">{Number(d.gross_weight_kg).toLocaleString()} KG</span></p>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-100/60 mt-2">
                        <span>Voyage Ref: #{d.manifest_no}</span>
                        <span>{d.logged_at ? new Date(d.logged_at).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Slide-Over Panel displaying Emergency & Roadside Breakdown Incidents */}
      {breakdownsOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 text-red-600 flex items-center gap-1">🚨 Emergency & Breakdowns</h3>
                <p className="text-xs text-slate-400">Live multi-tenant incident alerts and active corridor crisis panels</p>
              </div>
              <button onClick={() => { setBreakdownsOpen(false); setEmergencyFormOpen(false); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <button 
                onClick={() => setEmergencyFormOpen(!emergencyFormOpen)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider py-2 rounded-xl transition-colors shadow-xs"
              >
                {emergencyFormOpen ? "← View Active Incidents" : "⚠️ Report Fleet Incident / SOS"}
              </button>
            </div>
            
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {emergencyFormOpen ? (
                <form onSubmit={handleCreateBreakdownAlert} className="space-y-4 p-1">
                  <div className="bg-slate-50 border rounded-xl p-2.5">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Impacted Trip Manifest Link</label>
                    <select 
                      required
                      className="bg-transparent w-full text-xs font-semibold focus:outline-hidden"
                      value={emManifest}
                      onChange={e => setEmManifest(e.target.value)}
                    >
                      <option value="">-- Choose Target Voyage --</option>
                      {manifests.map(m => (
                        <option key={m.id} value={m.manifest_no}>{m.manifest_no} ({m.vehicle_plate})</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-slate-50 border rounded-xl p-2.5">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Incident Category Classification</label>
                    <select className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" value={emType} onChange={e => setEmType(e.target.value)}>
                      <option value="MECHANICAL">Mechanical Breakdown (Engine/Gearbox)</option>
                      <option value="TYRE_BURST">Tyre Burst Failure</option>
                      <option value="ACCIDENT">Road Transit Accident</option>
                      <option value="FUEL_RUNOUT">Dry Fuel Depletion</option>
                      <option value="POLICE_RESISTANCE">Highway Harassment / Police Intercept</option>
                    </select>
                  </div>

                  <div className="bg-slate-50 border rounded-xl p-2.5">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Current Geographic Location Coordinates</label>
                    <input type="text" placeholder="e.g. 20KM past Mtito Andei Town" required className="bg-transparent w-full text-xs font-semibold focus:outline-hidden" value={emLocation} onChange={e => setEmLocation(e.target.value)} />
                  </div>

                  <div className="bg-slate-50 border rounded-xl p-2.5">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">On-Ground Situation Remarks</label>
                    <textarea rows={3} placeholder="Provide specific operational visibility data here..." className="bg-transparent w-full text-xs font-semibold focus:outline-hidden resize-none" value={emComments} onChange={e => setEmComments(e.target.value)} />
                  </div>

                  <button type="submit" disabled={submittingEmergency} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors disabled:opacity-50 animate-pulse">
                    {submittingEmergency ? 'Broadcasting SOS Coordinates...' : '🚨 Broadcast Incident Alert'}
                  </button>
                </form>
              ) : (
                breakdowns.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-10 italic">No historical emergency incidents or active alerts reported. All fleet lines clear.</div>
                ) : (
                  breakdowns.map((b) => (
                    <div key={b.id} className="p-3 border border-red-100 rounded-xl bg-red-50/20 hover:border-red-300 transition-colors">
                      <div className="flex justify-between items-start mb-1.5">
                        <div>
                          <span className="text-xs font-black bg-red-600 text-white px-1.5 py-0.5 rounded font-mono uppercase tracking-wide">{b.breakdown_type.replace('_', ' ')}</span>
                          <span className="text-[10px] font-mono font-medium text-slate-400 block mt-1">Ticket: #{b.alert_no}</span>
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          b.alert_status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          b.alert_status === 'DISPATCHED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-red-50 text-red-700 border-red-200 animate-pulse'
                        }`}>{b.alert_status}</span>
                      </div>
                      
                      <div className="text-xs text-slate-600 font-medium space-y-1 mt-2">
                        <p>📍 Location: <span className="text-slate-800 font-semibold">{b.current_location}</span></p>
                        {b.driver_comments && (
                          <p className="p-1.5 bg-slate-50 border border-slate-100 rounded text-slate-500 italic mt-1">"{b.driver_comments}"</p>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 border-t border-slate-100 mt-2">
                        <span>Voyage Reference: #{b.manifest_no}</span>
                        <span>{b.reported_at ? new Date(b.reported_at).toLocaleTimeString() : ''}</span>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}; 
