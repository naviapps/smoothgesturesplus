import 'react-devtools'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { SmoothGestures } from './SmoothGestures'

const root: HTMLDivElement = document.createElement('div')
root.id = 'smoothgestures'
document.body.before(root)

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <SmoothGestures />
  </React.StrictMode>,
)
