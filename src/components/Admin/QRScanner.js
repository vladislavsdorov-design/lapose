// import React, { useState, useEffect, useRef } from "react";
// import { Html5Qrcode } from "html5-qrcode";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   Paper,
//   Typography,
//   Button,
//   Alert,
//   Box,
//   CircularProgress,
//   IconButton,
// } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
// import CameraAltIcon from "@mui/icons-material/CameraAlt";
// import FlipCameraIosIcon from "@mui/icons-material/FlipCameraIos";

// const QRScanner = ({ onScan }) => {
//   const [open, setOpen] = useState(false);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [cameras, setCameras] = useState([]);
//   const [selectedCamera, setSelectedCamera] = useState("");
//   const [hasCamera, setHasCamera] = useState(true);

//   const scannerRef = useRef(null);
//   const containerId =
//     "qr-reader-container-" + Math.random().toString(36).substring(7);

//   // Получаем список камер при открытии
//   useEffect(() => {
//     if (open) {
//       getCameras();
//     }
//   }, [open]);

//   const getCameras = async () => {
//     try {
//       const devices = await Html5Qrcode.getCameras();
//       if (devices && devices.length > 0) {
//         setCameras(devices);
//         // По умолчанию выбираем заднюю камеру
//         const backCamera = devices.find(
//           (camera) =>
//             camera.label.toLowerCase().includes("back") ||
//             camera.label.toLowerCase().includes("environment")
//         );
//         setSelectedCamera(backCamera ? backCamera.id : devices[0].id);
//         setHasCamera(true);
//         startScanner(backCamera ? backCamera.id : devices[0].id);
//       } else {
//         setHasCamera(false);
//         setError("Камеры не найдены. Убедитесь, что камера подключена.");
//         setLoading(false);
//       }
//     } catch (err) {
//       console.error("Ошибка получения камер:", err);
//       setHasCamera(false);
//       setError("Не удалось получить доступ к камерам");
//       setLoading(false);
//     }
//   };

//   const startScanner = (cameraId) => {
//     setLoading(true);
//     setError("");

//     try {
//       const scanner = new Html5Qrcode(containerId);
//       scannerRef.current = scanner;

//       const config = {
//         fps: 10,
//         qrbox: { width: 250, height: 250 },
//         aspectRatio: 1.0,
//         disableFlip: false,
//         rememberLastUsedCamera: true,
//         supportedScanTypes: [],
//       };

//       scanner
//         .start(
//           cameraId,
//           config,
//           (decodedText) => {
//             // Успешное сканирование
//             console.log("✅ QR код распознан:", decodedText);

//             // Останавливаем сканер
//             if (scannerRef.current && scannerRef.current.isScanning) {
//               scannerRef.current
//                 .stop()
//                 .then(() => {
//                   // Отправляем результат
//                   onScan({ number: decodedText });
//                   // Закрываем диалог
//                   setOpen(false);
//                   setLoading(false);
//                 })
//                 .catch((err) => {
//                   console.error("Ошибка остановки сканера:", err);
//                 });
//             }
//           },
//           (errorMessage) => {
//             // Ошибки сканирования игнорируем
//             console.debug("Ошибка сканирования:", errorMessage);
//           }
//         )
//         .then(() => {
//           setLoading(false);
//         })
//         .catch((err) => {
//           console.error("Ошибка запуска сканера:", err);
//           setError("Ошибка запуска камеры: " + err.message);
//           setLoading(false);
//         });
//     } catch (err) {
//       console.error("Ошибка инициализации:", err);
//       setError("Ошибка инициализации сканера");
//       setLoading(false);
//     }
//   };

//   const switchCamera = () => {
//     if (cameras.length < 2) return;

