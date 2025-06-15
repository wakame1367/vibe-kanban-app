'use client'

import { useState, useOptimistic } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TaskCreateForm } from '@/components/task-create-form'
import { updateTaskPosition } from '@/app/actions/task-actions'

interface Task {
  id: string
  title: string
  description: string | null
  position: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate: Date | null
  isCompleted: boolean
  columnId: string
}

interface Column {
  id: string
  title: string
  position: number
  color: string
  boardId: string
  tasks: Task[]
}

interface Board {
  id: string
  title: string
  description: string | null
  createdAt: Date
  updatedAt: Date
  columns: Column[]
}

interface KanbanBoardProps {
  board: Board
}

interface DragData {
  type: 'task'
  task: Task
}

interface ColumnDropData {
  type: 'column'
  column: Column
}

function TaskCard({ task, isDragging }: { task: Task; isDragging?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task
    } as DragData
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-slate-50 dark:bg-slate-700 p-3 rounded-lg border cursor-grab active:cursor-grabbing ${
        isDragging || isSortableDragging ? 'shadow-lg' : ''
      }`}
    >
      <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
        {task.title}
      </h3>
      {task.description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          {task.description}
        </p>
      )}
      <div className="flex items-center justify-between text-xs">
        <span className={`px-2 py-1 rounded-full inline-flex items-center gap-1 ${
          task.priority === 'URGENT' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
          task.priority === 'HIGH' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
          task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
          'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            task.priority === 'URGENT' ? 'bg-red-500' :
            task.priority === 'HIGH' ? 'bg-orange-500' :
            task.priority === 'MEDIUM' ? 'bg-yellow-500' :
            'bg-green-500'
          }`}></span>
          {task.priority === 'URGENT' ? '緊急' :
           task.priority === 'HIGH' ? '高' :
           task.priority === 'MEDIUM' ? '中' : '低'}
        </span>
        {task.dueDate && (
          <span className="text-slate-500 dark:text-slate-400">
            {new Date(task.dueDate).toLocaleDateString('ja-JP')}
          </span>
        )}
      </div>
    </div>
  )
}

function DroppableColumn({ column, tasks }: { 
  column: Column; 
  tasks: Task[]; 
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column
    }
  })

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border">
      <div 
        className="px-4 py-3 border-b"
        style={{ borderTopColor: column.color }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              {column.title}
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
              {tasks.length}
            </span>
          </div>
          <TaskCreateForm columnId={column.id} />
        </div>
      </div>
      
      <div 
        ref={setNodeRef}
        className={`p-4 space-y-3 min-h-[200px] transition-colors ${
          isOver ? 'bg-slate-50 dark:bg-slate-700/50' : ''
        }`}
      >
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-8">
              タスクがありません
            </p>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}

export function KanbanBoard({ board }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [columns, setColumns] = useOptimistic(
    board.columns,
    (state, { columnId, taskId, newPosition, newColumnId }: {
      columnId: string;
      taskId: string;
      newPosition: number;
      newColumnId: string;
    }) => {
      const newColumns = [...state]
      
      // Find source and destination columns
      const sourceColumn = newColumns.find(col => col.id === columnId)
      const destColumn = newColumns.find(col => col.id === newColumnId)
      
      if (!sourceColumn || !destColumn) return state
      
      // Find the task to move
      const taskIndex = sourceColumn.tasks.findIndex(task => task.id === taskId)
      if (taskIndex === -1) return state
      
      const [movedTask] = sourceColumn.tasks.splice(taskIndex, 1)
      
      // Update task's columnId if moving to different column
      if (columnId !== newColumnId) {
        movedTask.columnId = newColumnId
      }
      
      // Insert task at new position
      destColumn.tasks.splice(newPosition, 0, movedTask)
      
      // Update positions
      sourceColumn.tasks.forEach((task, index) => {
        task.position = index
      })
      
      destColumn.tasks.forEach((task, index) => {
        task.position = index
      })
      
      return newColumns
    }
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const { data } = active
    
    if (data?.current?.type === 'task') {
      setActiveTask(data.current.task)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    
    if (!over) return
    
    const activeData = active.data.current as DragData | undefined
    
    if (!activeData || activeData.type !== 'task') return
    
    const activeTask = activeData.task
    const activeColumnId = activeTask.columnId
    
    // Determine if we're over a task or column
    const overData = over.data.current as DragData | ColumnDropData | undefined
    let overColumnId: string
    
    if (overData?.type === 'task') {
      overColumnId = overData.task.columnId
    } else if (overData?.type === 'column') {
      overColumnId = overData.column.id
    } else {
      return
    }
    
    // No need to do anything if staying in same column
    if (activeColumnId === overColumnId) return
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveTask(null)
    
    if (!over) return
    
    const activeData = active.data.current as DragData | undefined
    
    if (!activeData || activeData.type !== 'task') return
    
    const activeTask = activeData.task
    const overData = over.data.current as DragData | ColumnDropData | undefined
    
    let overColumnId: string
    let newPosition: number
    
    if (overData?.type === 'task') {
      // Dropping over another task
      const overTask = overData.task
      overColumnId = overTask.columnId
      
      const overColumn = columns.find(col => col.id === overColumnId)
      if (!overColumn) return
      
      const overTaskIndex = overColumn.tasks.findIndex(task => task.id === overTask.id)
      newPosition = overTaskIndex
    } else if (overData?.type === 'column') {
      // Dropping over a column
      overColumnId = overData.column.id
      const overColumn = columns.find(col => col.id === overColumnId)
      if (!overColumn) return
      
      newPosition = overColumn.tasks.length
    } else {
      return
    }
    
    // If same position, no need to update
    if (activeTask.columnId === overColumnId && activeTask.position === newPosition) {
      return
    }
    
    try {
      // Optimistic update
      setColumns({
        columnId: activeTask.columnId,
        taskId: activeTask.id,
        newPosition,
        newColumnId: overColumnId
      })
      
      // Server update
      await updateTaskPosition(activeTask.id, overColumnId, newPosition)
    } catch (error) {
      console.error('Failed to update task position:', error)
      // The page will be revalidated by the server action, so the optimistic update will be reverted
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnTasks = column.tasks.sort((a, b) => a.position - b.position)
          return (
            <DroppableColumn 
              key={column.id}
              column={column} 
              tasks={columnTasks}
            />
          )
        })}
      </div>
      
      <DragOverlay>
        {activeTask ? (
          <TaskCard task={activeTask} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}