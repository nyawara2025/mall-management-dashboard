import React from 'react';
import { Mall } from '../types/auth';
import { 
  Building2, 
  MapPin, 
  Navigation,
  Calendar,
  Settings,
  Users,
  ShoppingBag,
  ExternalLink,
  Clock
} from 'lucide-react';

interface MallCardProps {
  mall: Mall;
  userRole: string;
  userMallId?: number | null;
}

export function MallCard({ mall, userRole, userMallId }: MallCardProps) {
  const isAccessible = userRole === 'super_admin' || mall.id === userMallId;
  const shopCount = mall.shops?.length || 0;

  const getStatusColor = (active: boolean) => {
    return active 
      ? 'bg-success/10 text-success' 
      : 'bg-error/10 text-error';
  };

  const getStatusText = (active: boolean) => {
    return active ? 'Active' : 'Inactive';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCoordinate = (value: number) => {
    return value.toFixed(6);
  };

  return (
    <div className={`card group relative ${!isAccessible ? 'opacity-60' : ''}`}>
      {/* Access Indicator */}
      {!isAccessible && (
        <div className="absolute top-3 right-3">
          <div className="bg-warning/10 text-warning px-2 py-1 rounded-full text-xs font-medium">
            Limited Access
          </div>
        </div>
      )}

      {/* Mall Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="bg-primary-100 p-2 rounded-lg">
            <Building2 className="w-6 h-6 text-primary-700" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary-700 transition-colors">
              {mall.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mall.active)}`}>
                {getStatusText(mall.active)}
              </span>
              <span className="text-xs text-text-secondary">
                ID: {mall.id}
              </span>
            </div>
          </div>
        </div>
        
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-page-bg rounded-md">
          <Settings className="w-4 h-4 text-text-secondary" />
        </button>
      </div>

      {/* Mall Details */}
      <div className="space-y-3 mb-4">
        {/* Location */}
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-text-secondary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-text-primary">{mall.address}</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-text-secondary">
              <span>Lat: {formatCoordinate(mall.latitude)}</span>
              <span>Lng: {formatCoordinate(mall.longitude)}</span>
            </div>
          </div>
        </div>

        {/* Coverage Area */}
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-text-secondary" />
          <span className="text-sm text-text-secondary">
            Coverage radius: {mall.radius_meters}m
          </span>
        </div>

        {/* Statistics */}
        <div className="flex items-center gap-4 pt-2 border-t border-border-subtle">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-text-secondary" />
            <span className="text-sm text-text-primary font-medium">
              {shopCount} {shopCount === 1 ? 'Shop' : 'Shops'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-text-secondary" />
            <span className="text-sm text-text-primary font-medium">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Shops List (if accessible and shops exist) */}
      {isAccessible && mall.shops && mall.shops.length > 0 && (
        <div className="border-t border-border-subtle pt-4">
          <h4 className="text-sm font-medium text-text-primary mb-3">Shops</h4>
          <div className="space-y-2">
            {mall.shops.slice(0, 3).map((shop) => (
              <div key={shop.id} className="flex items-center justify-between p-2 bg-page-bg rounded-md">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-sm text-text-primary">{shop.name}</span>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-3 h-3 text-text-secondary hover:text-primary-500" />
                </button>
              </div>
            ))}
            {mall.shops.length > 3 && (
              <div className="text-xs text-text-secondary text-center py-1">
                +{mall.shops.length - 3} more shops
              </div>
            )}
          </div>
        </div>
      )}

      {/* Limited Access Notice */}
      {!isAccessible && (
        <div className="border-t border-border-subtle pt-4">
          <div className="bg-warning/5 border border-warning/20 rounded-md p-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-warning" />
              <span className="text-sm text-warning font-medium">
                Restricted Access
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              You can view this mall but cannot manage its operations.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border-subtle mt-4">
        <div className="flex items-center gap-1 text-xs text-text-secondary">
          <Calendar className="w-3 h-3" />
          <span>Created {formatDate(mall.created_at)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="text-xs text-primary-500 hover:text-primary-700 font-medium">
            View Details
          </button>
          {isAccessible && (
            <button className="text-xs text-text-secondary hover:text-primary-500 font-medium">
              Manage
            </button>
          )}
        </div>
      </div>
    </div>
  );
}