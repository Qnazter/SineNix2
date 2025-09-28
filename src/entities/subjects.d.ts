/**
 * Collection ID: subjects
 * Interface for Subjects
 */
export interface Subjects {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType number */
  completedContentItems?: number;
  /** @wixFieldType text */
  subjectName?: string;
  /** @wixFieldType number */
  totalContentItems?: number;
  /** @wixFieldType boolean */
  completionStatus?: boolean;
  /** @wixFieldType number */
  progressPercentage?: number;
  /** @wixFieldType text */
  contentModules?: string;
  /** @wixFieldType text */
  subjectCode?: string;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType image */
  subjectImage?: string;
  /** @wixFieldType url */
  studyMaterialsLink?: string;
  /** @wixFieldType url */
  additionalResourcesLink?: string;
  /** @wixFieldType boolean */
  isActive?: boolean;
  /** @wixFieldType number */
  difficultyLevel?: number;
}
