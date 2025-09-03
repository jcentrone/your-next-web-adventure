import React from 'react';
import Widget from '../Widget';
import { TemplateProps } from './types';

const TemplateA: React.FC<TemplateProps> = ({ org, settings }) => (
  <div className="min-h-screen p-4" style={{ backgroundColor: org?.primary_color || undefined }}>
    <div className="max-w-2xl mx-auto space-y-4">
      {org?.logo_url && (
        <img src={org.logo_url} alt={org.name || ''} className="h-16 mx-auto" />
      )}
      {org?.name && (
        <h1
          className="text-2xl font-bold text-center"
          style={{ color: org.secondary_color || undefined }}
        >
          {org.name}
        </h1>
      )}
      <Widget settings={settings} />
      {(org?.address || org?.phone || org?.email || org?.website) && (
        <div
          className="text-center space-y-1 text-sm"
          style={{ color: org?.secondary_color || undefined }}
        >
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
