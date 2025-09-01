import React from "npm:react@18.3.1";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "npm:@react-email/components@0.0.22";

interface ReportShareEmailProps {
  link: string;
  name?: string;
  organizationName?: string;
  organizationAddress?: string;
  organizationUrl?: string;
  unsubscribeUrl?: string;
}

export const ReportShareEmail = ({
  link,
  name,
  organizationName,
  organizationAddress,
  organizationUrl,
  unsubscribeUrl,
}: ReportShareEmailProps) => (
  <Html>
    <Head />
    <Preview>View your shared report</Preview>
    <Body style={main}>
      <Container style={container}>
        {organizationName && (
          <Heading style={h1}>{organizationName}</Heading>
        )}
        {name && <Text style={text}>Hi {name},</Text>}
        <Text style={text}>
          A report has been shared with you. Click the link below to view it.
        </Text>
        <Link href={link} style={linkStyle} target="_blank">
          View Report
        </Link>
        <Text style={footerText}>
          © {new Date().getFullYear()} {organizationName}
          {organizationAddress ? ` • ${organizationAddress}` : ""}
          {organizationUrl ? " • " : ""}
          {organizationUrl && (
            <Link href={organizationUrl} style={footerLink} target="_blank">
              {organizationUrl}
            </Link>
          )}
        </Text>
        {unsubscribeUrl && (
          <Text style={footerText}>
            <Link href={unsubscribeUrl} style={footerLink} target="_blank">
              Unsubscribe
            </Link>
          </Text>
        )}
      </Container>
    </Body>
  </Html>
);

export default ReportShareEmail;

const main = {
  backgroundColor: "#ffffff",
};

const container = {
  padding: "12px",
  margin: "0 auto",
};

const h1 = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "24px",
  fontWeight: "bold" as const,
  margin: "40px 0 20px",
  padding: 0,
};

const text = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  margin: "24px 0",
};

const linkStyle = {
  ...text,
  color: "#2754C5",
  textDecoration: "underline",
};

const footerText = {
  ...text,
  color: "#666",
  fontSize: "12px",
  marginTop: "32px",
};

const footerLink = {
  ...linkStyle,
  color: "#666",
};

