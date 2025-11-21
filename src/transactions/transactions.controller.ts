import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('transactions')
@Controller('transactions')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @GetUser() user: { userId: string; email: string },
  ) {
    return this.transactionsService.create(createTransactionDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions with optional filters' })
  @ApiQuery({ name: 'type', required: false, enum: ['income', 'expense'] })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of transactions' })
  findAll(
    @Query('type') type?: 'income' | 'expense',
    @Query('category') category?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
    @GetUser() user?: { userId: string; email: string },
  ) {
    return this.transactionsService.findAll({
      type,
      category,
      startDate,
      endDate,
      search,
    }, user?.userId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get financial summary and statistics' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: ['income', 'expense'] })
  @ApiResponse({ status: 200, description: 'Financial summary' })
  getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: 'income' | 'expense',
    @GetUser() user?: { userId: string; email: string },
  ) {
    return this.transactionsService.getSummary({
      startDate,
      endDate,
      type,
    }, user?.userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @GetUser() user?: { userId: string; email: string },
  ) {
    return this.transactionsService.findOne(id, user?.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @GetUser() user?: { userId: string; email: string },
  ) {
    return this.transactionsService.update(id, updateTransactionDto, user?.userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetUser() user?: { userId: string; email: string },
  ) {
    this.transactionsService.remove(id, user?.userId);
    return { message: 'Transaction deleted successfully' };
  }
}

