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

interface PasswordRecoveryEmailProps {
  supabase_url: string
  token_hash: string
  redirect_to: string
  organizationName?: string
  organizationLogo?: string
  primaryColor?: string
  secondaryColor?: string
  userName?: string
}

export const PasswordRecoveryEmail = ({
  supabase_url,
  token_hash,
  redirect_to,
  organizationName = 'HomeReportPro',
  organizationLogo,
  primaryColor = '#2563eb',
  secondaryColor = '#64748b',
  userName = 'there',
}: PasswordRecoveryEmailProps) => {
  const resetUrl = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=recovery&redirect_to=${redirect_to}`
  
  return (
    <Html>
      <Head />
      <Preview>Reset your password for {organizationName}</Preview>
      <Body style={main}>
        <Container style={container}>
          {organizationLogo && (
            <img 
              src={organizationLogo} 
              alt={`${organizationName} Logo`}
              style={logo}
            />
          )}
          <Heading style={{...h1, color: primaryColor}}>Reset Your Password</Heading>
          <Text style={text}>
            Hi {userName},
          </Text>
          <Text style={text}>
            We received a request to reset your password for your {organizationName} account. Click the button below to choose a new password.
          </Text>
          <Link
            href={resetUrl}
            target="_blank"
            style={{
              ...button,
              backgroundColor: primaryColor,
              color: '#ffffff',
            }}
          >
            Reset Password
          </Link>
          <Text style={text}>
            If the button doesn't work, you can also click this link: {resetUrl}
          </Text>
          <Text style={footer}>
            If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
          </Text>
          <Text style={footer}>
            © 2025 {organizationName}. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default PasswordRecoveryEmail

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