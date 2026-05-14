import type { User, Project, Task, ChatChannel, ChatMessage, CalendarEvent, TimeEntry, ActivityLog, Document, LeaveRequest, AttendanceRecord, Goal, Notification } from '../types';

export const users: User[] = [
  { id: '1', name: 'Pawan Kumar', email: 'pawan@company.com', avatar: 'PK', role: 'admin', department: 'Engineering', position: 'CEO & Founder', phone: '+91 98765 43210', joinDate: '2023-01-15', status: 'online' },
  { id: '2', name: 'Anita Sharma', email: 'anita@company.com', avatar: 'AS', role: 'manager', department: 'Design', position: 'Design Lead', phone: '+91 98765 43211', joinDate: '2023-03-20', status: 'online' },
  { id: '3', name: 'Rahul Verma', email: 'rahul@company.com', avatar: 'RV', role: 'employee', department: 'Engineering', position: 'Senior Developer', phone: '+91 98765 43212', joinDate: '2023-02-10', status: 'away' },
  { id: '4', name: 'Priya Singh', email: 'priya@company.com', avatar: 'PS', role: 'employee', department: 'Marketing', position: 'Marketing Manager', phone: '+91 98765 43213', joinDate: '2023-04-05', status: 'online' },
  { id: '5', name: 'Vikram Joshi', email: 'vikram@company.com', avatar: 'VJ', role: 'employee', department: 'Engineering', position: 'Full Stack Developer', phone: '+91 98765 43214', joinDate: '2023-05-15', status: 'busy' },
  { id: '6', name: 'Neha Gupta', email: 'neha@company.com', avatar: 'NG', role: 'manager', department: 'HR', position: 'HR Manager', phone: '+91 98765 43215', joinDate: '2023-01-20', status: 'online' },
  { id: '7', name: 'Amit Patel', email: 'amit@company.com', avatar: 'AP', role: 'employee', department: 'Engineering', position: 'Backend Developer', phone: '+91 98765 43216', joinDate: '2023-06-01', status: 'offline' },
  { id: '8', name: 'Sonal Mehta', email: 'sonal@company.com', avatar: 'SM', role: 'employee', department: 'Design', position: 'UI/UX Designer', phone: '+91 98765 43217', joinDate: '2023-07-10', status: 'online' },
  { id: '9', name: 'Deepak Reddy', email: 'deepak@company.com', avatar: 'DR', role: 'employee', department: 'Sales', position: 'Sales Executive', phone: '+91 98765 43218', joinDate: '2023-08-20', status: 'away' },
  { id: '10', name: 'Kavita Nair', email: 'kavita@company.com', avatar: 'KN', role: 'employee', department: 'Engineering', position: 'QA Engineer', phone: '+91 98765 43219', joinDate: '2023-09-15', status: 'online' },
];

export const projects: Project[] = [
  {
    id: 'p1', name: 'E-Commerce Platform', description: 'Building next-gen e-commerce platform with AI recommendations', status: 'active', priority: 'high', progress: 68,
    startDate: '2024-01-15', dueDate: '2024-06-30', teamMembers: ['1', '3', '5', '7', '10'], tasks: [], createdBy: '1',
  },
  {
    id: 'p2', name: 'Mobile App Redesign', description: 'Complete redesign of the mobile app for better UX', status: 'active', priority: 'high', progress: 45,
    startDate: '2024-02-01', dueDate: '2024-05-30', teamMembers: ['2', '8', '5'], tasks: [], createdBy: '2',
  },
  {
    id: 'p3', name: 'Marketing Campaign Q2', description: 'Plan and execute Q2 marketing campaigns', status: 'planning', priority: 'medium', progress: 20,
    startDate: '2024-03-01', dueDate: '2024-06-30', teamMembers: ['4', '9'], tasks: [], createdBy: '4',
  },
  {
    id: 'p4', name: 'HR Portal', description: 'Internal HR management portal for employees', status: 'active', priority: 'medium', progress: 82,
    startDate: '2023-11-01', dueDate: '2024-04-30', teamMembers: ['6', '3', '7'], tasks: [], createdBy: '6',
  },
  {
    id: 'p5', name: 'Analytics Dashboard', description: 'Real-time analytics dashboard for business metrics', status: 'on-hold', priority: 'low', progress: 35,
    startDate: '2024-01-20', dueDate: '2024-07-15', teamMembers: ['5', '10'], tasks: [], createdBy: '1',
  },
];

