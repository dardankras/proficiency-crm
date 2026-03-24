import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Dashboard() {
  const [stats, setStats] = useState({ projects: 0, meetings: 0, actions: 0, rfis: 0 })
  const [recentActions, setRecentActions] = useState([])
  const [recentRfis, setRecentRfis] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { count: projectCount },
        { count: meetingCount },
        { count: actionCount },
        { count: rfiCount },
        { data: actionsData },
        { data: rfisData },
      ] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('meetings').select('*', { count: 'exact', head: true }),
        supabase.from('actions').select('*', { count: 'exact', head: true }),
        supabase.from('rfis').select('*', { count: 'exact', head: true }),
        supabase.from('actions').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('rfis').select('*').order('created_at', { ascending: false }).limit(5),
      ])
      setStats({
        projects: projectCount ?? 0,
        meetings: meetingCount ?? 0,
        actions: actionCount ?? 0,
        rfis: rfiCount ?? 0,
      })
      setRecentActions(actionsData ?? [])
      setRecentRfis(rfisData ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="empty">Loading dashboard…</div>

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card amber">
          <div className="stat-label">Projects</div>
          <div className="stat-value">{stats.projects}</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Meetings</div>
          <div className="stat-value">{stats.meetings}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Actions</div>
          <div className="stat-value">{stats.actions}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">RFIs</div>
          <div className="stat-value">{stats.rfis}</div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Actions</div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Assigned To</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActions.length === 0 ? (
                  <tr><td colSpan={4} className="empty">No actions yet</td></tr>
                ) : recentActions.map(a => (
                  <tr key={a.id}>
                    <td>{a.description}</td>
                    <td>{a.assigned_to}</td>
                    <td>{a.due_date}</td>
                    <td>
                      <span className={`badge ${a.status === 'Closed' ? 'badge-green' : a.status === 'Overdue' ? 'badge-red' : 'badge-amber'}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent RFIs</div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>From</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRfis.length === 0 ? (
                  <tr><td colSpan={4} className="empty">No RFIs yet</td></tr>
                ) : recentRfis.map(r => (
                  <tr key={r.id}>
                    <td>{r.subject}</td>
                    <td>{r.from_party}</td>
                    <td>{r.date_issued}</td>
                    <td>
                      <span className={`badge ${r.status === 'Answered' ? 'badge-green' : r.status === 'Overdue' ? 'badge-red' : 'badge-blue'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
