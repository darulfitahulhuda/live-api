const {PrismaClient} = require ('@prisma/client');
const prisma = new PrismaClient ();

const getById = async id => {
  return await prisma.users.findUnique ({where: {id: Number (id)}});
};

module.exports = {getById};
