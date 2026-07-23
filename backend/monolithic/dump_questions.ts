import { AppDataSource } from './src/data-source';
import { Question } from './src/modules/question/entities/question.entity';
import { Assessment } from './src/modules/assessment/entities/assessment.entity';
import { Course } from './src/modules/courses/entities/course.entity';

async function run() {
  await AppDataSource.initialize();
  const assessments = await AppDataSource.getRepository(Assessment).find({ relations: ['questions', 'questions.options'] });
  console.log('Assessments:', JSON.stringify(assessments, null, 2));
  process.exit(0);
}
run();
