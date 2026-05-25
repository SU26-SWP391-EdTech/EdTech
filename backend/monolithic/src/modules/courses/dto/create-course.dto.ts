import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCourseDto {
  @IsNotEmpty({ message: 'Tên khóa học không được để trống' })
  @IsString()
  title!: string;

  @IsNotEmpty({ message: 'ID của tổ chức (organizationId) không được để trống' })
  @IsNumber()
  organizationId!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  projectUrl?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;
}
