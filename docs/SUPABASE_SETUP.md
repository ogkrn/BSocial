# Supabase OTP Setup Guide for BSocial

This guide explains how to set up Supabase for OTP (One-Time Password) email verification in the BSocial platform.

## Why Supabase?

Supabase provides a reliable, free-tier email OTP service that:
- Handles email delivery without needing your own SMTP server
- Provides built-in rate limiting and security
- Offers a simple API for sending and verifying OTPs
- Includes customizable email templates

## Setup Steps

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click **"New Project"**
4. Fill in the details:
   - **Organization**: Select or create one
   - **Name**: `bsocial` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose the closest to your users
5. Click **"Create new project"**
6. Wait for the project to be created (usually 2-3 minutes)

### 2. Get Your API Keys

1. Go to **Project Settings** (gear icon in sidebar)
2. Click on **API** in the left menu
3. Copy the following values:
   - **Project URL** → This is your `SUPABASE_URL`
   - **service_role key** (under "Project API keys") → This is your `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ **Important**: The `service_role` key has admin privileges. Never expose it in client-side code!

### 3. Configure Authentication Settings

1. Go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. Go to **Authentication** → **URL Configuration**
4. Set your site URL (for redirects after verification)

### 4. Customize Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the **Magic Link** or **Confirm signup** template:

```html
<h2>BSocial - Verify Your Email</h2>
<p>Hi there!</p>
<p>Your OTP code is: <strong>{{ .Token }}</strong></p>
<p>This code will expire in 10 minutes.</p>
<p>If you didn't request this, please ignore this email.</p>
<p>— The BSocial Team</p>
```

### 5. Configure Your Environment

Add these variables to your `apps/api/.env` file:

```env
# Supabase Configuration
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

### 6. Restrict Email Domain (Recommended)

To ensure only `@uktech.net.in` emails can sign up:

1. Go to **Authentication** → **Providers** → **Email**
2. Under **Restrict email domain**, add: `uktech.net.in`

This adds an extra layer of validation on Supabase's side.

## How It Works

### Registration Flow with Supabase OTP

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│   Client    │────▶│  BSocial API │────▶│   Supabase    │
│  (Web/App)  │     │   (Express)  │     │  Auth Service │
└─────────────┘     └──────────────┘     └───────────────┘
       │                   │                     │
       │  1. Request OTP   │                     │
       │──────────────────▶│                     │
       │                   │  2. signInWithOtp   │
       │                   │────────────────────▶│
       │                   │                     │
       │                   │                     │ 3. Send Email
       │                   │                     │────────────┐
       │                   │                     │◀───────────┘
       │                   │  4. OTP Sent ✓      │
       │◀──────────────────│◀────────────────────│
       │                   │                     │
       │  5. Submit OTP    │                     │
       │──────────────────▶│                     │
       │                   │  6. verifyOtp       │
       │                   │────────────────────▶│
       │                   │                     │
       │                   │  7. Verified ✓      │
       │  8. Create User   │◀────────────────────│
       │◀──────────────────│                     │
```

### API Integration

The BSocial API automatically:
1. Checks if Supabase is configured
2. Uses Supabase for OTP if available
3. Falls back to local SMTP if Supabase is not configured

```typescript
// In auth.service.ts
if (isSupabaseConfigured()) {
  // Send OTP via Supabase Auth
  await supabase.auth.signInWithOtp({ email });
} else {
  // Fallback to local SMTP
  await sendLocalOtp(email);
}
```

## Testing

### Test OTP Flow

1. Start the API server:
   ```bash
   cd apps/api
   pnpm dev
   ```

2. Request OTP:
   ```bash
   curl -X POST http://localhost:5000/api/auth/register/initiate \
     -H "Content-Type: application/json" \
     -d '{"email": "test@uktech.net.in"}'
   ```

3. Check your email for the OTP code

4. Complete registration:
   ```bash
   curl -X POST http://localhost:5000/api/auth/register/complete \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@uktech.net.in",
       "otp": "123456",
       "password": "YourPassword123",
       "fullName": "Test User",
       "username": "testuser"
     }'
   ```

## Troubleshooting

### OTP Email Not Received

1. Check spam/junk folder
2. Verify email domain is `@uktech.net.in`
3. Check Supabase Auth logs in dashboard
4. Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct

### "Invalid or expired OTP" Error

- OTPs expire after 10 minutes by default
- Each OTP can only be used once
- Make sure you're using the most recent OTP

### Supabase Not Configured Warning

If you see this in logs, it means the environment variables are missing:
```
[warn] Supabase not configured, using local OTP system
```

Check that both `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in `.env`

## Rate Limits

Supabase free tier includes:
- 4 emails per hour per user
- 30 emails per hour per project
- Unlimited on paid plans

For higher limits, consider:
- Upgrading Supabase plan
- Using custom SMTP with Supabase
- Implementing the fallback SMTP option

## Security Best Practices

1. **Never expose `service_role` key** in client-side code
2. **Use HTTPS** in production
3. **Implement rate limiting** on your API endpoints
4. **Log authentication attempts** for monitoring
5. **Set short OTP expiry** (10 minutes recommended)

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase OTP Guide](https://supabase.com/docs/guides/auth/passwordless-login/auth-email-otp)
- [Custom SMTP Setup](https://supabase.com/docs/guides/auth/auth-smtp)
