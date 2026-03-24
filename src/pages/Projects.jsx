import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const EMPTY_PROJECT = {
  name: '', client: '', status: 'Active', start_date: '', end_date: '', description: '',
}

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_PROJECT)
  const [editId, setEditId] = useState(null)

  async function load() {
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    setProjects(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setForm(EMPTY_PROJECT)
    setEditId(null)
    setShowModal(true)
  }

  function openEdit(p) {
    setForm({ name: p.name, client: p.client, status: p.status, start_date: p.start_date ?? '', end_date: p.end_date ?? '', description: p.description ?? '' })
    setEditId(p.id)
    setShowModal(true)
  }

  async function save() {
    if (editId) {
      await supabase.from('projects').update(form).eq('id', editId)
    } else {
      await supabase.from('projects').insert(form)
    }
    setShowModal(false)
    load()
  }

  async function remove(id) {
    await supabase.from('projects').delete().eq('id', id)
    load()
  }

  if (loading) return <div className="empty">Loading projects…</div>

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 0, borderBottom: 'none' }}>All Projects</div>
        <button className="btn btn-amber" onClick={openNew}>+ New Project</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Client</th>
                <th>Status</th>
                <th>Start</th>
                <th>End</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr><td colSpan={6} className="empty">No projects yet</td></tr>
              ) : projects.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>{p.client}</td>
                  <td>
                    <span className={`badge ${p.status === 'Active' ? 'badge-green' : p.status === 'On Hold' ? 'badge-amber' : 'badge-slate'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>{p.start_date}</td>
                  <td>{p.end_date}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>{' '}
                    <button className="btn btn-danger btn-sm" onClick={() => remove(p.id)}>Delete</button>
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
              <div className="modal-title">{editId ? 'Edit Project' : 'New Project'}</div>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Project Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Client</label>
                  <input value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option>Active</option>
                    <option>On Hold</option>
                    <option>Completed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
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
