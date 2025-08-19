import React, { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'

const API_BASE = 'http://localhost:3000'

export default function App() {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { webhookUrl: 'http://localhost:4000/sink' }
  })
  const [token, setToken] = useState('changeme')
  const [statusFilter, setStatusFilter] = useState('')
  const [notes, setNotes] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 20

  const headers = useMemo(() => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }), [token])

  const onSubmit = async (data) => {
    try {
      const res = await fetch(`${API_BASE}/api/notes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...data, releaseAt: new Date(data.releaseAt).toISOString() })
      })
      if (!res.ok) throw new Error('Create failed')
      reset()
      fetchNotes()
      alert('Note created')
    } catch (e) {
      alert(e.message)
    }
  }

  async function fetchNotes(p = page, s = statusFilter) {
    const qs = new URLSearchParams({ page: String(p), ...(s ? { status: s } : {}) })
    const res = await fetch(`${API_BASE}/api/notes?${qs}`, { headers })
    const json = await res.json()
    setNotes(json.data || [])
    setPage(json.page || 1)
    setTotal(json.total || 0)
  }

  useEffect(() => {
    fetchNotes(1, statusFilter)
    const id = setInterval(() => fetchNotes(page, statusFilter), 3000)
    return () => clearInterval(id)
  }, [statusFilter])

  const totalPages = Math.ceil(total / pageSize)

  const replay = async (id) => {
    const res = await fetch(`${API_BASE}/api/notes/${id}/replay`, { method: 'POST', headers })
    if (res.ok) {
      fetchNotes()
    } else {
      const j = await res.json()
      alert(j.error || 'Replay failed')
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui', padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1>DropLater Admin</h1>

      <section style={{ marginBottom: 24, display: 'grid', gap: 12 }}>
        <label>Admin Token <input value={token} onChange={e => setToken(e.target.value)} style={{ width: 300 }} /></label>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: 8, maxWidth: 600 }}>
          <input placeholder="Title" {...register('title', { required: true })} />
          <textarea placeholder="Body" {...register('body', { required: true })} rows={4} />
          <label>Release At (local)
            <input type="datetime-local" {...register('releaseAt', { required: true })} />
          </label>
          <input placeholder="Webhook URL" {...register('webhookUrl', { required: true })} />
          <button type="submit">Create Note</button>
        </form>
      </section>

      <section>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <strong>Filter:</strong>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="dead">Dead</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        <table width="100%" cellPadding="6" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              <th>Id</th><th>Title</th><th>Status</th><th>Last Code</th><th>Release</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notes.map(n => {
              const Row = n.status === 'delivered' ? motion.tr : 'tr'
              return (
                <Row key={n.id} initial={{ backgroundColor: '#fff' }} animate={{ backgroundColor: '#eaffea' }} transition={{ duration: 0.6 }}>
                  <td style={{ fontFamily: 'monospace' }}>{n.id}</td>
                  <td>{n.title}</td>
                  <td>{n.status}</td>
                  <td>{n.lastAttemptCode ?? '-'}</td>
                  <td>{new Date(n.releaseAt).toLocaleString()}</td>
                  <td>
                    {(n.status === 'failed' || n.status === 'dead') && (
                      <button onClick={() => replay(n.id)}>Replay</button>
                    )}
                  </td>
                </Row>
              )
            })}
          </tbody>
        </table>

        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button disabled={page <= 1} onClick={() => { fetchNotes(page - 1); }}>Prev</button>
          <span>Page {page} / {Math.max(totalPages, 1)}</span>
          <button disabled={page >= totalPages} onClick={() => { fetchNotes(page + 1); }}>Next</button>
        </div>
      </section>
    </div>
  )
}
