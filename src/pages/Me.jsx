import React from 'react'
import { useStore } from '../app/store'
import { Navigate } from 'react-router-dom'

export default function Me(){
  const { users, session } = useStore()
  const me = users.find(u=>u.id===session.userId)
  if(!me) return <Navigate to="/login" replace />
  return <Navigate to={`/profile/${me.id}`} replace />
}
