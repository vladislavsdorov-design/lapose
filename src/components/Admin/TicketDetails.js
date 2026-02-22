import React, { useState } from "react";
import { ref, update } from "firebase/database";
import { database } from "../../firebase/config";
import {
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import LocalPoliceIcon from "@mui/icons-material/LocalPolice";
import CloseIcon from "@mui/icons-material/Close";

const TicketDetails = ({ ticket, onClose, onUpdate }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return { text: "Ожидает сдачи", color: "warning", icon: "⏳" };
      case "issued":
        return { text: "Курточка сдана", color: "success", icon: "✅" };
      case "completed":
        return { text: "Курточка выдана", color: "info", icon: "🔄" };
      case "cancelled":
        return { text: "Аннулирован", color: "error", icon: "❌" };
      case "free":
        return { text: "Свободен", color: "default", icon: "⬜" };
      default:
        return { text: "Неизвестно", color: "default", icon: "❓" };
    }
  };

  const handleAction = async (action) => {
    setLoading(true);
    setError("");
    setActionMessage("");

    try {
      const updates = {};
      const now = new Date().toISOString();

      switch (action) {
        case "confirm":
          updates.status = "issued";
          updates.issuedAt = now;
          setActionMessage("✅ Курточка принята!");
          break;
        case "cancel":
          updates.status = "cancelled";
          updates.cancelledAt = now;
          setActionMessage("❌ Номерок аннулирован");
          break;
        case "complete":
          updates.status = "completed";
          updates.completedAt = now;
          setActionMessage("🔄 Курточка выдана");
          break;
        case "close":
          setActionMessage("👁️ Просмотр завершен");
          setTimeout(() => {
            onClose();
          }, 1000);
          return;
        default:
          setActionMessage("Неизвестное действие");
          setLoading(false);
          return;
      }

      await update(ref(database, `tickets/${ticket.number}`), updates);
      setTimeout(() => {
        onUpdate();
      }, 1500);
    } catch (err) {
      console.error("Ошибка:", err);
      setError("Ошибка при обновлении статуса");
    } finally {
      setLoading(false);
    }
  };

  const statusInfo = getStatusInfo(ticket.status);

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <span>{statusInfo.icon}</span>
          <Typography variant="h5">Номерок #{ticket.number}</Typography>
          <Chip label={statusInfo.text} color={statusInfo.color} size="small" />
        </Box>
      </DialogTitle>

      <DialogContent>
        <Paper sx={{ p: 3, mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {actionMessage && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {actionMessage}
            </Alert>
          )}

          <Typography variant="body1" gutterBottom>
            <strong>Зона:</strong> {ticket.zone}
          </Typography>

          <Typography variant="body1" gutterBottom>
            <strong>Диапазон:</strong> {ticket.zoneStart} - {ticket.zoneEnd}
          </Typography>

          {ticket.createdAt && (
            <Typography variant="body2" color="textSecondary" gutterBottom>
              <strong>Создан:</strong>{" "}
              {new Date(ticket.createdAt).toLocaleString()}
            </Typography>
          )}

          {ticket.issuedAt && (
            <Typography variant="body2" color="textSecondary" gutterBottom>
              <strong>Курточка сдана:</strong>{" "}
              {new Date(ticket.issuedAt).toLocaleString()}
            </Typography>
          )}

          {ticket.completedAt && (
            <Typography variant="body2" color="textSecondary" gutterBottom>
              <strong>Курточка выдана:</strong>{" "}
              {new Date(ticket.completedAt).toLocaleString()}
            </Typography>
          )}

          <Box sx={{ mt: 4, display: "flex", gap: 2, flexDirection: "column" }}>
            {ticket.status === "pending" && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleAction("confirm")}
                  disabled={loading}
                  fullWidth
                >
                  Подтвердить (курточка сдана)
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  startIcon={<CancelIcon />}
                  onClick={() => handleAction("cancel")}
                  disabled={loading}
                  fullWidth
                >
                  Аннулировать
                </Button>
              </>
            )}

            {ticket.status === "issued" && (
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<LocalPoliceIcon />}
                onClick={() => handleAction("complete")}
                disabled={loading}
                fullWidth
              >
                Выдать курточку
              </Button>
            )}

            <Button
              variant="outlined"
              size="large"
              startIcon={<CloseIcon />}
              onClick={() => handleAction("close")}
              disabled={loading}
              fullWidth
              sx={{ mt: ticket.status === "pending" ? 1 : 2 }}
            >
              Просто закрыть (без изменений)
            </Button>
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Закрыть окно
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketDetails;
