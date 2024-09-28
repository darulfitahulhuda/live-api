const courseRepository = require ('../repositories/courses.repository');
const creditCardRepository = require ('../repositories/creditCards.repotirory');
const enrollmentRepository = require ('../repositories/enrollments.repository');

const create = async ({
  user_id,
  course_id,
  metode_pembayaran = 'creditCard',
  card_number,
  card_name,
  cvv,
  expired,
}) => {
  user_id = Number(user_id);
  const course = await courseRepository.getById ({id: course_id});

  if (course.type === 'isPremium' || 'isFree') {
    if (metode_pembayaran === 'creditCard') {
      const creditCard = await creditCardRepository.create ({
        card_number,
        card_name,
        cvv,
        expired,
        user_id,
      });
      const price = Number (course.price) + Number (course.price) * 0.11;

      const enrollment = await enrollmentRepository.create ({
        price,
        metode_pembayaran,
        user_id,
        course_id,
      });

      return {
        id: enrollment.id,
        price: enrollment.price,
        metode_pembayaran: enrollment.metodePembayaran,
        status_pembayaran: enrollment.statusPembayaran,
        course: {
          id: course.id,
          name: course.name,
        },
        creditCard: {
          id: creditCard.id,
          number: creditCard.number,
          name: creditCard.name,
          cvv: creditCard.cvv,
          expired: creditCard.expired,
        },
      };
    }
  }
};

const getAll = async () => {};

module.exports = {create};