export const tasks: Task[] = [
  { id: 't1', title: 'Design user authentication flow', description: 'Create wireframes for login, signup, and password reset', status: 'done', priority: 'high', assignee: '8', projectId: 'p1', dueDate: '2024-03-15', createdAt: '2024-02-01', tags: ['design', 'auth'] },
  { id: 't2', title: 'Implement product catalog API', description: 'Build REST API for product CRUD operations', status: 'in-progress', priority: 'high', assignee: '3', projectId: 'p1', dueDate: '2024-04-01', createdAt: '2024-02-15', tags: ['backend', 'api'] },
  { id: 't3', title: 'Setup payment gateway', description: 'Integrate Razorpay payment gateway', status: 'todo', priority: 'urgent', assignee: '7', projectId: 'p1', dueDate: '2024-04-15', createdAt: '2024-03-01', tags: ['payments', 'integration'] },
  { id: 't4', title: 'Build shopping cart UI', description: 'Frontend for cart management', status: 'in-progress', priority: 'medium', assignee: '5', projectId: 'p1', dueDate: '2024-04-10', createdAt: '2024-03-05', tags: ['frontend', 'ui'] },
  { id: 't5', title: 'Write unit tests for auth', description: 'Complete test coverage for authentication module', status: 'review', priority: 'medium', assignee: '10', projectId: 'p1', dueDate: '2024-03-20', createdAt: '2024-03-10', tags: ['testing', 'auth'] },
  { id: 't6', title: 'Create new app navigation', description: 'Design and implement new bottom navigation', status: 'in-progress', priority: 'high', assignee: '2', projectId: 'p2', dueDate: '2024-03-25', createdAt: '2024-02-10', tags: ['design', 'navigation'] },
  { id: 't7', title: 'Redesign home screen', description: 'New home screen layout with personalized feed', status: 'todo', priority: 'high', assignee: '8', projectId: 'p2', dueDate: '2024-04-05', createdAt: '2024-02-20', tags: ['design', 'ui'] },
  { id: 't8', title: 'Social media content plan', description: 'Create content calendar for social media', status: 'in-progress', priority: 'medium', assignee: '4', projectId: 'p3', dueDate: '2024-03-30', createdAt: '2024-03-01', tags: ['marketing', 'content'] },
  { id: 't9', title: 'Employee onboarding module', description: 'Build onboarding workflow for new employees', status: 'review', priority: 'high', assignee: '3', projectId: 'p4', dueDate: '2024-04-01', createdAt: '2024-01-15', tags: ['hr', 'onboarding'] },
  { id: 't10', title: 'Leave management system', description: 'Online leave application and approval system', status: 'done', priority: 'medium', assignee: '7', projectId: 'p4', dueDate: '2024-03-15', createdAt: '2024-01-20', tags: ['hr', 'leave'] },
  { id: 't11', title: 'Setup data pipeline', description: 'ETL pipeline for real-time data processing', status: 'todo', priority: 'high', assignee: '5', projectId: 'p5', dueDate: '2024-05-01', createdAt: '2024-02-01', tags: ['data', 'backend'] },
  { id: 't12', title: 'Design dashboard widgets', description: 'Create reusable chart and metric widgets', status: 'todo', priority: 'medium', assignee: '10', projectId: 'p5', dueDate: '2024-05-15', createdAt: '2024-02-10', tags: ['design', 'analytics'] },
];

export const chatChannels: ChatChannel[] = [
  { id: 'ch1', name: 'general', description: 'Company-wide announcements and discussions', type: 'public', members: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], unreadCount: 3 },
  { id: 'ch2', name: 'engineering', description: 'Engineering team discussions', type: 'public', members: ['1', '3', '5', '7', '10'], unreadCount: 5 },
  { id: 'ch3', name: 'design', description: 'Design team updates', type: 'public', members: ['2', '8'], unreadCount: 0 },
  { id: 'ch4', name: 'marketing', description: 'Marketing strategies and campaigns', type: 'public', members: ['4', '9'], unreadCount: 2 },
  { id: 'ch5', name: 'hr-updates', description: 'HR policies and announcements', type: 'public', members: ['6', '1'], unreadCount: 1 },
  { id: 'ch6', name: 'project-ecommerce', description: 'E-Commerce project channel', type: 'private', members: ['1', '3', '5', '7', '10'], unreadCount: 8 },
];

