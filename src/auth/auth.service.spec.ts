import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';

jest.mock('bcrypt');
const bcryptCompare = bcrypt.compare as jest.Mock;

describe('AuthService', () => {
  let service: AuthService;

  const userServiceMock = {
    findOneByEmail: jest.fn(),
  };

  const jwtServiceMock = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should sign in a user with valid credentials', async () => {
    userServiceMock.findOneByEmail.mockResolvedValue({
      id: 1,
      email: 'email',
      username: 'username',
      password: 'password',
    });
    bcryptCompare.mockResolvedValue(true);
    jwtServiceMock.signAsync.mockResolvedValue('fake-jwt-token');

    const result = await service.signIn('email', 'password');

    expect(result).toEqual({
      access_token: 'fake-jwt-token',
      userId: 1,
      email: 'email',
    });
  });

  it('should not enter with unknown email', async () => {
    userServiceMock.findOneByEmail.mockResolvedValue(null);

    await expect(service.signIn('unknown@hotmail.com', 'unknown')).rejects.toThrow(
      'Invalid credentials',
    );
  });

  it('should not enter with wrong password', async () => {
    userServiceMock.findOneByEmail.mockResolvedValue({
      id: 1,
      email: 'email',
      username: 'username',
      password: 'wrong-password',
    });
    bcryptCompare.mockResolvedValue(false);

    await expect(
      service.signIn('email', 'wrong-password'),
    ).rejects.toThrow('Invalid credentials');
  });
});
