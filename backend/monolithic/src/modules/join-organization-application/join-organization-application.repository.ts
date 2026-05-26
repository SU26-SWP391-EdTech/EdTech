import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JoinOrganizationApplication } from './entities/join-organization-application.entity';
import { JoinOrganizationApplicationStatus } from 'src/common/enums/join-organization-application.enum';
import { OrganizationMemberProfile } from '../organization-member-profiles/entities/organization-member-profile.entity';

export class JoinOrganizationApplicationRepository {
  constructor(
    @InjectRepository(JoinOrganizationApplication)
    private readonly repo: Repository<JoinOrganizationApplication>,
  ) {}

  public async findAll(): Promise<JoinOrganizationApplication[]> {
    return this.repo
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.user', 'user')
      .leftJoinAndSelect('app.organization', 'organization')
      .leftJoinAndSelect('app.reviewedBy', 'reviewedBy')
      .getMany();
  }

  public async findByUserId(userId: number): Promise<JoinOrganizationApplication[]> {
    return this.repo
      .createQueryBuilder('app')
      .where('app.userId = :userId', { userId })
      .leftJoinAndSelect('app.user', 'user')
      .leftJoinAndSelect('app.organization', 'organization')
      .leftJoinAndSelect('app.reviewedBy', 'reviewedBy')
      .getMany();
  }

  public async findByOrganizationMemberProfile(userId: number): Promise<JoinOrganizationApplication[]> {
    return this.repo
      .createQueryBuilder('app')
      .innerJoin(
        OrganizationMemberProfile,
        'omp',
        'omp.organizationId = app.organizationId',
      )
      .where('omp.userId = :userId', { userId })
      .leftJoinAndSelect('app.user', 'user')
      .leftJoinAndSelect('app.organization', 'organization')
      .leftJoinAndSelect('app.reviewedBy', 'reviewedBy')
      .getMany();
  }

  public async findByOrganizationId(organizationId: number): Promise<JoinOrganizationApplication[]> {
    return this.repo
      .createQueryBuilder('app')
      .where('app.organizationId = :organizationId', { organizationId })
      .leftJoinAndSelect('app.user', 'user')
      .leftJoinAndSelect('app.organization', 'organization')
      .leftJoinAndSelect('app.reviewedBy', 'reviewedBy')
      .getMany();
  }

  public async findByUserAndOrganization(
    userId: number,
    organizationId: number,
    status?: JoinOrganizationApplicationStatus,
  ): Promise<JoinOrganizationApplication | null> {
    const query = this.repo.createQueryBuilder('app')
      .where('app.userId = :userId', { userId })
      .andWhere('app.organizationId = :organizationId', { organizationId });

    if (status) {
      query.andWhere('app.status = :status', { status });
    }

    return query.getOne();
  }

  public async findById(applicationId: number): Promise<JoinOrganizationApplication | null> {
    return this.repo.findOne({
      where: { cpApplicationId: applicationId },
      relations: {
        user: true,
        organization: true,
        reviewedBy: true,
      },
    });
  }

  public async createApplication(applicationData: Partial<JoinOrganizationApplication>) {
    const application = this.repo.create(applicationData);
    return this.repo.save(application);
  }

  public async save(application: JoinOrganizationApplication) {
    return await this.repo.save(application);
  }
}
