import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
	constructor(private readonly filesService: FilesService) {}

	@Post()
	create(@Body() createFileDto: CreateFileDto) {
		return this.filesService.create(createFileDto);
	}

	@Get()
	findAll() {
		return this.filesService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.filesService.findOne(+id);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.filesService.remove(+id);
	}
}
