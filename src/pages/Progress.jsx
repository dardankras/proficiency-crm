import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const EMPTY_ENTRY = {
  project_id: '', date: '', description: '', percent_complete: '', reported_by: '',
}

export default function Progress() {
  const [entries, setEntries] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_ENTRY)
  const [editId, setEditId] = useState(null)
  const [filterProject, setFilterProject] = useState('All')

  async function load() {
    const [{ data: e }, { data: p }] = await Promise.all([
      supabase.from('progress').select('*').order('date', { ascending: false }),
      supabase.from('projects').select('id, name'),
    ])
    setEntries(e ?? [])
    setProjects(p ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() { setForm(EMPTY_ENTRY); setEditId(null); setShowModal(true) }

  function openEdit(e) {
    setForm({
      project_id: e.project_id ?? '', date: e.date ?? '', description: e.description ?? '',
      percent_complete: e.percent_complete ?? '', reported_by: e.reported_by ?? '',
    })
    setEditId(e.id)
    setShowModal(true)
  }

  async function save() {
    const payload = {
      ...form,
      project_id: form.project_id || null,
      percent_complete: form.percent_complete === '' ? null : Number(form.percent_complete),
    }
    if (editId) {
      await supabase.from('progress').update(payload).eq('id', editId)
    } else {
      await supabase.from('progress').insert(payload)
    }
    setShowModal(false)
    load()
  }

  async function remove(id) {
    await supabase.from('progress').delete().eq('id', id)
    load()
  }

  const projectMap = Object.fromEntries(projects.map(p => [p.id, p.name]))
  const filtered = filterProject === 'All' ? entries : entries.filter(e => e.project_id === filterProject)

  if (loading) return <div className="empty">Loading progress…</div>

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="section-title" style={{ marginBottom: 0, borderBottom: 'none' }}>Progress Reports</div>
          <select value={filterProject} onChange={e => setFilterProject(e.target.value)} style={{ fontSize: 13 }}>
            <option value="All">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <button className="btn btn-amber" onClick={openNew}>+ New Entry</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Project</th>
                <th>Description</th>
                <th>% Complete</th>
                <th>Reported By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="empty">No progress entries yet</td></tr>
              ) : filtered.map(e => (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td>{projectMap[e.project_id] ?? '—'}</td>
                  <td>{e.description}</td>
                  <td>
                    {e.percent_complete != null && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${e.percent_complete}%`, height: '100%', background: e.percent_complete >= 75 ? 'var(--green)' : e.percent_complete >= 40 ? 'var(--amber)' : 'var(--blue)', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{e.percent_complete}%</span>
                      </div>
                    )}
                  </td>
                  <td>{e.reported_by}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(e)}>Edit</button>{' '}
                    <button className="btn btn-danger btn-sm" onClick={() => remove(e.id)}>Delete</button>
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
              <div className="modal-title">{editId ? 'Edit Progress' : 'New Progress Entry'}</div>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Project</label>
                  <select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })}>
                    <option value="">— Select —</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>% Complete</label>
                  <input type="number" min="0" max="100" value={form.percent_complete} onChange={e => setForm({ ...form, percent_complete: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Reported By</label>
                  <input value={form.reported_by} onChange={e => setForm({ ...form, reported_by: e.target.value })} />
                </div>
                <div className="form-group full">
                  <label>Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
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
