-- CreateEnum
CREATE TYPE "Type" AS ENUM ('isFree', 'isPremium');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('Beginner', 'Intermediate', 'Advanced');

-- CreateEnum
CREATE TYPE "StatusPembayaran" AS ENUM ('belumBayar', 'sudahBayar');

-- CreateEnum
CREATE TYPE "MetodePembayaran" AS ENUM ('bankTransfer', 'creditCard');

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "no_hp" TEXT,
    "foto_profile" TEXT,
    "country" TEXT,
    "city" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Otp" (
    "id" SERIAL NOT NULL,
    "kode_otp" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mentors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Mentors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Courses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "price" INTEGER,
    "level" "Level" NOT NULL,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "type" "Type" NOT NULL DEFAULT 'isFree',
    "image" TEXT,
    "intended_for" TEXT,
    "total_lesson" INTEGER,
    "total_duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorsOnCourses" (
    "mentor_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentorsOnCourses_pkey" PRIMARY KEY ("mentor_id","course_id")
);

-- CreateTable
CREATE TABLE "CategoriesOnCourses" (
    "category_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategoriesOnCourses_pkey" PRIMARY KEY ("category_id","course_id")
);

-- CreateTable
CREATE TABLE "Chapters" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "course_id" INTEGER,

    CONSTRAINT "Chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lessons" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "video" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "is_done" BOOLEAN NOT NULL DEFAULT false,
    "chapter_id" INTEGER NOT NULL,

    CONSTRAINT "Lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollments" (
    "id" SERIAL NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "statusPembayaran" "StatusPembayaran" NOT NULL DEFAULT 'belumBayar',
    "metodePembayaran" "MetodePembayaran" NOT NULL,
    "tanggalBayar" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "course_id_enrollment" INTEGER NOT NULL,

    CONSTRAINT "Enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditCard" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "cvv" INTEGER NOT NULL,
    "expired" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "CreditCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoursePromos" (
    "id" SERIAL NOT NULL,
    "promo_code" TEXT NOT NULL,
    "discount_percentage" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoursePromos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CoursePromosToCourses" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Otp_kode_otp_key" ON "Otp"("kode_otp");

-- CreateIndex
CREATE UNIQUE INDEX "CoursePromos_promo_code_key" ON "CoursePromos"("promo_code");

-- CreateIndex
CREATE UNIQUE INDEX "_CoursePromosToCourses_AB_unique" ON "_CoursePromosToCourses"("A", "B");

-- CreateIndex
CREATE INDEX "_CoursePromosToCourses_B_index" ON "_CoursePromosToCourses"("B");

-- AddForeignKey
ALTER TABLE "Otp" ADD CONSTRAINT "Otp_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorsOnCourses" ADD CONSTRAINT "MentorsOnCourses_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "Mentors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorsOnCourses" ADD CONSTRAINT "MentorsOnCourses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriesOnCourses" ADD CONSTRAINT "CategoriesOnCourses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriesOnCourses" ADD CONSTRAINT "CategoriesOnCourses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapters" ADD CONSTRAINT "Chapters_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lessons" ADD CONSTRAINT "Lessons_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "Chapters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollments" ADD CONSTRAINT "Enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollments" ADD CONSTRAINT "Enrollments_course_id_enrollment_fkey" FOREIGN KEY ("course_id_enrollment") REFERENCES "Courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditCard" ADD CONSTRAINT "CreditCard_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoursePromosToCourses" ADD CONSTRAINT "_CoursePromosToCourses_A_fkey" FOREIGN KEY ("A") REFERENCES "CoursePromos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoursePromosToCourses" ADD CONSTRAINT "_CoursePromosToCourses_B_fkey" FOREIGN KEY ("B") REFERENCES "Courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
