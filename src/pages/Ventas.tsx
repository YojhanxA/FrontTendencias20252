import * as React from 'react'
import { Paper, Typography, Stack, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Snackbar, Alert, Autocomplete } from '@mui/material'
import client from '../api/client'
import { Cliente, DetalleVenta, Producto, Venta, Paged } from '../types'

type Option<T> = T & { label: string }

export default function VentasPage() {
  const [clientes, setClientes] = React.useState<Option<Cliente>[]>([])
  const [productos, setProductos] = React.useState<Option<Producto>[]>([])
  const [clienteSel, setClienteSel] = React.useState<Option<Cliente> | null>(null)
  const [lineas, setLineas] = React.useState<DetalleVenta[]>([{ producto: 0, cantidad: 1, precio_unitario: 0 }])
  const [ventas, setVentas] = React.useState<Venta[]>([])
  const [snack, setSnack] = React.useState<{msg:string; sev:'success'|'error'}|null>(null)

  React.useEffect(() => {
    // carga inicial
    client.get<Paged<Cliente>>('clientes/?ordering=nombre').then(({data}) => {
      const arr = (data.results ?? data as any).map((c: Cliente) => ({...c, label: `${c.nombre} <${c.email}>`}))
      setClientes(arr)
    })
    client.get<Paged<Producto>>('productos/?ordering=nombre').then(({data}) => {
      const arr = (data.results ?? data as any).map((p: Producto) => ({...p, label: `${p.nombre} ($${p.precio})`}))
      setProductos(arr)
    })
    loadVentas()
  }, [])

  async function loadVentas() {
    const { data } = await client.get<Paged<Venta>>('ventas/?ordering=-fecha')
    setVentas((data as any).results ?? data as any)
  }

  function addLinea() {
    setLineas(ls => [...ls, { producto: 0, cantidad: 1, precio_unitario: 0 }])
  }

  function removeLinea(ix: number) {
    setLineas(ls => ls.filter((_, i) => i !== ix))
  }

  function updateLinea(ix: number, patch: Partial<DetalleVenta>) {
    setLineas(ls => ls.map((l, i) => i === ix ? { ...l, ...patch } : l))
  }

  const total = lineas.reduce((acc, l) => acc + (Number(l.cantidad || 0) * Number(l.precio_unitario || 0)), 0)

  async function crearVenta() {
    if (!clienteSel) { setSnack({ msg: 'Selecciona un cliente', sev: 'error' }); return }
    const detalles = lineas
      .filter(l => l.producto && l.cantidad > 0)
      .map(l => ({ producto: l.producto, cantidad: l.cantidad, precio_unitario: l.precio_unitario }))
    if (!detalles.length) { setSnack({ msg: 'Agrega al menos 1 producto', sev: 'error' }); return }

    try {
      await client.post('ventas/', { cliente: clienteSel.id, detalles })
      setSnack({ msg: 'Venta registrada', sev: 'success' })
      setClienteSel(null)
      setLineas([{ producto: 0, cantidad: 1, precio_unitario: 0 }])
      await loadVentas()
    } catch (e: any) {
      setSnack({ msg: e?.response?.data?.detail || 'Error creando venta', sev: 'error' })
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Registrar venta</Typography>
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Autocomplete
            value={clienteSel}
            onChange={(_, v) => setClienteSel(v)}
            options={clientes}
            renderInput={(params) => <TextField {...params} label="Cliente" />}
          />

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell style={{width: 380}}>Producto</TableCell>
                  <TableCell>Cantidad</TableCell>
                  <TableCell>Precio unitario</TableCell>
                  <TableCell>Subtotal</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lineas.map((l, ix) => (
                  <TableRow key={ix}>
                    <TableCell>
                      <Autocomplete
                        options={productos}
                        onChange={(_, v) => {
                          updateLinea(ix, { producto: v?.id || 0, precio_unitario: v?.precio || 0 })
                        }}
                        renderInput={(params) => <TextField {...params} label="Producto" />}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField type="number" value={l.cantidad} onChange={e => updateLinea(ix, { cantidad: Number(e.target.value) })} inputProps={{min:1}} />
                    </TableCell>
                    <TableCell>
                      <TextField type="number" value={l.precio_unitario} onChange={e => updateLinea(ix, { precio_unitario: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell>{(l.cantidad * l.precio_unitario).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button color="error" onClick={() => removeLinea(ix)}>Quitar</Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={5}>
                    <Button onClick={addLinea}>+ Agregar producto</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} align="right"><b>Total</b></TableCell>
                  <TableCell colSpan={2}><b>${total.toFixed(2)}</b></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={crearVenta}>Guardar venta</Button>
          </Stack>
        </Stack>
      </Paper>

      <Typography variant="h6">Últimas ventas</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ventas.map(v => (
              <TableRow key={v.id}>
                <TableCell>{v.id}</TableCell>
                <TableCell>{(v as any).cliente?.nombre || (v as any).cliente || ''}</TableCell>
                <TableCell>{new Date(v.fecha).toLocaleString()}</TableCell>
                <TableCell align="right">{Number(v.total).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={()=>setSnack(null)}>
        {snack && <Alert severity={snack.sev} onClose={()=>setSnack(null)}>{snack.msg}</Alert>}
      </Snackbar>
    </Stack>
  )
}
