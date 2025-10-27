import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export default function FadeIn({ children, className }){
  const shouldReduce = useReducedMotion()
  if(shouldReduce) return <div className={className}>{children}</div>
  return (
    <motion.div className={className}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
