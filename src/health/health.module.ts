import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from 'src/todo/entities/todo.entity';

@Module({
  imports: [TerminusModule, TypeOrmModule.forFeature([Todo])],
  controllers: [HealthController],
})
export class HealthModule {}
