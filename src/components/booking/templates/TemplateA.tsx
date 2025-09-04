import React from 'react';
import type { TemplateProps } from './types';

const TemplateA: React.FC<TemplateProps> = ({ org, children }) => (
  <div
    className="min-h-screen bg-slate-50"
    style={{
      '--primary-color': org?.primary_color || '#1e293b',
      '--secondary-color': org?.secondary_color || '#64748b',
    } as React.CSSProperties}
  >
    {/* Header */}
    <div 
      className="px-6 py-8 text-white"
      style={{ backgroundColor: 'var(--primary-color)' }}
    >
      <div className="max-w-2xl mx-auto text-center">
        {org?.logo_url && (
          <img 
            src={org.logo_url} 
            alt={org.name || ''} 
            className="h-16 mx-auto mb-4 bg-white p-2 rounded"
          />
        )}
        {org?.name && (
          <h1 className="text-3xl font-bold mb-2">
            {org.name}
          </h1>
        )}
        <p className="text-lg opacity-90">Schedule Your Appointment</p>
      </div>
    </div>

    {/* Main content */}
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {children}
      </div>
    </div>

    {/* Footer */}
    {(org?.address || org?.phone || org?.email || org?.website) && (
      <div 
        className="mt-8 px-6 py-4 text-white text-center text-sm"
        style={{ backgroundColor: 'var(--secondary-color)' }}
      >
        <div className="max-w-2xl mx-auto space-y-1">
          {org.address && <p>{org.address}</p>}
          {org.phone && <p>📞 {org.phone}</p>}
          {org.email && <p>✉️ {org.email}</p>}
          {org.website && <p>🌐 {org.website}</p>}
        </div>
      </div>
    )}
  </div>
);

export default TemplateA;