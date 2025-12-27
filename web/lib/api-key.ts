import { NextRequest, NextResponse } from "next/server"

const API_KEY = process.env.MOBILE_API_KEY

/**
 * Middleware to verify API key from Flutter app
 * Prevents unauthorized access to mobile endpoints
 */
export function verifyApiKey(request: NextRequest): boolean {
    const apiKey = request.headers.get("X-API-Key")

    if (!apiKey || !API_KEY) {
        return false
    }

    return apiKey === API_KEY
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse() {
    return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid API key" },
        { status: 401 }
    )
}
