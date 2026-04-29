import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { CreateReportDto } from './reports.dto';

@Injectable()
export class ReportsService {
  createReport(user: AuthenticatedUser, dto: CreateReportDto) {
    return {
      id: 'pending-persistence',
      reporterId: user.id,
      status: 'open',
      ...dto,
    };
  }
}