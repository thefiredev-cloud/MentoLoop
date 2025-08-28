# Location Bypass Methods - Quick Reference

## Problem
You're being region-locked even though you live in a supported state.

## Supported States
- Arkansas (AR)
- Arizona (AZ)  
- California (CA)
- Colorado (CO)
- Florida (FL)
- Louisiana (LA)
- New Mexico (NM)
- Oklahoma (OK)
- Texas (TX)

## Immediate Solutions

### 1. Quick URL Bypass (Easiest)
Add this to any URL to bypass the location check:
```
?bypass=mentoloop-bypass-2025
```

Example:
- `https://your-site.netlify.app/?bypass=mentoloop-bypass-2025`
- `https://your-site.netlify.app/dashboard?bypass=mentoloop-bypass-2025`

This will set a bypass cookie that lasts 24 hours.

### 2. Environment Variable (For Development)
In your `.env.local` file, set:
```
DISABLE_LOCATION_CHECK=true
```

### 3. Email Whitelist
Add your email to the whitelist in `.env.local`:
```
LOCATION_WHITELIST_EMAILS=your-email@example.com
```

For multiple emails:
```
LOCATION_WHITELIST_EMAILS=email1@example.com,email2@example.com
```

### 4. Debug Mode
To see what's happening with location detection, set:
```
DEBUG_LOCATION=true
```

This will log:
- Your detected IP address
- The geolocation API response
- Why validation is failing

## How It Works

1. **Middleware Check**: The middleware (`middleware.ts`) intercepts all requests
2. **IP Detection**: It tries to get your IP from various headers (Netlify, CloudFlare, standard)
3. **Geolocation**: Uses ipapi.co to determine your state from IP
4. **Validation**: Checks if your state is in the supported list
5. **Bypass Methods**: Several ways to skip this check for authorized users

## Troubleshooting

If you're still having issues:

1. **Check Console Logs**: With `DEBUG_LOCATION=true`, check browser console and server logs
2. **VPN/Proxy**: Disable VPN or proxy that might affect IP detection
3. **Browser Cache**: Clear cookies and try again
4. **Incognito Mode**: Try in an incognito/private window

## For Production Deployment

Add these to your Netlify environment variables:
- `LOCATION_BYPASS_TOKEN` - Your secret bypass token
- `LOCATION_WHITELIST_EMAILS` - Comma-separated admin emails
- `DEBUG_LOCATION` - Set to `false` in production (unless debugging)
- `DISABLE_LOCATION_CHECK` - Emergency override (use carefully)

## Testing Locally

The location check is automatically disabled for:
- `localhost`
- `127.0.0.1`  
- Private IP ranges (192.168.x.x, 10.x.x.x)
- Development mode (`NODE_ENV !== 'production'`)