/**
 * Collection ID: logbookentries
 * Interface for LogbookEntries
 */
export interface LogbookEntries {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  mistakeDescription?: string;
  /** @wixFieldType datetime */
  dateRecorded?: Date | string;
  /** @wixFieldType text */
  relatedSubject?: string;
  /** @wixFieldType number */
  severityLevel?: number;
  /** @wixFieldType text */
  correctionAction?: string;
  /** @wixFieldType boolean */
  isResolved?: boolean;
}
