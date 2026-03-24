import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const EMPTY_ACTION = {
  project_id: '', meeting_id: '', description: '', assigned_to: '', due_date: '', status: 'Open', priority: 'Medium',
}

export default function Actions() {
  const [actions, setActions] = useState([])
  const [projects, setProjects] = useState([])
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_ACTION)
  const [editId, setEditId] = useState(null)
  const [filter, setFilter] = useState('All')

  async function load() {
    const [{ data: a }, { data: p }, { data: m }] = await Promise.all([
      supabase.from('actions').select('*').order('due_date', { ascending: true }),
      supabase.from('projects').select('id, name'),
      supabase.from('meetings').select('id, title'),
    ])
    setActions(a ?? [])
    setProjects(p ?? [])
    setMeetings(m ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() { setForm(EMPTY_ACTION); setEditId(null); setShowModal(true) }

  function openEdit(a) {
    setForm({
      project_id: a.project_id ?? '', meeting_id: a.meeting_id ?? '', description: a.description,
      assigned_to: a.assigned_to ?? '', due_date: a.due_date ?? '', status: a.status, priority: a.priority ?? 'Medium',
    })
    setEditId(a.id)
    setShowModal(true)
  }

  async function save() {
    const payload = { ...form, project_id: form.project_id || null, meeting_id: form.meeting_id || null }
    if (editId) {
      await supabase.from('actions').update(payload).eq('id', editId)
    } else {
      await supabase.from('actions').insert(payload)
    }
    setShowModal(false)
    load()
  }

  async function remove(id) {
    await supabase.from('actions').delete().eq('id', id)
    load()
  }

  const filtered = filter === 'All' ? actions : actions.filter(a => a.status === filter)

  function isOverdue(a) {
    return a.status !== 'Closed' && a.due_date && new Date(a.due_date) < new Date()
  }

  if (loading) return <div className="empty">Loading actions…</div>

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
          {['All', 'Open', 'In Progress', 'Closed'].map(s => (
            <div key={s} className={`tab${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>{s}</div>
          ))}
        </div>
        <button className="btn btn-amber" onClick={openNew}>+ New Action</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="empty">No actions found</td></tr>
              ) : filtered.map(a => (
                <tr key={a.id} className={isOverdue(a) ? 'overdue-row' : ''}>
                  <td>{a.description}</td>
                  <td>{a.assigned_to}</td>
                  <td>
                    <span className={`badge ${a.priority === 'High' ? 'badge-red' : a.priority === 'Low' ? 'badge-slate' : 'badge-amber'}`}>
                      {a.priority}
                    </span>
                  </td>
                  <td>{a.due_date}</td>
                  <td>
                    <span className={`badge ${a.status === 'Closed' ? 'badge-green' : a.status === 'In Progress' ? 'badge-blue' : 'badge-amber'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(a)}>Edit</button>{' '}
                    <button className="btn btn-danger btn-sm" onClick={() => remove(a.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editId ? 'Edit Action' : 'New Action'}</div>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full">
                  <label>Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Project</label>
                  <select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })}>
                    <option value="">— None —</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Meeting</label>
                  <select value={form.meeting_id} onChange={e => setForm({ ...form, meeting_id: e.target.value })}>
                    <option value="">— None —</option>
                    {meetings.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Assigned To</label>
                  <input value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Closed</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
