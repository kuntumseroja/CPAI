import { Link, useLocation } from 'react-router-dom'
import { useDemoMode } from '../demo/DemoContext'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { isDemoMode, setDemoMode } = useDemoMode()

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/submit', label: 'Submit Finding' },
    { path: '/analysis', label: 'Analysis' },
  ]

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>◇</span>
          CAPA AI
        </Link>
        <nav style={styles.nav}>
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              style={{
                ...styles.navLink,
                ...(location.pathname === path ? styles.navLinkActive : {}),
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
        <label style={styles.demoToggle}>
          <input
            type="checkbox"
            checked={isDemoMode}
            onChange={(e) => setDemoMode(e.target.checked)}
          />
          <span style={styles.demoLabel}>Demo Mode</span>
        </label>
        <span style={styles.badge}>PT Bio Farma</span>
      </header>
      <main style={styles.main}>{children}</main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    padding: '1rem 2rem',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)',
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--accent)',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  logoIcon: {
    fontSize: '1.5rem',
    color: 'var(--accent)',
  },
  nav: {
    display: 'flex',
    gap: '0.5rem',
    flex: 1,
  },
  navLink: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  navLinkActive: {
    color: 'var(--accent)',
    background: 'rgba(0, 200, 150, 0.1)',
  },
  demoToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  demoLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  badge: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    padding: '0.25rem 0.5rem',
    border: '1px solid var(--border)',
    borderRadius: '4px',
  },
  main: {
    flex: 1,
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
}
