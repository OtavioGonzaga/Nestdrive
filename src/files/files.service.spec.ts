import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FilesService } from './files.service';
import { getFile } from 'test/mocks/files/get-file.mock';
describe('FilesService', () => {
	let service: FilesService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [FilesService],
		}).compile();

		service = module.get<FilesService>(FilesService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('Upload', () => {
		it('should upload files', async () => {
			service.create(await getFile());
		});
	});
});
