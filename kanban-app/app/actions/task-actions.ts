'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Priority } from '@prisma/client'

export async function updateTaskPosition(
  taskId: string,
  newColumnId: string,
  newPosition: number
) {
  try {
    await prisma.$transaction(async (tx) => {
      // Get the task to move
      const task = await tx.task.findUnique({
        where: { id: taskId },
        include: { column: { select: { id: true, boardId: true } } }
      })

      if (!task) {
        throw new Error('タスクが見つかりません')
      }

      const oldColumnId = task.columnId
      const boardId = task.column.boardId

      // Step 1: Set the moving task to a temporary negative position to avoid conflicts
      await tx.task.update({
        where: { id: taskId },
        data: { position: -1 }
      })

      if (oldColumnId === newColumnId) {
        // Moving within the same column
        if (newPosition > task.position) {
          // Moving down - shift tasks between old and new positions up
          await tx.task.updateMany({
            where: {
              columnId: oldColumnId,
              position: {
                gt: task.position,
                lte: newPosition
              }
            },
            data: { position: { decrement: 1 } }
          })
        } else if (newPosition < task.position) {
          // Moving up - shift tasks between new and old positions down
          await tx.task.updateMany({
            where: {
              columnId: oldColumnId,
              position: {
                gte: newPosition,
                lt: task.position
              }
            },
            data: { position: { increment: 1 } }
          })
        }
      } else {
        // Moving to different column
        // Step 2a: Shift tasks in old column up (fill the gap)
        await tx.task.updateMany({
          where: {
            columnId: oldColumnId,
            position: { gt: task.position }
          },
          data: { position: { decrement: 1 } }
        })

        // Step 2b: Shift tasks in new column down (make space)
        await tx.task.updateMany({
          where: {
            columnId: newColumnId,
            position: { gte: newPosition }
          },
          data: { position: { increment: 1 } }
        })
      }

      // Step 3: Update the task to its final position and column
      await tx.task.update({
        where: { id: taskId },
        data: {
          columnId: newColumnId,
          position: newPosition
        }
      })

      // Revalidate the board page
      revalidatePath(`/boards/${boardId}`)
    })
  } catch (error) {
    console.error('Failed to update task position:', error)
    throw new Error('タスクの移動に失敗しました')
  }
}

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