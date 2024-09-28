import { createReadStream, ReadStream } from 'fs';

export default function filteToBuffer(filePath: string) {
	const readStream = createReadStream(filePath);
	const chunks: Buffer[] = [];

	return new Promise<{ stream: ReadStream; buffer: Buffer }>(
		(resolve, reject) => {
			readStream.on('data', (chunk: Buffer) => chunks.push(chunk));

			readStream.on('error', reject);

			readStream.on('close', () => {
				resolve({
					stream: readStream,
					buffer: Buffer.concat(chunks) as Buffer,
				});
			});
		},
	);
}

