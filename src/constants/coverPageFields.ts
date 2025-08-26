export interface MergeField {
  label: string;
  token: string;
}

export const organizationFields: MergeField[] = [
  { label: "Organization Name", token: "{{organization.name}}" },
  { label: "Organization Address", token: "{{organization.address}}" },
  { label: "Organization Phone", token: "{{organization.phone}}" },
  { label: "Organization Email", token: "{{organization.email}}" },
  { label: "Organization Website", token: "{{organization.website}}" },
  { label: "Organization Logo", token: "{{organizational_logo}}" },
];

export const inspectorFields: MergeField[] = [
  { label: "Inspector Name", token: "{{inspector.name}}" },
  { label: "Inspector License Number", token: "{{inspector.license_number}}" },
  { label: "Inspector Phone", token: "{{inspector.phone}}" },
  { label: "Inspector Email", token: "{{inspector.email}}" },
];

export const contactFields: MergeField[] = [
  { label: "Client Name", token: "{{contact.name}}" },
  { label: "Client Address", token: "{{contact.address}}" },
  { label: "Client Email", token: "{{contact.email}}" },
  { label: "Client Phone", token: "{{contact.phone}}" },
];

export const reportFields: MergeField[] = [
  { label: "Inspection Date", token: "{{report.inspection_date}}" },
  { label: "Weather Conditions", token: "{{report.weather_conditions}}" },
  { label: "Cover Image", token: "{{cover_image}}" },
];

const IMAGE_FIELD_REGEX = /logo|image/i;
export const IMAGE_FIELD_TOKENS = [
  ...organizationFields,
  ...inspectorFields,
  ...contactFields,
  ...reportFields,
]
  .filter((field) => IMAGE_FIELD_REGEX.test(field.label))
  .map((field) => field.token);
