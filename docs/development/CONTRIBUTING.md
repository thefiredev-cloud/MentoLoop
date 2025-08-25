# Contributing to MentoLoop

Thank you for your interest in contributing to MentoLoop! This healthcare mentorship platform relies on community contributions to improve the educational experience for nursing students and preceptors.

## 🏥 About MentoLoop

MentoLoop is a HIPAA-compliant platform designed specifically for healthcare education, connecting nursing students with experienced preceptors through AI-powered matching and comprehensive clinical placement management.

## 🚀 Getting Started

### Prerequisites

- Node.js 22+ (recommended for optimal performance)
- Git for version control
- A Clerk account for authentication testing
- A Convex account for database development

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/MentoLoop.git
   cd MentoLoop
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Fill in your development environment variables
   ```

3. **Start Development Servers**
   ```bash
   # Terminal 1: Next.js development server
   npm run dev
   
   # Terminal 2: Convex development server  
   npx convex dev
   ```

4. **Verify Setup**
   - Visit http://localhost:3000
   - Check that authentication works
   - Verify database connection

## 🛠️ Development Workflow

### Code Standards

- **TypeScript**: All new code must be written in TypeScript
- **ESLint**: Run `npm run lint` before committing
- **Prettier**: Code formatting is handled automatically
- **Convex**: Database operations must use Convex functions

### Convex Development Patterns

- **Actions vs Mutations**: Use actions for external API calls, mutations for database operations
- **Hook Usage**: Use `useAction` for external operations, `useMutation` for database changes
- **Internal Actions**: Follow the `sendEmailInternal` pattern for reusable internal operations
- **Error Handling**: Implement comprehensive error handling and logging for all operations
- **Email Integration**: Use the internal action pattern for all email operations

### Component Guidelines

- Use functional components with React hooks
- Follow the existing shadcn/ui component patterns
- **Always provide unique keys** for ScrollArea and dynamic list components
- Maintain accessibility standards (ARIA labels, keyboard navigation)
- Ensure responsive design (mobile-first approach)
- Use proper React key patterns to prevent rendering issues

### Healthcare Data Compliance

- **HIPAA Compliance**: Never log or expose personal health information
- **FERPA Compliance**: Student educational records must be protected
- **Data Validation**: Always validate and sanitize inputs
- **Audit Logging**: Use the audit logging system for sensitive operations

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test:unit

# End-to-end tests
npm run test:e2e

# Integration tests  
npm run test:integration

# All tests
npm run test:all
```

### Writing Tests

- **Unit Tests**: Use Vitest for component and utility function testing
- **E2E Tests**: Use Playwright for full user journey testing
- **Integration Tests**: Test Convex function integrations
- **Coverage**: Maintain >80% test coverage for new features

### Test Guidelines

- Test user workflows, not implementation details
- Mock external services (SendGrid, Twilio, OpenAI)
- Include accessibility tests
- Test error handling and edge cases
- **Email System**: Test internal action patterns and template rendering
- **React Components**: Test component key handling and re-rendering behavior
- **Convex Functions**: Test action vs mutation separation and error handling

## 📝 Pull Request Process

### Before Submitting

1. **Branch Naming**
   ```bash
   git checkout -b feature/ai-matching-improvements
   git checkout -b fix/student-dashboard-bug
   git checkout -b docs/update-api-documentation
   ```

2. **Code Quality Checks**
   ```bash
   npm run lint          # ESLint validation
   npm run type-check    # TypeScript compilation
   npm run build         # Production build test
   npm run test:unit:run # Unit test validation
   ```
   
   **Additional Checks for New Patterns:**
   - Verify proper use of `useAction` vs `useMutation`
   - Ensure ScrollArea components have unique keys
   - Test email system with internal action patterns
   - Validate error handling in Convex functions

3. **Manual Testing**
   - Test the feature in both student and preceptor roles
   - Verify mobile responsiveness
   - Check accessibility with screen readers
   - Test with various data scenarios

### Pull Request Guidelines

- **Clear Title**: Describe what the PR accomplishes
- **Detailed Description**: Explain the problem and solution
- **Screenshots**: Include before/after images for UI changes
- **Testing Notes**: Describe how to test the changes
- **Breaking Changes**: Clearly document any breaking changes

### Review Process

1. Automated checks must pass (build, lint, tests)
2. Code review by at least one maintainer
3. Manual testing of the feature
4. Security review for healthcare compliance
5. Merge approval by project maintainers

## 🐛 Bug Reports

### Before Reporting

- Search existing issues to avoid duplicates
- Try to reproduce the bug consistently
- Test in different browsers and devices
- Check if the issue exists in the latest version

### Bug Report Template

```markdown
**Bug Description**
Clear description of the issue

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What should have happened

**Screenshots**
If applicable, add screenshots

**Environment**
- Browser: [e.g., Chrome 91.0]
- Device: [e.g., iPhone 12, Desktop]
- OS: [e.g., iOS 14.6, Windows 10]
```

## 💡 Feature Requests

### Enhancement Guidelines

- **Healthcare Focus**: Features should improve the educational experience
- **Compliance**: Must maintain HIPAA/FERPA compliance
- **Accessibility**: Features must be accessible to all users
- **Performance**: Consider impact on application performance
- **Mobile-First**: Design for mobile users primarily

### Feature Request Template

```markdown
**Feature Description**
Clear description of the proposed feature

**Problem Statement**
What problem does this solve for students/preceptors?

**Proposed Solution**
Detailed description of how it should work

**Healthcare Context**
How does this improve clinical education?

**Acceptance Criteria**
- [ ] Feature works for students
- [ ] Feature works for preceptors  
- [ ] Mobile responsive
- [ ] Accessibility compliant
- [ ] HIPAA compliant
```

## 🔒 Security

### Reporting Security Issues

**DO NOT** create public GitHub issues for security vulnerabilities.

Instead, email security concerns to: [security@mentoloop.com]

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Security Guidelines

- Never commit API keys or secrets
- Use environment variables for sensitive configuration
- Validate all user inputs
- Implement proper authentication checks
- Follow OWASP security guidelines

## 📚 Documentation

### Code Documentation

- Use JSDoc comments for functions and components
- Include examples in documentation
- Document complex business logic
- Update README.md when adding features

### Healthcare Domain Knowledge

- **Clinical Hours**: Understanding of nursing education requirements
- **Preceptor Relationships**: Mentor-student dynamics in healthcare
- **Compliance**: HIPAA, FERPA, and other healthcare regulations
- **Workflow**: Clinical placement and rotation management

## 🤝 Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and community chat
- **Discord**: Real-time development discussions
- **Email**: security@mentoloop.com for security issues

### Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## 🎯 Roadmap

### Current Priorities

1. **AI Matching Enhancement**: Improve MentorFit algorithm accuracy
2. **Mobile App**: React Native companion app
3. **Advanced Analytics**: Learning outcome tracking
4. **Integration APIs**: LMS and hospital system integration

### Getting Involved

- Check the [Issues](https://github.com/Apex-ai-net/MentoLoop/issues) page for good first issues
- Join our community discussions
- Review and test pull requests
- Improve documentation and examples

## 📄 License

By contributing to MentoLoop, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

**Thank you for contributing to healthcare education! 🏥💙**