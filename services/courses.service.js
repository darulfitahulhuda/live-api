const courseRepository = require ('./../repositories/courses.repository');

const getByEnrollment = async (payload) => {
  return courseRepository.getByEnrollment (payload);
};

module.exports = {getByEnrollment};
