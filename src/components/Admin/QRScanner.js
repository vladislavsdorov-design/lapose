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
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import FlipCameraIosIcon from "@mui/icons-material/FlipCameraIos";

const QRScanner = ({ onScan }) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [hasCamera, setHasCamera] = useState(true);

  const scannerRef = useRef(null);
  const containerId =
    "qr-reader-container-" + Math.random().toString(36).substring(7);

  // Получаем список камер при открытии
  useEffect(() => {
    if (open) {
      getCameras();
    }
  }, [open]);

  const getCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);
        // По умолчанию выбираем заднюю камеру
        const backCamera = devices.find(
          (camera) =>
            camera.label.toLowerCase().includes("back") ||
            camera.label.toLowerCase().includes("environment")
        );
        setSelectedCamera(backCamera ? backCamera.id : devices[0].id);
        setHasCamera(true);
        startScanner(backCamera ? backCamera.id : devices[0].id);
      } else {
        setHasCamera(false);
        setError("Камеры не найдены. Убедитесь, что камера подключена.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Ошибка получения камер:", err);
      setHasCamera(false);
      setError("Не удалось получить доступ к камерам");
      setLoading(false);
    }
  };

  const startScanner = (cameraId) => {
    setLoading(true);
    setError("");

    try {
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
        rememberLastUsedCamera: true,
        supportedScanTypes: [],
      };

      scanner
        .start(
          cameraId,
          config,
          (decodedText) => {
            // Успешное сканирование
            console.log("✅ QR код распознан:", decodedText);

            // Останавливаем сканер
            if (scannerRef.current && scannerRef.current.isScanning) {
              scannerRef.current
                .stop()
                .then(() => {
                  // Отправляем результат
                  onScan({ number: decodedText });
                  // Закрываем диалог
                  setOpen(false);
                  setLoading(false);
                })
                .catch((err) => {
                  console.error("Ошибка остановки сканера:", err);
                });
            }
          },
          (errorMessage) => {
            // Ошибки сканирования игнорируем
            console.debug("Ошибка сканирования:", errorMessage);
          }
        )
        .then(() => {
          setLoading(false);
        })
        .catch((err) => {
          console.error("Ошибка запуска сканера:", err);
          setError("Ошибка запуска камеры: " + err.message);
          setLoading(false);
        });
    } catch (err) {
      console.error("Ошибка инициализации:", err);
      setError("Ошибка инициализации сканера");
      setLoading(false);
    }
  };

  const switchCamera = () => {
    if (cameras.length < 2) return;

    // Останавливаем текущий сканер
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current
        .stop()
        .then(() => {
          // Выбираем следующую камеру
          const currentIndex = cameras.findIndex(
            (c) => c.id === selectedCamera
          );
          const nextIndex = (currentIndex + 1) % cameras.length;
          const nextCamera = cameras[nextIndex].id;
          setSelectedCamera(nextCamera);
          startScanner(nextCamera);
        })
        .catch((err) => {
          console.error("Ошибка переключения камеры:", err);
        });
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setError("");
  };

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
        onClick={handleOpen}
        fullWidth
        size="large"
        startIcon={<CameraAltIcon />}
        sx={{ py: 1.5, fontSize: "1.1rem" }}
      >
        Сканировать QR-код
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "#1976d2",
            color: "white",
          }}
        >
          <Typography variant="h6">Сканирование QR-кода</Typography>
          <IconButton onClick={handleClose} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Paper sx={{ p: 2, minHeight: 500 }}>
            {error && (
              <Alert severity="error" sx={{ m: 2 }}>
                {error}
              </Alert>
            )}

            {!hasCamera ? (
              <Box sx={{ textAlign: "center", p: 4 }}>
                <Typography color="error" gutterBottom>
                  ❌ Камера не обнаружена
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Убедитесь, что:
                  <br />• Камера подключена
                  <br />• Браузер имеет доступ к камере
                  <br />• Вы используете HTTPS или localhost
                </Typography>
              </Box>
            ) : (
              <>
                {loading && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      textAlign: "center",
                      zIndex: 1,
                    }}
                  >
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Запуск камеры...</Typography>
                  </Box>
                )}

                <div
                  id={containerId}
                  style={{
                    width: "100%",
                    minHeight: 400,
                    opacity: loading ? 0.3 : 1,
                  }}
                />

                {cameras.length > 1 && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 20,
                      right: 20,
                      zIndex: 2,
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={switchCamera}
                      startIcon={<FlipCameraIosIcon />}
                      sx={{ borderRadius: 28 }}
                    >
                      Переключить камеру
                    </Button>
                  </Box>
                )}
              </>
            )}

            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Наведите камеру на QR-код клиента
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                Сканирование произойдет автоматически
              </Typography>
            </Box>
          </Paper>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QRScanner;
