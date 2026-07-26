export async function authLogin(email) {
    const url = '/api/auth-login';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const rawMsg = (errorData.error || response.statusText || "").toLowerCase();
            if (response.status === 500 || rawMsg.includes("already") || rawMsg.includes("exist") || rawMsg.includes("registered") || rawMsg.includes("contacted") || rawMsg.includes("500") || rawMsg.includes("internal server")) {
                throw new Error("You have already contacted us. Please wait while our team reviews your request. We'll get back to you soon.");
            }
            throw new Error(errorData.error || 'Failed to authenticate');
        }

        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Login Error:', error);
        throw error;
    }
}

export async function authSignup(data) {
    const url = '/api/auth-signup';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const rawMsg = (errorData.error || response.statusText || "").toLowerCase();
            if (response.status === 500 || rawMsg.includes("already") || rawMsg.includes("exist") || rawMsg.includes("registered") || rawMsg.includes("contacted") || rawMsg.includes("500") || rawMsg.includes("internal server")) {
                throw new Error("You have already contacted us. Please wait while our team reviews your request. We'll get back to you soon.");
            }
            throw new Error(errorData.error || 'Failed to register');
        }

        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Signup Error:', error);
        throw error;
    }
}
