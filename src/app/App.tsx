import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { AtlasPage } from '@/components/pages/AtlasPage'

gsap.registerPlugin(useGSAP)

export function App() {
  return <AtlasPage />
}
