import React, { useState, useEffect } from "react";
import { ref, onValue, update } from "firebase/database";
import { database } from "../../firebase/config";
import { QRCodeSVG } from "qrcode.react";
import "./LostItemsPanel.css";

const LostItemsPanel = ({ onClose }) => {
  const [lostItems, setLostItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const lostRef = ref(database, "lostItems");
    const unsubscribe = onValue(lostRef, (snapshot) => {
      const data = snapshot.val() || {};
      const items = Object.entries(data)
        .map(([id, item]) => ({
          id,
          ...item,
        }))
        .filter((item) => item.status === "waiting");
      setLostItems(items);
    });

    return () => unsubscribe();
  }, []);

  const handleReturn = async (item) => {
    setLoading(true);
    setMessage("");

    try {
      // Отмечаем как возвращенное
      const updates = {
        status: "returned",
        returnedAt: new Date().toISOString(),
        returnedBy: "admin",
      };

      await update(ref(database, `lostItems/${item.id}`), updates);

      setMessage(`✅ Курточка с номерка #${item.originalTicketNumber} выдана`);

      setTimeout(() => {
        setSelectedItem(null);
        setMessage("");
      }, 2000);
    } catch (err) {
      setMessage("❌ Ошибка: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="lost-items-overlay" onClick={onClose}>
      <div className="lost-items-modal" onClick={(e) => e.stopPropagation()}>
        <div className="lost-items-header">
          <h2>📋 Забытые курточки</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {message && (
          <div
            className={`lost-message ${
              message.includes("❌") ? "error" : "success"
            }`}
          >
            {message}
          </div>
        )}

        {selectedItem ? (
          <div className="lost-item-details">
            <button className="back-btn" onClick={() => setSelectedItem(null)}>
              ← Назад к списку
            </button>

            <h3>Курточка #{selectedItem.originalTicketNumber}</h3>

            <div className="lost-item-info">
              <p>
                <strong>📅 Оставлена:</strong> {formatDate(selectedItem.lostAt)}
              </p>
              <p>
                <strong>📍 Оригинальная зона:</strong>{" "}
                {selectedItem.originalZone}
              </p>
              <p>
                <strong>📝 Статус:</strong> Ожидает получения
              </p>
            </div>

            <div className="lost-qr-section">
              <h4>QR-код для клиента:</h4>
              <div className="qr-container">
                <QRCodeSVG
                  value={selectedItem.uniqueToken}
                  size={200}
                  level="H"
                />
              </div>
              <p className="qr-note">
                Клиент показывает этот код при получении
              </p>
            </div>

            <button
              className="return-lost-btn"
              onClick={() => handleReturn(selectedItem)}
              disabled={loading}
            >
              {loading ? "⏳" : "✅"} Клиент забрал курточку
            </button>
          </div>
        ) : (
          <>
            {lostItems.length === 0 ? (
              <div className="empty-state">
                <p>✨ Нет забытых курточек</p>
              </div>
            ) : (
              <div className="lost-items-list">
                {lostItems.map((item) => (
                  <div
                    key={item.id}
                    className="lost-item-card"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="lost-item-header">
                      <span className="lost-number">
                        #{item.originalTicketNumber}
                      </span>
                      <span className="lost-date">
                        {formatDate(item.lostAt)}
                      </span>
                    </div>
                    <div className="lost-item-body">
                      <p>
                        <strong>Зона:</strong> {item.originalZone}
                      </p>
                    </div>
                    <div className="lost-item-footer">
                      <span className="lost-status">Ждет получения</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LostItemsPanel;
