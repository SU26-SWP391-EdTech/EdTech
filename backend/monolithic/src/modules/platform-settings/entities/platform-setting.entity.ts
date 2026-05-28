import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('platform_settings')
export class PlatformSetting {
    @PrimaryGeneratedColumn({ name: 'setting_id' })
    settingId!: number;

    @Column({ name: 'platform_name'})
    platformName!: string;

    @Column({ name: 'platform_email', unique: true })
    platformEmail!: string;

    @Column({ name: 'logo_url', nullable: true })
    logoUrl!: string;

    @Column({ name: 'banner_url', nullable: true })
    bannerUrl!: string;

    @Column({ name: 'description', nullable: true })
    description!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    
}