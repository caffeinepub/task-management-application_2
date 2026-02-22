import { useState } from 'react';
import { Task, TaskStatus } from '../backend';
import { useUpdateTask } from '../hooks/useQueries';
import EditTaskModal from './EditTaskModal';
import DeleteTaskConfirmation from './DeleteTaskConfirmation';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Calendar, Edit2, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface TaskItemProps {
  task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const updateTask = useUpdateTask();

  const dueDate = new Date(Number(task.dueDate) / 1000000);
  const isOverdue = dueDate < new Date() && task.status !== TaskStatus.completed;

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.pending:
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
      case TaskStatus.inProgress:
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      case TaskStatus.completed:
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.pending:
        return 'Pending';
      case TaskStatus.inProgress:
        return 'In Progress';
      case TaskStatus.completed:
        return 'Completed';
    }
  };

  const handleQuickStatusChange = async (newStatus: TaskStatus) => {
    try {
      await updateTask.mutateAsync({
        taskId: task.id,
        title: task.title,
        description: task.description,
        status: newStatus,
        dueDate: task.dueDate,
      });
      toast.success('Task status updated');
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 hover:border-emerald-500/30 flex flex-col h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 flex-1">{task.title}</h3>
            <Badge variant="outline" className={getStatusColor(task.status)}>
              {getStatusLabel(task.status)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 pb-3">
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{task.description}</p>
          )}
          
          <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                Due: {format(dueDate, 'MMM d, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Created: {format(new Date(Number(task.createdAt) / 1000000), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t flex flex-col gap-2">
          {task.status !== TaskStatus.completed && (
            <div className="flex gap-2 w-full">
              {task.status === TaskStatus.pending && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8 text-xs"
                  onClick={() => handleQuickStatusChange(TaskStatus.inProgress)}
                  disabled={updateTask.isPending}
                >
                  Start
                </Button>
              )}
              {task.status === TaskStatus.inProgress && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                  onClick={() => handleQuickStatusChange(TaskStatus.completed)}
                  disabled={updateTask.isPending}
                >
                  Complete
                </Button>
              )}
            </div>
          )}
          
          <div className="flex gap-2 w-full">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete
            </Button>
          </div>
        </CardFooter>
      </Card>

      <EditTaskModal
        task={task}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />

      <DeleteTaskConfirmation
        task={task}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}
