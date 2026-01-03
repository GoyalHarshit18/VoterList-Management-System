export async function loginApi({ bloId, password, otp }) {
    // 🔒 Replace with real backend later
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                token: "mock-jwt-token",
                expiresIn: 15 * 60 * 1000, // 15 minutes
                user: {
                    id: bloId,
                    role: "BLO",
                    name: "BLO Officer",
                },
            });
        }, 800);
    });
}
