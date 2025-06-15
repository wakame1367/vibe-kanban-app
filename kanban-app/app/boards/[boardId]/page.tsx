import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KanbanBoard } from './kanban-board'

interface BoardPageProps {
  params: Promise<{
    boardId: string
  }>
}

async function getBoard(boardId: string) {
  try {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              orderBy: { position: 'asc' }
            }
          }
        }
      }
    })
    
    return board
  } catch (error) {
    console.error('Failed to fetch board:', error)
    return null
  }
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = await params
  const board = await getBoard(boardId)

  if (!board) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="border-b bg-white dark:bg-slate-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {board.title}
              </h1>
              {board.description && (
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {board.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <KanbanBoard board={board} />
      </div>
    </div>
  )
}