import React from 'react';
import type { TemplateProps } from './types';

const TemplateA: React.FC<TemplateProps> = ({ org, children }) => (
  <div
    className="min-h-screen p-4 bg-[var(--primary-color)]"
    style={{
      '--primary-color': org?.primary_color || 'transparent',
      '--secondary-color': org?.secondary_color || '#000',
    } as React.CSSProperties}
  >
    <div className="max-w-2xl mx-auto space-y-4">
      {org?.logo_url && (
        <img src={org.logo_url} alt={org.name || ''} className="h-16 mx-auto" />
      )}
      {org?.name && (
        <h1 className="text-2xl font-bold text-center text-[var(--secondary-color)]">
          {org.name}
        </h1>
      )}
      {children}
      {(org?.address || org?.phone || org?.email || org?.website) && (
        <div className="text-center space-y-1 text-sm text-[var(--secondary-color)]">
          {org.address && <p>{org.address}</p>}
          {org.phone && <p>{org.phone}</p>}
          {org.email && <p>{org.email}</p>}
          {org.website && <p>{org.website}</p>}
        </div>
      )}
    </div>
  </div>
);

export default TemplateA;
