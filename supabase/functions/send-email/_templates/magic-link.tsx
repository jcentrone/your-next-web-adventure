import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface MagicLinkEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
  organizationName?: string
  organizationLogo?: string
  primaryColor?: string
  secondaryColor?: string
  userName?: string
}

export const MagicLinkEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
  organizationName = 'HomeReportPro',
  organizationLogo,
  primaryColor = '#2563eb',
  secondaryColor = '#64748b',
  userName = 'there',
}: MagicLinkEmailProps) => {
  const magicLinkUrl = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`
  
  return (
    <Html>
      <Head />
      <Preview>Log in with this magic link</Preview>
      <Body style={main}>
        <Container style={container}>
          {organizationLogo && (
            <img 
              src={organizationLogo} 
              alt={`${organizationName} Logo`}
              style={logo}
            />
          )}
          <Heading style={{...h1, color: primaryColor}}>Login</Heading>
          <Text style={text}>
            Hi {userName},
          </Text>
          <Link
            href={magicLinkUrl}
            target="_blank"
            style={{
              ...link,
              backgroundColor: primaryColor,
              color: '#ffffff',
              display: 'block',
              marginBottom: '16px',
            }}
          >
            Click here to log in with this magic link
          </Link>
          <Text style={{ ...text, marginBottom: '14px' }}>
            Or, copy and paste this temporary login code:
          </Text>
          <code style={code}>{token}</code>
          <Text
            style={{
              ...text,
              color: '#ababab',
              marginTop: '14px',
              marginBottom: '16px',
            }}
          >
            If you didn't try to login, you can safely ignore this email.
          </Text>
          <Text style={footer}>
            © 2025 {organizationName}. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default MagicLinkEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
}

const container = {
  paddingLeft: '12px',
  paddingRight: '12px',
  margin: '0 auto',
  maxWidth: '600px',
}

const logo = {
  margin: '0 auto 32px',
  maxHeight: '80px',
  display: 'block',
}

const h1 = {
  fontFamily: 'inherit',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0',
  textAlign: 'center' as const,
}

const link = {
  fontFamily: 'inherit',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  padding: '12px 24px',
  borderRadius: '6px',
  display: 'inline-block',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const text = {
  fontFamily: 'inherit',
  fontSize: '16px',
  lineHeight: '24px',
  color: '#333',
  margin: '16px 0',
}

const footer = {
  fontFamily: 'inherit',
  fontSize: '12px',
  lineHeight: '20px',
  color: '#666',
  margin: '24px 0 0',
  textAlign: 'center' as const,
}

const code = {
  display: 'inline-block',
  padding: '16px 4.5%',
  width: '90.5%',
  backgroundColor: '#f4f4f4',
  borderRadius: '5px',
  border: '1px solid #eee',
  color: '#333',
}