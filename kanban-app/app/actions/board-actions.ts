'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createBoard(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string

  if (!title || title.trim().length === 0) {
    throw new Error('Title is required')
  }

  try {
    const board = await prisma.board.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        columns: {
          create: [
            {
              title: 'To Do',
              position: 0,
              color: '#ef4444'
            },
            {
              title: 'In Progress',
              position: 1,
              color: '#f59e0b'
            },
            {
              title: 'Done',
              position: 2,
              color: '#10b981'
            }
          ]
        }
      }
    })

    revalidatePath('/')
    redirect(`/boards/${board.id}`)
  } catch (error) {
    console.error('Failed to create board:', error)
    throw new Error('Failed to create board')
  }
}