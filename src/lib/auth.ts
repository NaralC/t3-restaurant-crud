export const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET_KEY;

    if (!secret || secret?.length === 0) {
        throw new Error("Missing JWT Secert");
    }

    return secret;
}