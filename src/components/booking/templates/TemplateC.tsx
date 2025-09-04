import React from 'react';
import type { TemplateProps } from './types';

const TemplateC: React.FC<TemplateProps> = ({ org, children }) => (
  <div
    className="min-h-screen flex flex-col bg-[var(--primary-color)]"
    style={{
      '--primary-color': org?.primary_color || 'transparent',
      '--secondary-color': org?.secondary_color || '#000',
    } as React.CSSProperties}
  >
    <header className="p-4 bg-white flex items-center justify-center gap-2 shadow">
      {org?.logo_url && <img src={org.logo_url} alt={org.name || ''} className="h-10" />}
      {org?.name && (
        <span className="text-lg font-bold text-[var(--secondary-color)]">{org.name}</span>
      )}
    </header>
    <main className="flex-1 flex items-center justify-center p-4">{children}</main>
    {(org?.address || org?.phone || org?.email || org?.website) && (
      <footer className="p-4 bg-white text-center space-y-1 text-sm text-[var(--secondary-color)]">
        {org.address && <p>{org.address}</p>}
        {org.phone && <p>{org.phone}</p>}
        {org.email && <p>{org.email}</p>}
        {org.website && <p>{org.website}</p>}
      </footer>
    )}
  </div>
);

export default TemplateC;
