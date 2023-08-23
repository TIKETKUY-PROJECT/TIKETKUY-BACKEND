import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Dummy')
@Controller('api/v1')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOkResponse({ description: 'hello world' })
  getHello(): string {
    return this.appService.getHello();
  }
}
