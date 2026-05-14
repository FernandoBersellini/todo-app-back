import { Injectable } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TodoService {
  constructor(@InjectRepository(Todo) private todoRepository: Repository<Todo>) { }
  async create(createTodoDto: CreateTodoDto) {
    return await this.todoRepository.save(createTodoDto);
  }

  async findAll() {
    return await this.todoRepository.find();
  }

  async findOne(id: number) {
    return await this.todoRepository.findOne({ where: { id } });
  }

  async update(id: number, updateTodoDto: UpdateTodoDto) {
    return await this.todoRepository.update(id, updateTodoDto);
  }

  async remove(id: number) {
    return await this.todoRepository.delete(id);
  }
}
