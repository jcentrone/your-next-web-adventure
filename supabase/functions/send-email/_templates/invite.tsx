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

interface InviteEmailProps {
  supabase_url: string
  token_hash: string
  redirect_to: string
  organizationName?: string
  organizationLogo?: string
  primaryColor?: string
  secondaryColor?: string
  userName?: string
  inviterName?: string
  inviteeEmail?: string
}

export const InviteEmail = ({
  supabase_url,
  token_hash,
  redirect_to,
  organizationName = 'HomeReportPro',
  organizationLogo,
  primaryColor = '#2563eb',
  secondaryColor = '#64748b',
  userName = 'there',
  inviterName = 'the team',
  inviteeEmail,
}: InviteEmailProps) => {
  const inviteUrl = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=invite&redirect_to=${redirect_to}`
  
  return (
    <Html>
      <Head />
      <Preview>You've been invited to join {organizationName}</Preview>
      <Body style={main}>
        <Container style={container}>
          {organizationLogo && (
            <img 
              src={organizationLogo} 
              alt={`${organizationName} Logo`}
              style={logo}
            />
          )}
          <Heading style={{...h1, color: primaryColor}}>You're Invited!</Heading>
          <Text style={text}>
            Hi {userName},
          </Text>
          <Text style={text}>
            {inviterName} has invited you to join {organizationName}. Click the button below to accept your invitation and create your account.
          </Text>
          <Link
            href={inviteUrl}
            target="_blank"
            style={{
              ...button,
              backgroundColor: primaryColor,
              color: '#ffffff',
            }}
          >
            Accept Invitation
          </Link>
          <Text style={text}>
            If the button doesn't work, you can also click this link: {inviteUrl}
          </Text>
          {inviteeEmail && (
            <Text style={text}>
              This invitation was sent to {inviteeEmail}.
            </Text>
          )}
          <Text style={footer}>
            If you weren't expecting this invitation, you can safely ignore this email.
          </Text>
          <Text style={footer}>
            © 2025 {organizationName}. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default InviteEmail

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