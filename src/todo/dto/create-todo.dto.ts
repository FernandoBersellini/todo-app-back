import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateTodoDto {
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsOptional()
    userId?: number;
}
