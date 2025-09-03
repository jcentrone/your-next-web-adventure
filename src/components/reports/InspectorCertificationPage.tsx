import React from "react";
import { Profile } from "@/integrations/supabase/organizationsApi";
import { Report } from "@/lib/reportSchemas";

interface InspectorCertificationPageProps {
  inspector?: Profile;
  organization?: any;
  report: Report;
  mediaUrlMap: Record<string, string>;
}

const InspectorCertificationPage: React.FC<InspectorCertificationPageProps> = ({
  inspector,
  organization,
  report,
  mediaUrlMap,
}) => {
  return (
    <div className="preview-page">
      <section className="pdf-page-break p-8 min-h-[11in] flex flex-col justify-center">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h1 className="text-3xl font-bold text-primary mb-12">
            Inspector Certification
          </h1>
          
          <div className="space-y-6">
            <p className="text-lg leading-relaxed">
              I hereby certify that I have inspected the property located at{" "}
              <strong>{report.address}</strong> on{" "}
              <strong>{new Date(report.inspectionDate).toLocaleDateString()}</strong>{" "}
              in accordance with industry standards and best practices.
            </p>
            
            <p className="text-base leading-relaxed">
              This inspection was conducted in a professional manner using appropriate 
              tools and methods. All observations and findings documented in this report 
              are based on the conditions present at the time of inspection.
            </p>
            
            <p className="text-base leading-relaxed">
              The inspection was limited to readily accessible areas and components. 
              This report reflects the condition of the property as observed during 
              the inspection and should not be considered a warranty or guarantee.
            </p>
          </div>
          
          <div className="border-t pt-8 mt-12">
            <div className="flex justify-between items-end">
              <div className="text-left">
                <div className="mb-6">
                  {inspector?.signature_url && (
                    <img
                      src={mediaUrlMap[inspector.signature_url] || inspector.signature_url}
                      alt="Inspector Signature"
                      className="h-16 w-auto mb-2"
                    />
                  )}
                  <div className="border-b border-gray-400 w-64 mb-2"></div>
                  <p className="text-sm text-gray-600">Inspector Signature</p>
                </div>
                
                <div>
                  <p className="font-semibold text-lg">{inspector?.full_name || "Inspector Name"}</p>
                  {inspector?.license_number && (
                    <p className="text-sm text-gray-600">License #: {inspector.license_number}</p>
                  )}
                  {inspector?.phone && (
                    <p className="text-sm text-gray-600">Phone: {inspector.phone}</p>
                  )}
                  {inspector?.email && (
                    <p className="text-sm text-gray-600">Email: {inspector.email}</p>
                  )}
                </div>
              </div>
              
              <div className="text-left">
                <div className="mb-6">
                  <p className="text-sm mt-1">{new Date(report.inspectionDate).toLocaleDateString()}</p>
                  <div className="border-b border-gray-400 w-40 mb-2"></div>
                  <p className="text-sm text-gray-600">Date</p>

                </div>
              </div>
            </div>
          </div>

          {organization && (
            <div className="mt-12 pt-8 border-t text-center">
              <p className="text-sm text-gray-600">
                {organization.name}
              </p>
              {organization.address && (
                <p className="text-sm text-gray-600">{organization.address}</p>
              )}
              {organization.phone && (
                <p className="text-sm text-gray-600">Phone: {organization.phone}</p>
              )}
              {organization.website && (
                <p className="text-sm text-gray-600">Web: {organization.website}</p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default InspectorCertificationPage;