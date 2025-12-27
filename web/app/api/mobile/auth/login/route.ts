import { NextRequest, NextResponse } from "next/server"
import { generateToken } from "@/lib/jwt"
import { verifyApiKey, unauthorizedResponse } from "@/lib/api-key"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(request: NextRequest) {
    // Verify API key from Flutter app
    if (!verifyApiKey(request)) {
        return unauthorizedResponse()
    }

    try {
        const body = await request.json()
        const { email, password } = body

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: "Email and password are required" },
                { status: 400 }
            )
        }

        // For mobile API: Verify credentials using Better Auth's API endpoint
        // Call the Better Auth sign-in endpoint directly
        const authResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/sign-in/email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
            }),
        })

        if (!authResponse.ok) {
            return NextResponse.json(
                { success: false, error: "Invalid credentials. Please ensure you've signed up via the web app." },
                { status: 401 }
            )
        }

        // Fetch user data from Convex by email (using public query)
        const convexUser = await convex.query(api.users.getUserByEmail, { email })

        if (!convexUser) {
            return NextResponse.json(
                { success: false, error: "User not found in database. Please sign up via web app first." },
                { status: 404 }
            )
        }

        // Generate JWT token for mobile
        const token = generateToken({
            userId: convexUser._id,
            email: convexUser.email,
            role: convexUser.role,
        })

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: convexUser._id,
                email: convexUser.email,
                name: convexUser.name,
                role: convexUser.role,
                teamId: convexUser.teamId,
            },
        })
    } catch (error: any) {
        console.error("Login error:", error)
        return NextResponse.json(
            { success: false, error: "Login failed. Please ensure you've signed up via the web app and are using correct credentials." },
            { status: 500 }
        )
    }
}
