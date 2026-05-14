export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'manager' | 'employee';
  department: string;
  position: string;
  phone: string;
  joinDate: string;
  status: 'online' | 'offline' | 'away' | 'busy';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold' | 'planning';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  startDate: string;
  dueDate: string;
  teamMembers: string[];
  tasks: Task[];
  createdBy: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  projectId: string;
  dueDate: string;
  createdAt: string;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  timestamp: string;
  reactions: { emoji: string; users: string[] }[];
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'direct';
  members: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: 'meeting' | 'deadline' | 'event' | 'reminder';
  attendees: string[];
  color: string;
}

export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  taskId: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  date: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  target: string;
  targetType: 'task' | 'project' | 'document' | 'message' | 'member';
  timestamp: string;
  details: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'spreadsheet' | 'image' | 'presentation' | 'folder';
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  sharedWith: string[];
  parentFolder?: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  type: 'sick' | 'casual' | 'annual' | 'wfh';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'absent' | 'half-day' | 'wfh' | 'leave';
  totalHours: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'company' | 'team' | 'personal';
  progress: number;
  startDate: string;
  dueDate: string;
  ownerId: string;
  keyResults: KeyResult[];
  status: 'on-track' | 'at-risk' | 'behind' | 'completed';
}

export interface KeyResult {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
  link?: string;
}
