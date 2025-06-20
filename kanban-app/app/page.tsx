import { BoardCreateForm } from '@/components/board-create-form'
import { BoardList } from '@/components/board-list'
import { prisma } from '@/lib/prisma'

async function getBoards() {
  try {
    const boards = await prisma.board.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true
      }
    })
    return boards
  } catch (error) {
    console.error('Failed to fetch boards:', error)
    return []
  }
}

export default async function Home() {
  const boards = await getBoards()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Kanban Board
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              プロジェクトを効率的に管理するためのカンバンボードアプリケーションです。
              新しいボードを作成して、タスクの進捗を可視化しましょう。
            </p>
          </div>
          
          <div className="flex justify-center">
            <BoardCreateForm />
          </div>

          <div className="pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                ボード一覧
              </h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {boards.length} 件のボード
              </span>
            </div>
            <BoardList boards={boards} />
          </div>
        </div>
      </div>
    </div>
  );
}
