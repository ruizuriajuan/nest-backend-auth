import { Exclude, Expose } from "class-transformer";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    name: string;

    @MinLength(6)
    password: string;

}

export class UserResponseDto {
    @Expose()
    name: string;
  
    @Expose()
    email: string;
  
    @Exclude()
    password: string;
  
    constructor(partial: Partial<UserResponseDto>) {
      Object.assign(this, partial);
    }
  }