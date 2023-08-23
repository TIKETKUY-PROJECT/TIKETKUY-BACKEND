import { ApiProperty } from '@nestjs/swagger';

export class CommonResponse {
  @ApiProperty({
    description: 'the response data',
  })
  data: any;

  @ApiProperty({
    description: 'the response message',
  })
  message: any;
}
