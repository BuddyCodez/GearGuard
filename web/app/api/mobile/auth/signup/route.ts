import { NextRequest, NextResponse } from "next/server"
import { generateToken } from "@/lib/jwt"
import { verifyApiKey, unauthorizedResponse } from "@/lib/api-key"

export async function POST(request: NextRequest) {
    // Verify API key from Flutter app
    if (!verifyApiKey(request)) {
        return unauthorizedResponse()
    }

    try {
        const body = await request.json()
        const { email, password, name } = body

        // Validate input
        if (!email || !password || !name) {
            return NextResponse.json(
                { success: false, error: "Email, password, and name are required" },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { success: false, error: "Password must be at least 6 characters" },
                { status: 400 }
            )
        }

        // Call Better Auth signup endpoint
        const authResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/sign-up/email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                name,
            }),
        })

        const authData = await authResponse.json()

        if (!authResponse.ok) {
            return NextResponse.json(
                { success: false, error: authData.error || "Signup failed. Email may already be in use." },
                { status: authResponse.status }
            )
        }

        // Wait a moment for user to be created in Convex
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Fetch the created user from Convex
        const convex = await import("convex/browser").then(m => m.ConvexHttpClient)
        const client = new convex(process.env.NEXT_PUBLIC_CONVEX_URL!)
        const { api } = await import("@/convex/_generated/api")

        const convexUser = await client.query(api.users.getUserByEmail, { email })

        if (!convexUser) {
            return NextResponse.json(
                { success: false, error: "User created but not found in database. Please try logging in." },
                { status: 500 }
            )
        }

        // Generate JWT token
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
        console.error("Signup error:", error)
        return NextResponse.json(
            { success: false, error: error.message || "Signup failed" },
            { status: 500 }
        )
    }
}
