import React, { useState } from "react";
import { ref, remove, update } from "firebase/database";
import { database } from "../../firebase/config";
import "./TicketDetails.css";

const LostTicketDetails = ({ lostItem, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReturn = async () => {
    setLoading(true);
    setMessage("");

    try {
      console.log("Выдаем забытую курточку:", lostItem);

      // 1. Удаляем из lostItems (чтобы у клиента пропало уведомление)
      await remove(ref(database, `lostItems/${lostItem.id}`));

      // 2. Если нужно, обновляем оригинальный номерок
      // (можно добавить пометку что был возвращен)

      setMessage("✅ Забытая курточка выдана!");

      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Ошибка при выдаче:", err);
      setMessage("❌ Ошибка: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="ticket-details-overlay" onClick={onClose}>
      <div
        className="ticket-details-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <div className="ticket-status-badge status-lost">
          <span className="status-icon">🔔</span>
          Забытая курточка
        </div>

        <h2 className="ticket-details-number">
          #{lostItem.originalTicketNumber}
        </h2>

        <div className="ticket-details-info">
          <div className="info-row">
            <span className="info-label">📍 Оригинальная зона:</span>
            <span className="info-value">{lostItem.originalZone}</span>
          </div>

          <div className="info-row">
            <span className="info-label">📅 Оставлена:</span>
            <span className="info-value">{formatDate(lostItem.lostAt)}</span>
          </div>

          <div className="info-row">
            <span className="info-label">🔑 Код:</span>
            <span className="info-value token">
              {lostItem.uniqueToken.substring(0, 15)}...
            </span>
          </div>
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
          <button
            className="action-btn return-btn"
            onClick={handleReturn}
            disabled={loading}
            style={{ fontSize: "20px", padding: "20px" }}
          >
            {loading ? "⏳" : "✅"} ВЫДАТЬ КУРТОЧКУ
          </button>
        </div>

        <div className="pickup-info" style={{ marginTop: "20px" }}>
          <p>🔔 Клиент пришел за забытой курточкой</p>
          <p>После выдачи уведомление у клиента исчезнет</p>
        </div>
      </div>
    </div>
  );
};

export default LostTicketDetails;
