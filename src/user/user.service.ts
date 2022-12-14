import { Injectable,NotFoundException,HttpException,HttpStatus} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {Model} from 'mongoose';
import { RegisterDto } from './register.dto';
import { User } from 'src/types/user';
import * as bcrypt  from 'bcrypt';


@Injectable()
export class UserService {
  constructor (
    @InjectModel('User') private readonly userModel:Model<User>){}
   
  async newUser(RegisterDto:RegisterDto) { 
    const {username} = RegisterDto;
    const user = await this.userModel.findOne({username});
    if (user) {
       throw new HttpException('user already exist',HttpStatus.BAD_REQUEST)
    }
    const newUser = new this.userModel(RegisterDto);
    await newUser.save()
    return  this.sanitizeUser(newUser);
  }  

  async findByLogin(RegisterDTO: RegisterDto) {
    const { username, password } = RegisterDTO;
    const user = await this.userModel.findOne({ username});
    if (!user) {
      throw new HttpException('user doesnt exists', HttpStatus.BAD_REQUEST);
    }
    const passwordValid = await bcrypt.compareSync(password,user.password); 
    if (passwordValid){
      return user
    } else {
      throw new HttpException('invalid credential', HttpStatus.BAD_REQUEST);
    }
  }

  async findAll() {
    const users = await this.userModel.find({}).exec()
    users.map(user => {
      return this.sanitizeUser(user);
    })
  }

 async  findOne(username:string) {
    const user = await this.userModel.findOne({username:username});
    return user;
  }

  sanitizeUser(user: User) {
    const sanitized = user;
    delete sanitized.password;
    return sanitized;
  }
}