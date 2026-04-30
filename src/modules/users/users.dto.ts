import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { UserRole } from '@prisma/client';

const userRoles: UserRole[] = ['reader', 'publisher', 'moderator', 'editor', 'admin'];

export class ListUsersQueryDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(200)
  limit = 100;
}

export class UpdateUserRoleDto {
  @IsIn(userRoles)
  role!: UserRole;
}

export class InviteUserDto extends UpdateUserRoleDto {
  @IsEmail()
  email!: string;
}