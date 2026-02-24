// import React, { useState, useEffect } from "react";
// import { ref, onValue } from "firebase/database";
// import { database } from "../../firebase/config";
// import QRScanner from "./QRScanner";
// import TicketDetails from "./TicketDetails";
// import LostTicketDetails from "./LostTicketDetails"; // Новый компонент для забытых
// import {
//   Container,
//   Paper,
//   Typography,
//   Box,
//   Grid,
//   Card,
//   CardContent,
//   Alert,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Chip,
//   Button,
//   Tooltip,
// } from "@mui/material";
// import InventoryIcon from "@mui/icons-material/Inventory";
// import "./AdminPanel.css";

// const AdminPanel = () => {
//   const [scannedTicket, setScannedTicket] = useState(null);
//   const [scannedLost, setScannedLost] = useState(null); // Для забытых
//   const [ticketData, setTicketData] = useState(null);
//   const [lostItemData, setLostItemData] = useState(null); // Данные забытой
//   const [tickets, setTickets] = useState({});
//   const [lostItems, setLostItems] = useState({});
//   const [error, setError] = useState("");
//   const [showLostItems, setShowLostItems] = useState(false);
//   const [lostCount, setLostCount] = useState(0);
//   const [stats, setStats] = useState({
//     lower: { free: 100, occupied: 0 },
//     middle: { free: 101, occupied: 0 },
//     upper: { free: 101, occupied: 0 },
//   });

//   useEffect(() => {
//     const ticketsRef = ref(database, "tickets");
//     const unsubscribe = onValue(
//       ticketsRef,
//       (snapshot) => {
//         const data = snapshot.val() || {};
//         setTickets(data);
//         calculateStats(data);
//       },
//       (error) => {
//         setError("Ошибка загрузки данных: " + error.message);
//       }
//     );

//     return () => unsubscribe();
//   }, []);

//   // Следим за забытыми вещами
//   useEffect(() => {
//     const lostRef = ref(database, "lostItems");
//     const unsubscribe = onValue(lostRef, (snapshot) => {
//       const data = snapshot.val() || {};
//       setLostItems(data);
//       const count = Object.values(data).filter(
//         (item) => item.status === "waiting"
//       ).length;
//       setLostCount(count);
//     });

//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     if (scannedTicket && tickets[scannedTicket.number]) {
//       setTicketData(tickets[scannedTicket.number]);
//     }
//   }, [scannedTicket, tickets]);

//   const calculateStats = (data) => {
//     const newStats = {
//       lower: { free: 100, occupied: 0 },
//       middle: { free: 101, occupied: 0 },
//       upper: { free: 101, occupied: 0 },
//     };

//     Object.values(data).forEach((ticket) => {
//       let zone = "lower";
//       if (ticket.zoneStart >= 200) zone = "middle";
//       if (ticket.zoneStart >= 400) zone = "upper";

//       if (ticket.status === "issued" || ticket.status === "pending") {
//         newStats[zone].occupied++;
//         newStats[zone].free--;
//       }
//     });

//     setStats(newStats);
//   };

//   const handleScan = (qrData) => {
//     console.log("Получен QR:", qrData);

//     // Проверяем, не является ли это кодом забытой курточки
//     if (
//       qrData.type === "lost" ||
//       (qrData.number && qrData.number.startsWith("LOST_"))
//     ) {
//       // Ищем в lostItems
//       const token = qrData.number || qrData.token;
//       const foundLost = Object.values(lostItems).find(
//         (item) => item.uniqueToken === token && item.status === "waiting"
//       );

//       if (foundLost) {
//         setScannedLost({ id: foundLost.id, data: foundLost });
//         setError("");
//       } else {
//         setError("Недействительный код забытой курточки");
//       }
//       return;
//     }

//     // Ищем обычный билет по токену
//     const foundTicket = Object.values(tickets).find(
//       (ticket) =>
//         ticket.uniqueToken === qrData.number &&
//         (ticket.status === "pending" || ticket.status === "issued")
//     );

//     if (foundTicket) {
//       setScannedTicket({ number: foundTicket.number });
//       setError("");
//     } else {
//       setError("Недействительный или уже использованный QR-код");
//     }
//   };

//   const handleTicketClick = (ticket) => {
//     setScannedTicket({ number: ticket.number });
//     setTicketData(ticket);
//   };

//   const handleCloseTicket = () => {
//     setScannedTicket(null);
//     setTicketData(null);
//   };

//   const handleCloseLost = () => {
//     setScannedLost(null);
//     setLostItemData(null);
//   };

//   const getNextTicket = () => {
//     const zones = [
//       { name: "lower", start: 1, end: 100 },
//       { name: "middle", start: 200, end: 300 },
//       { name: "upper", start: 400, end: 500 },
//     ];

//     for (const zone of zones) {
//       for (let i = zone.start; i <= zone.end; i++) {
//         const ticket = tickets[i];
//         if (
//           !ticket ||
//           ticket.status === "completed" ||
//           ticket.status === "free" ||
//           ticket.status === "cancelled"
//         ) {
//           return { zone: zone.name, number: i };
//         }
//       }
//     }
//     return null;
//   };

//   const nextTicket = getNextTicket();

//   return (
//     <Container maxWidth="lg">
//       <Box sx={{ mt: 4, mb: 4 }}>
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             mb: 3,
//           }}
//         >
//           <Typography variant="h4" gutterBottom>
//             👨‍💼 Панель администратора
//           </Typography>

