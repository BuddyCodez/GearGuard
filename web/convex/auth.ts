import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth";
import authConfig from "./auth.config";
import { emailOTP, admin } from "better-auth/plugins"
import { Resend } from "resend";
import { api } from "./_generated/api";

const siteUrl = process.env.SITE_URL!;

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth);

const resend = new Resend(process.env.RESEND_API_KEY);


export const createAuth = (ctx: GenericCtx<DataModel>) => {
    return betterAuth({
        baseURL: siteUrl,
        database: authComponent.adapter(ctx),
        trustedOrigins: [
            "*"
        ],
        // Configure simple, non-verified email/password to get started
        emailAndPassword: {
            enabled: true,
            requireEmailVerification: false,
        },
        plugins: [
            // The Convex plugin is required for Convex compatibility
            convex({ authConfig }),
            emailOTP({
                async sendVerificationOTP({ email, otp, type }) {
                    try {
                        const { error } = await resend.emails.send({
                            from: "Auth <onboarding@resend.dev>",
                            to: email,
                            subject: type === "sign-in" ? "Sign in to your account" : "Verify your email",
                            html: `<p>Your verification code is <strong>${otp}</strong></p>`,
                        });
                        if (error) throw error;
                    } catch (e) {
                        console.error("Error sending email", JSON.stringify(e, null, 2));
                    }
                },
            }),
        ],
    });
};

// Example function for getting the current user
// Feel free to edit, omit, etc.
export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        return authComponent.getAuthUser(ctx);
    },
});