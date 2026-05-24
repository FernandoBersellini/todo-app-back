import { Injectable } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo) private todoRepository: Repository<Todo>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}
  async create(createTodoDto: CreateTodoDto) {
    const user = await this.userRepository.findOne({
      where: { id: createTodoDto.userId },
    });
    if (!user) {
      throw new Error('User not found');
    }
    const todo = this.todoRepository.create(createTodoDto);
    todo.user = user;
    return await this.todoRepository.save(todo);
  }

  async findAll() {
    return await this.todoRepository.find();
  }

  async findOne(id: number) {
    return await this.todoRepository.findOne({ where: { id } });
  }

  async findByUserId(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    return await this.todoRepository.find({ where: { user: { id: userId } } });
  }

  async update(id: number, updateTodoDto: UpdateTodoDto) {
    return await this.todoRepository.update(id, updateTodoDto);
  }

  async remove(id: number) {
    return await this.todoRepository.delete(id);
  }
}
