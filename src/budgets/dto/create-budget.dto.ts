import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, Min } from 'class-validator';
import { TimePeriod } from '../budget.interface';

export class CreateBudgetDto {
  @IsString()
  category: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(TimePeriod)
  timePeriod: TimePeriod;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}



