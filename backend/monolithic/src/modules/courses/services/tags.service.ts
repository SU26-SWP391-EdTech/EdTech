import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Course } from '../entities/course.entity';
import { CourseTag } from '../entities/course-tag.entity';
import { Tag } from '../entities/tag.entity';
import {
  BrowseCoursesByTagDto,
  CreateTagDto,
} from '../dto/course-tags.dto';
import { TagsRepository } from '../repositories/tags.repository';

@Injectable()
export class TagsService {
  constructor(
    private readonly tagsRepository: TagsRepository,
    private readonly dataSource: DataSource,
  ) {}

  public normalizeTags(tags: string[] = []): string[] {
    if (tags.length > 10) {
      throw new BadRequestException('Maximum 10 tags per course');
    }

    const normalizedTags: string[] = [];
    const seenTags = new Set<string>();

    for (const tag of tags) {
      const normalizedTag = tag.trim();

      if (!normalizedTag) {
        throw new BadRequestException('Tag must not be empty');
      }

      if (normalizedTag.length > 30) {
        throw new BadRequestException('Tag must not exceed 30 characters');
      }

      const key = normalizedTag.toLowerCase();
      if (seenTags.has(key)) {
        continue;
      }

      seenTags.add(key);
      normalizedTags.push(normalizedTag);
    }

    return normalizedTags;
  }

  public async findAll() {
    const tags = await this.tagsRepository.findAllTags();
    return tags.map((tag) => ({
      tagId: tag.tagId,
      name: tag.name,
    }));
  }

  public async search(keyword = '') {
    const tags = await this.tagsRepository.searchTags(keyword.trim());
    return tags.map((tag) => ({
      tagId: tag.tagId,
      name: tag.name,
    }));
  }

  public async create(createTagDto: CreateTagDto): Promise<Tag> {
    const [name] = this.normalizeTags([createTagDto.name]);
    const existingTag = await this.tagsRepository.findByNameInsensitive(name);

    if (existingTag) {
      throw new BadRequestException('Tag name already exists');
    }

    const tag = this.tagsRepository.create({
      name,
      description: createTagDto.description?.trim(),
    });

    return this.tagsRepository.save(tag);
  }

  public async browseCourses(tagId: number, dto: BrowseCoursesByTagDto) {
    const tag = await this.tagsRepository.findOne({ where: { tagId } });

    if (!tag) {
      throw new NotFoundException(`Not found tag with ID ${tagId}`);
    }

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const { data, total } = await this.tagsRepository.browseApprovedCoursesByTag(
      tagId,
      page,
      limit,
    );

    return {
      items: data,
      meta: {
        total,
        count: data.length,
        page,
        limit,
      },
    };
  }

  public async setCourseTags(
    courseId: number,
    tags: string[] = [],
    manager?: EntityManager,
  ): Promise<void> {
    const normalizedTags = this.normalizeTags(tags);
    const run = async (transactionManager: EntityManager) => {
      await transactionManager.delete(CourseTag, { courseId });

      if (normalizedTags.length === 0) {
        return;
      }

      const tagEntities = await this.findOrCreateTags(
        normalizedTags,
        transactionManager,
      );

      await transactionManager.insert(
        CourseTag,
        tagEntities.map((tag) => ({
          courseId,
          tagId: tag.tagId,
        })),
      );
    };

    if (manager) {
      await run(manager);
      return;
    }

    await this.dataSource.transaction(run);
  }

  public async removeTagFromCourse(
    courseId: number,
    tagId: number,
  ): Promise<{ message: string }> {
    await this.dataSource.transaction(async (manager) => {
      const course = await manager.findOne(Course, {
        where: { courseId },
      });

      if (!course) {
        throw new NotFoundException(`Not found course with ID ${courseId}`);
      }

      const tag = await manager.findOne(Tag, {
        where: { tagId },
      });

      if (!tag) {
        throw new NotFoundException(`Not found tag with ID ${tagId}`);
      }

      await manager.delete(CourseTag, { courseId, tagId });
    });

    return {
      message: `Tag ID ${tagId} has been removed from course ID ${courseId}`,
    };
  }

  private async findOrCreateTags(
    tagNames: string[],
    manager: EntityManager,
  ): Promise<Tag[]> {
    const existingTags = await this.tagsRepository.findByNamesInsensitive(
      tagNames,
      manager,
    );
    const tagsByName = new Map(
      existingTags.map((tag) => [tag.name.toLowerCase(), tag]),
    );
    const result: Tag[] = [];

    for (const tagName of tagNames) {
      const key = tagName.toLowerCase();
      const existingTag = tagsByName.get(key);

      if (existingTag) {
        result.push(existingTag);
        continue;
      }

      const createdTag = manager.create(Tag, {
        name: tagName,
      });
      const savedTag = await manager.save(Tag, createdTag);
      tagsByName.set(key, savedTag);
      result.push(savedTag);
    }

    return result;
  }
}
