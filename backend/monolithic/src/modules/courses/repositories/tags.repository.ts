import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CourseStatus } from 'src/common/enums/course.enum';
import { Course } from '../entities/course.entity';
import { CourseTag } from '../entities/course-tag.entity';
import { Tag } from '../entities/tag.entity';

@Injectable()
export class TagsRepository extends Repository<Tag> {
  constructor(private dataSource: DataSource) {
    super(Tag, dataSource.createEntityManager());
  }

  public async findAllTags(): Promise<Tag[]> {
    return this.createQueryBuilder('tag')
      .select(['tag.tagId', 'tag.name'])
      .orderBy('LOWER(tag.name)', 'ASC')
      .getMany();
  }

  public async searchTags(keyword: string): Promise<Tag[]> {
    return this.createQueryBuilder('tag')
      .select(['tag.tagId', 'tag.name'])
      .where('LOWER(tag.name) LIKE LOWER(:keyword)', {
        keyword: `%${keyword}%`,
      })
      .orderBy('LOWER(tag.name)', 'ASC')
      .getMany();
  }

  public async findByNameInsensitive(
    name: string,
    manager?: EntityManager,
  ): Promise<Tag | null> {
    const repository = manager ? manager.getRepository(Tag) : this;

    return repository
      .createQueryBuilder('tag')
      .where('LOWER(tag.name) = LOWER(:name)', { name })
      .getOne();
  }

  public async findByNamesInsensitive(
    names: string[],
    manager: EntityManager,
  ): Promise<Tag[]> {
    if (names.length === 0) {
      return [];
    }

    return manager
      .getRepository(Tag)
      .createQueryBuilder('tag')
      .where('LOWER(tag.name) IN (:...names)', {
        names: names.map((name) => name.toLowerCase()),
      })
      .getMany();
  }

  public async browseApprovedCoursesByTag(
    tagId: number,
    page: number,
    limit: number,
  ): Promise<{ data: Course[]; total: number }> {
    const queryBuilder = this.dataSource
      .getRepository(Course)
      .createQueryBuilder('course')
      .innerJoin(CourseTag, 'courseTag', 'courseTag.courseId = course.courseId')
      .leftJoin('course.user', 'user')
      .addSelect(['user.userId', 'user.fullName', 'user.avatar'])
      .leftJoinAndSelect('course.courseTag', 'allCourseTags')
      .leftJoinAndSelect('allCourseTags.tag', 'tag')
      .where('courseTag.tagId = :tagId', { tagId })
      .andWhere('course.status = :status', { status: CourseStatus.APPROVED })
      .orderBy('course.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }
}
