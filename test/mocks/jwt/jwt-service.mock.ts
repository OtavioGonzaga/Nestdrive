import { JwtService } from '@nestjs/jwt';

export const JwtServiceMock = {
	provide: JwtService,
	useValue: {
		decode: jest
			.fn()
			.mockResolvedValue({ sub: 'ce17ebf4-abb6-4ad7-b6dd-5170287f861a' }),
	},
};
