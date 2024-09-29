export class UserResponse {
	id: string;
	username: string;
	email: string;
	emailVerified: boolean;
	attributes: { name: string[] };
	createdTimestamp: number;
	enabled: boolean;
	totp: boolean;
	disableableCredentialTypes: string[];
	requiredActions: string[];
	notBefore: number;
	access: {
		manageGroupMembership: boolean;
		view: boolean;
		mapRoles: boolean;
		impersonate: boolean;
		manage: boolean;
	};
}