//           <Button
//             variant="contained"
//             color="warning"
//             startIcon={<InventoryIcon />}
//             onClick={() => setShowLostItems(true)}
//             sx={{
//               bgcolor: "black",
//               "&:hover": { bgcolor: "#dc3545" },
//               fontSize: "16px",
//               py: 1.5,
//               px: 3,
//             }}
//           >
//             Забытые курточки {lostCount > 0 && `(${lostCount})`}
//           </Button>
//         </Box>

//         {error && (
//           <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
//             {error}
//           </Alert>
//         )}

//         <Grid container spacing={3}>
//           {/* Статистика */}
//           <Grid item xs={12}>
//             <Paper sx={{ p: 2 }}>
//               <Typography variant="h6" gutterBottom>
//                 Статистика по зонам
//               </Typography>
//               <Grid container spacing={2}>
//                 <Grid item xs={12} md={4}>
//                   <Card sx={{ bgcolor: "#fff3e0" }}>
//                     <CardContent>
//                       <Typography variant="h6">Нижний ряд (1-100)</Typography>
//                       <Typography>Свободно: {stats.lower.free}</Typography>
//                       <Typography>Занято: {stats.lower.occupied}</Typography>
//                     </CardContent>
//                   </Card>
//                 </Grid>
//                 <Grid item xs={12} md={4}>
//                   <Card sx={{ bgcolor: "#e3f2fd" }}>
//                     <CardContent>
//                       <Typography variant="h6">
//                         Средний ряд (200-300)
//                       </Typography>
//                       <Typography>Свободно: {stats.middle.free}</Typography>
//                       <Typography>Занято: {stats.middle.occupied}</Typography>
//                     </CardContent>
//                   </Card>
//                 </Grid>
//                 <Grid item xs={12} md={4}>
//                   <Card sx={{ bgcolor: "#f3e5f5" }}>
//                     <CardContent>
//                       <Typography variant="h6">
//                         Верхний ряд (400-500)
//                       </Typography>
//                       <Typography>Свободно: {stats.upper.free}</Typography>
//                       <Typography>Занято: {stats.upper.occupied}</Typography>
//                     </CardContent>
//                   </Card>
//                 </Grid>
//               </Grid>

//               {nextTicket && (
//                 <Alert severity="info" sx={{ mt: 2 }}>
//                   Следующий свободный: #{nextTicket.number}(
//                   {nextTicket.zone === "lower"
//                     ? "Нижний ряд"
//                     : nextTicket.zone === "middle"
//                     ? "Средний ряд"
//                     : "Верхний ряд"}
//                   )
//                 </Alert>
//               )}
//             </Paper>
//           </Grid>

//           {/* Сканер QR */}
//           <Grid item xs={12} md={6}>
//             <Paper sx={{ p: 3 }}>
//               <Typography variant="h6" gutterBottom>
//                 Сканировать QR-код
//               </Typography>
//               <QRScanner onScan={handleScan} />
//             </Paper>
//           </Grid>

//           {/* Последние операции */}
//           <Grid item xs={12} md={6}>
//             <Paper sx={{ p: 3 }}>
//               <Typography variant="h6" gutterBottom>
//                 Последние операции
//               </Typography>
//               <TableContainer>
//                 <Table size="small">
//                   <TableHead>
//                     <TableRow>
//                       <TableCell>Номер</TableCell>
//                       <TableCell>Зона</TableCell>
//                       <TableCell>Статус</TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {Object.entries(tickets)
//                       .sort(
//                         (a, b) =>
//                           new Date(b[1].createdAt) - new Date(a[1].createdAt)
//                       )
//                       .slice(0, 10)
//                       .map(([num, ticket]) => (
//                         <TableRow
//                           key={num}
//                           onClick={() => handleTicketClick(ticket)}
//                           sx={{
//                             cursor: "pointer",
//                             "&:hover": {
//                               backgroundColor: "#f5f5f5",
//                             },
//                           }}
//                         >
//                           <TableCell>
//                             <strong>#{num}</strong>
//                           </TableCell>
//                           <TableCell>{ticket.zone}</TableCell>
//                           <TableCell>
//                             <Tooltip title="Нажмите чтобы открыть">
//                               <Chip
//                                 label={
//                                   ticket.status === "pending"
//                                     ? "⏳ Ожидает"
//                                     : ticket.status === "issued"
//                                     ? "✅ Занят"
//                                     : ticket.status === "completed"
//                                     ? "🔄 Выдан"
//                                     : ticket.status === "cancelled"
//                                     ? "❌ Отменен"
//                                     : "⬜ Свободен"
//                                 }
//                                 color={
//                                   ticket.status === "pending"
//                                     ? "warning"
//                                     : ticket.status === "issued"
//                                     ? "success"
//                                     : ticket.status === "completed"
//                                     ? "info"
//                                     : ticket.status === "cancelled"
//                                     ? "error"
//                                     : "default"
//                                 }
//                                 size="small"
//                               />
//                             </Tooltip>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
//               <Typography
//                 variant="caption"
//                 color="text.secondary"
//                 sx={{ mt: 1, display: "block", textAlign: "center" }}
//               >
//                 👆 Нажмите на любой номерок чтобы открыть
//               </Typography>
//             </Paper>
//           </Grid>
//         </Grid>

//         {/* Обычный номерок */}
//         {scannedTicket && ticketData && (
//           <TicketDetails
//             ticket={ticketData}
//             onClose={handleCloseTicket}
//             onUpdate={() => {
//               setTicketData(tickets[scannedTicket.number]);
//             }}
//           />
//         )}

