import * as React from 'react'
import { Paper, Typography, Stack, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material'
import client from '../api/client'
import { Producto, Paged } from '../types'
import { useAuth } from '../context/AuthContext'

type FormState = Partial<Omit<Producto, 'id'>>

export default function ProductosPage() {
  const [rows, setRows] = React.useState<Producto[]>([])
  const [q, setQ] = React.useState('')
  const [ordering, setOrdering] = React.useState<string>('nombre')
  const [openForm, setOpenForm] = React.useState(false)
  const [editing, setEditing] = React.useState<Producto | null>(null)
  const [form, setForm] = React.useState<FormState>({ nombre: '', descripcion: '', precio: 0, stock: 0 })
  const [loading, setLoading] = React.useState(false)
  const [snack, setSnack] = React.useState<{msg:string; sev:'success'|'error'}|null>(null)
  const { isAuthenticated } = useAuth()

  async function load() {
    setLoading(true)
    try {
      const { data } = await client.get<Paged<Producto>>(`productos/?search=${encodeURIComponent(q)}&ordering=${encodeURIComponent(ordering)}`)
      setRows(data.results ?? data as any) // por si no hay paginación
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { load() }, [])

  function startCreate() {
    setEditing(null)
    setForm({ nombre: '', descripcion: '', precio: 0, stock: 0 })
    setOpenForm(true)
  }

  function startEdit(p: Producto) {
    setEditing(p)
    setForm({ nombre: p.nombre, descripcion: p.descripcion, precio: p.precio, stock: p.stock })
    setOpenForm(true)
  }

  async function save() {
    try {
      if (editing) {
        await client.put(`productos/${editing.id}/`, form)
        setSnack({ msg: 'Producto actualizado', sev: 'success' })
      } else {
        await client.post('productos/', form)
        setSnack({ msg: 'Producto creado', sev: 'success' })
      }
      setOpenForm(false)
      await load()
    } catch (e: any) {
      setSnack({ msg: e?.response?.data?.detail || 'Error guardando', sev: 'error' })
    }
  }

  async function remove(p: Producto) {
    if (!confirm(`Eliminar "${p.nombre}"?`)) return
    try {
      await client.delete(`productos/${p.id}/`)
      setSnack({ msg: 'Producto eliminado', sev: 'success' })
      await load()
    } catch (e: any) {
      setSnack({ msg: e?.response?.data?.detail || 'No se pudo eliminar', sev: 'error' })
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Productos</Typography>
      <Stack direction="row" spacing={1}>
        <TextField size="small" label="Buscar" value={q} onChange={e=>setQ(e.target.value)} />
        <TextField size="small" label="Ordenar por" value={ordering} onChange={e=>setOrdering(e.target.value)} placeholder="nombre | precio | -precio ..." />
        <Button variant="outlined" onClick={load} disabled={loading}>Buscar</Button>
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
              <TableCell>Descripción</TableCell>
              <TableCell align="right">Precio</TableCell>
              <TableCell align="right">Stock</TableCell>
              {isAuthenticated && <TableCell align="right">Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.nombre}</TableCell>
                <TableCell>{r.descripcion}</TableCell>
                <TableCell align="right">{r.precio}</TableCell>
                <TableCell align="right">{r.stock}</TableCell>
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
        <DialogTitle>{editing ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1, minWidth: 380 }}>
            <TextField label="Nombre" value={form.nombre || ''} onChange={e=>setForm(s=>({...s, nombre: e.target.value}))} required />
            <TextField label="Descripción" value={form.descripcion || ''} onChange={e=>setForm(s=>({...s, descripcion: e.target.value}))} required multiline minRows={2} />
            <TextField type="number" label="Precio" value={form.precio ?? 0} onChange={e=>setForm(s=>({...s, precio: Number(e.target.value)}))} required />
            <TextField type="number" label="Stock" value={form.stock ?? 0} onChange={e=>setForm(s=>({...s, stock: Number(e.target.value)}))} required />
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
