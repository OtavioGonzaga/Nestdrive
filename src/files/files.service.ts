import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { writeFile } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class FilesService {
	create(file: Express.Multer.File): Promise<void> {
		try {
			console.log('creating file');
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
}
