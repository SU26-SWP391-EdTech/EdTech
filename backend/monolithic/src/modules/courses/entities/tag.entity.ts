import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CourseTag } from "./course-tag.entity";

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn({
    name: 'tag_id',
  })
  tagId!: number;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name!: string;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description!: string;

  @CreateDateColumn({
    name: 'created_at',
    nullable: false
  })
  createdAt!: Date;

  // tags n - 1 course_tags
  @OneToMany(
    () => CourseTag,
    (courseTag) => courseTag.tag,
    { nullable: false }
  )
  courseTags!: CourseTag[];
}
