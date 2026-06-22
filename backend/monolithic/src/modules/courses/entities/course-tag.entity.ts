import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Course } from "./course.entity";
import { Tag } from "./tag.entity";

@Entity('course_tags')
export class CourseTag {
  @PrimaryColumn({
    name: 'course_id',
    type: 'int',
    nullable: false
  })
  courseId: number;

  @PrimaryColumn({
    name: 'tag_id',
    type: 'int',
    nullable: false
  })
  tagId!: number;

  @ManyToOne(
    () => Course,
    (course) => course.courseTag,
    {
      onDelete: 'CASCADE',
      nullable: false
    }
  )
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  // lesson_tags n - 1 tags
  @ManyToOne(
    () => Tag,
    (tag) => tag.courseTags,
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
