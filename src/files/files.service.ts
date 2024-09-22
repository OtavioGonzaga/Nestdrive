import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { writeFile } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class FilesService {
	create(file: Express.Multer.File) {
		try {
			return writeFile(
				join(
					'files',
					Date.now().toString() + '.' + (file.mimetype.split('/')[1] || 'bin'),
				),
				file.buffer,
			);
		} catch (error) {
			Logger.error(error);

			throw new BadRequestException();
		}
	}

	findAll() {
		return `This action returns all files`;
	}

	findOne(id: number) {
		return `This action returns a #${id} file`;
	}

	update(id: number, updateFileDto: UpdateFileDto) {
		return `This action updates a #${id} file`;
	}

	remove(id: number) {
		return `This action removes a #${id} file`;
	}
}
