const {PrismaClient} = require ('@prisma/client');
const prisma = new PrismaClient ();
const {getPagination} = require ('../libs/pagination');
const {
  search,
  filter,
  getByType,
} = require ('../repositories/courses.repository');
const courseService = require ('../services/courses.service');
const {chat} = require ('googleapis/build/src/apis/chat');

module.exports = {
  getAllCourse: async (req, res, next) => {
    try {
      let {limit = 10, page = 1} = req.query;
      limit = Number (limit);
      page = Number (page);

      let courses = await prisma.courses.findMany ({
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          category: {
            select: {
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      const {_count} = await prisma.courses.aggregate ({
        _count: {id: true},
      });

      let pagination = getPagination (req, _count.id, page, limit);

      res.status (200).json ({
        status: true,
        message: 'Show All Course',
        err: null,
        data: {pagination, courses},
      });
    } catch (err) {
      next (err);
    }
  },

  getCoursePopuler: async (req, res, next) => {
    try {
      let {id} = req.params;

      // Get the category
      let category = await prisma.categories.findUnique ({
        where: {id: Number (id)},
      });
      if (!category) {
        return res.status (404).json ({
          status: false,
          message: 'Not Found',
          err: 'Category ID not found',
          data: null,
        });
      }

      // Get the associated courses
      let topCourses = await prisma.categoriesOnCourses.findMany ({
        where: {category_id: Number (id)},
        take: 3,
        orderBy: {
          course: {
            rating: 'desc',
          },
        },
        include: {
          category: {
            select: {
              name: true,
            },
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
                  mentor: true,
                },
              },
            },
          },
        },
      });

      res.status (200).json ({
        status: true,
        message: 'Show Top 3 Most populer Course',
        err: null,
        data: {
          category,
          topCourses,
        },
      });
    } catch (err) {
      next (err);
    }
  },

  getPopulerAll: async (req, res, next) => {
    try {
      const topCourse = await prisma.categoriesOnCourses.findMany ({
        take: 6,
        orderBy: {
          course: {
            rating: 'desc',
          },
        },
        include: {
          category: {
            select: {
              name: true,
            },
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
                  mentor: true,
                },
              },
            },
          },
        },
      });

      res.status (200).json ({
        status: true,
        message: 'Show Top 6 Most Populer Course',
        err: null,
        data: {
          topCourse,
        },
      });
    } catch (err) {
      next (err);
    }
  },

  // Menampilkan Course Detail
  getDetailCourse: async (req, res, next) => {
    try {
      let {courseId} = req.params;
      let { id } = req.user || {};

      let course = await prisma.courses.findUnique ({
        where: {id: Number (courseId)},
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
                  duration: true,
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
          data: `Course with id ${courseId} doesn\'t exist!`,
        });
      }


      /* START LOGIC */
      // mark is_preview

      // mark is_done
      const results = await prisma.$queryRaw`SELECT DISTINCT
          l.id,
          CASE
              WHEN lu.id > 0 THEN true
              ELSE false
          END AS is_done,
          e."statusPembayaran"
      FROM
          "Courses" c
          INNER JOIN "Chapters" c2 ON c2.course_id = c.id
          INNER JOIN "Lessons" l ON l.chapter_id = c2.id
          LEFT JOIN "Enrollments" e ON e.course_id_enrollment = c.id and e.user_id = ${id}
          LEFT JOIN "LessonUpdate" lu ON lu.lesson_id = l.id AND lu.user_id = ${id}
      WHERE
          c.id = ${Number(courseId)};`;

          console.log(`SELECT
          l.id,
          CASE
              WHEN lu.id > 0 THEN true
              ELSE false
          END AS is_done,
          e."statusPembayaran"
      FROM
          "Courses" c
          INNER JOIN "Chapters" c2 ON c2.course_id = c.id
          INNER JOIN "Lessons" l ON l.chapter_id = c2.id
          LEFT JOIN "Enrollments" e ON e.course_id_enrollment = c.id and e.user_id = ${id}
          LEFT JOIN "LessonUpdate" lu ON lu.lesson_id = l.id AND lu.user_id = ${id}
      WHERE
          c.id = ${Number(courseId)};`)
      // check is buy
      let is_buy = false;
      results.forEach(l => {
        if (l.statusPembayaran == 'sudahBayar') {
          is_buy = true;
        }
      });
      /* END LOGIC */

      let total_lesson = 0;
      let total_duration = 0;
      let chapters = course.chapter.map((c, ci) => {
        let lessons = c.lesson.map((l) => {
          total_lesson++;
          total_duration += l.duration;
          let lessonIndex = results.findIndex(ll => ll.id === l.id);

          console.log("\n\nlesson id:", l.id);
          console.log("lesson index:", lessonIndex);
          if (lessonIndex >= 0) {
            console.log("lesson data:", results[lessonIndex]);
          }
          console.log(results)

          return {
            id: l.id,
            name: l.name,
            video: l.video,
            duration: l.duration,
            is_done: lessonIndex >= 0 ? results[lessonIndex].is_done : false,
            is_preview: ci == 0 ? true : (is_buy ? true : false)
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
        type: course.type,
        rating: course.rating,
        level : course.level,
        price: course.price,
        intended_for: course.intended_for,
        category: course.category.length ? course.category[0].category : null,
        mentor: course.mentor.length ? course.mentor[0].mentor : null,
        is_buy,
        total_lesson,
        total_duration,
        chapter: chapters
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

  updateIsDone: async (req, res, next) => {
    try {
        let {id} = req.user;
        let {lessonId} = req.params;

        let lessons = await prisma.lessons.findFirst({
            where: {
                id: Number(lessonId),
            },
            include: {
                chapter: {
                    include: {
                        course: {
                          include: {
                            enrollment: {
                              select: {
                                user_id: true
                              }
                            }
                          }
                        }
                    }
                }
            }
        });

        if(!lessons){
            return res.status(404).json({
                status: false,
                message: 'Not Found',
                err: `lesson not found with id ${lessonId}`,
                data: null
            })
        }

        const courseId = lessons.chapter.course.id;

        let enrollment = await prisma.enrollments.findFirst({
            where: {
                user_id: id,
                course_id_enrollment: courseId
            }
        });

        if(!enrollment) {
            return res.status(400).json({
                status: false,
                message: 'Bad Request',
                err: `Enrollment not found for user with id ${id}`,
                data: null
            })
        }

        const lessonUpdateExist = await prisma.lessonUpdate.findFirst({
          where: {
            user_id: id,
            lesson_id: Number(lessonId)
          }
        });

        if(lessonUpdateExist){
          return res.status(200).json({
            status: true,
            message: 'OK',
            err: null,
            data: {updatedLesson: lessonUpdateExist}
          })
        }

        const updatedLesson = await prisma.lessonUpdate.create({
            data: {
              user_id: id,
              lesson_id: Number(lessonId)
            }
        });

        res.status(201).json({
            status: true,
            message: 'Created',
            err: null,
            data: {updatedLesson}
        })

    } catch(err){
        next(err);
    }
  },

  isBuy: async (req, res, next) => {
    try {
      let {id} = req.user;
      let {courseId} = req.body;

      let buyed = await prisma.enrollments.findFirst({
          where: {
              user_id: id,
              course_id_enrollment: courseId
          }
      });

      if(!buyed) {
        return res.status(400).json({
            status: false,
            message: 'Bad Request',
            err: `Enrollment not found for user with id ${id}`,
            data: null
        })
      }

      res.status(200).json({
        status: true,
        message: 'OK',
        err: null,
        data: 'coursedetail'
      })

    } catch (err) {
        next(err);
    }
  },

  rating: async(req, res, next) => {
    try{
      let {courseId} = req.params;
      let {id}= req.user;
      let {rating} = req.body;

      const courseExist = await prisma.courses.findUnique({
        where: {id: Number(courseId)},
      });
      if(!courseExist){
        return res.status(404).json({
          status: false,
          message: 'Not Found',
          err: 'Course ID is not found',
          data: null
        });
      }

      if (rating < 0 || rating > 5){
        return res.status(400).json({
          status: false,
          message: 'Bad Request',
          err: 'Rating Must be between 0 and 5',
          data: null
        });
      }

      // Menghitung totalRating (jumlah total rating yang sudah ada + rating baru)
      const totalRating = courseExist.rating + rating;

      // Menghitung totalVote (jumlah pemilih atau voting yang sudah ada + 1)
      const totalVote = courseExist.totalVote ? courseExist.totalVote + 1 : 1;

      // Menghitung averageRating
      const averageRating = totalRating / totalVote;

      const updateCourse = await prisma.courses.update({
        where: {id: Number(courseId)},
        data: {averageRatings: averageRating}
      });

      return res.status(200).json({
        status: true,
        message: 'Rating added Successfuly',
        err: null,
        data: updateCourse
      });

    }catch(err){
      next(err);
    }
  },

  search: async (req, res, next) => {
    try {
      const result = await search (req);

      res.status (200).json ({
        data: result,
      });
    } catch (err) {
      next (err);
    }
  },

  getByCategory: async (req, res, next) => {
    try {
      const result = await getByCategory (req);

      res.status (200).json ({
        data: result,
      });
    } catch (error) {
      next (error);
    }
  },

  filter: async (req, res, next) => {
    try {
      const result = await filter (req);

      res.status (200).json ({
        data: result,
      });
    } catch (error) {
      next (error);
    }
  },

  getByType: async (req, res, next) => {
    try {
      const {result, pagination} = await getByType (req);

      res.status (200).json ({
        data: {result, pagination},
      });
    } catch (error) {
      next (error);
    }
  },

  getByEnrollment: async (req, res, next) => {
    try {
      const {result, pagination} = await courseService.getByEnrollment ({user_id: req.user.id, req});

      res.status (200).json ({
        data: {result, pagination},
      });
    } catch (error) {
      next (error);
    }
  },

  getPremiumCourse: async (req, res, next) => {
    try {
      const {categoryId, level, sortBy} = req.query;

      let courseQuery = {
        where: {
          ...(categoryId ? {category_id: Number (categoryId)} : {}),
          course: {
            level: level,
            type: 'isPremium',
          },
        },
        include: {
          category: {
            select: {
              name: true,
            },
          },
          course: {
            select: {
              name: true,
              price: true,
              image: true,
              level: true,
              rating: true,
              total_lesson: true,
              total_duration: true,
              createdAt: true,
              mentor: {
                select: {
                  mentor: true,
                },
              },
            },
          },
        },
      };

      if (sortBy) {
        switch (sortBy) {
          case 'latest':
            courseQuery.orderBy = {course: {createdAt: 'desc'}};
            break;
          case 'populer':
            courseQuery.orderBy = {course: {rating: 'desc'}};
            break;
          // case 'promo':
          //     courseQuery.where.course.price =
          default:
            break;
        }
      }

      let courses = await prisma.categoriesOnCourses.findMany (courseQuery);

      // let filteredCourse = course.filter((course) => course.course !== null );

      if (courses.length === 0) {
        return res.status (404).json ({
          status: false,
          message: 'Data is not found',
          err: 'Not Found',
          data: null,
        });
      }

      courses = courses.map(c => {
        return {
            id: c.course_id,
            name: c.course.name,
            price: c.course.price,
            image: c.course.image,
            level: c.course.level,
            rating: c.course.rating,
            total_lesson: c.course.total_lesson,
            total_duration: c.course.total_duration,
            createdAt: c.course.createdAt,
            mentor: c.course.mentor.length ? c.course.mentor[0].mentor : [],
            category: {
                id: c.category_id,
                name: c.category.name
          }
        };
    });

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

  getFreeCourse: async (req, res, next) => {
    try {
      const {categoryId, level, sortBy} = req.query;

      let courseQuery = {
        where: {
          ...(categoryId ? {category_id: Number (categoryId)} : {}),
          course: {
            level: level,
            type: 'isFree',
          },
        },
        include: {
          category: {
            select: {
              name: true,
            },
          },
          course: {
            select: {
              name: true,
              price: true,
              image: true,
              level: true,
              rating: true,
              total_lesson: true,
              total_duration: true,
              createdAt: true,
              mentor: {
                select: {
                  mentor: true,
                },
              },
            },
          },
        },
      };

      if (sortBy) {
        switch (sortBy) {
          case 'latest':
            courseQuery.orderBy = {course: {createdAt: 'desc'}};
            break;
          case 'populer':
            courseQuery.orderBy = {course: {rating: 'desc'}};
            break;
          // case 'promo':
          //     courseQuery.where.course.price =
          default:
            break;
        }
      }

      let courses = await prisma.categoriesOnCourses.findMany (courseQuery);

      // let filteredCourse = courses.filter (course => course.course !== null);

      if (courses.length === 0) {
        return res.status (404).json ({
          status: false,
          message: 'Data is not found',
          err: 'Not Found',
          data: null,
        });
      }

      courses = courses.map(c => {
        return {
            id: c.course_id,
            name: c.course.name,
            price: c.course.price,
            image: c.course.image,
            level: c.course.level,
            rating: c.course.rating,
            total_lesson: c.course.total_lesson,
            total_duration: c.course.total_duration,
            createdAt: c.course.createdAt,
            mentor: c.course.mentor.length ? c.course.mentor[0].mentor : [],
            category: {
                id: c.category_id,
                name: c.category.name
          }
        };
    });

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

  getAllFreePrem: async (req, res, next) => {
    try {
      const {categoryId, level, sortBy} = req.query;

      let courseQuery = {
        where: {
          ...(categoryId ? {category_id: Number (categoryId)} : {}),
          course: {
            level: level,
          },
        },
        include: {
          category: {
            select: {
              name: true,
            },
          },
          course: {
            select: {
              name: true,
              price: true,
              image: true,
              level: true,
              type: true,
              rating: true,
              total_lesson: true,
              total_duration: true,
              createdAt: true,
              mentor: {
                select: {
                  mentor: true,
                },
              },
            },
          },
        },
      };

      if (sortBy) {
        switch (sortBy) {
          case 'latest':
            courseQuery.orderBy = {course: {createdAt: 'desc'}};
            break;
          case 'populer':
            courseQuery.orderBy = {course: {rating: 'desc'}};
            break;
          // case 'promo':
          //     courseQuery.where.course.price =
          default:
            break;
        }
      }

      let courses = await prisma.categoriesOnCourses.findMany (courseQuery);

      // let filteredCourse = course.filter (course => course.course !== null);

      if (courses.length === 0) {
        return res.status (404).json ({
          status: false,
          message: 'Data is not found',
          err: 'Not Found',
          data: null,
        });
      }

      courses = courses.map(c => {
        return {
            id: c.course_id,
            name: c.course.name,
            price: c.course.price,
            image: c.course.image,
            level: c.course.level,
            rating: c.course.rating,
            total_lesson: c.course.total_lesson,
            total_duration: c.course.total_duration,
            createdAt: c.course.createdAt,
            mentor: c.course.mentor.length ? c.course.mentor[0].mentor : [],
            category: {
                id: c.category_id,
                name: c.category.name
          }
        };
    });

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
};
