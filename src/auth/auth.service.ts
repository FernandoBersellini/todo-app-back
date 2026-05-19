import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}
    
    async signIn(email: string, password: string): Promise<{ access_token: string, userId: number, email: string }> {
        const user = await this.userService.findOneByEmail(email);
        if (user?.password !== password) {
            throw new Error('Invalid credentials');
        }

        const payload = { username: user.username, sub: user.id };
        
        return {
            access_token: await this.jwtService.signAsync(payload),
            userId: user.id,
            email: user.email,
        };
    }
}

