import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { LessonTag } from "./lesson-tag.entity";

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

  // tags n - 1 lesson_tags
  @OneToMany(
    () => LessonTag,
    (lessonTag) => lessonTag.tag,
    { nullable: false }
  )
  lessonTags!: LessonTag[];
}
