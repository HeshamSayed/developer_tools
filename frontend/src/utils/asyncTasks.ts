/**
 * Async task utilities for handling Celery task polling and progress tracking
 */

export interface TaskStatus {
  task_id: string
  status: 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE' | 'RETRY'
  message: string
  progress: number
  download_ready?: boolean
  result?: any
  error?: string
}

export interface AsyncTaskOptions {
  pollInterval?: number // milliseconds between polls (default: 2000)
  maxAttempts?: number // max polling attempts (default: 150 = 5 minutes)
  onProgress?: (status: TaskStatus) => void
  onComplete?: (result: any) => void
  onError?: (error: string) => void
}

/**
 * Poll a Celery task until completion
 *
 * @param taskId - The Celery task ID to poll
 * @param statusUrl - API endpoint to check task status
 * @param options - Polling configuration options
 * @returns Promise that resolves with final result or rejects with error
 */
export async function pollTaskStatus(
  taskId: string,
  statusUrl: string,
  options: AsyncTaskOptions = {}
): Promise<any> {
  const {
    pollInterval = 2000,
    maxAttempts = 150,
    onProgress,
    onComplete,
    onError
  } = options

  let attempts = 0

  return new Promise((resolve, reject) => {
    const poll = async () => {
      attempts++

      if (attempts > maxAttempts) {
        const error = 'Task timeout - maximum polling attempts reached'
        onError?.(error)
        reject(new Error(error))
        return
      }

      try {
        const response = await fetch(statusUrl)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const status: TaskStatus = await response.json()

        // Call progress callback
        onProgress?.(status)

        // Handle task states
        switch (status.status) {
          case 'SUCCESS':
            onComplete?.(status.result)
            resolve(status.result)
            return

          case 'FAILURE':
            const error = status.error || 'Task failed'
            onError?.(error)
            reject(new Error(error))
            return

          case 'PENDING':
          case 'STARTED':
          case 'RETRY':
            // Continue polling
            setTimeout(poll, pollInterval)
            break

          default:
            // Unknown status, continue polling
            setTimeout(poll, pollInterval)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Network error'
        onError?.(message)
        reject(error)
      }
    }

    // Start polling
    poll()
  })
}

/**
 * Submit async task and automatically poll for completion
 *
 * @param submitFn - Function that submits the task and returns task_id
 * @param options - Polling configuration options
 * @returns Promise that resolves with final result
 */
export async function submitAndPoll<T>(
  submitFn: () => Promise<{ task_id: string; status_url?: string }>,
  options: AsyncTaskOptions = {}
): Promise<T> {
  // Submit the task
  const submission = await submitFn()

  // Determine status URL
  const statusUrl = submission.status_url ||
    `/api/pdf-tools/task-status/${submission.task_id}/`

  // Poll for completion
  return pollTaskStatus(submission.task_id, statusUrl, options)
}

/**
 * Cancel a running task
 *
 * @param taskId - The Celery task ID to cancel
 * @returns Promise that resolves when cancellation is confirmed
 */
export async function cancelTask(taskId: string): Promise<void> {
  const response = await fetch(`/api/pdf-tools/cancel-task/${taskId}/`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw new Error(`Failed to cancel task: ${response.statusText}`)
  }

  const result = await response.json()

  if (!result.success) {
    throw new Error(result.message || 'Failed to cancel task')
  }
}

/**
 * Get current queue status
 *
 * @returns Promise with queue statistics
 */
export async function getQueueStatus(): Promise<{
  active_tasks: number
  scheduled_tasks: number
  reserved_tasks: number
  total_queued: number
  status: 'healthy' | 'busy' | 'unavailable'
}> {
  const response = await fetch('/api/pdf-tools/queue-status/')

  if (!response.ok) {
    throw new Error('Failed to fetch queue status')
  }

  return response.json()
}

/**
 * Format progress message based on task status
 */
export function getProgressMessage(status: TaskStatus): string {
  switch (status.status) {
    case 'PENDING':
      return 'Your request is in the queue...'
    case 'STARTED':
      return 'Processing your request...'
    case 'SUCCESS':
      return 'Processing complete! Your file is ready.'
    case 'FAILURE':
      return 'Processing failed. Please try again.'
    case 'RETRY':
      return 'Retrying... Please wait.'
    default:
      return status.message || 'Processing...'
  }
}

/**
 * Get progress percentage based on status
 */
export function getProgressPercentage(status: TaskStatus): number {
  if (status.progress !== undefined) {
    return status.progress
  }

  switch (status.status) {
    case 'PENDING':
      return 10
    case 'STARTED':
      return 50
    case 'SUCCESS':
      return 100
    case 'FAILURE':
      return 0
    case 'RETRY':
      return 25
    default:
      return 0
  }
}
