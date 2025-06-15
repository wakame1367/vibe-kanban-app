'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Priority } from '@prisma/client'

export async function createTask(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const priority = formData.get('priority') as Priority
  const dueDateString = formData.get('dueDate') as string
  const columnId = formData.get('columnId') as string

  if (!title || title.trim().length === 0) {
    throw new Error('タイトルは必須です')
  }

  if (!columnId) {
    throw new Error('カラムIDが必要です')
  }

  // Validate priority
  if (priority && !['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
    throw new Error('無効な優先度です')
  }

  // Parse due date if provided
  let dueDate: Date | null = null
  if (dueDateString && dueDateString.trim().length > 0) {
    dueDate = new Date(dueDateString)
    if (isNaN(dueDate.getTime())) {
      throw new Error('無効な期限日です')
    }
  }

  try {
    // Get the current maximum position in the column to place the new task at the end
    const maxPositionResult = await prisma.task.aggregate({
      where: { columnId },
      _max: { position: true }
    })
    
    const newPosition = (maxPositionResult._max.position ?? -1) + 1

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority || 'MEDIUM',
        dueDate,
        position: newPosition,
        columnId
      }
    })

    // Get the board ID to revalidate the correct path
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      select: { boardId: true }
    })

    if (column) {
      revalidatePath(`/boards/${column.boardId}`)
    }

    return task
  } catch (error) {
    console.error('Failed to create task:', error)
    throw new Error('タスクの作成に失敗しました')
  }
}