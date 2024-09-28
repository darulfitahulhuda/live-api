const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedData() {
  const users = await prisma.users.createMany({
    data: [
      {
        name: 'Budi Setiawan',
        email: 'budi@example.com',
        password: 'budi123',
        no_hp: '+6281234567890',
        foto_profile: 'budi.jpg',
        country: 'Indonesia',
        city: 'Jakarta',
        is_active: true,
      },
      {
        name: 'Dewi Sulastri',
        email: 'dewi@example.com',
        password: 'dewi456',
        no_hp: '+6289876543210',
        foto_profile: 'dewi.jpg',
        country: 'Indonesia',
        city: 'Surabaya',
        is_active: true,
      },
      {
        name: 'Eko Prasetyo',
        email: 'eko@example.com',
        password: 'eko789',
        no_hp: '+6282345678901',
        foto_profile: 'eko.jpg',
        country: 'Indonesia',
        city: 'Bandung',
        is_active: true,
      },
      {
        name: 'Fitriani Sari',
        email: 'fitri@example.com',
        password: 'fitri123',
        no_hp: '+6283456789012',
        foto_profile: 'fitri.jpg',
        country: 'Indonesia',
        city: 'Yogyakarta',
        is_active: true,
      },
      {
        name: 'Guntur Wicaksono',
        email: 'guntur@example.com',
        password: 'guntur456',
        no_hp: '+6284567890123',
        foto_profile: 'guntur.jpg',
        country: 'Indonesia',
        city: 'Semarang',
        is_active: true,
      },
    ],
  });

  const categories = await prisma.categories.createMany({
    data: [
      { name: 'Programming', image: 'programming.jpg' },
      { name: 'Design', image: 'design.jpg' },
      { name: 'Business', image: 'business.jpg' },
      { name: 'Language', image: 'language.jpg' },
      { name: 'Science', image: 'science.jpg' },
    ],
  });

  const mentors = await prisma.mentors.createMany({
    data: [
      { name: 'Mentor A' },
      { name: 'Mentor B' },
      { name: 'Mentor C' },
      { name: 'Mentor D' },
      { name: 'Mentor E' },
    ],
  });

  const coursePromos = await prisma.coursePromos.createMany({
    data: [
      {
        promo_code: 'CODE1',
        discount_percentage: 10,
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      {
        promo_code: 'CODE2',
        discount_percentage: 15,
        start_date: new Date(),
        end_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      },
      {
        promo_code: 'CODE3',
        discount_percentage: 20,
        start_date: new Date(),
        end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      },
      {
        promo_code: 'CODE4',
        discount_percentage: 12,
        start_date: new Date(),
        end_date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), // 40 days from now
      },
      {
        promo_code: 'CODE5',
        discount_percentage: 18,
        start_date: new Date(),
        end_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
      },
    ],
  });

  const courses = await prisma.courses.createMany({
    data: [
      {
        name: 'Web Development Basics',
        desc: 'Learn the fundamentals of web development',
        price: 200000,
        level: 'Beginner',
        type: 'isPremium',
        image: 'web_dev.jpg',
        total_duration: 30,
      },
      {
        name: 'Graphic Design Essentials',
        desc: 'Master the essentials of graphic design',
        price: 300000,
        level: 'Intermediate',
        type: 'isPremium',
        image: 'graphic_design.jpg',
        total_duration: 45,
      },
      {
        name: 'Business Strategy 101',
        desc: 'Develop effective business strategies',
        price: 100000,
        level: 'Advanced',
        type: 'isPremium',
        image: 'business_strategy.jpg',
        total_duration: 60,
      },
      {
        name: 'Indonesian Language Mastery',
        desc: 'Master the Indonesian language skills',
        price: 200000,
        level: 'Intermediate',
        type: 'isPremium',
        image: 'indonesian_language.jpg',
        total_duration: 40,
      },
      {
        name: 'Introduction to Science',
        desc: 'Explore the wonders of science',
        price: 150000,
        level: 'Beginner',
        type: 'isPremium',
        image: 'science_intro.jpg',
        total_duration: 35,
      },
    ],
  });

  const chapters = await prisma.chapters.createMany({
    data: [
      {
        name: 'Chapter 1 - Introduction',
        course_id: 1
      },
      {
        name: 'Chapter 2 - Basics of Programming',
        course_id: 2
      },
      {
        name: 'Chapter 3 - Advanced Topics',
        course_id: 3
      },
      {
        name: 'Chapter 4 - Project Development',
        course_id: 4 
      },
      {
        name: 'Chapter 5 - Final Project',
        course_id: 5
      },
    ],
  });

  const lessons = await prisma.lessons.createMany({
    data: [
      {
        name: 'Lesson 1 - Course Introduction',
        video: 'lesson1.mp4',
        desc: 'Introduction to the course',
        duration: 60,
        chapter_id: 1
      },
      {
        name: 'Lesson 2 - Basic Concepts',
        video: 'lesson2.mp4',
        desc: 'Getting started with the basics',
        duration: 60,
        chapter_id: 2
      },
      {
        name: 'Lesson 3 - Advanced Programming',
        video: 'lesson3.mp4',
        desc: 'Exploring advanced programming topics',
        duration: 60,
        chapter_id: 3
      },
      {
        name: 'Lesson 4 - Building Projects',
        video: 'lesson4.mp4',
        desc: 'Learn to build real-world projects',
        duration: 60,
        chapter_id: 4
      },
      {
        name: 'Lesson 5 - Final Project Guidelines',
        video: 'lesson5.mp4',
        desc: 'Guidelines for the final project',
        duration: 60,
        chapter_id: 5
      },
    ],
  });

  console.log('Seed data created successfully');
}

seedData()
  .catch((error) => {
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
