import { useState } from 'react';
import { useGetAllTasks, useGetTasksByStatus } from '../hooks/useQueries';
import { TaskStatus } from '../backend';
import TaskItem from './TaskItem';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, ListTodo } from 'lucide-react';

export default function TaskList() {
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');

  const allTasksQuery = useGetAllTasks();
  const pendingTasksQuery = useGetTasksByStatus(TaskStatus.pending);
  const inProgressTasksQuery = useGetTasksByStatus(TaskStatus.inProgress);
  const completedTasksQuery = useGetTasksByStatus(TaskStatus.completed);

  const getActiveQuery = () => {
    switch (statusFilter) {
      case TaskStatus.pending:
        return pendingTasksQuery;
      case TaskStatus.inProgress:
        return inProgressTasksQuery;
      case TaskStatus.completed:
        return completedTasksQuery;
      default:
        return allTasksQuery;
    }
  };

  const activeQuery = getActiveQuery();
  const tasks = activeQuery.data || [];
  const isLoading = activeQuery.isLoading;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Tasks</h2>
          <p className="text-sm text-muted-foreground">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} {statusFilter !== 'all' && `(${statusFilter})`}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Label htmlFor="filter" className="text-sm whitespace-nowrap">Filter by:</Label>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | TaskStatus)}>
            <SelectTrigger id="filter" className="w-full sm:w-[180px] h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value={TaskStatus.pending}>Pending</SelectItem>
              <SelectItem value={TaskStatus.inProgress}>In Progress</SelectItem>
              <SelectItem value={TaskStatus.completed}>Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : tasks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ListTodo className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {statusFilter === 'all'
                ? "You haven't created any tasks yet. Create your first task to get started!"
                : `No tasks with status "${statusFilter}". Try a different filter.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
