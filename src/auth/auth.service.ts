import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, UserResponseDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { loginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './Interfaces/jwt.payload.interface';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService
  ) { }

  async create(createAuthDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const { password, ...datosUsuario } = createAuthDto;
      const nuevo = new this.userModel({
        password: bcryptjs.hashSync(password, 10),
        ...datosUsuario
      });
      await nuevo.save();
      return plainToInstance(UserResponseDto, nuevo.toObject());

    } catch (error) {
      if (error.code == 11000) {
        throw new BadRequestException(`${createAuthDto.email} ya existe`)
      }
      throw new InternalServerErrorException('Error al crear usuario');
    }
  }

  /** Devuelve el User{} y el Token */
  async login(loginDto: loginDto) {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas : email')
    }

    if (!bcryptjs.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credenciales invalidas : password')
    }

    const { password: _renombrando, ...data } = user.toJSON();
    return {
      user: data,
      token: this.getToken({ id: user.id })
    }

  }

  async findUserById(id: string) {
    const user = await this.userModel.findById(id);
    const { password, ...resto } = user.toJSON();
    return resto;
  }

  getToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
