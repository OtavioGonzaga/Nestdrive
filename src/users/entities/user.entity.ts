import { KeycloakRoles } from '@common/enums/keycloak-roles.enum';
import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
	@PrimaryGeneratedColumn('uuid', { name: 'id' })
	id: string;

	@Column({ name: 'keycloak_id', type: 'uuid' })
	keycloakId: string;

	@Column({ name: 'username', type: 'varchar' })
	username: string;

	@Column({ name: 'name', type: 'varchar' })
	name: string;

	@Column({ name: 'email', type: 'varchar', unique: true })
	email: string;

	@Column({ name: 'role', type: 'enum', enum: KeycloakRoles })
	role: KeycloakRoles;

	@CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
	updatedAt: Date;
}
