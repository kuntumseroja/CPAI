import { createContext, useContext, useState, ReactNode } from 'react'

const DemoContext = createContext<{
  isDemoMode: boolean
  setDemoMode: (v: boolean) => void
}>({ isDemoMode: true, setDemoMode: () => {} })

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setDemoMode] = useState(true)
  return (
    <DemoContext.Provider value={{ isDemoMode, setDemoMode }}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemoMode() {
  return useContext(DemoContext)
}
