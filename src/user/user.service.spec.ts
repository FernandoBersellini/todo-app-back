import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
const bcryptHashSpy = bcrypt.hash as jest.Mock;

describe('UserService', () => {
  let service: UserService;

  const userRepositoryMock = {
    findOneBy: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: userRepositoryMock },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jest.clearAllMocks()
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should not create a duplicated user', async () => {
    userRepositoryMock.findOneBy.mockResolvedValue({ id: 1, email: 'email', username: 'username', password: 'password' })

    await expect(service.create({ email: 'Leonel91@hotmail.com', password: 'password' })).rejects.toThrow('User already exists');
  });
});
