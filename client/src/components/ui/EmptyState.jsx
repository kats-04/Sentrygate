import React from 'react';
import { Inbox, Users, Calendar, FileText } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no items to display',
  actionLabel,
  onAction,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
    <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <Icon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
      {description}
    </p>
    {actionLabel && onAction && (
      <Button onClick={onAction} variant="primary" size="sm">
        {actionLabel}
      </Button>
    )}
  </div>
);

export const EmptyStates = {
  Notifications: () => (
    <EmptyState
      icon={Inbox}
      title="No notifications"
      description="You're all caught up! Check back later for updates."
    />
  ),
  Users: ({ onInvite }) => (
    <EmptyState
      icon={Users}
      title="No team members yet"
      description="Invite your first team member to get started"
      actionLabel="Invite Member"
      onAction={onInvite}
    />
  ),
  Events: () => (
    <EmptyState
      icon={Calendar}
      title="No events scheduled"
      description="Schedule your first event to get started"
    />
  ),
  Documents: ({ onUpload }) => (
    <EmptyState
      icon={FileText}
      title="No documents"
      description="Upload your first document to get started"
      actionLabel="Upload Document"
      onAction={onUpload}
    />
  ),
};

export default EmptyState;
