/** @jsx jsx */
import { jsx } from 'theme-ui'
import { useState, useEffect, useRef } from 'react'

import { Parent, Child } from './styles'

const sumUp = (acc, node) => acc + node.scrollHeight

export default function Masonry({
  children,
  rowHeight = 40,
  colWidth = '17em',
  ...rest
}) {
  const ref = useRef(null)
  const [spans, setSpans] = useState([])

  const computeSpans = () => {
    if (ref.current) {
      const spans = []
      Array.from(ref.current.children).forEach(child => {
        const childHeight = Array.from(child.children).reduce(sumUp, 0)
        const span = Math.ceil(childHeight / rowHeight)
        spans.push(span + 1)
        child.style.height = span * rowHeight + `px`
      })
      setSpans(spans)
    }
  }

  useEffect(() => {
    computeSpans()

    window.addEventListener('resize', computeSpans)

    return () => {
      window.removeEventListener('resize', computeSpans)
    }
  }, [])

  return (
    <Parent ref={ref} colWidth={colWidth} {...rest}>
      {children.map((child, i) => (
        <Child key={i} span={spans[i]}>
          {child}
        </Child>
      ))}
    </Parent>
  )
}