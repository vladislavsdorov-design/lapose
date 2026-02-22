import React, { useState, useEffect } from "react";
import { ref, set, get } from "firebase/database";
import { database } from "../../firebase/config";
import { QRCodeSVG } from "qrcode.react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";

const ClientQR = () => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Конфигурация зон с приоритетами
  const zones = [
    { name: "Нижний ряд", start: 1, end: 100, priority: 1 },
    { name: "Средний ряд", start: 200, end: 300, priority: 2 },
    { name: "Верхний ряд", start: 400, end: 500, priority: 3 },
  ];

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

      const ticketData = {
        number: selectedNumber,
        zone: selectedZone.name,
        zoneStart: selectedZone.start,
        zoneEnd: selectedZone.end,
        status: "pending",
        createdAt: new Date().toISOString(),
        clientId: generateClientId(),
      };

      await set(ref(database, `tickets/${selectedNumber}`), ticketData);

      localStorage.setItem(
        "currentTicket",
        JSON.stringify({
          number: selectedNumber,
          createdAt: ticketData.createdAt,
        })
      );

      setTicket(ticketData);
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
    return JSON.stringify({
      number: ticket.number,
      type: "garderob_ticket",
      generated: ticket.createdAt,
    });
  };

  useEffect(() => {
    const savedTicket = localStorage.getItem("currentTicket");
    if (savedTicket) {
      try {
        const parsed = JSON.parse(savedTicket);
        const checkTicket = async () => {
          const ticketRef = ref(database, `tickets/${parsed.number}`);
          const snapshot = await get(ticketRef);
          const ticketData = snapshot.val();

          if (
            ticketData &&
            (ticketData.status === "pending" || ticketData.status === "issued")
          ) {
            setTicket(ticketData);
          } else {
            localStorage.removeItem("currentTicket");
          }
        };
        checkTicket();
      } catch (e) {
        localStorage.removeItem("currentTicket");
      }
    }
  }, []);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h4" gutterBottom>
            🎩 Гардероб Шатни
          </Typography>

          {!ticket ? (
            <>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                Нажмите кнопку, чтобы получить номерок
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={generateTicket}
                disabled={loading}
                sx={{ py: 2, px: 4, fontSize: "1.2rem" }}
              >
                {loading ? <CircularProgress size={24} /> : "Получить номерок"}
              </Button>

              <Typography
                variant="caption"
                display="block"
                sx={{ mt: 3, color: "text.secondary" }}
              >
                Система автоматически выберет свободный номерок по приоритету:
                <br />
                1. Нижний ряд (1-100)
                <br />
                2. Средний ряд (200-300)
                <br />
                3. Верхний ряд (400-500)
              </Typography>
            </>
          ) : (
            <Box>
              <Typography
                variant="h5"
                gutterBottom
                sx={{ color: "success.main", fontWeight: "bold" }}
              >
                Ваш номерок: #{ticket.number}
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                {ticket.zone}
              </Typography>

              <Box
                sx={{
                  my: 4,
                  p: 3,
                  backgroundColor: "#f5f5f5",
                  display: "inline-block",
                  borderRadius: 2,
                  border: "2px solid #e0e0e0",
                }}
              >
                <QRCodeSVG value={getQRValue()} size={256} level="H" />
              </Box>

              <Alert severity="info" sx={{ mb: 3, textAlign: "left" }}>
                <Typography variant="body2">
                  <strong>Важно:</strong> Сохраните этот QR-код!
                  <br />• Покажите при сдаче курточки
                  <br />• Покажите снова, когда будете забирать
                </Typography>
              </Alert>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ClientQR;
