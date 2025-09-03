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
    </div>
  </div>
);

export default TemplateB;
