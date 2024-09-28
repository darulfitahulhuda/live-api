const {PrismaClient} = require ('@prisma/client');
const prisma = new PrismaClient ();
const {getPagination} = require ('../../libs/pagination');
const {
  search,
  filter,
  getByType,
} = require ('../../repositories/courses.repository');
const courseService = require ('../../services/courses.service');
const {chat} = require ('googleapis/build/src/apis/chat');

// router.get('/list', restrict, getAllCourse);
// router.get('/populerall', getPopulerAll);
// router.get('/premium', getPremiumCourse);
// router.get('/all', getAllFreePrem);
// router.get('/free', getFreeCourse);
// router.get('/search/', search);

module.exports = {
    // get all - login not required
    index:async (req, res, next) => {
        try {
            const {search, is_premium, order, sort} = req.query;

            let filter = {}
            if (search){
              filter.name = {
                  contains: search,
                  mode: 'insensitive',
              }
            }

            if (is_premium == 'true'){
                filter.type= 'isPremium'
            }else     if (is_premium == 'false'){
                filter.type= 'isFree'
            }

           

          let courseQuery = {
            where:filter,
          };
    
          if (order) {
            switch (order) {
              case 'latest':
                courseQuery.orderBy = {createdAt: 'desc'};
                break;
              case 'populer':
                courseQuery.orderBy = {rating: 'desc'};
                break;
              default:
                break;
            }
          }
    
          let courses = await prisma.courses.findMany(courseQuery);
    
        //   courses = courses.map(c => {
        //     return {
        //         id: c.course_id,
        //         name: c.course.name,
        //         price: c.course.price,
        //         image: c.course.image,
        //         level: c.course.level,
        //         rating: c.course.rating,
        //         total_lesson: c.course.total_lesson,
        //         total_duration: c.course.total_duration,
        //         createdAt: c.course.createdAt,
        //         mentor: c.course.mentor.length ? c.course.mentor[0].mentor : [],
        //         category: {
        //             id: c.category_id,
        //             name: c.category.name
        //       }
        //     };
        // });
    
          res.status (200).json ({
            status: true,
            message: 'OK!',
            err: null,
            data: courses,
          });
        } catch (err) {
          next (err);
        }
      },

    // get detail - login not required
    show:async (req, res, next) => {
        try {
          let {id} = req.params;
          let course = await prisma.courses.findUnique ({
            where: {id: Number (id)},
            include: {
              category: {
                select: {
                  category: true,
                },
              },
              chapter: {
                select: {
                  id: true,
                  name: true,
                  lesson: {
                    select: {
                      id: true,
                      name: true,
                      video: true,
                      desc: true,
                      duration: true,
                      is_done: true,
                    },
                  },
                },
              },
              mentor: {
                select: {
                  mentor: true,
                },
              },
            },
          });
    
          if (!course) {
            return res.status (400).json ({
              status: false,
              message: 'Bad Request!',
              data: `Course with id ${id} doesn\'t exist!`,
            });
          }
    
          let chapters = course.chapter.map(c => {
            let lessons = c.lesson.map(l => {
                return {
                    id: c.id,
                    name: c.name,
                    video: c.video,
                    desc: c.desc,
                    duration: c.duration,
                    is_done: c.is_done
                };
            });
        
            return {
                id: c.id,
                name: c.name,
                lessons
            };
        });
        
        let response = {
            id: course.id,
            title: course.name,
            desc: course.desc,
            intended_for: course.intended_for,
            category: course.category.length ? course.category[0].category : null,
            mentor: course.mentor.length ? course.mentor[0].mentor : null,
            chapters
        };
    
          res.status (200).json ({
            status: true,
            message: 'OK!',
            data: response,
          });
        } catch (err) {
          next (err);
        }
      },

    // create course - only admin can access
    create:async(req,res,next)=>{
        try{

        }catch(err){
            next(err)
        }
    },

    // update course - only admin can access
    update:async(req,res,next)=>{
        try{

        }catch(err){
            next(err)
        }
    },

    // delete course - only admin can access
    delete:async(req,res,next)=>{
        try{

        }catch(err){
            next(err)
        }
    }
}