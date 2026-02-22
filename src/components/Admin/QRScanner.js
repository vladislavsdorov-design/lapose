import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Paper,
  Typography,
  Button,
  Alert,
  Box,
  CircularProgress,
} from "@mui/material";

const QRScanner = ({ onScan }) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [initializing, setInitializing] = useState(false);
  const scannerRef = useRef(null);
  const containerId = "qr-reader-container";

  useEffect(() => {
    if (open) {
      setInitializing(true);

      setTimeout(() => {
        try {
          const scanner = new Html5QrcodeScanner(
            containerId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
              showTorchButtonIfSupported: true,
              showZoomSliderIfSupported: true,
              defaultZoomValueIfSupported: 2,
            },
            false
          );

          scanner.render(
            (decodedText) => {
              try {
                const parsed = JSON.parse(decodedText);
                if (parsed.type === "garderob_ticket") {
                  onScan(parsed);
                  scanner.clear();
                  setOpen(false);
                  setError("");
                } else {
                  setError("Неверный формат QR-кода");
                }
              } catch (err) {
                setError("Не удалось прочитать QR-код");
              }
            },
            (errorMessage) => {
              console.warn(errorMessage);
            }
          );

          scannerRef.current = scanner;
        } catch (err) {
          setError("Ошибка инициализации камеры");
          console.error(err);
        } finally {
          setInitializing(false);
        }
      }, 100);

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
        }
      };
    }
  }, [open, onScan]);

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
    }
    setOpen(false);
    setError("");
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
        fullWidth
        size="large"
        sx={{ py: 1.5 }}
      >
        Сканировать QR-код
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Сканирование QR-кода</DialogTitle>
        <DialogContent>
          <Paper sx={{ p: 2, minHeight: 400 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {initializing && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 300,
                }}
              >
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Инициализация камеры...</Typography>
              </Box>
            )}

            <div
              id={containerId}
              style={{ width: "100%", minHeight: initializing ? 0 : 300 }}
            />

            <Typography
              variant="body2"
              align="center"
              sx={{ mt: 2, color: "text.secondary" }}
            >
              Наведите камеру на QR-код клиента
            </Typography>

            <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
              <Button onClick={handleClose} variant="outlined">
                Закрыть
              </Button>
            </Box>
          </Paper>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QRScanner;
