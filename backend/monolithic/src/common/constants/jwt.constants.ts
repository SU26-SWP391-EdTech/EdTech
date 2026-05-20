export const jwtConstants = {
    get secret() {
        return process.env.JWT_SECRET ?? 'your-secret-key-change-this-in-production';
    },
    expiresIn: '7d' as const,
};