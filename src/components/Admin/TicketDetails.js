import React, { useState } from "react";
import { ref, update } from "firebase/database";
import { database } from "../../firebase/config";
import "./TicketDetails.css";

const TicketDetails = ({ ticket, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAction = async (action) => {
    setLoading(true);
    setMessage("");

    try {
      const updates = {};
      const now = new Date().toISOString();

      switch (action) {
        case "accept": // Принять курточку (один клик)
          updates.status = "issued";
          updates.issuedAt = now;
          updates.acceptedBy = "admin";
          setMessage("✅ Курточка принята!");
          break;

        case "return": // Выдать курточку (один клик)
          updates.status = "completed";
          updates.completedAt = now;
          updates.returnedBy = "admin";
          setMessage("🔄 Курточка выдана!");
          break;

        case "cancel": // Аннулировать
          updates.status = "cancelled";
          updates.cancelledAt = now;
          updates.cancelledBy = "admin";
          setMessage("❌ Операция отменена");
          break;

        case "view": // Просто просмотр
          setMessage("👁️ Просмотр");
          setTimeout(onClose, 1000);
          return;

        default:
          return;
      }

      await update(ref(database, `tickets/${ticket.number}`), updates);

      setTimeout(() => {
        onUpdate();
        if (action === "accept" || action === "return") {
          // Не закрываем автоматически после действий
        }
      }, 1500);
    } catch (err) {
      setMessage("❌ Ошибка: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statuses = {
      pending: { text: "Ожидает приёма", class: "status-pending" },
      issued: { text: "Курточка сдана", class: "status-issued" },
      completed: { text: "Курточка выдана", class: "status-completed" },
      cancelled: { text: "Аннулирован", class: "status-cancelled" },
    };
    return statuses[status] || { text: status, class: "" };
  };

  const status = getStatusText(ticket.status);

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
          {status.text}
        </div>

        <h2 className="ticket-details-number">Номерок #{ticket.number}</h2>

        <div className="ticket-details-info">
          <div className="info-row">
            <span className="info-label">Зона:</span>
            <span className="info-value">{ticket.zone}</span>
          </div>

          <div className="info-row">
            <span className="info-label">Диапазон:</span>
            <span className="info-value">
              {ticket.zoneStart} - {ticket.zoneEnd}
            </span>
          </div>

          {ticket.createdAt && (
            <div className="info-row">
              <span className="info-label">Создан:</span>
              <span className="info-value">
                {new Date(ticket.createdAt).toLocaleString()}
              </span>
            </div>
          )}

          {ticket.uniqueToken && (
            <div className="info-row">
              <span className="info-label">Токен:</span>
              <span className="info-value token">
                {ticket.uniqueToken.substring(0, 15)}...
              </span>
            </div>
          )}
        </div>

        {message && <div className="action-message">{message}</div>}

        <div className="action-buttons">
          {ticket.status === "pending" && (
            <>
              <button
                className="action-btn accept-btn"
                onClick={() => handleAction("accept")}
                disabled={loading}
              >
                ✅ Принять курточку
              </button>

              <button
                className="action-btn cancel-btn"
                onClick={() => handleAction("cancel")}
                disabled={loading}
              >
                ❌ Отменить
              </button>
            </>
          )}

          {ticket.status === "issued" && (
            <button
              className="action-btn return-btn"
              onClick={() => handleAction("return")}
              disabled={loading}
            >
              🎯 Выдать курточку
            </button>
          )}

          <button
            className="action-btn view-btn"
            onClick={() => handleAction("view")}
            disabled={loading}
          >
            👁️ Просмотр
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
