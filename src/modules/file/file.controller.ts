import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { FileService } from './file.service'

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload/large-file')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      dest: 'uploads',
    }),
  )
  uploadLargeFile(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body,
  ) {
    console.log('Body:', body)
    console.log('Files:', files)
  }
}
