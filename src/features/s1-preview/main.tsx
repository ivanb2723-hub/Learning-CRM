import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../index.css'
import { S1Preview } from './S1Preview.tsx'

createRoot(document.getElementById('root')!).render(<StrictMode><S1Preview /></StrictMode>)
