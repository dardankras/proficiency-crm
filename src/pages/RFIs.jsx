import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const EMPTY_RFI = {
  project_id: '', subject: '', from_party: '', to_party: '', date_issued: '', date_required: '', status: 'Open', details: '',
}

export default function RFIs() {
  const [rfis, setRfis] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_RFI)
  const [editId, setEditId] = useState(null)
  const [filter, setFilter] = useState('All')

  async function load() {
    const [{ data: r }, { data: p }] = await Promise.all([
      supabase.from('rfis').select('*').order('date_issued', { ascending: false }),
      supabase.from('projects').select('id, name'),
    ])
    setRfis(r ?? [])
    setProjects(p ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() { setForm(EMPTY_RFI); setEditId(null); setShowModal(true) }

  function openEdit(r) {
    setForm({
      project_id: r.project_id ?? '', subject: r.subject, from_party: r.from_party ?? '', to_party: r.to_party ?? '',
      date_issued: r.date_issued ?? '', date_required: r.date_required ?? '', status: r.status, details: r.details ?? '',
    })
    setEditId(r.id)
    setShowModal(true)
  }

  async function save() {
    const payload = { ...form, project_id: form.project_id || null }
    if (editId) {
      await supabase.from('rfis').update(payload).eq('id', editId)
    } else {
      await supabase.from('rfis').insert(payload)
    }
    setShowModal(false)
    load()
  }

  async function remove(id) {
    await supabase.from('rfis').delete().eq('id', id)
    load()
  }

  const filtered = filter === 'All' ? rfis : rfis.filter(r => r.status === filter)

  if (loading) return <div className="empty">Loading RFIs…</div>

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
          {['All', 'Open', 'Answered', 'Overdue'].map(s => (
            <div key={s} className={`tab${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>{s}</div>
          ))}
        </div>
        <button className="btn btn-amber" onClick={openNew}>+ New RFI</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>From</th>
                <th>To</th>
                <th>Issued</th>
                <th>Required</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="empty">No RFIs found</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.subject}</td>
                  <td>{r.from_party}</td>
                  <td>{r.to_party}</td>
                  <td>{r.date_issued}</td>
                  <td>{r.date_required}</td>
                  <td>
                    <span className={`badge ${r.status === 'Answered' ? 'badge-green' : r.status === 'Overdue' ? 'badge-red' : 'badge-blue'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(r)}>Edit</button>{' '}
                    <button className="btn btn-danger btn-sm" onClick={() => remove(r.id)}>Delete</button>
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
              <div className="modal-title">{editId ? 'Edit RFI' : 'New RFI'}</div>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group full">
                  <label>Subject</label>
                  <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Project</label>
                  <select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })}>
                    <option value="">— None —</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option>Open</option>
                    <option>Answered</option>
                    <option>Overdue</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>From</label>
                  <input value={form.from_party} onChange={e => setForm({ ...form, from_party: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>To</label>
                  <input value={form.to_party} onChange={e => setForm({ ...form, to_party: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Date Issued</label>
                  <input type="date" value={form.date_issued} onChange={e => setForm({ ...form, date_issued: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Date Required</label>
                  <input type="date" value={form.date_required} onChange={e => setForm({ ...form, date_required: e.target.value })} />
                </div>
                <div className="form-group full">
                  <label>Details</label>
                  <textarea value={form.details} onChange={e => setForm({ ...form, details: e.target.value })} />
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
