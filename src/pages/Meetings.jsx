import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const EMPTY_MEETING = {
  project_id: '', title: '', date: '', location: '', attendees: '',
}

export default function Meetings() {
  const [meetings, setMeetings] = useState([])
  const [projects, setProjects] = useState([])
  const [minutes, setMinutes] = useState([])
  const [distribution, setDistribution] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_MEETING)
  const [editId, setEditId] = useState(null)
  const [selected, setSelected] = useState(null)
  const [minuteText, setMinuteText] = useState('')

  async function load() {
    const [{ data: m }, { data: p }, { data: min }, { data: dist }] = await Promise.all([
      supabase.from('meetings').select('*').order('date', { ascending: false }),
      supabase.from('projects').select('id, name'),
      supabase.from('minutes').select('*').order('created_at', { ascending: true }),
      supabase.from('distribution').select('*'),
    ])
    setMeetings(m ?? [])
    setProjects(p ?? [])
    setMinutes(min ?? [])
    setDistribution(dist ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setForm(EMPTY_MEETING)
    setEditId(null)
    setShowModal(true)
  }

  function openEdit(m) {
    setForm({ project_id: m.project_id ?? '', title: m.title, date: m.date ?? '', location: m.location ?? '', attendees: m.attendees ?? '' })
    setEditId(m.id)
    setShowModal(true)
  }

  async function save() {
    const payload = { ...form, project_id: form.project_id || null }
    if (editId) {
      await supabase.from('meetings').update(payload).eq('id', editId)
    } else {
      await supabase.from('meetings').insert(payload)
    }
    setShowModal(false)
    load()
  }

  async function remove(id) {
    await supabase.from('meetings').delete().eq('id', id)
    if (selected?.id === id) setSelected(null)
    load()
  }

  async function addMinute() {
    if (!minuteText.trim() || !selected) return
    await supabase.from('minutes').insert({ meeting_id: selected.id, content: minuteText.trim() })
    setMinuteText('')
    load()
  }

  const meetingMinutes = selected ? minutes.filter(m => m.meeting_id === selected.id) : []
  const meetingDist = selected ? distribution.filter(d => d.meeting_id === selected.id) : []

  if (loading) return <div className="empty">Loading meetings…</div>

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 0, borderBottom: 'none' }}>All Meetings</div>
        <button className="btn btn-amber" onClick={openNew}>+ New Meeting</button>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {meetings.length === 0 ? (
                  <tr><td colSpan={4} className="empty">No meetings yet</td></tr>
                ) : meetings.map(m => (
                  <tr key={m.id} style={{ cursor: 'pointer', background: selected?.id === m.id ? '#f0f4ff' : undefined }} onClick={() => setSelected(m)}>
                    <td style={{ fontWeight: 600 }}>{m.title}</td>
                    <td>{m.date}</td>
                    <td>{m.location}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); openEdit(m) }}>Edit</button>{' '}
                      <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); remove(m.id) }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">{selected ? `Minutes — ${selected.title}` : 'Select a meeting'}</div>
          </div>
          <div className="card-body">
            {!selected ? (
              <div className="empty">Click a meeting to view minutes</div>
            ) : (
              <>
                {meetingMinutes.length === 0 ? (
                  <div className="empty" style={{ padding: '12px 0' }}>No minutes recorded</div>
                ) : (
                  <ul style={{ paddingLeft: 18, marginBottom: 12 }}>
                    {meetingMinutes.map(m => <li key={m.id} style={{ marginBottom: 6, fontSize: 13 }}>{m.content}</li>)}
                  </ul>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <input placeholder="Add a minute…" value={minuteText} onChange={e => setMinuteText(e.target.value)} style={{ flex: 1 }} onKeyDown={e => e.key === 'Enter' && addMinute()} />
                  <button className="btn btn-primary btn-sm" onClick={addMinute}>Add</button>
                </div>
                {meetingDist.length > 0 && (
                  <>
                    <div className="section-title" style={{ marginTop: 16 }}>Distribution</div>
                    <ul style={{ paddingLeft: 18 }}>
                      {meetingDist.map(d => <li key={d.id} style={{ fontSize: 13 }}>{d.name} — {d.company}</li>)}
                    </ul>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editId ? 'Edit Meeting' : 'New Meeting'}</div>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Title</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Project</label>
                  <select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })}>
                    <option value="">— None —</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                </div>
                <div className="form-group full">
                  <label>Attendees</label>
                  <textarea value={form.attendees} onChange={e => setForm({ ...form, attendees: e.target.value })} />
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
