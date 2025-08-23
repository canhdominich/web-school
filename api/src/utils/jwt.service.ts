/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity';

@Injectable()
export class JwtService {
  constructor(private readonly jwtService: NestJwtService) {}

  generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      facultyId: user.facultyId,
      departmentId: user.departmentId,
      majorId: user.majorId,
      roles: user.userRoles?.map((ur: any) => ur.role.name) || [],
    };
    return this.jwtService.sign(payload);
  }

  verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch {
      return null;
    }
  }

  decodeToken(token: string): any {
    return this.jwtService.decode(token);
  }
}
