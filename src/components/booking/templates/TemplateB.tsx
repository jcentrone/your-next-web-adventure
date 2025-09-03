import React from 'react';
import Widget from '../Widget';
import { TemplateProps } from './types';

const TemplateB: React.FC<TemplateProps> = ({ org, settings }) => (
  <div
    className="min-h-screen flex items-center justify-center"
    style={{ backgroundColor: org?.secondary_color || undefined }}
  >
    <div className="p-8 space-y-4 bg-white rounded shadow max-w-md w-full">
      {org?.logo_url && (
        <img src={org.logo_url} alt={org.name || ''} className="h-12 mx-auto" />
      )}
      {org?.name && <h1 className="text-xl font-semibold text-center">{org.name}</h1>}
      <Widget settings={settings} />
      {(org?.address || org?.phone || org?.email || org?.website) && (
        <div className="text-center space-y-1 text-sm text-gray-700">
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
