import React from 'react';
import type { TemplateProps } from './types';

const TemplateB: React.FC<TemplateProps> = ({ org, children }) => (
  <div
    className="min-h-screen bg-gray-50"
    style={{
      '--primary-color': org?.primary_color || '#059669',
      '--secondary-color': org?.secondary_color || '#374151',
    } as React.CSSProperties}
  >
    {/* Hero section with logo and title */}
    <div className="bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto text-center px-6">
        {org?.logo_url && (
          <div className="mb-6">
            <img 
              src={org.logo_url} 
              alt={org.name || ''} 
              className="h-20 mx-auto"
            />
          </div>
        )}
        <h1 className="text-4xl font-light text-gray-700 mb-2">
          {org?.name || 'Professional Services'}
        </h1>
        <p className="text-xl text-gray-500">Book your consultation today</p>
      </div>
    </div>

    {/* Service card and booking widget */}
    <div className="max-w-4xl mx-auto px-6 -mt-8">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Service highlight card */}
        <div 
          className="md:col-span-1 text-white p-6 rounded-lg shadow-lg"
          style={{ backgroundColor: 'var(--primary-color)' }}
        >
          <h3 className="text-xl font-semibold mb-2">Professional Consultation</h3>
          <p className="text-lg mb-1">1 hour</p>
          <p className="text-2xl font-bold">$500</p>
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-sm opacity-90">Expert guidance tailored to your needs</p>
          </div>
        </div>

        {/* Booking widget */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-lg p-6">
          {children}
        </div>
      </div>
    </div>

    {/* Contact info footer */}
    {(org?.address || org?.phone || org?.email || org?.website) && (
      <div className="mt-16 py-8 bg-white border-t">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-center text-sm text-gray-600">
            {org.address && (
              <div>
                <p className="font-medium">Address</p>
                <p>{org.address}</p>
              </div>
            )}
            {org.phone && (
              <div>
                <p className="font-medium">Phone</p>
                <p>{org.phone}</p>
              </div>
            )}
            {org.email && (
              <div>
                <p className="font-medium">Email</p>
                <p>{org.email}</p>
              </div>
            )}
            {org.website && (
              <div>
                <p className="font-medium">Website</p>
                <p>{org.website}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);

export default TemplateB;