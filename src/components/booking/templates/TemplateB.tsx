import React from 'react';
import type { TemplateProps } from './types';

const TemplateB: React.FC<TemplateProps> = ({ org, children }) => (
  <div
    className="min-h-screen flex items-center justify-center bg-[var(--secondary-color)]"
    style={{
      '--primary-color': org?.primary_color || '#000',
      '--secondary-color': org?.secondary_color || 'transparent',
    } as React.CSSProperties}
  >
    <div className="p-8 space-y-4 bg-white rounded shadow max-w-md w-full">
      {org?.logo_url && (
        <img src={org.logo_url} alt={org.name || ''} className="h-12 mx-auto" />
      )}
      {org?.name && (
        <h1 className="text-xl font-semibold text-center text-[var(--primary-color)]">
          {org.name}
        </h1>
      )}
      {children}
      {(org?.address || org?.phone || org?.email || org?.website) && (
        <div className="text-center space-y-1 text-sm text-[var(--primary-color)]">
          {org.address && <p>{org.address}</p>}
          {org.phone && <p>{org.phone}</p>}
          {org.email && <p>{org.email}</p>}
          {org.website && <p>{org.website}</p>}
        </div>
      )}
    </div>
  </div>
);

export default TemplateB;
