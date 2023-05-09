import { jwtVerify } from "jose";

interface UserJwtPayload {
    jti: string;
    iat: number;
}

export const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET_KEY;

    if (!secret || secret?.length === 0) {
        throw new Error("Missing JWT Secert");
    }

    return secret;
}

export const verifyAuth = async (token: string) => {
    try {
        const verified = await jwtVerify(token, new TextEncoder().encode(getJwtSecret()))
        return verified.payload as UserJwtPayload;
    } catch (error) {
        throw new Error("Invalid token");
    }
}
