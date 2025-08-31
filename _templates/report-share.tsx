import * as React from "npm:react@18.3.1";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Hr,
} from "npm:@react-email/components@0.0.22";

interface ReportShareEmailProps {
  shareLink: string;
  name?: string;
}

export const ReportShareEmail = ({ shareLink, name }: ReportShareEmailProps) => (
  <Html>
    <Head />
    <Preview>Your inspection report is ready</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your inspection report is ready</Heading>
        <Text style={text}>Hi {name || "there"},</Text>
        <Text style={text}>
          You can view the report by clicking the button below:
        </Text>
        <Button style={button} href={shareLink}>
          View Report
        </Button>
        <Hr style={hr} />
        <Text style={footer}>Thanks for using Your Next Web Adventure</Text>
      </Container>
    </Body>
  </Html>
);

export default ReportShareEmail;

const main = {
  backgroundColor: "#f9fafb",
  padding: "20px 0",
};
const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "32px",
  margin: "0 auto",
};
const h1 = {
  color: "#111827",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0 0 24px 0",
};
const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px 0",
};
const button = {
  backgroundColor: "#2563eb",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  textDecoration: "none",
  padding: "12px 20px",
  display: "inline-block",
};
const hr = {
  borderColor: "#e5e7eb",
  margin: "20px 0",
};
const footer = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "20px",
};
