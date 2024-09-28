const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getPagination } = require('../libs/pagination');

module.exports = {
    getAllCategories: async (req, res, next) => {
        try {
            let categories = await prisma.categories.findMany({
                select: {
                    id: true,
                    name: true,
                    image: true
                }
            });

            const { _count } = await prisma.categories.aggregate({
                _count: { id: true },
            });

            res.status(200).json({
                status: true,
                message: 'Show All Categories',
                err: null,
                data: { total_item: _count.id, categories },
            });
        } catch (err) {
            next(err);
        }
    },

    getCategoriesDetail: async (req, res, next) => {
        try {
            let { id } = req.params;
            let { limit = 10, page = 1 } = req.query;
            limit = Number(limit);
            page = Number(page);
    
            // Get the category
            let category = await prisma.categories.findUnique({
                where: { id: Number(id) },
            });
    
            if (!category) {
                return res.status(404).json({
                    status: false,
                    message: 'Category not found',
                    err: null,
                    data: null,
                });
            }
    
            // Get the associated courses
            let courses = await prisma.categoriesOnCourses.findMany({
                where: { category_id: Number(id) },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    category: {
                        select: {
                            name: true
                        }
                    },
                    course: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            price: true,
                            level: true,
                            rating: true,
                            total_lesson: true,
                            total_duration: true,
                            mentor: {
                                select: {
                                    mentor: true
                                }
                            }
                        }
                    }
                }
            });
    
            const { _count } = await prisma.categories.aggregate({
                _count: { id: true },
            });
    
            let pagination = getPagination(req, _count.id, page, limit);
    
            res.status(200).json({
                status: true,
                message: 'Show Category Detail',
                err: null,
                data: {
                    pagination, 
                    category,
                    courses
                },
            });
        } catch (err) {
            next(err);
        }
    },
};    
