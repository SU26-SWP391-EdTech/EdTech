export class GetLearnerProfileDto {
    fullName: string;
    email?: string;
    avatarUrl?: string;
    learningGoal?: string;
    level?: string;
    bio?: string;
    createdAt?: Date;
  }