import * as React from 'react'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Box, Button, Container } from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { useAuth } from './context/AuthContext'
import ProductosPage from './pages/Productos'
import ClientesPage from './pages/Clientes'
import VentasPage from './pages/Ventas'
import ReporteVentasPage from './pages/ReporteVentas'
import LoginPage from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'

function NavBar() {
  const { isAuthenticated, logout } = useAuth()
  const location = useLocation()

  return (
    <AppBar position="sticky" sx={{ mb: 2 }}>
      <Toolbar>
        <ShoppingCartIcon sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Ventas • Grupo 6
        </Typography>
        <Button component={Link} to="/productos" color="inherit" variant={location.pathname.startsWith('/productos') ? 'outlined' : 'text'}>
          Productos
        </Button>
        <Button component={Link} to="/clientes" color="inherit" variant={location.pathname.startsWith('/clientes') ? 'outlined' : 'text'}>
          Clientes
        </Button>
        <Button component={Link} to="/ventas" color="inherit" variant={location.pathname.startsWith('/ventas') ? 'outlined' : 'text'}>
          Ventas
        </Button>
        <Button component={Link} to="/reportes" color="inherit" variant={location.pathname.startsWith('/reportes') ? 'outlined' : 'text'}>
          Reportes
        </Button>
        {isAuthenticated ? (
          <Button color="inherit" onClick={logout}>Salir</Button>
        ) : (
          <Button component={Link} to="/login" color="inherit">Entrar</Button>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default function App() {
  return (
    <Box>
      <NavBar />
      <Container sx={{ py: 3 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/productos" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/ventas" element={
            <ProtectedRoute><VentasPage /></ProtectedRoute>
          } />
          <Route path="/reportes" element={
            <ProtectedRoute><ReporteVentasPage /></ProtectedRoute>
          } />
          <Route path="*" element={<Typography>404</Typography>} />
        </Routes>
      </Container>
    </Box>
  )
}
