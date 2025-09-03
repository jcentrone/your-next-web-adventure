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
  </div>
);

export default TemplateC;
