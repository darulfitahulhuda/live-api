const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');       
// const {JWT_SECRET_KEY} = process.env;
const { sendOTPByEmail, getHtml, sendEmail } = require('../utils/nodemailer');
const {generateOTP} = require('../utils/otp');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

if(!JWT_SECRET_KEY) {
    console.error('Error: JWT_SECRET_KEY is not defined');
    throw new Error ('JWT_SECRET_KEY is not defined');
}

module.exports = {
    register: async (req, res, next) => {
        try{
            let { name, email, no_hp, password} = req.body;
    
            // Checking Password
            const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*()_+{}\[\]:;<>,.?~\\-]).{8,}$/;
            if(!passwordRegex.test(password)) {
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'Password must contain at least one digit special character, lowercase, uppercase, and at least 8 character long.',
                    data: null
                });
            }

            let userExist = await prisma.users.findUnique({where: {email}});
            if(userExist){
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'User has been already used',
                    data: null
                });
            }

            let encryptedPassword = await bcrypt.hash(password, 10);
            let user = await prisma.users.create({
                data: {
                    name,
                    email,
                    no_hp,
                    password: encryptedPassword,
                    is_active: true
                }
            });

            // Generate OTP and Save to the user in the database
            // let otpValue = generateOTP();
            // let expiredTime = new Date();
            // expiredTime.setMinutes(expiredTime.getMinutes() + 5); 
            // await prisma.otp.create({
            //     data: {
            //         user_id: user.id,
            //         kode_otp: otpValue,
            //         expiredAt: expiredTime
            //     }
            // });
            
            // Send OTP to user email
            // sendOTPByEmail(email, otpValue);

            return res.status(201).json({
                status: true,
                message: 'Created',
                err: null,
                data: {user},
            })
        }catch(err){
            next(err);
        }
    },
    
    // verify: async (req, res, next) => {
    //     try {
    //         let {email, otp} = req.body;

    //         const user = await prisma.users.findUnique({where: {email}});
    //         if(!user){
    //             return res.status(404).json({
    //                 status: false,
    //                 message: 'Not Found',
    //                 err: 'User Not Found',
    //                 data: null
    //             });
    //         }

    //         const otpRecord = await prisma.otp.findFirst({
    //             where: {
    //                 user_id: user.id,
    //                 kode_otp: otp,
    //                 expiredAt: {
    //                     gte: new Date().toISOString()
    //                 }
    //             }
    //         });

    //         if(!otpRecord) {
    //             return res.status(400).json({
    //                 status: false,
    //                 message: 'Bad Request',
    //                 err: 'Invalid OTP',
    //                 data: null
    //             });
    //         }

    //         await prisma.users.update({
    //             where: {id: user.id},
    //             data: {is_active: true}
    //         })

    //         return res.status(200).json({
    //             status: true,
    //             message: 'OK',
    //             err: null,
    //             data: {
    //                 user: user.email,
    //                 is_active: true
    //             }
    //         })
    //     } catch (err){
    //         next(err);
    //     }
    // },
    
    newOTP: async (req, res, next)=>{
        try{
            let {email} = req.body;

            const user = await prisma.users.findUnique({where: {email}});
            if(!user){
                return res.status(404).json({
                    status: false,
                    message: 'Bad request',
                    err: 'User Not Found',
                    data: null
                });
            }

            // Generate New OTP
            let newotpValue = generateOTP();

            const existingOTP = await prisma.otp.findFirst({
                where: {
                    user_id: user.id
                }
            });

            // Update the existing OTP record
            if(existingOTP){
                const expiredTime = new Date();
                expiredTime.setMinutes(expiredTime.getMinutes() + 5);

                await prisma.otp.update({
                    where: {id: existingOTP.id},
                    data: {
                        kode_otp: newotpValue,
                        expiredAt: expiredTime
                    }
                });
            } else {
                return false;
            }


            // Resend the New OTP to user email
            sendOTPByEmail(email, newotpValue);

            return res.status(200).json({
                status: true,
                message: 'OK',
                err: null,
                data: {
                    user: user.email,
                    newOTP: true
                }
            })

        } catch(err){
            next(err);
        }
    },

    login: async (req, res, next) => {
        console.log('Login Request received');
        console.log('JWT_SECRET_KEY:', JWT_SECRET_KEY );
        try {
            const {email, password} = req.body;

            let users = await prisma.users.findUnique({where:{email}});
            if (!users ) {
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'invalid email or password!',
                    data: null
                });
            }
            if (!users.is_active) {
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'your account is not verified yet, please verify first',
                    data: null
                })
            }

            // nambahin kondisi login harus true

            let isPasswordCorrect = await bcrypt.compare(password, users.password);
            if (!isPasswordCorrect) {
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'invalid email or password!',
                    data: null
                });
            }

            let token = jwt.sign({ id: users.id }, JWT_SECRET_KEY);

            return res.status(200).json({
                status: true,
                message: 'OK',
                err: null,
                data: { users, token }
            });
        } catch (err) {
            next(err);

        }
    },
    forgotPassword: async (req, res, next) => {
        try {
            const { email } = req.body;

            const user = await prisma.users.findUnique({ where: {email} });

            if (!user) {
                return res.status(404).json({
                    status: false,
                    message: "Bad Request!",
                    data: "No User Found"
                });
            } 

            let token = jwt.sign({ email: user.email }, JWT_SECRET_KEY);
            let link = `https://liver-learning.vercel.app/updatepass/?token=${token}&email=${email}`;
            let html = await getHtml('reset-password.ejs', { name: user.name, link })

            sendEmail(email, html);

            res.status(200).json({
                status: true,
                message: 'OK!',
                err: null,
                data: email
            })
            
        } catch (err) {
            next(err);
        }
    },

    resetPassword: async (req, res, next) => {
        try {

            const { token } = req.query;

            const decoded = jwt.verify(token, JWT_SECRET_KEY);
            console.log(decoded)
            if (!decoded || !decoded.email) {
                return res.status(400).json({
                    status: false,
                    message: "Token is invalid!",
                    data: null
                });
            }

            const userExist = await prisma.users.findUnique({
                where: {
                    email: decoded.email,
                },
            });
            if(!userExist){
                return res.status(404).json({
                    status: false,
                    message: 'Not Found',
                    err: 'User Not Found',
                    data: null
                });
            }

            const { password, password_confirmation } = req.body;

            const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&*()_+{}\[\]:;<>,.?~\\-]).{8,}$/;
            if(!passwordRegex.test(password)) {
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'Password must contain at least one digit, special character, lowercase, uppercase, and at least 8 character long.',
                    data: null
                })
            }

            if (password != password_confirmation) {
                return res.status(400).json({
                    status: false,
                    message: 'Please ensure that password and password confirmation match!',
                    err: 'Password doesnt match',
                    data: null
                })
            }

            const passwordupdated = await prisma.users.update({ 
                where: { email: decoded.email },
                data: {
                  password: await bcrypt.hash(password, 10)
                }
            });

            res.status(200).json({
                status: true,
                message: 'OK!',
                err: null,
                data: passwordupdated
            })
        } catch (err) {
            console.log(err);
        }
    },

    getMe: async (req, res, next) => {
        try{
            let {id} = req.user;

            const userExist = await prisma.users.findUnique({where: {id: Number(id)}});
            if(!userExist){
                return res.status(404).json({
                    status: false,
                    message: 'Not Found',
                    err: 'User ID is not found',
                    data: null
                });
            }

            const getMe = await prisma.users.findUnique({
                where: {id: Number(id)},
                select: {
                    id: true,
                    name: true,
                    email: true,
                    no_hp: true,
                    country: true,
                    city: true,
                    foto_profile: true
                }
            });

            res.status(200).json({
                status: true,
                message: 'OK',
                err: null,
                data: getMe
            })
        } catch(err){
            next(err);
        }
    }
};