import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import dataSource from '../data-source';
import { User } from '../../user/entities/user.entity';
import { Todo } from '../../todo/entities/todo.entity';

async function seed() {
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const todoRepo = dataSource.getRepository(Todo);

  const existing = await userRepo.count();
  if (existing > 0) {
    console.log(`Seed: ${existing} user(s) already present, skipping.`);
    await dataSource.destroy();
    return;
  }

  const password = await bcrypt.hash('password123', 10);
  const user = await userRepo.save(
    userRepo.create({
      username: 'demo',
      email: 'demo@example.com',
      password,
    }),
  );

  await todoRepo.save([
    todoRepo.create({
      title: 'Buy groceries',
      description: 'Milk, eggs, bread',
      user,
    }),
    todoRepo.create({ title: 'Walk the dog', completed: true, user }),
    todoRepo.create({
      title: 'Write tests',
      description: 'Increase coverage',
      user,
    }),
  ]);

  console.log(
    'Seed: inserted 1 user (demo@example.com / password123) and 3 todos.',
  );
  await dataSource.destroy();
}

seed().catch(async (err) => {
  console.error('Seed failed:', err);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exit(1);
});
