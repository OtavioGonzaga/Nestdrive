import filteToBuffer from '@utils/file-to-buffer';

export async function getFile(): Promise<Express.Multer.File> {
	const { buffer, stream } = await filteToBuffer('README.md');

	return {
		fieldname: 'README',
		originalname: 'README.md',
		encoding: '7bit',
		mimetype: 'text/markdown',
		size: 1024 * 50,
		stream,
		destination: '',
		filename: 'README',
		path: 'README',
		buffer,
	};
}
