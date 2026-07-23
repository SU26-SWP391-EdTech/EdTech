import { AppDataSource } from './src/data-source';
import { QuestionOption } from './src/modules/question/entities/question-option.entity';

async function run() {
  await AppDataSource.initialize();
  const options = await AppDataSource.getRepository(QuestionOption).find({ take: 20 });
  console.log('Options:', JSON.stringify(options, null, 2));
  process.exit(0);
}
run();
