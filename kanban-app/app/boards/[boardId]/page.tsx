import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskCreateForm } from '@/components/task-create-form'

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {board.columns.map((column) => (
            <div key={column.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border">
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
                      {column.tasks.length}
                    </span>
                  </div>
                  <TaskCreateForm columnId={column.id} />
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                {column.tasks.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-8">
                    タスクがありません
                  </p>
                ) : (
                  column.tasks.map((task) => (
                    <div 
                      key={task.id}
                      className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg border"
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
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}