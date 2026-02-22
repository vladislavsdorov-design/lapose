import React, { useState } from "react";
import { ref, update } from "firebase/database";
import { database } from "../../firebase/config";
import "./TicketDetails.css";

const TicketDetails = ({ ticket, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Генерация нового токена
  const generateNewToken = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const secret = Math.random().toString(36).substring(2, 15);
    return `${timestamp}_${random}_${secret}`;
  };

  const handleAccept = async () => {
    setLoading(true);
    setMessage("");

    try {
      const updates = {
        status: "issued",
        issuedAt: new Date().toISOString(),
        acceptedBy: "admin",
      };

      await update(ref(database, `tickets/${ticket.number}`), updates);
      setMessage("✅ Курточка принята!");

      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1500);
    } catch (err) {
      setMessage("❌ Ошибка: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    setLoading(true);
    setMessage("");

    try {
      const newToken = generateNewToken();
      const updates = {
        status: "completed",
        completedAt: new Date().toISOString(),
        returnedBy: "admin",
        oldToken: ticket.uniqueToken,
        uniqueToken: newToken,
        isUsed: true,
      };

      await update(ref(database, `tickets/${ticket.number}`), updates);
      setMessage("🔄 Курточка выдана!");

      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1500);
    } catch (err) {
      setMessage("❌ Ошибка: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    setMessage("");

    try {
      const newToken = generateNewToken();
      const updates = {
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
        cancelledBy: "admin",
        oldToken: ticket.uniqueToken,
        uniqueToken: newToken,
      };

      await update(ref(database, `tickets/${ticket.number}`), updates);
      setMessage("❌ Операция отменена");

      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1500);
    } catch (err) {
      setMessage("❌ Ошибка: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statuses = {
      pending: { text: "Ожидает приёма", class: "status-pending", icon: "⏳" },
      issued: { text: "Курточка сдана", class: "status-issued", icon: "✅" },
      completed: {
        text: "Курточка выдана",
        class: "status-completed",
        icon: "🔄",
      },
      cancelled: { text: "Аннулирован", class: "status-cancelled", icon: "❌" },
    };
    return statuses[status] || { text: status, class: "", icon: "❓" };
  };

  const status = getStatusInfo(ticket.status);

  return (
    <div className="ticket-details-overlay" onClick={onClose}>
      <div
        className="ticket-details-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <div className={`ticket-status-badge ${status.class}`}>
          <span className="status-icon">{status.icon}</span>
          {status.text}
        </div>

        <h2 className="ticket-details-number">Номерок #{ticket.number}</h2>

        <div className="ticket-details-info">
          <div className="info-row">
            <span className="info-label">📍 Зона:</span>
            <span className="info-value">{ticket.zone}</span>
          </div>

          <div className="info-row">
            <span className="info-label">📊 Диапазон:</span>
            <span className="info-value">
              {ticket.zoneStart} - {ticket.zoneEnd}
            </span>
          </div>

          {ticket.createdAt && (
            <div className="info-row">
              <span className="info-label">🕐 Создан:</span>
              <span className="info-value">
                {new Date(ticket.createdAt).toLocaleString()}
              </span>
            </div>
          )}

          {ticket.issuedAt && (
            <div className="info-row">
              <span className="info-label">✅ Принят:</span>
              <span className="info-value">
                {new Date(ticket.issuedAt).toLocaleString()}
              </span>
            </div>
          )}

          {ticket.completedAt && (
            <div className="info-row">
              <span className="info-label">🔄 Выдан:</span>
              <span className="info-value">
                {new Date(ticket.completedAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {message && (
          <div
            className={`action-message ${
              message.includes("❌") ? "error" : "success"
            }`}
          >
            {message}
          </div>
        )}

        <div className="action-buttons">
          {ticket.status === "pending" && (
            <>
              <button
                className="action-btn accept-btn"
                onClick={handleAccept}
                disabled={loading}
              >
                {loading ? "⏳" : "✅"} Принять курточку
              </button>

              <button
                className="action-btn cancel-btn"
                onClick={handleCancel}
                disabled={loading}
              >
                {loading ? "⏳" : "❌"} Отменить
              </button>
            </>
          )}

          {ticket.status === "issued" && (
            <button
              className="action-btn return-btn"
              onClick={handleReturn}
              disabled={loading}
            >
              {loading ? "⏳" : "🎯"} Выдать курточку
            </button>
          )}

          {(ticket.status === "completed" || ticket.status === "cancelled") && (
            <div className="info-message">
              <p>
                ✨ Этот номерок уже{" "}
                {ticket.status === "completed" ? "выдан" : "отменен"}
              </p>
              <button className="action-btn view-btn" onClick={onClose}>
                👁️ Закрыть
              </button>
            </div>
          )}
        </div>

        {ticket.status === "issued" && (
          <div className="token-warning">
            <p>⚠️ После выдачи курточки старый QR-код перестанет работать</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetails;