//         {/* Забытая курточка - сканирование */}
//         {scannedLost && (
//           <LostTicketDetails
//             lostItem={scannedLost.data}
//             onClose={handleCloseLost}
//             onUpdate={() => {
//               // Обновляем список после выдачи
//               setScannedLost(null);
//             }}
//           />
//         )}
//       </Box>
//     </Container>
//   );
// };

// export default AdminPanel;
import React, { useState, useEffect } from "react";
import { ref, onValue, set, update } from "firebase/database";
import { database } from "../../firebase/config";
import QRScanner from "./QRScanner";
import TicketDetails from "./TicketDetails";
import LostTicketDetails from "./LostTicketDetails";
import SettingsIcon from "@mui/icons-material/Settings";
import SaveIcon from "@mui/icons-material/Save";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  InputAdornment,
  Snackbar,
} from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";
import CloseIcon from "@mui/icons-material/Close";
import "./AdminPanel.css";

const AdminPanel = () => {
  const [scannedTicket, setScannedTicket] = useState(null);
  const [scannedLost, setScannedLost] = useState(null);
  const [ticketData, setTicketData] = useState(null);
  const [lostItemData, setLostItemData] = useState(null);
  const [tickets, setTickets] = useState({});
  const [lostItems, setLostItems] = useState({});
  const [error, setError] = useState("");
  const [showLostItems, setShowLostItems] = useState(false);
  const [selectedLostItem, setSelectedLostItem] = useState(null);
  const [lostCount, setLostCount] = useState(0);

  // Состояние для настроек зон
  const [showSettings, setShowSettings] = useState(false);
  const [zoneSettings, setZoneSettings] = useState({
    lower: { start: 1, end: 100, name: "Нижний ряд" },
    middle: { start: 200, end: 300, name: "Средний ряд" },
    upper: { start: 400, end: 500, name: "Верхний ряд" },
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState("");

  const [stats, setStats] = useState({
    lower: { free: 0, occupied: 0, total: 100 },
    middle: { free: 0, occupied: 0, total: 101 },
    upper: { free: 0, occupied: 0, total: 101 },
  });

  // Загружаем настройки зон из Firebase
  useEffect(() => {
    const settingsRef = ref(database, "settings/zones");
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setZoneSettings(data);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const ticketsRef = ref(database, "tickets");
    const unsubscribe = onValue(
      ticketsRef,
      (snapshot) => {
        const data = snapshot.val() || {};
        setTickets(data);
        calculateStats(data);
      },
      (error) => {
        setError("Ошибка загрузки данных: " + error.message);
      }
    );

    return () => unsubscribe();
  }, [zoneSettings]); // Пересчитываем статистику при изменении настроек

  // Следим за забытыми вещами
  useEffect(() => {
    const lostRef = ref(database, "lostItems");
    const unsubscribe = onValue(lostRef, (snapshot) => {
      const data = snapshot.val() || {};
      setLostItems(data);
      const count = Object.values(data).filter(
        (item) => item.status === "waiting"
      ).length;
      setLostCount(count);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scannedTicket && tickets[scannedTicket.number]) {
      setTicketData(tickets[scannedTicket.number]);
    }
  }, [scannedTicket, tickets]);

  // Обновленная функция расчета статистики
  const calculateStats = (data) => {
    const newStats = {
      lower: {
        free: zoneSettings.lower.end - zoneSettings.lower.start + 1,
        occupied: 0,
        total: zoneSettings.lower.end - zoneSettings.lower.start + 1,
      },
      middle: {
        free: zoneSettings.middle.end - zoneSettings.middle.start + 1,
        occupied: 0,
        total: zoneSettings.middle.end - zoneSettings.middle.start + 1,
      },
      upper: {
        free: zoneSettings.upper.end - zoneSettings.upper.start + 1,
        occupied: 0,
        total: zoneSettings.upper.end - zoneSettings.upper.start + 1,
      },
    };

    Object.values(data).forEach((ticket) => {
      let zone = "lower";
      if (ticket.zoneStart >= zoneSettings.middle.start) zone = "middle";
      if (ticket.zoneStart >= zoneSettings.upper.start) zone = "upper";

      if (ticket.status === "issued" || ticket.status === "pending") {
        newStats[zone].occupied++;
        newStats[zone].free--;
      }
    });

    setStats(newStats);
  };

  // Сохранение настроек зон
  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    setError("");
    setSettingsSuccess("");

    try {
      // Проверяем, чтобы зоны не пересекались
      if (zoneSettings.middle.start <= zoneSettings.lower.end) {
        throw new Error(
          "Зоны не должны пересекаться! Средний ряд должен начинаться после нижнего."
        );
      }
      if (zoneSettings.upper.start <= zoneSettings.middle.end) {
        throw new Error(
          "Зоны не должны пересекаться! Верхний ряд должен начинаться после среднего."
        );
      }

      const settingsRef = ref(database, "settings/zones");
      await set(settingsRef, zoneSettings);

      setSettingsSuccess("Настройки успешно сохранены!");

      // Закрываем окно через 2 секунды
      setTimeout(() => {
        setShowSettings(false);
        setSettingsSuccess("");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSettingsLoading(false);
    }
  };

  // Обработчик изменения полей ввода
  const handleZoneChange = (zone, field, value) => {
    const numValue = parseInt(value) || 0;
    setZoneSettings((prev) => ({
      ...prev,
      [zone]: {
        ...prev[zone],
        [field]: numValue,
      },
    }));
  };

  const handleScan = (qrData) => {
    console.log("Получен QR:", qrData);

    // Проверяем, не является ли это кодом забытой курточки
    if (
      qrData.type === "lost" ||
      (qrData.number && qrData.number.startsWith("LOST_"))
    ) {
      // Ищем в lostItems
      const token = qrData.number || qrData.token;
      const foundLost = Object.values(lostItems).find(
        (item) => item.uniqueToken === token && item.status === "waiting"
      );

      if (foundLost) {
        setSelectedLostItem(foundLost);
        setScannedLost({ id: foundLost.id, data: foundLost });
        setError("");
      } else {
        setError("Недействительный код забытой курточки");
      }
      return;
    }

    // Ищем обычный билет по токену
    const foundTicket = Object.values(tickets).find(
      (ticket) =>
        ticket.uniqueToken === qrData.number &&
        (ticket.status === "pending" || ticket.status === "issued")
    );

    if (foundTicket) {
      setScannedTicket({ number: foundTicket.number });
      setError("");
    } else {
      setError("Недействительный или уже использованный QR-код");
    }
  };

  const handleTicketClick = (ticket) => {
    setScannedTicket({ number: ticket.number });
    setTicketData(ticket);
  };

  const handleLostItemClick = (lostItem) => {
    setSelectedLostItem(lostItem);
    setScannedLost({ id: lostItem.id, data: lostItem });
    setShowLostItems(false);
  };

  const handleCloseTicket = () => {
    setScannedTicket(null);
    setTicketData(null);
  };

  const handleCloseLost = () => {
    setScannedLost(null);
    setLostItemData(null);
    setSelectedLostItem(null);
  };

  // Обновленная функция поиска следующего свободного
  const getNextTicket = () => {
    const zones = [
      { name: "lower", ...zoneSettings.lower, priority: 1 },
      { name: "middle", ...zoneSettings.middle, priority: 2 },
      { name: "upper", ...zoneSettings.upper, priority: 3 },
    ];

    for (const zone of zones) {
      for (let i = zone.start; i <= zone.end; i++) {
        const ticket = tickets[i];
        if (
          !ticket ||
          ticket.status === "completed" ||
          ticket.status === "free" ||
          ticket.status === "cancelled"
        ) {
          return { zone: zone.name, number: i, zoneName: zone.name };
        }
      }
    }
    return null;
  };

  const nextTicket = getNextTicket();

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return "Н/Д";
    return new Date(dateString).toLocaleString();
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" gutterBottom>
            👨‍💼 Панель администратора
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<SettingsIcon />}
              onClick={() => setShowSettings(true)}
              sx={{
                fontSize: "16px",
                py: 1.5,
                px: 3,
              }}
            >
              Настройки зон
            </Button>

            <Button
              variant="contained"
              color="warning"
              startIcon={<InventoryIcon />}
              onClick={() => setShowLostItems(true)}
              sx={{
                bgcolor: "#fd7e14",
                "&:hover": { bgcolor: "#dc3545" },
                fontSize: "16px",
                py: 1.5,
                px: 3,
              }}
            >
              Забытые курточки {lostCount > 0 && `(${lostCount})`}
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {settingsSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {settingsSuccess}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Статистика */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Статистика по зонам
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ bgcolor: "#fff3e0" }}>
                    <CardContent>
                      <Typography variant="h6">
                        {zoneSettings.lower.name} ({zoneSettings.lower.start}-
                        {zoneSettings.lower.end})
                      </Typography>
                      <Typography>Всего: {stats.lower.total}</Typography>
                      <Typography>Свободно: {stats.lower.free}</Typography>
                      <Typography>Занято: {stats.lower.occupied}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ bgcolor: "#e3f2fd" }}>
                    <CardContent>
                      <Typography variant="h6">
                        {zoneSettings.middle.name} ({zoneSettings.middle.start}-
                        {zoneSettings.middle.end})
                      </Typography>
                      <Typography>Всего: {stats.middle.total}</Typography>
                      <Typography>Свободно: {stats.middle.free}</Typography>
                      <Typography>Занято: {stats.middle.occupied}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ bgcolor: "#f3e5f5" }}>
                    <CardContent>
                      <Typography variant="h6">
                        {zoneSettings.upper.name} ({zoneSettings.upper.start}-
                        {zoneSettings.upper.end})
                      </Typography>
                      <Typography>Всего: {stats.upper.total}</Typography>
                      <Typography>Свободно: {stats.upper.free}</Typography>
                      <Typography>Занято: {stats.upper.occupied}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {nextTicket && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Следующий свободный: #{nextTicket.number} (
                  {nextTicket.zoneName})
                </Alert>
              )}
            </Paper>
          </Grid>

          {/* Сканер QR */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Сканировать QR-код
              </Typography>
              <QRScanner onScan={handleScan} />
            </Paper>
          </Grid>

          {/* Последние операции */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Последние операции
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Номер</TableCell>
                      <TableCell>Зона</TableCell>
                      <TableCell>Статус</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(tickets)
                      .sort(
                        (a, b) =>
                          new Date(b[1].createdAt) - new Date(a[1].createdAt)
                      )
                      .slice(0, 10)
                      .map(([num, ticket]) => (
                        <TableRow
                          key={num}
                          onClick={() => handleTicketClick(ticket)}
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "#f5f5f5",
                            },
                          }}
                        >
                          <TableCell>
                            <strong>#{num}</strong>
                          </TableCell>
                          <TableCell>{ticket.zone}</TableCell>
                          <TableCell>
                            <Tooltip title="Нажмите чтобы открыть">
                              <Chip
                                label={
                                  ticket.status === "pending"
                                    ? "⏳ Ожидает"
                                    : ticket.status === "issued"
                                    ? "✅ Занят"
                                    : ticket.status === "completed"
                                    ? "🔄 Выдан"
                                    : ticket.status === "cancelled"
                                    ? "❌ Отменен"
                                    : "⬜ Свободен"
                                }
                                color={
                                  ticket.status === "pending"
                                    ? "warning"
                                    : ticket.status === "issued"
                                    ? "success"
                                    : ticket.status === "completed"
                                    ? "info"
                                    : ticket.status === "cancelled"
                                    ? "error"
                                    : "default"
                                }
                                size="small"
                              />
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block", textAlign: "center" }}
              >
                👆 Нажмите на любой номерок чтобы открыть
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Модальное окно настроек зон */}
        <Dialog
          open={showSettings}
          onClose={() => setShowSettings(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h6">⚙️ Настройка зон гардероба</Typography>
              <IconButton onClick={() => setShowSettings(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 3, mt: 1 }}>
              Укажите диапазоны номеров для каждой зоны. Зоны не должны
              пересекаться!
            </Alert>

            <Grid container spacing={3}>
              {/* Нижний ряд */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, bgcolor: "#fff3e0" }}>
                  <Typography variant="subtitle1" gutterBottom>
                    🟠 {zoneSettings.lower.name}
                  </Typography>
                  <TextField
                    fullWidth
                    label="Название зоны"
                    value={zoneSettings.lower.name}
                    onChange={(e) =>
                      setZoneSettings((prev) => ({
                        ...prev,
                        lower: { ...prev.lower, name: e.target.value },
                      }))
                    }
                    sx={{ mb: 2 }}
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Начало"
                    type="number"
                    value={zoneSettings.lower.start}
                    onChange={(e) =>
                      handleZoneChange("lower", "start", e.target.value)
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">#</InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Конец"
                    type="number"
                    value={zoneSettings.lower.end}
                    onChange={(e) =>
                      handleZoneChange("lower", "end", e.target.value)
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">#</InputAdornment>
                      ),
                    }}
                    size="small"
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Всего:{" "}
                    {zoneSettings.lower.end - zoneSettings.lower.start + 1}{" "}
                    номерков
                  </Typography>
                </Paper>
              </Grid>

              {/* Средний ряд */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, bgcolor: "#e3f2fd" }}>
                  <Typography variant="subtitle1" gutterBottom>
                    🔵 {zoneSettings.middle.name}
                  </Typography>
                  <TextField
                    fullWidth
                    label="Название зоны"
                    value={zoneSettings.middle.name}
                    onChange={(e) =>
                      setZoneSettings((prev) => ({
                        ...prev,
                        middle: { ...prev.middle, name: e.target.value },
                      }))
                    }
                    sx={{ mb: 2 }}
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Начало"
                    type="number"
                    value={zoneSettings.middle.start}
                    onChange={(e) =>
                      handleZoneChange("middle", "start", e.target.value)
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">#</InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Конец"
                    type="number"
                    value={zoneSettings.middle.end}
                    onChange={(e) =>
                      handleZoneChange("middle", "end", e.target.value)
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">#</InputAdornment>
                      ),
                    }}
                    size="small"
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Всего:{" "}
                    {zoneSettings.middle.end - zoneSettings.middle.start + 1}{" "}
                    номерков
                  </Typography>
                </Paper>
              </Grid>

              {/* Верхний ряд */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, bgcolor: "#f3e5f5" }}>
                  <Typography variant="subtitle1" gutterBottom>
                    🟣 {zoneSettings.upper.name}
                  </Typography>
                  <TextField
                    fullWidth
                    label="Название зоны"
                    value={zoneSettings.upper.name}
                    onChange={(e) =>
                      setZoneSettings((prev) => ({
                        ...prev,
                        upper: { ...prev.upper, name: e.target.value },
                      }))
                    }
                    sx={{ mb: 2 }}
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Начало"
                    type="number"
                    value={zoneSettings.upper.start}
                    onChange={(e) =>
                      handleZoneChange("upper", "start", e.target.value)
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">#</InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Конец"
                    type="number"
                    value={zoneSettings.upper.end}
                    onChange={(e) =>
                      handleZoneChange("upper", "end", e.target.value)
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">#</InputAdornment>
                      ),
                    }}
                    size="small"
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Всего:{" "}
                    {zoneSettings.upper.end - zoneSettings.upper.start + 1}{" "}
                    номерков
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSettings(false)} color="inherit">
              Отмена
            </Button>
            <Button
              onClick={handleSaveSettings}
              variant="contained"
              color="primary"
              disabled={settingsLoading}
              startIcon={<SaveIcon />}
            >
              {settingsLoading ? "Сохранение..." : "Сохранить настройки"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Модальное окно со списком забытых курточек */}
        <Dialog
          open={showLostItems}
          onClose={() => setShowLostItems(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h6">Забытые курточки</Typography>
              <IconButton onClick={() => setShowLostItems(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {Object.keys(lostItems).length === 0 ? (
              <Alert severity="info">Нет забытых курточек</Alert>
            ) : (
              <List>
                {Object.values(lostItems)
                  .filter((item) => item.status === "waiting")
                  .sort((a, b) => new Date(b.lostAt) - new Date(a.lostAt))
                  .map((item, index) => (
                    <React.Fragment key={item.id}>
                      <ListItem
                        button
                        onClick={() => handleLostItemClick(item)}
                        sx={{
                          borderRadius: 1,
                          mb: 1,
                          bgcolor: "#fff3f3",
                          "&:hover": {
                            bgcolor: "#ffe0e0",
                          },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={2}>
                              <strong>
                                Номерок #{item.originalTicketNumber}
                              </strong>
                              <Chip
                                label="Ожидает выдачи"
                                size="small"
                                color="warning"
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" component="span">
                                📍 Зона: {item.originalZone}
                              </Typography>
                              <br />
                              <Typography variant="body2" component="span">
                                🕐 Забыта: {formatDate(item.lostAt)}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {index <
                        Object.values(lostItems).filter(
                          (item) => item.status === "waiting"
                        ).length -
                          1 && <Divider />}
                    </React.Fragment>
                  ))}
              </List>
            )}
          </DialogContent>
        </Dialog>

        {/* Обычный номерок */}
        {scannedTicket && ticketData && (
          <TicketDetails
            ticket={ticketData}
            onClose={handleCloseTicket}
            onUpdate={() => {
              setTicketData(tickets[scannedTicket.number]);
            }}
          />
        )}

        {/* Забытая курточка - детали */}
        {scannedLost && selectedLostItem && (
          <LostTicketDetails
            lostItem={selectedLostItem}
            onClose={handleCloseLost}
            onUpdate={() => {
              setScannedLost(null);
              setSelectedLostItem(null);
              // Обновляем список забытых
              const lostRef = ref(database, "lostItems");
              onValue(
                lostRef,
                (snapshot) => {
                  const data = snapshot.val() || {};
                  setLostItems(data);
                },
                { onlyOnce: true }
              );
            }}
          />
        )}
      </Box>
    </Container>
  );
};

export default AdminPanel;
// import React, { useState, useEffect } from "react";
// import { ref, onValue } from "firebase/database";
// import { database } from "../../firebase/config";
// import QRScanner from "./QRScanner";
// import TicketDetails from "./TicketDetails";
// import LostTicketDetails from "./LostTicketDetails";
// import {
//   Container,
//   Paper,
//   Typography,
//   Box,
//   Grid,
//   Card,
//   CardContent,
//   Alert,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Chip,
//   Button,
//   Tooltip,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   IconButton,
//   List,
//   ListItem,
//   ListItemText,
//   Divider,
// } from "@mui/material";
// import InventoryIcon from "@mui/icons-material/Inventory";
// import CloseIcon from "@mui/icons-material/Close";
// import "./AdminPanel.css";

// const AdminPanel = () => {
//   const [scannedTicket, setScannedTicket] = useState(null);
//   const [scannedLost, setScannedLost] = useState(null);
//   const [ticketData, setTicketData] = useState(null);
//   const [lostItemData, setLostItemData] = useState(null);
//   const [tickets, setTickets] = useState({});
//   const [lostItems, setLostItems] = useState({});
//   const [error, setError] = useState("");
//   const [showLostItems, setShowLostItems] = useState(false);
//   const [selectedLostItem, setSelectedLostItem] = useState(null);
//   const [lostCount, setLostCount] = useState(0);
//   const [stats, setStats] = useState({
//     lower: { free: 100, occupied: 0 },
//     middle: { free: 101, occupied: 0 },
//     upper: { free: 101, occupied: 0 },
//   });

//   useEffect(() => {
//     const ticketsRef = ref(database, "tickets");
//     const unsubscribe = onValue(
//       ticketsRef,
//       (snapshot) => {
//         const data = snapshot.val() || {};
//         setTickets(data);
//         calculateStats(data);
//       },
//       (error) => {
//         setError("Ошибка загрузки данных: " + error.message);
//       }
//     );

//     return () => unsubscribe();
//   }, []);

//   // Следим за забытыми вещами
//   useEffect(() => {
//     const lostRef = ref(database, "lostItems");
//     const unsubscribe = onValue(lostRef, (snapshot) => {
//       const data = snapshot.val() || {};
//       setLostItems(data);
//       const count = Object.values(data).filter(
//         (item) => item.status === "waiting"
//       ).length;
//       setLostCount(count);
//     });

//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     if (scannedTicket && tickets[scannedTicket.number]) {
//       setTicketData(tickets[scannedTicket.number]);
//     }
//   }, [scannedTicket, tickets]);

//   const calculateStats = (data) => {
//     const newStats = {
//       lower: { free: 100, occupied: 0 },
//       middle: { free: 101, occupied: 0 },
//       upper: { free: 101, occupied: 0 },
//     };

//     Object.values(data).forEach((ticket) => {
//       let zone = "lower";
//       if (ticket.zoneStart >= 200) zone = "middle";
//       if (ticket.zoneStart >= 400) zone = "upper";

//       if (ticket.status === "issued" || ticket.status === "pending") {
//         newStats[zone].occupied++;
//         newStats[zone].free--;
//       }
//     });

//     setStats(newStats);
//   };

//   const handleScan = (qrData) => {
//     console.log("Получен QR:", qrData);

//     // Проверяем, не является ли это кодом забытой курточки
//     if (
//       qrData.type === "lost" ||
//       (qrData.number && qrData.number.startsWith("LOST_"))
//     ) {
//       // Ищем в lostItems
//       const token = qrData.number || qrData.token;
//       const foundLost = Object.values(lostItems).find(
//         (item) => item.uniqueToken === token && item.status === "waiting"
//       );

//       if (foundLost) {
//         setSelectedLostItem(foundLost);
//         setScannedLost({ id: foundLost.id, data: foundLost });
//         setError("");
//       } else {
//         setError("Недействительный код забытой курточки");
//       }
//       return;
//     }

//     // Ищем обычный билет по токену
//     const foundTicket = Object.values(tickets).find(
//       (ticket) =>
//         ticket.uniqueToken === qrData.number &&
//         (ticket.status === "pending" || ticket.status === "issued")
//     );

//     if (foundTicket) {
//       setScannedTicket({ number: foundTicket.number });
//       setError("");
//     } else {
//       setError("Недействительный или уже использованный QR-код");
//     }
//   };

//   const handleTicketClick = (ticket) => {
//     setScannedTicket({ number: ticket.number });
//     setTicketData(ticket);
//   };

//   const handleLostItemClick = (lostItem) => {
//     setSelectedLostItem(lostItem);
//     setScannedLost({ id: lostItem.id, data: lostItem });
//     setShowLostItems(false);
//   };

//   const handleCloseTicket = () => {
//     setScannedTicket(null);
//     setTicketData(null);
//   };

//   const handleCloseLost = () => {
//     setScannedLost(null);
//     setLostItemData(null);
//     setSelectedLostItem(null);
//   };

//   const getNextTicket = () => {
//     const zones = [
//       { name: "lower", start: 1, end: 100 },
//       { name: "middle", start: 200, end: 300 },
//       { name: "upper", start: 400, end: 500 },
//     ];

//     for (const zone of zones) {
//       for (let i = zone.start; i <= zone.end; i++) {
//         const ticket = tickets[i];
//         if (
//           !ticket ||
//           ticket.status === "completed" ||
//           ticket.status === "free" ||
//           ticket.status === "cancelled"
//         ) {
//           return { zone: zone.name, number: i };
//         }
//       }
//     }
//     return null;
//   };

//   const nextTicket = getNextTicket();

//   // Форматирование даты
//   const formatDate = (dateString) => {
//     if (!dateString) return "Н/Д";
//     return new Date(dateString).toLocaleString();
//   };

//   return (
//     <Container maxWidth="lg">
//       <Box sx={{ mt: 4, mb: 4 }}>
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             mb: 3,
//           }}
//         >
//           <Typography variant="h4" gutterBottom>
//             👨‍💼 Панель администратора
//           </Typography>

//           <Button
//             variant="contained"
//             color="warning"
//             startIcon={<InventoryIcon />}
//             onClick={() => setShowLostItems(true)}
//             sx={{
//               bgcolor: "#fd7e14",
//               "&:hover": { bgcolor: "#dc3545" },
//               fontSize: "16px",
//               py: 1.5,
//               px: 3,
//             }}
//           >
//             Забытые курточки {lostCount > 0 && `(${lostCount})`}
//           </Button>
//         </Box>

//         {error && (
//           <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
//             {error}
//           </Alert>
//         )}

//         <Grid container spacing={3}>
//           {/* Статистика */}
//           <Grid item xs={12}>
//             <Paper sx={{ p: 2 }}>
//               <Typography variant="h6" gutterBottom>
//                 Статистика по зонам
//               </Typography>
//               <Grid container spacing={2}>
//                 <Grid item xs={12} md={4}>
//                   <Card sx={{ bgcolor: "#fff3e0" }}>
//                     <CardContent>
//                       <Typography variant="h6">Нижний ряд (1-100)</Typography>
//                       <Typography>Свободно: {stats.lower.free}</Typography>
//                       <Typography>Занято: {stats.lower.occupied}</Typography>
//                     </CardContent>
//                   </Card>
//                 </Grid>
//                 <Grid item xs={12} md={4}>
//                   <Card sx={{ bgcolor: "#e3f2fd" }}>
//                     <CardContent>
//                       <Typography variant="h6">
//                         Средний ряд (200-300)
//                       </Typography>
//                       <Typography>Свободно: {stats.middle.free}</Typography>
//                       <Typography>Занято: {stats.middle.occupied}</Typography>
//                     </CardContent>
//                   </Card>
//                 </Grid>
//                 <Grid item xs={12} md={4}>
//                   <Card sx={{ bgcolor: "#f3e5f5" }}>
//                     <CardContent>
//                       <Typography variant="h6">
//                         Верхний ряд (400-500)
//                       </Typography>
//                       <Typography>Свободно: {stats.upper.free}</Typography>
//                       <Typography>Занято: {stats.upper.occupied}</Typography>
//                     </CardContent>
//                   </Card>
//                 </Grid>
//               </Grid>

//               {nextTicket && (
//                 <Alert severity="info" sx={{ mt: 2 }}>
//                   Следующий свободный: #{nextTicket.number}(
//                   {nextTicket.zone === "lower"
//                     ? "Нижний ряд"
//                     : nextTicket.zone === "middle"
//                     ? "Средний ряд"
//                     : "Верхний ряд"}
//                   )
//                 </Alert>
//               )}
//             </Paper>
//           </Grid>

//           {/* Сканер QR */}
//           <Grid item xs={12} md={6}>
//             <Paper sx={{ p: 3 }}>
//               <Typography variant="h6" gutterBottom>
//                 Сканировать QR-код
//               </Typography>
//               <QRScanner onScan={handleScan} />
//             </Paper>
//           </Grid>

//           {/* Последние операции */}
//           <Grid item xs={12} md={6}>
//             <Paper sx={{ p: 3 }}>
//               <Typography variant="h6" gutterBottom>
//                 Последние операции
//               </Typography>
//               <TableContainer>
//                 <Table size="small">
//                   <TableHead>
//                     <TableRow>
//                       <TableCell>Номер</TableCell>
//                       <TableCell>Зона</TableCell>
//                       <TableCell>Статус</TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {Object.entries(tickets)
//                       .sort(
//                         (a, b) =>
//                           new Date(b[1].createdAt) - new Date(a[1].createdAt)
//                       )
//                       .slice(0, 10)
//                       .map(([num, ticket]) => (
//                         <TableRow
//                           key={num}
//                           onClick={() => handleTicketClick(ticket)}
//                           sx={{
//                             cursor: "pointer",
//                             "&:hover": {
//                               backgroundColor: "#f5f5f5",
//                             },
//                           }}
//                         >
//                           <TableCell>
//                             <strong>#{num}</strong>
//                           </TableCell>
//                           <TableCell>{ticket.zone}</TableCell>
//                           <TableCell>
//                             <Tooltip title="Нажмите чтобы открыть">
//                               <Chip
//                                 label={
//                                   ticket.status === "pending"
//                                     ? "⏳ Ожидает"
//                                     : ticket.status === "issued"
//                                     ? "✅ Занят"
//                                     : ticket.status === "completed"
//                                     ? "🔄 Выдан"
//                                     : ticket.status === "cancelled"
//                                     ? "❌ Отменен"
//                                     : "⬜ Свободен"
//                                 }
//                                 color={
//                                   ticket.status === "pending"
//                                     ? "warning"
//                                     : ticket.status === "issued"
//                                     ? "success"
//                                     : ticket.status === "completed"
//                                     ? "info"
//                                     : ticket.status === "cancelled"
//                                     ? "error"
//                                     : "default"
//                                 }
//                                 size="small"
//                               />
//                             </Tooltip>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
//               <Typography
//                 variant="caption"
//                 color="text.secondary"
//                 sx={{ mt: 1, display: "block", textAlign: "center" }}
//               >
//                 👆 Нажмите на любой номерок чтобы открыть
//               </Typography>
//             </Paper>
//           </Grid>
//         </Grid>

//         {/* Модальное окно со списком забытых курточек */}
//         <Dialog
//           open={showLostItems}
//           onClose={() => setShowLostItems(false)}
//           maxWidth="md"
//           fullWidth
//         >
//           <DialogTitle>
//             <Box
//               display="flex"
//               alignItems="center"
//               justifyContent="space-between"
//             >
//               <Typography variant="h6">Забытые курточки</Typography>
//               <IconButton onClick={() => setShowLostItems(false)}>
//                 <CloseIcon />
//               </IconButton>
//             </Box>
//           </DialogTitle>
//           <DialogContent>
//             {Object.keys(lostItems).length === 0 ? (
//               <Alert severity="info">Нет забытых курточек</Alert>
//             ) : (
//               <List>
//                 {Object.values(lostItems)
//                   .filter((item) => item.status === "waiting")
//                   .sort((a, b) => new Date(b.lostAt) - new Date(a.lostAt))
//                   .map((item, index) => (
//                     <React.Fragment key={item.id}>
//                       <ListItem
//                         button
//                         onClick={() => handleLostItemClick(item)}
//                         sx={{
//                           borderRadius: 1,
//                           mb: 1,
//                           bgcolor: "#fff3f3",
//                           "&:hover": {
//                             bgcolor: "#ffe0e0",
//                           },
//                         }}
//                       >
//                         <ListItemText
//                           primary={
//                             <Box display="flex" alignItems="center" gap={2}>
//                               <strong>
//                                 Номерок #{item.originalTicketNumber}
//                               </strong>
//                               <Chip
//                                 label="Ожидает выдачи"
//                                 size="small"
//                                 color="warning"
//                               />
//                             </Box>
//                           }
//                           secondary={
//                             <>
//                               <Typography variant="body2" component="span">
//                                 📍 Зона: {item.originalZone}
//                               </Typography>
//                               <br />
//                               <Typography variant="body2" component="span">
//                                 🕐 Забыта: {formatDate(item.lostAt)}
//                               </Typography>
//                             </>
//                           }
//                         />
//                       </ListItem>
//                       {index <
//                         Object.values(lostItems).filter(
//                           (item) => item.status === "waiting"
//                         ).length -
//                           1 && <Divider />}
//                     </React.Fragment>
//                   ))}
//               </List>
//             )}
//           </DialogContent>
//         </Dialog>

//         {/* Обычный номерок */}
//         {scannedTicket && ticketData && (
//           <TicketDetails
//             ticket={ticketData}
//             onClose={handleCloseTicket}
//             onUpdate={() => {
//               setTicketData(tickets[scannedTicket.number]);
//             }}
//           />
//         )}

//         {/* Забытая курточка - детали */}
//         {scannedLost && selectedLostItem && (
//           <LostTicketDetails
//             lostItem={selectedLostItem}
//             onClose={handleCloseLost}
//             onUpdate={() => {
//               setScannedLost(null);
//               setSelectedLostItem(null);
//               // Обновляем список забытых
//               const lostRef = ref(database, "lostItems");
//               onValue(
//                 lostRef,
//                 (snapshot) => {
//                   const data = snapshot.val() || {};
//                   setLostItems(data);
//                 },
//                 { onlyOnce: true }
//               );
//             }}
//           />
//         )}
//       </Box>
//     </Container>
//   );
// };

// export default AdminPanel;
