const { expressjwt: jwt } = require("express-jwt");

function authJwt() {
    const secret = process.env.secret;
    const api = process.env.API_URL;
    
    return jwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked // Make sure isRevoked is defined below
    })
    .unless({
        path: [
            {
                url: /\/api\/v1\/products(.*)/,
                methods: ['GET', 'POST', 'PUT', 'OPTIONS', 'DELETE']
            },
            {
                url: /\/api\/v1\/categories(.*)/,
                methods: ['GET', 'POST', 'PUT', 'OPTIONS', 'DELETE']
            },
            {
                url: /\/api\/v1\/orders(.*)/,
                methods: ['GET', 'POST', 'PUT', 'OPTIONS']
            },
            {
                url: /\/public\/uploads(.*)/,
                methods: ['GET', 'OPTIONS', 'POST']
            },
            `${api}/users`,  
            `${api}/users/login`,  
            `${api}/users/register`,  
        ]
    });
}

async function isRevoked(req, payload) {
    console.log('Payload:', payload);


    if (!payload) {
        console.log('Invalid payload, revoking token');
        return true; // Revoking token
    }

    return false; }

module.exports = authJwt;