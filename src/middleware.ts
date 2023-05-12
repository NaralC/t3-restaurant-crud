import { NextResponse, type NextRequest } from "next/server";
import { verifyAuth } from "./lib/auth";

export async function middleware(req: NextRequest) {
    // Get token from user
    const token = req.cookies.get("user-token")?.value

    // Check if user's authenticated
    const verifiedToken = token && (await verifyAuth(token).catch((err) => {
        console.log(err);
    }))

    // User trying to go to login without token, that's good
    if (req.nextUrl.pathname.startsWith('/login') && !verifiedToken) {
        return;
    } 

    const url = req.url;

    if (url.includes("/login") && verifiedToken) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    if (!verifiedToken) {
        return NextResponse.redirect(new URL("/login", req.url))
    }
}

export const config = {
    matcher: ['/dashboard/:path*', '/login']
}
