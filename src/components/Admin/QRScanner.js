import React, { useState } from "react";
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
import QrReader from "react-qr-reader";

const QRScanner = ({ onScan }) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleScan = (data) => {
    if (data) {
      console.log("Отсканировано:", data);
      setLoading(true);
      try {
        onScan({ number: data });
        setOpen(false);
        setError("");
      } catch (err) {
        setError("Ошибка обработки QR-кода");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleError = (err) => {
    console.error("Ошибка сканера:", err);
    if (err.name === "NotAllowedError") {
      setError(
        "Доступ к камере запрещен. Разрешите доступ в настройках браузера."
      );
    } else if (err.name === "NotFoundError") {
      setError("Камера не найдена. Подключите камеру и попробуйте снова.");
    } else {
      setError("Ошибка доступа к камере: " + err.message);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setError("");
  };

  const handleClose = () => {
    setOpen(false);
    setError("");
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
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

            {loading && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 300,
                }}
              >
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Обработка...</Typography>
              </Box>
            )}

            {!loading && !error && (
              <Box sx={{ width: "100%" }}>
                <QrReader
                  delay={300}
                  onError={handleError}
                  onScan={handleScan}
                  style={{ width: "100%" }}
                  facingMode="environment"
                  showViewFinder={true}
                  legacyMode={false}
                />
              </Box>
            )}

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
