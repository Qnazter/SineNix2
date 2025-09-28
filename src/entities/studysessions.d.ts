/**
 * Collection ID: studysessions
 * Interface for StudySessions
 */
export interface StudySessions {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  sessionName?: string;
  /** @wixFieldType date */
  sessionDate?: Date | string;
  /** @wixFieldType time */
  startTime?: any;
  /** @wixFieldType time */
  endTime?: any;
  /** @wixFieldType text */
  subjectName?: string;
  /** @wixFieldType boolean */
  isDeadline?: boolean;
  /** @wixFieldType text */
  notes?: string;
}
