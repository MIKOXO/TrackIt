import { useReducedMotion, useSpring } from 'framer-motion'

export const SPRING = {
  snappy: { type: 'spring', stiffness: 180, damping: 22, mass: 0.9 },
  soft: { type: 'spring', stiffness: 90, damping: 16, mass: 1 },
  bouncy: { type: 'spring', stiffness: 240, damping: 16, mass: 0.8 },
}

export const stagger = (staggerChildren = 0.08, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
})

export const springUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { ...SPRING.soft, ...(delay ? { delay } : {}) },
  },
})

export const useTilt = (strength = 6) => {
  const reduced = useReducedMotion()
  const rotateX = useSpring(0, { stiffness: 160, damping: 16, mass: 0.6 })
  const rotateY = useSpring(0, { stiffness: 160, damping: 16, mass: 0.6 })

  const onPointerMove = (event) => {
    if (reduced) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    rotateY.set(x * strength)
    rotateX.set(-y * strength)
  }

  const onPointerLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  return {
    onPointerMove,
    onPointerLeave,
    style: { rotateX, rotateY, transformPerspective: 900 },
  }
}
