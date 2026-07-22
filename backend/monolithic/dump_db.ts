import { Assessment } from './src/modules/assessment/entities/assessment.entity';
import { AppDataSource } from './src/data-source';

async function run() {
  await AppDataSource.initialize();
  const assessments = await AppDataSource.getRepository(Assessment).find();
  console.log('Assessments:', JSON.stringify(assessments, null, 2));
  process.exit(0);
}
run();
