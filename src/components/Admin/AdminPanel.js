import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../firebase/config";
import QRScanner from "./QRScanner";
import TicketDetails from "./TicketDetails";
import LostItemsPanel from "./LostItemsPanel"; // Добавлен импорт
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
  Button, // Добавлен Button
} from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory"; // Добавлена иконка
import "./AdminPanel.css";

const AdminPanel = () => {
  const [scannedTicket, setScannedTicket] = useState(null);
  const [ticketData, setTicketData] = useState(null);
  const [tickets, setTickets] = useState({});
  const [error, setError] = useState("");
  const [showLostItems, setShowLostItems] = useState(false); // Добавлено состояние
  const [lostCount, setLostCount] = useState(0); // Добавлено состояние
  const [stats, setStats] = useState({
    lower: { free: 100, occupied: 0 },
    middle: { free: 101, occupied: 0 },
    upper: { free: 101, occupied: 0 },
  });

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
  }, []);

  // Добавлен эффект для отслеживания забытых вещей
  useEffect(() => {
    const lostRef = ref(database, "lostItems");
    const unsubscribe = onValue(lostRef, (snapshot) => {
      const data = snapshot.val() || {};
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

  const calculateStats = (data) => {
    const newStats = {
      lower: { free: 100, occupied: 0 },
      middle: { free: 101, occupied: 0 },
      upper: { free: 101, occupied: 0 },
    };

    Object.values(data).forEach((ticket) => {
      let zone = "lower";
      if (ticket.zoneStart >= 200) zone = "middle";
      if (ticket.zoneStart >= 400) zone = "upper";

      if (ticket.status === "issued" || ticket.status === "pending") {
        newStats[zone].occupied++;
        newStats[zone].free--;
      }
    });

    setStats(newStats);
  };

  const handleScan = (qrData) => {
    console.log("Получен QR:", qrData);

    // Проверяем, может это код забытой вещи?
    if (qrData.number.startsWith("LOST_")) {
      setShowLostItems(true);
      return;
    }

    // Ищем билет по токену
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

  const handleCloseTicket = () => {
    setScannedTicket(null);
    setTicketData(null);
  };

  const getNextTicket = () => {
    const zones = [
      { name: "lower", start: 1, end: 100 },
      { name: "middle", start: 200, end: 300 },
      { name: "upper", start: 400, end: 500 },
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
          return { zone: zone.name, number: i };
        }
      }
    }
    return null;
  };

  const nextTicket = getNextTicket();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Добавлен заголовок с кнопкой */}
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
            Хранилище забытых {lostCount > 0 && `(${lostCount})`}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
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
                      <Typography variant="h6">Нижний ряд (1-100)</Typography>
                      <Typography>Свободно: {stats.lower.free}</Typography>
                      <Typography>Занято: {stats.lower.occupied}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ bgcolor: "#e3f2fd" }}>
                    <CardContent>
                      <Typography variant="h6">
                        Средний ряд (200-300)
                      </Typography>
                      <Typography>Свободно: {stats.middle.free}</Typography>
                      <Typography>Занято: {stats.middle.occupied}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ bgcolor: "#f3e5f5" }}>
                    <CardContent>
                      <Typography variant="h6">
                        Верхний ряд (400-500)
                      </Typography>
                      <Typography>Свободно: {stats.upper.free}</Typography>
                      <Typography>Занято: {stats.upper.occupied}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {nextTicket && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Следующий свободный: #{nextTicket.number}(
                  {nextTicket.zone === "lower"
                    ? "Нижний ряд"
                    : nextTicket.zone === "middle"
                    ? "Средний ряд"
                    : "Верхний ряд"}
                  )
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
                        <TableRow key={num}>
                          <TableCell>#{num}</TableCell>
                          <TableCell>{ticket.zone}</TableCell>
                          <TableCell>
                            <Chip
                              label={
                                ticket.status === "pending"
                                  ? "Ожидает"
                                  : ticket.status === "issued"
                                  ? "Занят"
                                  : ticket.status === "completed"
                                  ? "Выдан"
                                  : ticket.status === "cancelled"
                                  ? "Отменен"
                                  : "Свободен"
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
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Модальное окно с деталями билета */}
        {scannedTicket && ticketData && (
          <TicketDetails
            ticket={ticketData}
            onClose={handleCloseTicket}
            onUpdate={() => {
              // Обновляем данные после изменения
              setTicketData(tickets[scannedTicket.number]);
            }}
          />
        )}

        {/* Модальное окно хранилища забытых вещей */}
        {showLostItems && (
          <LostItemsPanel onClose={() => setShowLostItems(false)} />
        )}
      </Box>
    </Container>
  );
};

export default AdminPanel;