export const chatMessages: ChatMessage[] = [
  { id: 'm1', channelId: 'ch1', senderId: '1', content: 'Good morning team! Reminder: All hands meeting at 3 PM today.', timestamp: '2024-03-15T09:00:00', reactions: [{ emoji: '👍', users: ['2', '3', '4'] }] },
  { id: 'm2', channelId: 'ch1', senderId: '6', content: 'Also, please fill out the employee satisfaction survey by Friday.', timestamp: '2024-03-15T09:05:00', reactions: [] },
  { id: 'm3', channelId: 'ch1', senderId: '4', content: 'Just sent the Q2 marketing plan to everyone. Please review!', timestamp: '2024-03-15T09:30:00', reactions: [{ emoji: '🎉', users: ['1'] }] },
  { id: 'm4', channelId: 'ch2', senderId: '3', content: 'The new API endpoint for product search is live. Please test it.', timestamp: '2024-03-15T10:00:00', reactions: [{ emoji: '🚀', users: ['5', '7'] }] },
  { id: 'm5', channelId: 'ch2', senderId: '5', content: 'Found a bug in the cart calculation. Creating a ticket now.', timestamp: '2024-03-15T10:15:00', reactions: [] },
  { id: 'm6', channelId: 'ch2', senderId: '7', content: 'I\'ll pick that up. Can you assign it to me?', timestamp: '2024-03-15T10:20:00', reactions: [{ emoji: '💪', users: ['3'] }] },
  { id: 'm7', channelId: 'ch2', senderId: '10', content: 'Unit test coverage is now at 85%. Working on edge cases.', timestamp: '2024-03-15T11:00:00', reactions: [{ emoji: '🎯', users: ['1', '3'] }] },
  { id: 'm8', channelId: 'ch6', senderId: '1', content: 'Sprint review tomorrow at 10 AM. Please prepare your updates.', timestamp: '2024-03-15T14:00:00', reactions: [] },
  { id: 'm9', channelId: 'ch6', senderId: '5', content: 'Shopping cart UI is 80% done. Will push to staging today.', timestamp: '2024-03-15T14:30:00', reactions: [{ emoji: '👏', users: ['1', '3'] }] },
  { id: 'm10', channelId: 'ch3', senderId: '2', content: 'New design system components are ready for review in Figma.', timestamp: '2024-03-15T11:30:00', reactions: [{ emoji: '✨', users: ['8'] }] },
];

export const calendarEvents: CalendarEvent[] = [
  { id: 'e1', title: 'All Hands Meeting', description: 'Monthly company-wide meeting', startDate: '2024-03-15T15:00:00', endDate: '2024-03-15T16:00:00', type: 'meeting', attendees: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], color: '#6366f1' },
  { id: 'e2', title: 'Sprint Planning', description: 'Biweekly sprint planning for engineering', startDate: '2024-03-18T10:00:00', endDate: '2024-03-18T11:30:00', type: 'meeting', attendees: ['1', '3', '5', '7', '10'], color: '#06b6d4' },
  { id: 'e3', title: 'Design Review', description: 'Review new mobile app designs', startDate: '2024-03-19T14:00:00', endDate: '2024-03-19T15:00:00', type: 'meeting', attendees: ['2', '8', '1'], color: '#f59e0b' },
  { id: 'e4', title: 'E-Commerce MVP Deadline', description: 'First version delivery', startDate: '2024-03-22T00:00:00', endDate: '2024-03-22T23:59:00', type: 'deadline', attendees: ['1', '3', '5', '7', '10'], color: '#ef4444' },
  { id: 'e5', title: 'Team Lunch', description: 'Monthly team outing', startDate: '2024-03-20T12:30:00', endDate: '2024-03-20T14:00:00', type: 'event', attendees: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], color: '#10b981' },
  { id: 'e6', title: '1:1 with Rahul', description: 'Performance review discussion', startDate: '2024-03-21T11:00:00', endDate: '2024-03-21T11:30:00', type: 'meeting', attendees: ['1', '3'], color: '#8b5cf6' },
  { id: 'e7', title: 'Marketing Standup', description: 'Daily marketing sync', startDate: '2024-03-15T09:30:00', endDate: '2024-03-15T09:45:00', type: 'meeting', attendees: ['4', '9'], color: '#ec4899' },
];

