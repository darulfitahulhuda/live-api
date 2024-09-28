const {PrismaClient, StatusPembayaran, MetodePembayaran} = require('@prisma/client');
const prisma = new PrismaClient();
const {getPagination} = require ('../libs/pagination');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const imagekit = require('../libs/imagekit');
const path = require('path');
const {JWT_SECRET_KEY} = process.env;

module.exports = {
    dashboard: async (req, res, next) => {
        try {
            const activeUsers = await prisma.users.count({ where: { is_active: true }});
            const activeClass = await prisma.courses.count();
            const premiumClass = await prisma.courses.count({ where: { type: 'isPremium' }});
            
            const { categoryId, statusbayar, metodebayar } = req.query;

            let enrollment =  await prisma.enrollments.findMany({
                where: {
                    StatusPembayaran: statusbayar,
                    MetodePembayaran: metodebayar,
                    course: {
                        type: 'isPremium',
                        category: {
                            ...(categoryId ? { category_id: Number(categoryId)}: {}),
                        }
                    }
                },
                select: {
                    id: true,
                    user: {
                        select: {
                            name: true
                        },
                    },
                    course: {
                        select: {
                            category: {
                                select: {
                                    category: {
                                        select: {
                                            name: true
                                        }
                                    }
                                }
                            },
                            name: true,
                            mentor: {
                                select: {
                                    mentor: {
                                        select: {
                                            id: true,
                                            name: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    statusPembayaran: true,
                    metodePembayaran: true,
                    tanggalBayar: true
                }
            });

            const { _count } = await prisma.courses.aggregate({
                _count: { id: true },
                where: {type: 'isPremium'}
            });
    
            res.status(200).json({
                status: true,
                message: 'OK!',
                data: {  
                    activeUsers: activeUsers,
                    activeClass: activeClass,
                    premiumClass: premiumClass,
                    total_item: _count.id ,
                    enrollment 
                }
            });
            
        } catch (err) {
            next(err);
        }
    },

    kelolaKelas: async (req, res, next) => {
        try {
            const activeUsers = await prisma.users.count({ where: { is_active: true }});
            const activeClass = await prisma.courses.count();
            const premiumClass = await prisma.courses.count({ where: { type: 'isPremium' }});
            
            const { categoryId, type, level } = req.query;

            let course = await prisma.categoriesOnCourses.findMany({
                where: {
                    course: {
                        type: type,
                        level: level,
                    },
                    category: {
                        ...(categoryId ? { category_id: Number(categoryId)}: {}),
                    }
                },
                select: {
                    category: {
                        select: {
                            name: true
                        }
                    },
                    course: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            level: true,
                            type: true,
                            intended_for: true
                        }
                    }
                }
            });

            const { _count } = await prisma.courses.aggregate({
                _count: { id: true },
            });
    
            res.status(200).json({
                status: true,
                message: 'OK!',
                data: { 
                    activeUsers: activeUsers,
                    activeClass: activeClass,
                    premiumClass: premiumClass,
                    total_item: _count.id,
                    course
                }
            });

        } catch (err) {
            next(err);
        }
    },

    deleteCourse: async (req, res, next) => {
        try {
            let { id } = req.params;

            // related to categoriesOnCourses
            let isReferenced1 = await prisma.categoriesOnCourses.findMany({
                where: { course_id: Number(id) }
            });

            for (let data of isReferenced1) {
                let dataExist = await prisma.categoriesOnCourses.findUnique({
                    where: { category_id_course_id: {
                        category_id: data.category_id,
                        course_id: data.course_id
                    }}
                });

                if(dataExist){
                    await prisma.categoriesOnCourses.delete({
                        where: {category_id_course_id: {
                            category_id: data.category_id,
                            course_id: data.course_id
                        }}
                    })
                } else {
                    console.log(`Data not found for deletion: ${data.category_id} - ${data.course_id}`)
                }
            }

            // related to mentoroncourse
            let isReferenced2 = await prisma.mentorsOnCourses.findMany({
                where: { course_id: Number(id) }
            });

            for (let data of isReferenced2) {
                let dataExist = await prisma.mentorsOnCourses.findUnique({
                    where: { mentor_id_course_id: {
                        mentor_id: data.mentor_id,
                        course_id: data.course_id
                    } }
                });

                if(dataExist){
                    await prisma.mentorsOnCourses.delete({
                        where: {mentor_id_course_id: {
                            mentor_id: data.mentor_id,
                            course_id: data.course_id
                        }}
                    });
                } else {
                    console.log(`Data not found for deletion: ${data.mentor_id} - ${data.course_id}`)
                }
            }

            // related to enrollments
            let isReferenced3 = await prisma.enrollments.findMany({
                where: { course_id_enrollment: Number(id) }
            });

            for (let data of isReferenced3) {
                let dataExist = await prisma.enrollments.findMany({
                    where: {
                        course_id_enrollment: data.course_id_enrollment,
                        kode: data.kode
                    }
                });

                if(dataExist){
                    await prisma.enrollments.delete({
                        where: {
                            course_id_enrollment: data.course_id_enrollment,
                            kode: data.kode
                        }
                    });
                } else {
                    console.log(`Data not found for deletion: ${course_id_enrollment} - ${data.course_id}`)
                }
            }

            

            // related to chapter
            let isReferenced4 = await prisma.chapters.findMany({
                where: { course_id: Number(id) }
            });

            for (let data of isReferenced4) {
                let relatedLessons = await prisma.lessons.findMany({
                    where: {chapter_id: data.id}
                });

                if (relatedLessons.length > 0) {
                    await prisma.lessons.deleteMany({
                        where: { chapter_id: data.id }
                    });
                }

                await prisma.chapters.delete({
                    where: { 
                        course_id: data.course_id,
                        id: data.id }
                });
            }

            // hapus course
            let result = await prisma.courses.delete({
                where: { id : Number(id) }
            });

            res.status(200).json({
                status: true,
                message: `Course with id ${id} has been deleted!`,
                data: result
            });

        } catch (err) {
            next (err);
        }
    },

    login: async (req, res, next)=>{
        try {
            const {id, password} = req.body;
    
            let users = await prisma.users.findUnique({where:{id}});
            if (!users || !users.is_admin) {
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'invalid id or password!',
                    data: null
                });
            }
    
            // nambahin kondisi login harus true
    
            let isPasswordCorrect = await bcrypt.compare(password, users.password);
            if (!isPasswordCorrect) {
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'invalid id or password!',
                    data: null
                });
            }
    
            let token = jwt.sign({ id: users.id, is_admin: users.is_admin}, JWT_SECRET_KEY);
    
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

    updateCourse: async (req, res, next) => {
        try {
            let {id, name, desc, price, level, type, intended_for } = req.body;

            const courseExist = await prisma.courses.findUnique({where: {id: Number(id)}});
            if(!courseExist){
                return res.status(404).json({
                    status: false,
                    message: 'Not Found',
                    err: 'Course ID Not Found',
                    data: null
                });
            }

            const chapters = await prisma.chapters.findMany({
                where: {course_id: Number(id)},
                include: {lesson: true}
            });

            let totalLesson = 0;
            let totalDuration = 0;
            
            chapters.map((c) => {
                totalLesson += c.lesson.length;
                c.lesson.map((l) => {
                    totalDuration += l.duration;
                })
            });

            let update = await prisma.courses.update({
                where: { id: Number(id) },
                data: {
                    name,
                    desc,
                    price,
                    level,
                    type,
                    intended_for,
                    total_lesson: totalLesson,
                    total_duration: totalDuration
                }
            });

            res.status(200).json({
                status: true,
                message: 'Course has been successfully updated',
                err: null,
                data: update
            })
        } catch (err) {
            next(err);
        }
    },

    addCategory: async (req, res, next) => {
        try {
            let {name, image} = req.body;

            if(!name){
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'Please fill name column'
                })
            }

            let strFile = req.file.buffer.toString('base64');

            let {url} = await imagekit.upload({
                fileName: Date.now() + path.extname(req.file.originalname),
                file: strFile
            });

            let newCategory = await prisma.categories.create({
                data: {
                    name,
                    image: url
                }
            });

            return res.status(201).json({
                status: true,
                message: 'Created',
                err: null,
                data: {newCategory}
            })

        }catch(err){
            next(err);
        }
    },

    addMentor: async (req, res, next) => {
        try{
            let {name} = req.body;
            if(!name){
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'Please fill name column'
                });
            }

            const newMentor = await prisma.mentors.create({
                data: {name}
            });

            res.status(201).json({
                status: true,
                message: 'Created',
                err: null,
                data: newMentor
            })
        }catch(err){
            next(err);
        }
    },

    getAllMentor: async (req, res, next) => {
        try{
            let mentors = await prisma.mentors.findMany();

            const {_count} = await prisma.mentors.aggregate({
                _count: {id: true},
            });

            res.status(200).json({
                status: true,
                message: 'Show All Mentor',
                err: null,
                data: { 
                    total_item: _count.id,
                    mentors
                }
            });
            
        }catch(err){
            next(err);
        }
    },

    addCourse: async (req, res, next) => {
        try{
            const {category_id, name, desc, price, level, type, intended_for, mentor_id} = req.body;
            console.log(req.body);

            if(!category_id || !name || !desc || !price || !level || !type || !intended_for || !mentor_id){
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'Make sure all column has been adding',
                    data: null
                });
            }

            const category = await prisma.categories.findUnique({where: {id: category_id}});
            if(!category) {
            return res.status(404).json({
                status: false,
                message: 'Not Found',
                err: 'Category Id Not Found',
                data: null
            });
        }
            const mentor = await prisma.mentors.findUnique({where: {id: mentor_id}});
            if(!mentor){
                return res.status(404).json({
                    status: false,
                    message: 'Not Found',
                    err: 'Mentor Id Not Found',
                    data: null
                })
            }

            const categoryImage = category.image;

            const newCourse = await prisma.courses.create({
                data: {
                    name,
                    desc,
                    image: categoryImage,
                    price,
                    level,
                    type,
                    intended_for,
                    category: {
                        create: [{
                            category: {
                                connect: {
                                    id: category_id
                                }
                            }
                        }]
                    },
                    mentor: {
                        create: [{
                                    mentor: {
                                        connect: {
                                            id: mentor_id
                                        }
                                    }
                                }]
                    },
                }
            });

            return res.status(201).json({
                status: true,
                message: 'Created',
                err: null,
                data: newCourse
            })
        }catch(err){
            next(err);
        }
    },

    getAllCourse: async (req, res, next) => {
        try{
            let courses = await prisma.courses.findMany({
                select: {
                    id: true,
                    name: true,
                }
            });

            const {_count} = await prisma.courses.aggregate({
                _count: {id: true},
            });

            res.status(200).json({
                status: true,
                message: 'Show All Course',
                err: null,
                data: {
                    total_item: _count.id,
                    courses
                }
            });
        }catch(err){
            next(err);
        }
    },

    addChapter: async (req, res, next) => {
        try {
            let {name, course_id} = req.body;

            if(!name){
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'Please fill name column'
                })
            }

            const courseExist = await prisma.courses.findUnique({where: {id: course_id}});
            if(!courseExist){
                res.status(404).json({
                    status: false,
                    message: 'Not Found',
                    err: 'Course Id is not found',
                    data: null
                });
            }

            const newChapter = await prisma.chapters.create({
                data: {
                    name,
                    course_id
                }
            });

            res.status(201).json({
                status: true,
                message: 'Created',
                err: null,
                data: newChapter
            });

        }catch(err){
            next(err);
        }
    },

    getAllChapter: async (req, res, next) => {
        try{
            let chapters = await prisma.chapters.findMany({
                select: {
                    id: true,
                    name: true
                }
            });

            const {_count} = await prisma.chapters.aggregate({
                _count: {id: true},
            });

            res.status(200).json({
                status: true,
                message: 'Show All Chapter',
                err: null,
                data: {total_item:_count.id, chapters}
            });
        }catch(err){
            next(err);
        }
    },

    addLesson: async (req, res, next) => {
        try {
            let {name, video, desc, duration, chapter_id} = req.body;

            if(!name || !video || !duration || !chapter_id){
                return res.status(400).json({
                    status: false,
                    message: 'Bad Request',
                    err: 'Please fill name column'
                })
            }

            const chapterExist = await prisma.chapters.findUnique({where: {id: chapter_id}});
            if(!chapterExist){
                res.status(404).json({
                    status: false,
                    message: 'Not Found',
                    err: 'Course Id is not found',
                    data: null
                });
            }

            const newLesson = await prisma.lessons.create({
                data: {
                    name,
                    video,
                    desc,
                    duration,
                    chapter_id
                }
            });

            res.status(201).json({
                status: true,
                message: 'Created',
                err: null,
                data: newLesson
            });

        } catch(err){
            next(err);
        }
    }
};