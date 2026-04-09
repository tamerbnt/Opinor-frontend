import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  Min,
  Max,
  IsInt,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  FeedbackCategory,
  VisitReason,
  FirstVisitStatus,
  WillReturnStatus,
} from '../../../database/entities/enums';
import { Type } from 'class-transformer';

export class CreateFeedbackDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Great service!' })
  @IsString()
  @IsNotEmpty()
  comment: string;

  @ApiProperty({ enum: FeedbackCategory, example: 'service' })
  @IsEnum(FeedbackCategory)
  category: FeedbackCategory;

  @ApiProperty({ enum: VisitReason, example: 'simple_dinner' })
  @IsEnum(VisitReason)
  visitReason: VisitReason;

  @ApiProperty({ enum: FirstVisitStatus, example: 'yes' })
  @IsEnum(FirstVisitStatus)
  isFirstVisit: FirstVisitStatus;

  @ApiProperty({ enum: WillReturnStatus, example: 'definitely' })
  @IsEnum(WillReturnStatus)
  willReturn: WillReturnStatus;

  @ApiProperty({ type: [String], example: ['friendly', 'quick'] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiPropertyOptional({ example: 'New York, NY' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['https://example.com/image1.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
