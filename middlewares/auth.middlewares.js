const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const {JWT_SECRET_KEY} = process.env;

module.exports = {
    restrict: (req, res, next) => {
        let {authorization} = req.headers;
        if(!authorization){
            return res.status(401).json({
                status: false,
                message: 'Unauthorized',
                err: 'Missing token on headers',
                data: null
            });
        }
        jwt.verify(authorization, JWT_SECRET_KEY, async (err, decoded) => {
            if(err){
                return res.status(401).json({
                    status: false,
                    message: 'Unauthorized',
                    err: err.message,
                    data: null
                });
            }

            req.user = await prisma.users.findUnique({where : {id: decoded.id}});
            next();
        });
    },

    admin: async (req, res, next) => {
        if(!req.user.is_admin){
            return res.status(401).json({
                status: false,
                message: 'Unauthorized',
                err: 'Only Admin can access this endpoint',
                data: null
            });
        }
        next();
    },

    isBuy: async (req, res, next) => {
        const token = req.header('Authorization');

        // Periksa apakah token ada
        if (token) {
        const decoded = jwt.verify(token, JWT_SECRET_KEY);
        // Set req.user jika decoded memiliki properti 'id'
        if (decoded && decoded.id) {
            req.user = await prisma.users.findUnique({ where: { id: decoded.id } });
        }
        }

    next(); // Lanjutkan ke rute berikutnya
    },
}