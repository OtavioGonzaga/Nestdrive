import {
	Controller,
	FileTypeValidator,
	MaxFileSizeValidator,
	ParseFilePipe,
	Post,
	UploadedFile,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common';
import {
	FileFieldsInterceptor,
	FileInterceptor,
} from '@nestjs/platform-express';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
	constructor(private readonly filesService: FilesService) {}

	@Post()
	@UseInterceptors(FileInterceptor('file'))
	create(
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new FileTypeValidator({ fileType: 'image/*' }),
					new MaxFileSizeValidator({ maxSize: 11 * 1024 }),
				],
			}),
		)
		file: Express.Multer.File,
	): Promise<void> {
		return this.filesService.create(file);
	}
	@Post('many')
	@UseInterceptors(FileInterceptor('files'))
	createMany(
		@UploadedFiles() files: Express.Multer.File[],
	): Express.Multer.File[] {
		return files;
	}

	@Post('fields')
	@UseInterceptors(
		FileFieldsInterceptor([
			{
				name: 'photo',
				maxCount: 1,
			},
			{
				name: 'documents',
				maxCount: 10,
			},
		]),
	)
	createManyByFields(
		@UploadedFiles()
		files: {
			photo: Express.Multer.File[];
			documents: Express.Multer.File[];
		},
	): string[] {
		return [files.documents[0].mimetype, files.photo[0].mimetype];
	}
}
