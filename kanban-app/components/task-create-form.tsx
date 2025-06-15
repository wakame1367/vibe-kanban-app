'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createTask } from '@/app/actions/task-actions'

interface TaskCreateFormProps {
  columnId: string
}

export function TaskCreateForm({ columnId }: TaskCreateFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [priority, setPriority] = useState<string>('MEDIUM')

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      // Add the selected priority and columnId to the form data
      formData.set('priority', priority)
      formData.set('columnId', columnId)
      
      await createTask(formData)
      setOpen(false)
      // Reset form state
      setPriority('MEDIUM')
    } catch (error) {
      console.error('Failed to create task:', error)
      // TODO: Add proper error handling/toast notification
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="gap-1 text-xs">
          <Plus className="h-3 w-3" />
          タスクを追加
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新しいタスクを作成</DialogTitle>
          <DialogDescription>
            タスクの詳細を入力してください。
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル *</Label>
            <Input
              id="title"
              name="title"
              placeholder="タスクのタイトルを入力"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="タスクの説明を入力（任意）"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">優先度</Label>
            <Select value={priority} onValueChange={setPriority} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="優先度を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    低
                  </span>
                </SelectItem>
                <SelectItem value="MEDIUM">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    中
                  </span>
                </SelectItem>
                <SelectItem value="HIGH">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    高
                  </span>
                </SelectItem>
                <SelectItem value="URGENT">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    緊急
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">期限日</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '作成中...' : '作成'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}