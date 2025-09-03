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
    </div>
  </div>
);

export default TemplateA;
