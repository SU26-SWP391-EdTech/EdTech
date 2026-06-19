import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { Lesson } from './lesson.entity';
import { Tag } from './tag.entity';

@Entity('lesson_tags')
export class LessonTag {
  @PrimaryColumn({
    name: 'lesson_id',
    type: 'int',
    nullable: false
  })
  lessonId: number;

  // lesson_tags n - 1 lessons
  @ManyToOne(
    () => Lesson,
    (lesson) => lesson.lessonTags,
    {
      onDelete: 'CASCADE',
      nullable: false
    },
  )
  @JoinColumn({
    name: 'lesson_id',
  })
  lesson!: Lesson;

  @PrimaryColumn({
    name: 'tag_id',
    type: 'int',
    nullable: false
  })
  tagId!: number;

  // lesson_tags n - 1 tags
  @ManyToOne(
    () => Tag,
    (tag) => tag.lessonTags,
    {
      onDelete: 'CASCADE',
      nullable: false
    },
  )
  @JoinColumn({
    name: 'tag_id',
  })
  tag!: Tag;
}
