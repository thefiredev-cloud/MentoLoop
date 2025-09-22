export default {
  providers: [
    {
      // Use Clerk domain from environment variable
      // This should match your Clerk instance and JWT template configuration
      domain:
        process.env.CLERK_JWT_ISSUER_DOMAIN ||
        process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL ||
        "https://loved-lamprey-34.clerk.accounts.dev",
      applicationID: "convex",
    },
  ]
};