export const timeEntries: TimeEntry[] = [
  { id: 'te1', userId: '3', projectId: 'p1', taskId: 't2', description: 'Implementing product catalog API endpoints', startTime: '09:00', endTime: '12:30', duration: 3.5, date: '2024-03-15' },
  { id: 'te2', userId: '5', projectId: 'p1', taskId: 't4', description: 'Building shopping cart components', startTime: '09:30', endTime: '13:00', duration: 3.5, date: '2024-03-15' },
  { id: 'te3', userId: '3', projectId: 'p1', taskId: 't2', description: 'API testing and documentation', startTime: '14:00', endTime: '17:30', duration: 3.5, date: '2024-03-15' },
  { id: 'te4', userId: '7', projectId: 'p4', taskId: 't10', description: 'Leave management feature', startTime: '09:00', endTime: '12:00', duration: 3, date: '2024-03-15' },
  { id: 'te5', userId: '2', projectId: 'p2', taskId: 't6', description: 'Navigation design iterations', startTime: '10:00', endTime: '15:00', duration: 5, date: '2024-03-15' },
  { id: 'te6', userId: '10', projectId: 'p1', taskId: 't5', description: 'Writing auth unit tests', startTime: '09:00', endTime: '11:30', duration: 2.5, date: '2024-03-15' },
  { id: 'te7', userId: '4', projectId: 'p3', taskId: 't8', description: 'Social media content creation', startTime: '09:00', endTime: '12:00', duration: 3, date: '2024-03-14' },
  { id: 'te8', userId: '5', projectId: 'p1', taskId: 't4', description: 'Cart UI responsive design', startTime: '14:00', endTime: '18:00', duration: 4, date: '2024-03-14' },
];

export const activityLogs: ActivityLog[] = [
  { id: 'a1', userId: '3', action: 'updated', target: 'Product Catalog API', targetType: 'task', timestamp: '2024-03-15T17:30:00', details: 'Moved to In Progress' },
  { id: 'a2', userId: '5', action: 'completed', target: 'Shopping Cart UI - Mobile View', targetType: 'task', timestamp: '2024-03-15T16:45:00', details: 'Marked as done' },
  { id: 'a3', userId: '2', action: 'uploaded', target: 'App Navigation Mockups.fig', targetType: 'document', timestamp: '2024-03-15T15:30:00', details: 'New design file uploaded' },
  { id: 'a4', userId: '1', action: 'created', target: 'Sprint 12 Planning', targetType: 'project', timestamp: '2024-03-15T14:00:00', details: 'New sprint created' },
  { id: 'a5', userId: '10', action: 'commented', target: 'Auth Unit Tests', targetType: 'task', timestamp: '2024-03-15T13:20:00', details: 'Added test coverage report' },
  { id: 'a6', userId: '6', action: 'approved', target: 'Rahul\'s Leave Request', targetType: 'member', timestamp: '2024-03-15T12:00:00', details: '2 days casual leave approved' },
  { id: 'a7', userId: '4', action: 'shared', target: 'Q2 Marketing Plan.pdf', targetType: 'document', timestamp: '2024-03-15T11:30:00', details: 'Shared with entire team' },
  { id: 'a8', userId: '7', action: 'deployed', target: 'Leave Management Module', targetType: 'project', timestamp: '2024-03-15T10:45:00', details: 'Deployed to staging' },
  { id: 'a9', userId: '8', action: 'created', target: 'Design System v2', targetType: 'document', timestamp: '2024-03-15T10:00:00', details: 'New design system published' },
  { id: 'a10', userId: '9', action: 'updated', target: 'Sales Pipeline Q1', targetType: 'project', timestamp: '2024-03-15T09:30:00', details: 'Added 5 new leads' },
  { id: 'a11', userId: '1', action: 'sent', target: 'Team Performance Report', targetType: 'message', timestamp: '2024-03-14T18:00:00', details: 'Monthly report shared' },
  { id: 'a12', userId: '3', action: 'merged', target: 'feature/product-search', targetType: 'task', timestamp: '2024-03-14T17:00:00', details: 'PR #142 merged to main' },
];

