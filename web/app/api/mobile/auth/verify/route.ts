import { NextRequest, NextResponse } from "next/server"
import { verifyToken, extractToken } from "@/lib/jwt"
import { verifyApiKey, unauthorizedResponse } from "@/lib/api-key"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function GET(request: NextRequest) {
    // Verify API key from Flutter app
    if (!verifyApiKey(request)) {
        return unauthorizedResponse()
    }

    try {
        // Extract token from Authorization header
        const authHeader = request.headers.get("Authorization")
        const token = extractToken(authHeader)

        if (!token) {
            return NextResponse.json(
                { valid: false, error: "No token provided" },
                { status: 401 }
            )
        }

        // Verify JWT token
        const payload = verifyToken(token)

        if (!payload) {
            return NextResponse.json(
                { valid: false, error: "Invalid or expired token" },
                { status: 401 }
            )
        }

        // Optionally fetch fresh user data from Convex
        // This ensures the user still exists and gets latest data
        try {
            const convexUser = await convex.query(api.users.getViewer, {})

            if (!convexUser) {
                return NextResponse.json(
                    { valid: false, error: "User not found" },
                    { status: 404 }
                )
            }

            return NextResponse.json({
                valid: true,
                user: {
                    id: convexUser._id,
                    email: convexUser.email,
                    name: convexUser.name,
                    role: convexUser.role,
                    teamId: convexUser.teamId,
                },
            })
        } catch (error) {
            // If Convex query fails, still return token validity
            return NextResponse.json({
                valid: true,
                user: {
                    id: payload.userId,
                    email: payload.email,
                    role: payload.role,
                },
            })
        }
    } catch (error: any) {
        console.error("Verify error:", error)
        return NextResponse.json(
            { valid: false, error: error.message || "Verification failed" },
            { status: 500 }
        )
    }
}
