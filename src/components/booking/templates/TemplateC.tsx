import React from 'react';
import type { TemplateProps } from './types';

const TemplateC: React.FC<TemplateProps> = ({ org, children, settings }) => (
  <div
    className="min-h-screen"
    style={{
      '--primary-color': org?.primary_color || '#7c3aed',
      '--secondary-color': org?.secondary_color || '#1f2937',
    } as React.CSSProperties}
  >
    {/* Purple header section */}
    <div 
      className="text-white py-16"
      style={{ 
        backgroundColor: 'var(--primary-color)',
        background: `linear-gradient(135deg, var(--primary-color) 0%, ${org?.primary_color ? org.primary_color + '90' : '#6d28d9'} 100%)`
      }}
    >
      <div className="max-w-4xl mx-auto text-center px-6">
        {org?.logo_url && (
          <div className="mb-6">
            <div className="inline-block bg-white p-4 rounded-lg shadow-lg">
              <img 
                src={org.logo_url} 
                alt={org.name || ''} 
                className="h-16"
              />
            </div>
          </div>
        )}
        <h1 className="text-4xl font-bold mb-4">
          {org?.name || 'Professional Services'}
        </h1>
        <p className="text-xl opacity-90">{settings?.welcome_message || 'Choose your consultation type and book instantly'}</p>
      </div>
    </div>

    {/* Service selection and booking */}
    <div className="max-w-4xl mx-auto px-6 -mt-12">
      <div className="bg-white rounded-xl shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Select service</h2>
        
        {/* Service options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-primary transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Initial Free Consultation</h3>
                <p className="text-gray-600">15 minutes</p>
              </div>
              <div className="text-2xl font-bold text-green-600">Free</div>
            </div>
            <p className="text-sm text-gray-500">Get started with a complimentary consultation to discuss your needs</p>
          </div>
          
          <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-primary transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Premium Consultation</h3>
                <p className="text-gray-600">30 minutes</p>
              </div>
              <div 
                className="text-2xl font-bold"
                style={{ color: 'var(--primary-color)' }}
              >
                £90
              </div>
            </div>
            <p className="text-sm text-gray-500">Comprehensive consultation with detailed analysis and recommendations</p>
          </div>
        </div>

        {/* Booking widget */}
        <div className="border-t pt-8">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">Select time</h3>
          {children}
        </div>
      </div>
    </div>

    {/* Footer spacer */}
    <div className="h-16"></div>
  </div>
);

export default TemplateC;