export const documents: Document[] = [
  { id: 'd1', name: 'Projects', type: 'folder', size: '-', uploadedBy: '1', uploadedAt: '2024-01-15', sharedWith: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
  { id: 'd2', name: 'Q2 Marketing Plan.pdf', type: 'pdf', size: '2.4 MB', uploadedBy: '4', uploadedAt: '2024-03-15', sharedWith: ['1', '4', '9'] },
  { id: 'd3', name: 'Employee Handbook.doc', type: 'doc', size: '1.8 MB', uploadedBy: '6', uploadedAt: '2024-01-20', sharedWith: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
  { id: 'd4', name: 'Budget Report 2024.spreadsheet', type: 'spreadsheet', size: '856 KB', uploadedBy: '1', uploadedAt: '2024-02-01', sharedWith: ['1', '6'] },
  { id: 'd5', name: 'App Navigation Mockups.fig', type: 'image', size: '12.5 MB', uploadedBy: '2', uploadedAt: '2024-03-15', sharedWith: ['2', '8', '1'] },
  { id: 'd6', name: 'API Documentation.doc', type: 'doc', size: '3.2 MB', uploadedBy: '3', uploadedAt: '2024-03-10', sharedWith: ['1', '3', '5', '7', '10'] },
  { id: 'd7', name: 'Company Pitch Deck.presentation', type: 'presentation', size: '5.6 MB', uploadedBy: '1', uploadedAt: '2024-02-15', sharedWith: ['1', '4', '9'] },
  { id: 'd8', name: 'Design System v2.pdf', type: 'pdf', size: '8.1 MB', uploadedBy: '8', uploadedAt: '2024-03-15', sharedWith: ['2', '8', '5'] },
];

export const leaveRequests: LeaveRequest[] = [
  { id: 'lr1', userId: '3', type: 'casual', startDate: '2024-03-20', endDate: '2024-03-21', reason: 'Family function', status: 'approved', appliedAt: '2024-03-14' },
  { id: 'lr2', userId: '5', type: 'sick', startDate: '2024-03-18', endDate: '2024-03-18', reason: 'Not feeling well', status: 'approved', appliedAt: '2024-03-17' },
  { id: 'lr3', userId: '9', type: 'annual', startDate: '2024-04-01', endDate: '2024-04-05', reason: 'Vacation', status: 'pending', appliedAt: '2024-03-15' },
  { id: 'lr4', userId: '8', type: 'wfh', startDate: '2024-03-19', endDate: '2024-03-19', reason: 'Internet installation at home', status: 'approved', appliedAt: '2024-03-15' },
  { id: 'lr5', userId: '7', type: 'casual', startDate: '2024-03-25', endDate: '2024-03-25', reason: 'Personal work', status: 'pending', appliedAt: '2024-03-15' },
];

export const attendanceRecords: AttendanceRecord[] = [
  { id: 'at1', userId: '1', date: '2024-03-15', checkIn: '08:45', checkOut: '18:30', status: 'present', totalHours: 9.75 },
  { id: 'at2', userId: '2', date: '2024-03-15', checkIn: '09:00', checkOut: '18:00', status: 'present', totalHours: 9 },
  { id: 'at3', userId: '3', date: '2024-03-15', checkIn: '09:15', checkOut: '17:45', status: 'present', totalHours: 8.5 },
  { id: 'at4', userId: '4', date: '2024-03-15', checkIn: '09:30', checkOut: '18:15', status: 'present', totalHours: 8.75 },
  { id: 'at5', userId: '5', date: '2024-03-15', checkIn: '10:00', checkOut: '14:00', status: 'half-day', totalHours: 4 },
  { id: 'at6', userId: '6', date: '2024-03-15', checkIn: '08:30', checkOut: '17:30', status: 'present', totalHours: 9 },
  { id: 'at7', userId: '7', date: '2024-03-15', checkIn: '-', checkOut: '-', status: 'wfh', totalHours: 8 },
  { id: 'at8', userId: '8', date: '2024-03-15', checkIn: '09:00', checkOut: '17:00', status: 'present', totalHours: 8 },
  { id: 'at9', userId: '9', date: '2024-03-15', checkIn: '-', checkOut: '-', status: 'leave', totalHours: 0 },
  { id: 'at10', userId: '10', date: '2024-03-15', checkIn: '09:00', checkOut: '18:00', status: 'present', totalHours: 9 },
];

export const goals: Goal[] = [
  {
    id: 'g1', title: 'Launch E-Commerce Platform', description: 'Successfully launch the e-commerce platform with all core features', type: 'company', progress: 65, startDate: '2024-01-01', dueDate: '2024-06-30', ownerId: '1', status: 'on-track',
    keyResults: [
      { id: 'kr1', title: 'Complete core features', target: 10, current: 7, unit: 'features' },
      { id: 'kr2', title: 'Achieve 95% test coverage', target: 95, current: 85, unit: '%' },
      { id: 'kr3', title: 'Zero critical bugs', target: 0, current: 2, unit: 'bugs' },
    ],
  },
  {
    id: 'g2', title: 'Increase Revenue 40%', description: 'Grow quarterly revenue by 40% compared to last year', type: 'company', progress: 55, startDate: '2024-01-01', dueDate: '2024-12-31', ownerId: '1', status: 'on-track',
    keyResults: [
      { id: 'kr4', title: 'New customer acquisition', target: 500, current: 280, unit: 'customers' },
      { id: 'kr5', title: 'Monthly recurring revenue', target: 50, current: 28, unit: 'lakh' },
    ],
  },
  {
    id: 'g3', title: 'Improve App Rating', description: 'Increase app store rating from 3.8 to 4.5+', type: 'team', progress: 40, startDate: '2024-02-01', dueDate: '2024-08-30', ownerId: '2', status: 'at-risk',
    keyResults: [
      { id: 'kr6', title: 'App store rating', target: 4.5, current: 4.0, unit: 'stars' },
      { id: 'kr7', title: 'User satisfaction score', target: 90, current: 72, unit: '%' },
    ],
  },
  {
    id: 'g4', title: 'Build World-Class Engineering Team', description: 'Hire and retain top engineering talent', type: 'team', progress: 70, startDate: '2024-01-01', dueDate: '2024-12-31', ownerId: '6', status: 'on-track',
    keyResults: [
      { id: 'kr8', title: 'New hires', target: 8, current: 5, unit: 'engineers' },
      { id: 'kr9', title: 'Employee retention', target: 95, current: 92, unit: '%' },
    ],
  },
];

export const notifications: Notification[] = [
  { id: 'n1', title: 'New Task Assigned', message: 'You have been assigned "Setup payment gateway"', type: 'info', read: false, timestamp: '2024-03-15T14:30:00', link: '/projects' },
  { id: 'n2', title: 'PR Approved', message: 'Your PR for product-search has been approved', type: 'success', read: false, timestamp: '2024-03-15T13:00:00', link: '/projects' },
  { id: 'n3', title: 'Meeting in 30 minutes', message: 'All Hands Meeting starts at 3:00 PM', type: 'warning', read: false, timestamp: '2024-03-15T14:30:00', link: '/calendar' },
  { id: 'n4', title: 'Leave Approved', message: 'Your leave request for March 20-21 has been approved', type: 'success', read: true, timestamp: '2024-03-15T12:00:00', link: '/attendance' },
  { id: 'n5', title: 'Goal Update', message: 'E-Commerce Platform launch goal is 65% complete', type: 'info', read: true, timestamp: '2024-03-15T10:00:00', link: '/goals' },
  { id: 'n6', title: 'Document Shared', message: 'Priya shared Q2 Marketing Plan with you', type: 'info', read: false, timestamp: '2024-03-15T09:30:00', link: '/documents' },
];
