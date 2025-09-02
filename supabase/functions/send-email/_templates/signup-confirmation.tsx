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

interface SignupConfirmationEmailProps {
  supabase_url: string
  token_hash: string
  redirect_to: string
  organizationName?: string
  organizationLogo?: string
  primaryColor?: string
  secondaryColor?: string
  userName?: string
}

export const SignupConfirmationEmail = ({
  supabase_url,
  token_hash,
  redirect_to,
  organizationName = 'HomeReportPro',
  organizationLogo,
  primaryColor = '#2563eb',
  secondaryColor = '#64748b',
  userName = 'there',
}: SignupConfirmationEmailProps) => {
  const confirmationUrl = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=signup&redirect_to=${redirect_to}`
  
  return (
    <Html>
      <Head />
      <Preview>Welcome to {organizationName} - Confirm your account</Preview>
      <Body style={main}>
        <Container style={container}>
          {organizationLogo && (
            <img 
              src={organizationLogo} 
              alt={`${organizationName} Logo`}
              style={logo}
            />
          )}
          <Heading style={{...h1, color: primaryColor}}>Welcome to {organizationName}!</Heading>
          <Text style={text}>
            Hi {userName},
          </Text>
          <Text style={text}>
            Thank you for signing up! Please confirm your email address to complete your registration and start using our home inspection platform.
          </Text>
          <Link
            href={confirmationUrl}
            target="_blank"
            style={{
              ...button,
              backgroundColor: primaryColor,
              color: '#ffffff',
            }}
          >
            Confirm Your Email
          </Link>
          <Text style={text}>
            If the button doesn't work, you can also click this link: {confirmationUrl}
          </Text>
          <Text style={footer}>
            If you didn't create an account with {organizationName}, you can safely ignore this email.
          </Text>
          <Text style={footer}>
            © 2025 {organizationName}. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default SignupConfirmationEmail

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

const text = {
  fontFamily: 'inherit',
  fontSize: '16px',
  lineHeight: '24px',
  color: '#333',
  margin: '16px 0',
}

const button = {
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

const footer = {
  fontFamily: 'inherit',
  fontSize: '12px',
  lineHeight: '20px',
  color: '#666',
  margin: '24px 0 0',
  textAlign: 'center' as const,
}