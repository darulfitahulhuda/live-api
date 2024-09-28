const enrollmentService = require ('./../services/enrollments.service');
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();


const create = async (req, res, next) => {
  try {

    const enrollmentExist = await prisma.enrollments.findFirst({
      where: {user_id: req.user.id, course_id_enrollment: Number(req.params.course_id)},
    });
    if(enrollmentExist){
      return res.status(400).json({
        status: false,
        message: 'Bad Request',
        err: 'This Course has been buyed',
        data: null
      });
    }

    const payload = {
      ...req.body,
      course_id: req.params.course_id,
      user_id: req.user.id
    }
    const result = await enrollmentService.create (payload);

    await prisma.notifications.create({
      data: {
        type: 'Transactions',
        title: 'Berhasil Membeli Kelas!',
        body: 'Kamu berhasil membeli kelas, jika kamu punya pertanyaan seputar materi course, segera kontak kami lewat email yaa!',
        expiredAt: '2024-01-01T07:00:00.048Z',
        user_id: req.user.id
      }
    });

    res.status (200).json ({
      status: 'success',
      message: 'success',
      data: result,
    });
  } catch (error) {
    next (error);
  }
};

module.exports = {create};
