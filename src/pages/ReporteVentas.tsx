import * as React from "react";
import {
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  Snackbar,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from "@mui/material";
import client from "../api/client";
import { Venta, Paged } from "../types";

function ymd(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export default function ReporteVentasPage() {
  const today = new Date();
  const start = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);
  const [from, setFrom] = React.useState(ymd(start));
  const [to, setTo] = React.useState(ymd(today));
  const [rows, setRows] = React.useState<Venta[]>([]);
  const [snack, setSnack] = React.useState<{
    msg: string;
    sev: "success" | "error";
  } | null>(null);

  async function verJSON() {
    try {
      const { data } = await client.get<Paged<Venta>>(
        `/reportes/ventas/?from=${from}&to=${to}&format=json`
      );
      const arr = (data as any).results ?? (data as any);
      setRows(arr);
    } catch (e: any) {
      setSnack({
        msg: e?.response?.data?.detail || "Error cargando reporte",
        sev: "error",
      });
    }
  }

  async function descargarPDF() {
    try {
      const token = localStorage.getItem("token");

      const res = await client.get(
        `/reportes/ventas/?from=${from}&to=${to}&format=pdf`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_ventas_${from}_a_${to}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setSnack({
        msg: e?.response?.data?.detail || "No se pudo descargar",
        sev: "error",
      });
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Reporte de ventas</Typography>

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            type="date"
            label="Desde"
            InputLabelProps={{ shrink: true }}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <TextField
            type="date"
            label="Hasta"
            InputLabelProps={{ shrink: true }}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <Button variant="outlined" onClick={verJSON}>
            Ver JSON
          </Button>
          <Button variant="contained" onClick={descargarPDF}>
            Descargar PDF
          </Button>
        </Stack>
      </Paper>

      {rows.length > 0 && (
        <TableContainer component={Paper}>
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
              {rows.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>{v.id}</TableCell>
                  <TableCell>
                    {(v as any).cliente?.nombre || (v as any).cliente || ""}
                  </TableCell>
                  <TableCell>{new Date(v.fecha).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    {Number(v.total).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar
        open={!!snack}
        autoHideDuration={3000}
        onClose={() => setSnack(null)}
      >
        {snack && (
          <Alert severity={snack.sev} onClose={() => setSnack(null)}>
            {snack.msg}
          </Alert>
        )}
      </Snackbar>
    </Stack>
  );
}
