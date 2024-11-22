const { expressjwt: jwt } = require("express-jwt");

function authJwt() {
    const secret = process.env.secret;
    const api = process.env.API_URL;

    // Ensure secret and API_URL are defined
    if (!secret || !api) {
        throw new Error("Missing environment variables: 'secret' or 'API_URL'");
    }

    return jwt({
        secret,
        algorithms: ['HS256'],
        requestProperty: 'auth',
        isRevoked: isRevoked // Function to check token revocation
    }).unless({
        path: [
            {
                // Public access to products
                url: /\/api\/v1\/products(.*)/,
                methods: ['GET', 'OPTIONS']
            },
            {
                // Public access to categories
                url: /\/api\/v1\/categories(.*)/,
                methods: ['GET', 'OPTIONS']
            },
            {
                // Public access to file uploads
                url: /\/public\/uploads(.*)/,
                methods: ['GET', 'OPTIONS']
            },
            // Public access to user authentication routes
            `${api}/users/login`,
            `${api}/users/register`
        ]
    });
}

// Function to check if a token is revoked
async function isRevoked(req, payload) {
    try {
        // Example: Check if user role is admin
        // return payload.role !== "admin";
        console.log('Token payload in isRevoked:', JSON.stringify(payload, null, 2));
        return false; // By default, no token is revoked
    } catch (err) {
        console.error("Error in isRevoked function:", err);
        return true; // If there's an error, revoke token
    }
}

module.exports = authJwt;
