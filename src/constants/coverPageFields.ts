export interface MergeField {
    label: string;
    token: string;
}

export const organizationFields: MergeField[] = [
    {label: "Organization Name", token: "{{organization.name}}"},
    {label: "Organization Address", token: "{{organization.address}}"},
    {label: "Organization Phone", token: "{{organization.phone}}"},
    {label: "Organization Email", token: "{{organization.email}}"},
    {label: "Organization Website", token: "{{organization.website}}"},
    {label: "Organization Logo", token: "{{organization.logo}}"}, // make sure your org object exposes .logo
];

export const inspectorFields: MergeField[] = [
    {label: "Inspector Name", token: "{{inspector.name}}"},
    // Use the casing your Profile actually has:
    // if Profile has licenseNumber -> use that; if it’s license_number keep snake here.
    {label: "Inspector License Number", token: "{{inspector.licenseNumber}}"},
    {label: "Inspector Phone", token: "{{inspector.phone}}"},
    {label: "Inspector Email", token: "{{inspector.email}}"},
];

// Remove the separate “contact” root.
// Point these at report.* fields so we don’t need to derive contact in code.
export const contactFields: MergeField[] = [
    {label: "Client Name", token: "{{report.clientName}}"},
    // Pick the field you actually store; if it’s propertyAddress, use that instead of address.
    {label: "Client Address", token: "{{report.address}}"},
    {label: "Client Email", token: "{{report.clientEmail}}"},
    {label: "Client Phone", token: "{{report.clientPhone}}"},
];

export const reportFields: MergeField[] = [
    {label: "Inspection Date", token: "{{report.inspectionDate}}"},
    {label: "Weather Conditions", token: "{{report.weatherConditions}}"},
    {label: "Cover Image", token: "{{report.coverImage}}"},
    {label: "Report Title", token: "{{report.title}}"},
];
