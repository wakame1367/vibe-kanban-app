import { BoardCreateForm } from '@/components/board-create-form'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-8">
          <div>
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
        </div>
      </div>
    </div>
  );
}
