import { useEffect, useRef, useState } from 'react'

export function useInView({ threshold = 0.3 } = {}){
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if(!ref.current || visible) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        obs.disconnect()
      }
    }, { threshold })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold, visible])

  return { ref, visible }
}
