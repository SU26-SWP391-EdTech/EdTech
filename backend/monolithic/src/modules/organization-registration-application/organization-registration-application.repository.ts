import { Repository } from 'typeorm';
import { OrganizationRegistrationApplication } from './entities/organization-registration-application.entity';
import { InjectRepository } from '@nestjs/typeorm';

export class OrganizationRegistrationApplicationRepository {
  constructor(
    @InjectRepository(OrganizationRegistrationApplication)
    private readonly repo: Repository<OrganizationRegistrationApplication>,
  ) {}

  public async getAllOrganizationRegistrationApplications() {
    return this.repo.find();
  }

  public async createApplication( data: Partial<OrganizationRegistrationApplication>): Promise<OrganizationRegistrationApplication> {
    const application = this.repo.create(data);
    return await this.repo.save(application);
  }

  public async findByOrgEmail( orgEmail: string): Promise<OrganizationRegistrationApplication | null> {
    return await this.repo.findOne({
      where: {
        orgEmail,
      },
    });
  }

  public async findByTaxCode(taxCode: string): Promise<OrganizationRegistrationApplication | null> {
    return await this.repo.findOne({
      where: {
        taxCode,
      },
    });
  }

  public async findByPhone(phone: string): Promise<OrganizationRegistrationApplication | null> {
    return await this.repo.findOne({
      where: {
        phone,
      },
    });
  }

  public async findById(applicationId: number): Promise<OrganizationRegistrationApplication | null> {
    return this.repo.findOne({
      where: {
        applicationId,
      },
      relations: {
        requesterUser: true,
        reviewedBy: true,
      },
    });
  }

  public async save(application: OrganizationRegistrationApplication) {
    return await this.repo.save(application);
  }
}
