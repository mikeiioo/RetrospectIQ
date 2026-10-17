import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { getMongoClientSync } from "./mongodb";

export type SocialProviderId = "google" | "microsoft";

function socialProviders() {
  const providers: Parameters<typeof betterAuth>[0]["socialProviders"] = {};

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.google = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    };
  }

  if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
    providers.microsoft = {
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      // "common" accepts both personal (Outlook.com) and work/school accounts.
      tenantId: "common",
    };
  }

  return providers;
}

const client = getMongoClientSync();

export const auth = betterAuth({
  database: mongodbAdapter(client.db(), { client }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  socialProviders: socialProviders(),
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "microsoft"],
    },
  },
  // Database storage so limits hold across serverless instances.
  rateLimit: {
    enabled: true,
    storage: "database",
  },
  // nextCookies must be the last plugin.
  plugins: [nextCookies()],
});

export function enabledSocialProviders(): SocialProviderId[] {
  return (Object.keys(socialProviders()) as SocialProviderId[]).filter(
    (id) => id === "google" || id === "microsoft",
  );
}
