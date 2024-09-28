-- CreateTable
CREATE TABLE "LessonUpdate" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "lesson_id" INTEGER NOT NULL,

    CONSTRAINT "LessonUpdate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LessonUpdate" ADD CONSTRAINT "LessonUpdate_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonUpdate" ADD CONSTRAINT "LessonUpdate_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "Lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
