const { nanoid } = require('nanoid');
const {PrismaClient} = require ('@prisma/client');
const prisma = new PrismaClient ();

const create = async ({card_number, card_name, cvv, expired, user_id}) => {
  const id = `card-${nanoid(16)}`;

  return await prisma.creditCard.create ({
    data: {
      id: id,
      number: card_number,
      name: card_name,
      cvv: cvv,
      expired: new Date(expired),
      user_id: user_id,
    },
  });
};

const getByUserId = async (user_id) => {
  const result = await prisma.creditCard.findUnique ({
    where: {
      user_id: user_id,
    },
  });

  return result;
};

module.exports = {create, getByUserId};
