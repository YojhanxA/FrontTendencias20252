export type ID = number

export interface Producto {
  id: ID
  nombre: string
  descripcion: string
  precio: number
  stock: number
}

export interface Cliente {
  id: ID
  nombre: string
  email: string
  telefono: string
}

export interface DetalleVenta {
  id?: ID
  producto: ID
  producto_nombre?: string
  cantidad: number
  precio_unitario: number
  subtotal?: number
}

export interface Venta {
  id: ID
  cliente: ID | Cliente
  vendedor?: number | null
  fecha: string
  total: number
  detalles: DetalleVenta[]
}

export interface Paged<T> {
  count: number
  results: T[]
}
