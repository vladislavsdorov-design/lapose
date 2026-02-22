import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
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
  const containerId =
    "qr-reader-container-" + Math.random().toString(36).substring(7);

  useEffect(() => {
    let html5QrcodeScanner = null;

    if (open) {
      setInitializing(true);

      // Даем время для рендера контейнера
      setTimeout(() => {
        try {
          html5QrcodeScanner = new Html5Qrcode(containerId);

          const qrCodeSuccessCallback = (decodedText) => {
            try {
              console.log("Отсканировано:", decodedText);
              onScan({ number: decodedText });
              if (html5QrcodeScanner) {
                html5QrcodeScanner.stop().then(() => {
                  setOpen(false);
                });
              }
              setError("");
            } catch (err) {
              console.error("Ошибка парсинга:", err);
              setError("Не удалось прочитать QR-код");
            }
          };

          const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          };

          html5QrcodeScanner
            .start(
              { facingMode: "environment" },
              config,
              qrCodeSuccessCallback,
              (errorMessage) => {
                console.warn(errorMessage);
              }
            )
            .then(() => {
              setInitializing(false);
            })
            .catch((err) => {
              setError("Ошибка доступа к камере: " + err.message);
              setInitializing(false);
            });

          scannerRef.current = html5QrcodeScanner;
        } catch (err) {
          setError("Ошибка инициализации: " + err.message);
          setInitializing(false);
        }
      }, 500);
    }

    return () => {
      if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
        html5QrcodeScanner.stop().catch(console.error);
      }
    };
  }, [open, onScan, containerId]);

  const handleClose = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current
        .stop()
        .then(() => {
          setOpen(false);
          setError("");
        })
        .catch(console.error);
    } else {
      setOpen(false);
      setError("");
    }
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
