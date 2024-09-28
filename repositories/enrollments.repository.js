const {PrismaClient} = require ('@prisma/client');
const prisma = new PrismaClient ();

const create = async ({price, metode_pembayaran, user_id, course_id}) => {
  const result = await prisma.enrollments.create ({
    data: {
      price: Number(price),
      metodePembayaran: metode_pembayaran,
      statusPembayaran: 'sudahBayar',
      user_id: user_id,
      course_id_enrollment: Number(course_id),
    },
  });

  return result;
};

module.exports = {create};