//     // Останавливаем текущий сканер
//     if (scannerRef.current && scannerRef.current.isScanning) {
//       scannerRef.current
//         .stop()
//         .then(() => {
//           // Выбираем следующую камеру
//           const currentIndex = cameras.findIndex(
//             (c) => c.id === selectedCamera
//           );
//           const nextIndex = (currentIndex + 1) % cameras.length;
//           const nextCamera = cameras[nextIndex].id;
//           setSelectedCamera(nextCamera);
//           startScanner(nextCamera);
//         })
//         .catch((err) => {
//           console.error("Ошибка переключения камеры:", err);
//         });
//     }
//   };

//   const handleOpen = () => {
//     setOpen(true);
//     setError("");
//   };

//   const handleClose = () => {
//     if (scannerRef.current && scannerRef.current.isScanning) {
//       scannerRef.current
//         .stop()
//         .then(() => {
//           setOpen(false);
//           setError("");
//         })
//         .catch(console.error);
//     } else {
//       setOpen(false);
//       setError("");
//     }
//   };

//   return (
//     <>
//       <Button
//         variant="contained"
//         color="primary"
//         onClick={handleOpen}
//         fullWidth
//         size="large"
//         startIcon={<CameraAltIcon />}
//         sx={{ py: 1.5, fontSize: "1.1rem" }}
//       >
//         Сканировать QR-код
//       </Button>

//       <Dialog
//         open={open}
//         onClose={handleClose}
//         maxWidth="sm"
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: 3,
//             overflow: "hidden",
//           },
//         }}
//       >
//         <DialogTitle
//           sx={{
//             m: 0,
//             p: 2,
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             bgcolor: "#1976d2",
//             color: "white",
//           }}
//         >
//           <Typography variant="h6">Сканирование QR-кода</Typography>
//           <IconButton onClick={handleClose} sx={{ color: "white" }}>
//             <CloseIcon />
//           </IconButton>
//         </DialogTitle>

//         <DialogContent sx={{ p: 0 }}>
//           <Paper sx={{ p: 2, minHeight: 500 }}>
//             {error && (
//               <Alert severity="error" sx={{ m: 2 }}>
//                 {error}
//               </Alert>
//             )}

//             {!hasCamera ? (
//               <Box sx={{ textAlign: "center", p: 4 }}>
//                 <Typography color="error" gutterBottom>
//                   ❌ Камера не обнаружена
//                 </Typography>
//                 <Typography
//                   variant="body2"
//                   color="text.secondary"
//                   sx={{ mt: 2 }}
//                 >
//                   Убедитесь, что:
//                   <br />• Камера подключена
//                   <br />• Браузер имеет доступ к камере
//                   <br />• Вы используете HTTPS или localhost
//                 </Typography>
//               </Box>
//             ) : (
//               <>
//                 {loading && (
//                   <Box
//                     sx={{
//                       position: "absolute",
//                       top: "50%",
//                       left: "50%",
//                       transform: "translate(-50%, -50%)",
//                       textAlign: "center",
//                       zIndex: 1,
//                     }}
//                   >
//                     <CircularProgress />
//                     <Typography sx={{ mt: 2 }}>Запуск камеры...</Typography>
//                   </Box>
//                 )}

//                 <div
//                   id={containerId}
//                   style={{
//                     width: "100%",
//                     minHeight: 400,
//                     opacity: loading ? 0.3 : 1,
//                   }}
//                 />

//                 {cameras.length > 1 && (
//                   <Box
//                     sx={{
//                       position: "absolute",
//                       bottom: 20,
//                       right: 20,
//                       zIndex: 2,
//                     }}
//                   >
//                     <Button
//                       variant="contained"
//                       onClick={switchCamera}
//                       startIcon={<FlipCameraIosIcon />}
//                       sx={{ borderRadius: 28 }}
//                     >
//                       Переключить камеру
//                     </Button>
//                   </Box>
//                 )}
//               </>
//             )}

