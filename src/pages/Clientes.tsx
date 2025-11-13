import * as React from 'react'
import { Paper, Typography, Stack, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material'
import client from '../api/client'
import { Cliente, Paged } from '../types'
import { useAuth } from '../context/AuthContext'

type FormState = Partial<Omit<Cliente, 'id'>>

export default function ClientesPage() {
  const [rows, setRows] = React.useState<Cliente[]>([])
  const [q, setQ] = React.useState('')
  const [openForm, setOpenForm] = React.useState(false)
  const [editing, setEditing] = React.useState<Cliente | null>(null)
  const [form, setForm] = React.useState<FormState>({ nombre: '', email: '', telefono: '' })
  const [snack, setSnack] = React.useState<{msg:string; sev:'success'|'error'}|null>(null)
  const { isAuthenticated } = useAuth()

  async function load() {
    const { data } = await client.get<Paged<Cliente>>(`clientes/?search=${encodeURIComponent(q)}`)
    setRows(data.results ?? data as any)
  }

  React.useEffect(() => { load() }, [])

  function startCreate() {
    setEditing(null)
    setForm({ nombre: '', email: '', telefono: '' })
    setOpenForm(true)
  }

  function startEdit(c: Cliente) {
    setEditing(c)
    setForm({ nombre: c.nombre, email: c.email, telefono: c.telefono })
    setOpenForm(true)
  }

  async function save() {
    try {
      if (editing) {
        await client.put(`clientes/${editing.id}/`, form)
        setSnack({ msg: 'Cliente actualizado', sev: 'success' })
      } else {
        await client.post('clientes/', form)
        setSnack({ msg: 'Cliente creado', sev: 'success' })
      }
      setOpenForm(false)
      await load()
    } catch (e: any) {
      setSnack({ msg: e?.response?.data?.detail || 'Error guardando', sev: 'error' })
    }
  }

  async function remove(c: Cliente) {
    if (!confirm(`Eliminar "${c.nombre}"?`)) return
    try {
      await client.delete(`clientes/${c.id}/`)
      setSnack({ msg: 'Cliente eliminado', sev: 'success' })
      await load()
    } catch (e: any) {
      setSnack({ msg: e?.response?.data?.detail || 'No se pudo eliminar', sev: 'error' })
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Clientes</Typography>
      <Stack direction="row" spacing={1}>
        <TextField size="small" label="Buscar" value={q} onChange={e=>setQ(e.target.value)} />
        <Button variant="outlined" onClick={load}>Buscar</Button>
        {isAuthenticated && (
          <Button variant="contained" onClick={startCreate}>Nuevo</Button>
        )}
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              {isAuthenticated && <TableCell align="right">Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.nombre}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.telefono}</TableCell>
                {isAuthenticated && (
                  <TableCell align="right">
                    <Button size="small" onClick={() => startEdit(r)}>Editar</Button>
                    <Button size="small" color="error" onClick={() => remove(r)}>Eliminar</Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openForm} onClose={() => setOpenForm(false)}>
        <DialogTitle>{editing ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1, minWidth: 380 }}>
            <TextField label="Nombre" value={form.nombre || ''} onChange={e=>setForm(s=>({...s, nombre: e.target.value}))} required />
            <TextField label="Email" value={form.email || ''} onChange={e=>setForm(s=>({...s, email: e.target.value}))} required type="email" />
            <TextField label="Teléfono" value={form.telefono || ''} onChange={e=>setForm(s=>({...s, telefono: e.target.value}))} required />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancelar</Button>
          <Button variant="contained" onClick={save}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={()=>setSnack(null)}>
        {snack && <Alert severity={snack.sev} onClose={()=>setSnack(null)}>{snack.msg}</Alert>}
      </Snackbar>
    </Stack>
  )
}
