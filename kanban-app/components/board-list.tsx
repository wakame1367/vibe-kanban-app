import Link from 'next/link'
import { Calendar, FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Board {
  id: string
  title: string
  description: string | null
  createdAt: Date
}

interface BoardListProps {
  boards: Board[]
}

export function BoardList({ boards }: BoardListProps) {
  if (boards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto max-w-md">
          <FileText className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">
            ボードがありません
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            新しいボードを作成して、プロジェクトの管理を始めましょう。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {boards.map((board) => (
        <Link
          key={board.id}
          href={`/boards/${board.id}`}
          className="group block"
        >
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 p-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                {board.title}
              </h3>
              
              {board.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                  {board.description}
                </p>
              )}
              
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-700">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{formatDate(board.createdAt)}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}