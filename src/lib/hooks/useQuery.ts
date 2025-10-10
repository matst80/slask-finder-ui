import { useContext } from 'react'
import { QueryContext } from './queryContext'

export const useQuery = () => {
  const context = useContext(QueryContext)
  if (context == null) {
    throw new Error('useQuery must be used within a QueryProvider')
  }
  return context
}
