import { IsNumber, IsString, IsEnum, IsDateString, Min, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  category: string;

  @IsDateString()
  date: string;

  @IsEnum(['income', 'expense'])
  type: 'income' | 'expense';

  @IsOptional()
  @IsString()
  description?: string;
}

