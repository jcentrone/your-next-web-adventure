export interface MergeField {
  label: string;
  token: string;
}

export const organizationFields: MergeField[] = [
  { label: "Organization Name", token: "{{organization.name}}" },
  { label: "Organization Address", token: "{{organization.address}}" },
  { label: "Organization Phone", token: "{{organization.phone}}" },
  { label: "Organization Email", token: "{{organization.email}}" },
];

export const inspectorFields: MergeField[] = [
  { label: "Inspector Name", token: "{{inspector.name}}" },
  { label: "Inspector License Number", token: "{{inspector.license_number}}" },
  { label: "Inspector Phone", token: "{{inspector.phone}}" },
];

export const contactFields: MergeField[] = [
  { label: "Client Name", token: "{{contact.name}}" },
  { label: "Client Address", token: "{{contact.address}}" },
  { label: "Client Email", token: "{{contact.email}}" },
  { label: "Client Phone", token: "{{contact.phone}}" },
];

export const imageFields: MergeField[] = [
  { label: "Cover Image", token: "{{report.cover_image}}" },
  { label: "Company Logo", token: "{{organization.logo_url}}" },
];
