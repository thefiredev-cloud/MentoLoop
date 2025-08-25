# 🔒 MentoLoop Security Documentation

## Overview
This document outlines the security measures, protocols, and best practices implemented in the MentoLoop platform to protect user data, ensure HIPAA compliance, and maintain system integrity.

## Table of Contents
1. [Security Architecture](#security-architecture)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Protection](#data-protection)
4. [API Security](#api-security)
5. [Security Headers](#security-headers)
6. [Rate Limiting](#rate-limiting)
7. [Input Validation](#input-validation)
8. [Secrets Management](#secrets-management)
9. [Security Monitoring](#security-monitoring)
10. [Incident Response](#incident-response)
11. [Security Checklist](#security-checklist)

## Security Architecture

### Defense in Depth
We employ multiple layers of security:
- **Network Layer**: CloudFlare DDoS protection, firewall rules
- **Application Layer**: Security headers, input validation, rate limiting
- **Data Layer**: Encryption at rest and in transit
- **Access Layer**: Role-based access control, authentication

### Tech Stack Security
- **Next.js 15**: Latest security patches, server-side rendering protection
- **Clerk**: Enterprise-grade authentication with MFA support
- **Convex**: Built-in query security and data isolation
- **Stripe**: PCI DSS compliant payment processing

## Authentication & Authorization

### Clerk Integration
```typescript
// All routes protected by default via middleware.ts
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])
```

### Role-Based Access Control (RBAC)
- **Student**: Access to personal data, matches, and messaging
- **Preceptor**: Access to student profiles, availability management
- **Admin**: Full system access, metrics, and audit logs
- **Enterprise**: Organization-wide data and billing management

### Session Management
- JWT tokens with 1-hour expiration
- Secure cookie storage
- Automatic session refresh
- Concurrent session limits

## Data Protection

### Encryption
- **At Rest**: All database fields encrypted using AES-256
- **In Transit**: TLS 1.3 for all connections
- **Sensitive Data**: Additional field-level encryption for PII

### HIPAA Compliance
- PHI data segregation
- Audit logging for all data access
- Business Associate Agreements (BAAs) with vendors
- Regular security assessments

### Data Retention
- Active data: Retained while account is active
- Deleted accounts: Data purged after 30 days
- Audit logs: Retained for 7 years

## API Security

### Webhook Security
```typescript
// Stripe webhook signature verification
async function verifyStripeWebhook(
  payload: string,
  signature: string,
  webhookSecret: string
): Promise<any> {
  // Signature verification
  // Timestamp validation
  // Replay attack prevention
}
```

### CORS Configuration
```typescript
const allowedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL,
  'https://mentoloop.com',
  'https://www.mentoloop.com',
];
```

## Security Headers

### Content Security Policy (CSP)
```typescript
const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.accounts.dev",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https:",
  "connect-src 'self' https://*.convex.cloud https://*.clerk.accounts.dev",
  "frame-ancestors 'none'",
];
```

### Additional Headers
- `X-Frame-Options: DENY` - Prevent clickjacking
- `X-Content-Type-Options: nosniff` - Prevent MIME sniffing
- `Strict-Transport-Security` - Force HTTPS
- `Referrer-Policy: strict-origin-when-cross-origin`

## Rate Limiting

### Configuration
```typescript
// API endpoints
const apiRateLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  maxRequests: 100,    // 100 requests per minute
});

// Authentication endpoints
const authRateLimiter = new RateLimiter({
  interval: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,           // 5 failed attempts
});
```

### Brute Force Protection
- Account lockout after 5 failed attempts
- 15-minute cooldown period
- IP-based blocking for persistent attacks

## Input Validation

### Zod Schema Validation
```typescript
// Example: Email validation
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .max(100, 'Email too long')
  .transform(sanitizeEmail);
```

### Sanitization Rules
- HTML tags stripped from user input
- SQL injection prevention via parameterized queries
- XSS protection through output encoding
- File upload restrictions (type, size, content scanning)

## Secrets Management

### Environment Variables
```bash
# Never commit .env.local to version control
.env.local        # Actual secrets (git-ignored)
.env.example      # Template with placeholders
```

### Key Rotation Schedule
- API Keys: Every 90 days
- Webhook Secrets: Every 180 days
- Database Encryption Keys: Annually
- Session Keys: Every 30 days

### Secure Storage
- Production secrets in Convex environment variables
- No secrets in client-side code
- Encrypted backup of recovery codes

## Security Monitoring

### Audit Logging
All sensitive operations are logged:
```typescript
// auditLogs table tracks:
- User authentication events
- Data access and modifications
- Admin actions
- Failed security attempts
- API usage patterns
```

### Real-time Alerts
- Failed login attempts > 3 in 5 minutes
- Unusual API usage patterns
- Unauthorized access attempts
- System vulnerability detection

### Security Metrics Dashboard
- `/api/security/metrics` - Admin-only endpoint
- Tracks failed logins, blocked IPs, active sessions
- HIPAA compliance metrics
- Performance and error rates

## Incident Response

### Severity Levels
1. **Critical**: Data breach, system compromise
2. **High**: Authentication bypass, payment fraud
3. **Medium**: Service disruption, policy violation
4. **Low**: Minor vulnerabilities, false positives

### Response Protocol
1. **Detect**: Automated monitoring and alerting
2. **Contain**: Isolate affected systems
3. **Investigate**: Root cause analysis
4. **Remediate**: Fix vulnerabilities
5. **Document**: Update security logs
6. **Review**: Post-incident analysis

### Contact Information
- Security Team: security@mentoloop.com
- Data Protection Officer: dpo@mentoloop.com
- Emergency Hotline: [Configured in PagerDuty]

## Security Checklist

### Daily
- [ ] Review security alerts
- [ ] Check failed login attempts
- [ ] Monitor rate limiting metrics

### Weekly
- [ ] Review audit logs
- [ ] Check for dependency updates
- [ ] Verify backup integrity

### Monthly
- [ ] Security awareness training
- [ ] Penetration testing
- [ ] Access control review
- [ ] Update security documentation

### Quarterly
- [ ] Key rotation
- [ ] Security assessment
- [ ] Vendor security review
- [ ] Disaster recovery drill

## Development Security Practices

### Code Review Requirements
- All PRs require security review
- Automated security scanning with GitHub Actions
- Dependency vulnerability scanning
- Static code analysis

### Secure Coding Guidelines
```typescript
// ❌ Bad: Direct database query
const user = await db.query(`SELECT * FROM users WHERE id = ${userId}`);

// ✅ Good: Parameterized query
const user = await ctx.db.get(userId);
```

### Testing Requirements
- Security test cases for all endpoints
- Input validation testing
- Authentication/authorization testing
- Rate limiting verification

## Compliance & Certifications

### Current Compliance
- HIPAA (Healthcare data)
- PCI DSS Level 2 (Payment processing)
- SOC 2 Type I (In progress)
- GDPR (EU users)

### Security Audits
- Annual third-party penetration testing
- Quarterly vulnerability assessments
- Monthly automated security scans
- Continuous compliance monitoring

## Security Resources

### Documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

### Tools
- **Monitoring**: Sentry, DataDog
- **Scanning**: Snyk, GitHub Security
- **Testing**: OWASP ZAP, Burp Suite
- **Secrets**: HashiCorp Vault (planned)

## Reporting Security Issues

### Responsible Disclosure
Please report security vulnerabilities to:
- Email: security@mentoloop.com
- PGP Key: [Available on request]
- Response Time: < 24 hours

### Bug Bounty Program
We offer rewards for responsibly disclosed vulnerabilities:
- Critical: $1,000 - $5,000
- High: $500 - $1,000
- Medium: $100 - $500
- Low: Recognition in Hall of Fame

---

## Version History
- v1.0.0 (2024-12-20): Initial security documentation
- v1.1.0 (2024-12-20): Added rate limiting and input validation
- v1.2.0 (2024-12-20): Enhanced webhook security and admin authorization

Last Updated: December 20, 2024
Next Review: January 20, 2025