//             <Box sx={{ p: 2, textAlign: "center" }}>
//               <Typography variant="body2" color="text.secondary">
//                 Наведите камеру на QR-код клиента
//               </Typography>
//               <Typography
//                 variant="caption"
//                 color="text.secondary"
//                 sx={{ mt: 1, display: "block" }}
//               >
//                 Сканирование произойдет автоматически
//               </Typography>
//             </Box>
//           </Paper>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// };

// export default QRScanner;
import React, { useState, useEffect } from "react";
import { ref, set, get, onValue } from "firebase/database"; // Добавлен onValue
import { database } from "../../firebase/config";
import { QRCodeSVG } from "qrcode.react";

const ClientQR = () => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLostTicket, setIsLostTicket] = useState(false);
  const [lostMessage, setLostMessage] = useState("");

  // Конфигурация зон с приоритетами
  const zones = [
    { name: "Нижний ряд", start: 1, end: 100, priority: 1 },
    { name: "Средний ряд", start: 200, end: 300, priority: 2 },
    { name: "Верхний ряд", start: 400, end: 500, priority: 3 },
  ];

  // Генерация уникального токена
  const generateUniqueToken = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const secret = Math.random().toString(36).substring(2, 15);
    return `${timestamp}_${random}_${secret}`;
  };

  const generateTicket = async () => {
    setLoading(true);
    setError("");

    try {
      const sortedZones = [...zones].sort((a, b) => a.priority - b.priority);

      let selectedNumber = null;
      let selectedZone = null;

      for (const zone of sortedZones) {
        const result = await findFirstAvailableInZone(zone);
        if (result) {
          selectedNumber = result;
          selectedZone = zone;
          break;
        }
      }

      if (!selectedNumber) {
        setError("Извините, все номерки заняты!");
        setLoading(false);
        return;
      }

      const uniqueToken = generateUniqueToken();
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

      const ticketData = {
        number: selectedNumber,
        zone: selectedZone.name,
        zoneStart: selectedZone.start,
        zoneEnd: selectedZone.end,
        status: "pending",
        createdAt: new Date().toISOString(),
        clientId: generateClientId(),
        uniqueToken: uniqueToken,
        expiresAt: expiresAt,
        isUsed: false,
      };

      await set(ref(database, `tickets/${selectedNumber}`), ticketData);

      localStorage.setItem(
        "currentTicket",
        JSON.stringify({
          number: selectedNumber,
          uniqueToken: uniqueToken,
          expiresAt: expiresAt,
          createdAt: ticketData.createdAt,
          type: "normal",
        })
      );

      setTicket(ticketData);
      setIsLostTicket(false);
    } catch (err) {
      console.error("Ошибка:", err);
      setError("Ошибка при получении номерка");
    } finally {
      setLoading(false);
    }
  };

  const findFirstAvailableInZone = async (zone) => {
    for (let i = zone.start; i <= zone.end; i++) {
      const ticketRef = ref(database, `tickets/${i}`);
      const snapshot = await get(ticketRef);
      const ticket = snapshot.val();

      if (
        !ticket ||
        ticket.status === "free" ||
        ticket.status === "completed" ||
        ticket.status === "cancelled"
      ) {
        return i;
      }
    }
    return null;
  };

  const generateClientId = () => {
    return (
      "client_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
    );
  };

  const getQRValue = () => {
    return ticket.uniqueToken;
  };

  // СЛУШАЕМ ИЗМЕНЕНИЯ В РЕАЛЬНОМ ВРЕМЕНИ
  useEffect(() => {
    const checkForLostTicket = async () => {
      const savedTicket = localStorage.getItem("currentTicket");
      if (savedTicket) {
        try {
          const parsed = JSON.parse(savedTicket);

          // Если это уже LOST токен, проверяем в lostItems
          if (parsed.uniqueToken && parsed.uniqueToken.startsWith("LOST_")) {
            const lostRef = ref(database, "lostItems");
            const unsubscribe = onValue(lostRef, (snapshot) => {
              const lostData = snapshot.val() || {};
              const foundLost = Object.values(lostData).find(
                (item) =>
                  item.uniqueToken === parsed.uniqueToken &&
                  item.status === "waiting"
              );

              if (foundLost) {
                setIsLostTicket(true);
                setLostMessage(
                  "Вы забыли курточку! Приходите в любое открытие и покажите этот QR-код"
                );
                setTicket({
                  number: foundLost.originalTicketNumber,
                  zone: foundLost.originalZone,
                  uniqueToken: foundLost.uniqueToken,
                  isLost: true,
                });
              }
            });
            return () => unsubscribe();
          } else {
            // Обычный токен - слушаем изменения в tickets
            const ticketRef = ref(database, `tickets/${parsed.number}`);
            const unsubscribe = onValue(ticketRef, (snapshot) => {
              const ticketData = snapshot.val();

              if (ticketData) {
                // Проверяем, не был ли номерок отмечен как забытый
                if (ticketData.movedToLost && ticketData.lostToken) {
                  // Сохраняем новый LOST токен
                  localStorage.setItem(
                    "currentTicket",
                    JSON.stringify({
                      number: parsed.number,
                      uniqueToken: ticketData.lostToken,
                      type: "lost",
                    })
                  );

                  // Показываем сообщение о забытой курточке
                  setIsLostTicket(true);
                  setLostMessage(
                    "Вы забыли курточку! Приходите в любое открытие и покажите этот QR-код"
                  );
                  setTicket({
                    number: parsed.number,
                    zone: ticketData.zone,
                    uniqueToken: ticketData.lostToken,
                    isLost: true,
                  });
                } else if (
                  ticketData.status === "pending" ||
                  ticketData.status === "issued"
                ) {
                  // Обычный активный номерок
                  setTicket({
                    number: parsed.number,
                    zone: ticketData.zone,
                    uniqueToken: ticketData.uniqueToken,
                    status: ticketData.status,
                  });
                  setIsLostTicket(false);
                }
              }
            });
            return () => unsubscribe();
          }
        } catch (e) {
          console.error("Ошибка проверки:", e);
        }
      }
    };

    checkForLostTicket();
  }, []);

  return (
    <div className="client-container">
      <div className="client-card">
        <h1 className="client-title">🎩 Гардероб Шатни</h1>

        {!ticket ? (
          <div className="client-content">
            <p className="client-description">
              Нажмите кнопку, чтобы получить номерок для вашей курточки
            </p>

            {error && <div className="client-error">⚠️ {error}</div>}

            <button
              className="client-button"
              onClick={generateTicket}
              disabled={loading}
            >
              {loading ? "Получение..." : "Получить номерок"}
            </button>
          </div>
        ) : (
          <div className="ticket-container">
            <div
              className={`ticket-header ${isLostTicket ? "lost-header" : ""}`}
            >
              <span
                className={`ticket-status ${isLostTicket ? "lost-status" : ""}`}
              >
                {isLostTicket ? "🔔 Забытая курточка" : "✅ Активен"}
              </span>
            </div>

            <h2 className="ticket-number">#{ticket.number}</h2>
            <p className="ticket-zone">{ticket.zone}</p>

            {isLostTicket && (
              <div className="lost-message-client">
                <p>🔔 {lostMessage}</p>
                <p className="important">Сохраните этот QR-код!</p>
              </div>
            )}

            <div className="qr-container">
              <QRCodeSVG
                value={getQRValue()}
                size={250}
                level="H"
                includeMargin={true}
              />
            </div>

            {isLostTicket ? (
              <div className="lost-instructions-client">
                <h3>Как получить курточку:</h3>
                <ol>
                  <li>Приходите в любое открытие клуба</li>
                  <li>Покажите этот QR-код администратору</li>
                  <li>Получите вашу курточку</li>
                </ol>
                <p className="note">Курточка хранится в специальном месте</p>
              </div>
            ) : (
              <div className="ticket-warning">
                <p>
                  ⚠️ Не показывайте этот код никому, кроме работника гардероба!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientQR;
