import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Meetings from './pages/Meetings'
import Actions from './pages/Actions'
import RFIs from './pages/RFIs'
import Progress from './pages/Progress'

const NAV = [
  { path: '/',          label: 'Dashboard' },
  { path: '/projects',  label: 'Projects'  },
  { path: '/meetings',  label: 'Meetings'  },
  { path: '/actions',   label: 'Actions'   },
  { path: '/rfis',      label: 'RFIs'      },
  { path: '/progress',  label: 'Progress'  },
]

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src="/logo.png" alt="Proficiency Design & Build" className="sidebar-logo-img" />
        <div className="role">Project CRM</div>
        <div className="amber-bar" />
      </div>
      <div className="nav-section">
        <div className="nav-label">Menu</div>
        {NAV.map(n => (
          <NavLink
            key={n.path}
            to={n.path}
            end={n.path === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            {n.label}
          </NavLink>
        ))}
      </div>
    </div>
  )
}

function Topbar() {
  const { pathname } = useLocation()
  const page = NAV.find(n => n.path === pathname)?.label ?? 'Proficiency CRM'
  const date = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  return (
    <div className="topbar">
      <div>
        <div className="topbar-title">{page}</div>
        <div className="topbar-sub">{date}</div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar />
        <div className="main">
          <Topbar />
          <div className="content">
            <Routes>
              <Route path="/"         element={<Dashboard />} />
              <Route path="/projects" element={<Projects />}  />
              <Route path="/meetings" element={<Meetings />}  />
              <Route path="/actions"  element={<Actions />}   />
              <Route path="/rfis"     element={<RFIs />}      />
              <Route path="/progress" element={<Progress />}  />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  )
}