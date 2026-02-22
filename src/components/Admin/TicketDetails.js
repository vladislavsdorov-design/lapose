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

  const handleAction = async (action) => {
    setLoading(true);
    setMessage("");

    try {
      const updates = {};
      const now = new Date().toISOString();

      switch (action) {
        case "accept": // Принять курточку
          updates.status = "issued";
          updates.issuedAt = now;
          updates.acceptedBy = "admin";
          // Токен остается тем же (клиент еще не получил курточку)
          setMessage("✅ Курточка принята!");
          break;

        case "return": // Выдать курточку - генерируем НОВЫЙ токен!
          const newToken = generateNewToken();
          updates.status = "completed";
          updates.completedAt = now;
          updates.returnedBy = "admin";
          updates.oldToken = ticket.uniqueToken; // Сохраняем старый токен для истории
          updates.uniqueToken = newToken; // Меняем токен!
          updates.isUsed = true;
          setMessage("🔄 Курточка выдана! Токен обновлен");
          break;

        case "cancel": // Аннулировать
          updates.status = "cancelled";
          updates.cancelledAt = now;
          updates.cancelledBy = "admin";
          updates.oldToken = ticket.uniqueToken;
          updates.uniqueToken = generateNewToken(); // Тоже меняем токен при отмене
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
        if (action === "return" || action === "cancel") {
          // Закрываем после возврата или отмены, так как токен изменился
          setTimeout(onClose, 2000);
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

          {ticket.issuedAt && (
            <div className="info-row">
              <span className="info-label">Принят:</span>
              <span className="info-value">
                {new Date(ticket.issuedAt).toLocaleString()}
              </span>
            </div>
          )}

          {ticket.uniqueToken && (
            <div className="info-row">
              <span className="info-label">Токен:</span>
              <span className="info-value token">
                {ticket.uniqueToken.substring(0, 10)}...
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
            👁️ Только просмотр
          </button>
        </div>

        {ticket.status === "issued" && (
          <div className="token-warning">
            <p>⚠️ После выдачи курточки токен изменится!</p>
            <p>Старый QR-код больше не будет работать</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetails;
