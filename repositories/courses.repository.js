const {getPagination} = require ('../libs/pagination');
const {PrismaClient} = require ('@prisma/client');
const prisma = new PrismaClient ();

const search = async req => {
  const {name} = req.query;
  let {limit = 10, page = 1} = req.query;
  limit = Number (limit);
  page = Number (page);

  const result = await prisma.courses.findMany ({
    where: {
      name: {
        contains: name,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      name: true,
      image: true,
      desc: true,
      rating: true,
      level: true,
      price: true,
      total_lesson: true,
      total_duration: true,
      category: {
        select: {
          category: {
            select: {
              name: true,
            },
          },
        },
      },
      mentor: {
        select: {
          mentor: {
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

  if (!result) throw new Error (`Cource tidak ditemukan`);


  return {result, pagination};
};

const filter = async req => {
  const {category, level, rating, terbaru} = req.query;
  let {limit = 10, page = 1} = req.query;
  limit = Number (limit);
  page = Number (page);

  const orderByRating = rating ? {rating: 'asc'} : {};
  const orderByAssignedAt = terbaru ? {createdAt: 'asc'} : {};

  const result = await prisma.courses.findMany ({
    where: {
      OR: [
        {
          category: {
            some: {
              category_id: Number (category),
            },
          },
        },
        {
          level: level,
        },
      ],
    },
    orderBy: [orderByRating, orderByAssignedAt],
  });

  const {_count} = await prisma.courses.aggregate ({
    _count: {id: true},
  });

  let pagination = getPagination (req, _count.id, page, limit);

  if (!result.length) throw new Error (`Kursus tidak ditemukan`);

  return {result, pagination};
};

// const getByEnrollment = async ({user_id, req}) => {
//   const result = await prisma.courses.findMany ({
//     skip: (1 - 1) * 10,
//     take: 10,
//     where: {
//       enrollment: {
//         some: {
//           user_id: Number (user_id),
//         },
//       },
//     },
//   });

//   const totalCount = await prisma.courses.count ({
//     where: {
//       enrollment: {
//         some: {
//           user_id: Number (user_id),
//         },
//       },
//     },
//   });

//   let pagination = getPagination (req, totalCount, 1, 10);

//   if (!result || result.length === 0) {
//     throw new Error (`Course Not Found for user ID ${user_id}`);
//   }

//   return {result, pagination};
// };

const calculateCourseMetrics = async (course, user_id) => {
  const totalDuration = course.chapter.reduce((acc, chapter) => {
    const chapterDuration = chapter.lesson.reduce(
      (lessonAcc, lesson) => lessonAcc + lesson.duration,
      0
    );
    return acc + chapterDuration;
  }, 0);

  const totalLessons = course.chapter.reduce(
    (lessonAcc, chapter) => lessonAcc + chapter.lesson.length,
    0
  );

  const lessonUpdateCount = await prisma.lessonUpdate.count({
    where: {
      user_id: Number(user_id),
      lesson: {
        chapter: {
          course_id: course.id,
        },
      },
    },
  });

  const progress = totalLessons ? parseFloat((lessonUpdateCount / totalLessons * 100).toFixed(1)) : 0;

  return {
    id: course.id,
    name: course.name,
    image: course.image,
    mentor: course.mentor?.[0]?.mentor ?? null,
    category: course.category?.[0]?.category ?? null,
    level: course.level,
    rating: course.rating,
    totalDuration,
    totalLessons,
    progress,
  };
};

const getByEnrollment = async ({ user_id, req }) => {
  const result = await prisma.courses.findMany({
    skip: (1 - 1) * 10,
    take: 10,
    where: {
      enrollment: {
        some: {
          user_id: Number(user_id),
        },
      },
    },
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

  const totalCount = await prisma.courses.count({
    where: {
      enrollment: {
        some: {
          user_id: Number (user_id),
          user_id: Number(user_id),
        },
      },
    },
  });

  let pagination = getPagination(req, totalCount, 1, 10);

  if (!result || result.length === 0) {
    throw new Error(`Course Not Found for user ID ${user_id}`);
  }

  // Use Promise.all directly with map to parallelize processing
  const mappedResult = await Promise.all(
    result.map(course => calculateCourseMetrics(course, user_id))
  );

  return { result: mappedResult, pagination };
};


const getById = async ({id}) => {
  return await prisma.courses.findUnique ({
    where: {
      id: Number (id),
    },
  });
};

module.exports = {search, filter, getByEnrollment, getById};
