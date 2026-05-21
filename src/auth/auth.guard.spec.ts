import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  const jwtServiceMock = {
    verifyAsync: jest.fn(),
  };

  const buildContext = (headers: Record<string, string | undefined>) => {
    const request: { headers: typeof headers; user?: unknown } = { headers };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    return { context, request };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('throws UnauthorizedException when Authorization header is missing', async () => {
    const { context } = buildContext({ authorization: undefined });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    expect(jwtServiceMock.verifyAsync).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedException when scheme is not Bearer', async () => {
    const { context } = buildContext({ authorization: 'Basic some-token' });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    expect(jwtServiceMock.verifyAsync).not.toHaveBeenCalled();
  });

  it('returns true and attaches the payload to request.user on a valid token', async () => {
    const payload = { sub: 1, username: 'leonel' };
    jwtServiceMock.verifyAsync.mockResolvedValue(payload);
    const { context, request } = buildContext({ authorization: 'Bearer valid-token' });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(jwtServiceMock.verifyAsync).toHaveBeenCalledWith('valid-token');
    expect(request.user).toEqual(payload);
  });

  it('throws UnauthorizedException when verifyAsync rejects', async () => {
    jwtServiceMock.verifyAsync.mockRejectedValue(new Error('jwt expired'));
    const { context, request } = buildContext({ authorization: 'Bearer expired-token' });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    expect(request.user).toBeUndefined();
  });
});
