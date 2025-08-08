export interface KanbanCard {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'review' | 'done';
  tags: string[];
  dueDate?: Date;
  createdDate: Date;
  updatedDate: Date;
  estimatedHours?: number;
  actualHours?: number;
  attachments?: KanbanAttachment[];
  comments?: KanbanComment[];
  color?: string;
  archived: boolean;
}

export interface KanbanColumn {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  cards: KanbanCard[];
  maxCards?: number;
  color: string;
  icon: string;
  order: number;
  allowedFromStatuses: string[];
  autoProgress?: boolean;
}

export interface KanbanBoard {
  id: string;
  title: string;
  description: string;
  columns: KanbanColumn[];
  settings: KanbanSettings;
  createdDate: Date;
  updatedDate: Date;
}

export interface KanbanSettings {
  allowDragBetweenColumns: boolean;
  allowCardCreation: boolean;
  allowCardDeletion: boolean;
  allowCardEditing: boolean;
  allowColumnReorder: boolean;
  autoSave: boolean;
  showCardNumbers: boolean;
  showDueDates: boolean;
  showAssignees: boolean;
  showPriorities: boolean;
  showTags: boolean;
  swimlanes: boolean;
}

export interface KanbanAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadDate: Date;
}

export interface KanbanComment {
  id: string;
  author: string;
  content: string;
  createdDate: Date;
  updatedDate?: Date;
}

export interface KanbanMoveEvent {
  card: KanbanCard;
  fromColumn: string;
  toColumn: string;
  fromIndex: number;
  toIndex: number;
  board: string;
}

export interface KanbanFilter {
  assignee?: string;
  priority?: string[];
  tags?: string[];
  dueDate?: {
    from?: Date;
    to?: Date;
  };
  searchTerm?: string;
  status?: string[];
}

export interface KanbanStats {
  totalCards: number;
  completedCards: number;
  overdueCards: number;
  cardsByPriority: { [key: string]: number };
  cardsByAssignee: { [key: string]: number };
  avgTimeInProgress: number;
  throughput: number;
}

export type KanbanCardPriority = 'low' | 'medium' | 'high' | 'urgent';
export type KanbanCardStatus = 'todo' | 'in-progress' | 'review' | 'done';
