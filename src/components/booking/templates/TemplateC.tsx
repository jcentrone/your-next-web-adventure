import React from 'react';
import Widget from '../Widget';
import { TemplateProps } from './types';

const TemplateC: React.FC<TemplateProps> = ({ org, settings }) => (
  <div className="min-h-screen flex flex-col" style={{ backgroundColor: org?.primary_color || undefined }}>
    <header className="p-4 bg-white flex items-center justify-center gap-2 shadow">
      {org?.logo_url && <img src={org.logo_url} alt={org.name || ''} className="h-10" />}
      {org?.name && <span className="text-lg font-bold">{org.name}</span>}
    </header>
    <main className="flex-1 flex items-center justify-center p-4">
      <Widget settings={settings} />
    </main>
    {(org?.address || org?.phone || org?.email || org?.website) && (
      <footer className="p-4 bg-white text-center space-y-1 text-sm">
        {org.address && <p>{org.address}</p>}
        {org.phone && <p>{org.phone}</p>}
        {org.email && <p>{org.email}</p>}
        {org.website && <p>{org.website}</p>}
      </footer>
    )}
  </div>
);

export default TemplateC;
