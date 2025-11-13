import * as React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Paper, Typography, TextField, Stack, Button, Alert } from '@mui/material'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation() as any

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await login(username, password)
      const to = location.state?.from?.pathname || '/'
      navigate(to, { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Usuario o contraseña incorrectos')
    }
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 420, mx: 'auto' }} elevation={2}>
      <Typography variant="h6" gutterBottom>Entrar</Typography>
      <form onSubmit={onSubmit}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Usuario" value={username} onChange={e => setUsername(e.target.value)} required />
          <TextField type="password" label="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
          <Button variant="contained" type="submit">Ingresar</Button>
        </Stack>
      </form>
    </Paper>
  )
}
