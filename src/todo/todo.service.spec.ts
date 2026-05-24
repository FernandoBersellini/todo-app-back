import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TodoService } from './todo.service';
import { Todo } from './entities/todo.entity';
import { User } from '../user/entities/user.entity';

describe('TodoService', () => {
  let service: TodoService;

  const todoRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const userRepositoryMock = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        { provide: getRepositoryToken(Todo), useValue: todoRepositoryMock },
        { provide: getRepositoryToken(User), useValue: userRepositoryMock },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should not create a todo without a user', async () => {
    const todo = { title: 'Test Todo', userId: 1 };

    userRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.create(todo)).rejects.toThrow('User not found');
  });
});
