// import React, { useState } from "react";
// import { ref, update } from "firebase/database";
// import { database } from "../../firebase/config";
// import "./TicketDetails.css";

// const TicketDetails = ({ ticket, onClose, onUpdate }) => {
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   // Генерация нового токена
//   const generateNewToken = () => {
//     const timestamp = Date.now();
//     const random = Math.random().toString(36).substring(2, 15);
//     const secret = Math.random().toString(36).substring(2, 15);
//     return `${timestamp}_${random}_${secret}`;
//   };

//   const handleAccept = async () => {
//     setLoading(true);
//     setMessage("");

//     try {
//       const updates = {
//         status: "issued",
//         issuedAt: new Date().toISOString(),
//         acceptedBy: "admin",
//       };

//       await update(ref(database, `tickets/${ticket.number}`), updates);
//       setMessage("✅ Курточка принята!");

//       setTimeout(() => {
//         onUpdate();
//         onClose();
//       }, 1500);
//     } catch (err) {
//       setMessage("❌ Ошибка: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReturn = async () => {
//     setLoading(true);
//     setMessage("");

//     try {
//       const newToken = generateNewToken();
//       const updates = {
//         status: "completed",
//         completedAt: new Date().toISOString(),
//         returnedBy: "admin",
//         oldToken: ticket.uniqueToken,
//         uniqueToken: newToken,
//         isUsed: true,
//       };

//       await update(ref(database, `tickets/${ticket.number}`), updates);
//       setMessage("🔄 Курточка выдана!");

//       setTimeout(() => {
//         onUpdate();
//         onClose();
//       }, 1500);
//     } catch (err) {
//       setMessage("❌ Ошибка: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancel = async () => {
//     setLoading(true);
//     setMessage("");

//     try {
//       const newToken = generateNewToken();
//       const updates = {
//         status: "cancelled",
//         cancelledAt: new Date().toISOString(),
//         cancelledBy: "admin",
//         oldToken: ticket.uniqueToken,
//         uniqueToken: newToken,
//       };

//       await update(ref(database, `tickets/${ticket.number}`), updates);
//       setMessage("❌ Операция отменена");

//       setTimeout(() => {
//         onUpdate();
//         onClose();
//       }, 1500);
//     } catch (err) {
//       setMessage("❌ Ошибка: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusInfo = (status) => {
//     const statuses = {
//       pending: { text: "Ожидает приёма", class: "status-pending", icon: "⏳" },
//       issued: { text: "Курточка сдана", class: "status-issued", icon: "✅" },
//       completed: {
//         text: "Курточка выдана",
//         class: "status-completed",
//         icon: "🔄",
//       },
//       cancelled: { text: "Аннулирован", class: "status-cancelled", icon: "❌" },
//     };
//     return statuses[status] || { text: status, class: "", icon: "❓" };
//   };

//   const status = getStatusInfo(ticket.status);

//   return (
//     <div className="ticket-details-overlay" onClick={onClose}>
//       <div
//         className="ticket-details-modal"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <button className="modal-close" onClick={onClose}>
//           ×
//         </button>

//         <div className={`ticket-status-badge ${status.class}`}>
//           <span className="status-icon">{status.icon}</span>
//           {status.text}
//         </div>

//         <h2 className="ticket-details-number">Номерок #{ticket.number}</h2>

//         <div className="ticket-details-info">
//           <div className="info-row">
//             <span className="info-label">📍 Зона:</span>
//             <span className="info-value">{ticket.zone}</span>
//           </div>

//           <div className="info-row">
//             <span className="info-label">📊 Диапазон:</span>
//             <span className="info-value">
//               {ticket.zoneStart} - {ticket.zoneEnd}
//             </span>
//           </div>

//           {ticket.createdAt && (
//             <div className="info-row">
//               <span className="info-label">🕐 Создан:</span>
//               <span className="info-value">
//                 {new Date(ticket.createdAt).toLocaleString()}
//               </span>
//             </div>
//           )}

//           {ticket.issuedAt && (
//             <div className="info-row">
//               <span className="info-label">✅ Принят:</span>
//               <span className="info-value">
//                 {new Date(ticket.issuedAt).toLocaleString()}
//               </span>
//             </div>
//           )}

//           {ticket.completedAt && (
//             <div className="info-row">
//               <span className="info-label">🔄 Выдан:</span>
//               <span className="info-value">
//                 {new Date(ticket.completedAt).toLocaleString()}
//               </span>
//             </div>
//           )}
//         </div>

//         {message && (
//           <div
//             className={`action-message ${
//               message.includes("❌") ? "error" : "success"
//             }`}
//           >
//             {message}
//           </div>
//         )}

//         <div className="action-buttons">
//           {ticket.status === "pending" && (
//             <>
//               <button
//                 className="action-btn accept-btn"
//                 onClick={handleAccept}
//                 disabled={loading}
//               >
//                 {loading ? "⏳" : "✅"} Принять курточку
//               </button>

//               <button
//                 className="action-btn cancel-btn"
//                 onClick={handleCancel}
//                 disabled={loading}
//               >
//                 {loading ? "⏳" : "❌"} Отменить
//               </button>
//             </>
//           )}

//           {ticket.status === "issued" && (
//             <button
//               className="action-btn return-btn"
//               onClick={handleReturn}
//               disabled={loading}
//             >
//               {loading ? "⏳" : "🎯"} Выдать курточку
//             </button>
//           )}

//           {(ticket.status === "completed" || ticket.status === "cancelled") && (
//             <div className="info-message">
//               <p>
//                 ✨ Этот номерок уже{" "}
//                 {ticket.status === "completed" ? "выдан" : "отменен"}
//               </p>
//               <button className="action-btn view-btn" onClick={onClose}>
//                 👁️ Закрыть
//               </button>
//             </div>
//           )}
//         </div>

//         {ticket.status === "issued" && (
//           <div className="token-warning">
//             <p>⚠️ После выдачи курточки старый QR-код перестанет работать</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TicketDetails;
import React, { useState } from "react";
import { ref, update, set } from "firebase/database";
import { database } from "../../firebase/config";
import "./TicketDetails.css";

const TicketDetails = ({ ticket, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showManualControl, setShowManualControl] = useState(false);

  // Генерация нового токена
  const generateNewToken = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const secret = Math.random().toString(36).substring(2, 15);
    return `${timestamp}_${random}_${secret}`;
  };

  // Генерация токена для забытой вещи
  const generateLostToken = (ticketNumber) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `LOST_${ticketNumber}_${timestamp}_${random}`;
  };

  // Основные действия
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

  // НОВОЕ: Переместить в забытые (освобождаем основной номерок)
  const handleMoveToLost = async () => {
    setLoading(true);
    setMessage("");

    try {
      // 1. Создаем запись в отдельной таблице "lostItems"
      const lostItem = {
        originalTicketNumber: ticket.number,
        originalZone: ticket.zone,
        lostAt: new Date().toISOString(),
        movedBy: "admin",
        description: "Забытая курточка",
        status: "waiting", // waiting, returned
        uniqueToken: generateLostToken(ticket.number),
        clientId: ticket.clientId,
        notes: "",
      };

      // Сохраняем в отдельную папку lostItems
      const lostRef = ref(database, `lostItems/${ticket.number}_${Date.now()}`);
      await set(lostRef, lostItem);

      // 2. Освобождаем основной номерок (генерируем новый токен)
      const newToken = generateNewToken();
      const ticketUpdates = {
        status: "completed", // Освобождаем номерок
        completedAt: new Date().toISOString(),
        movedToLost: true,
        movedToLostAt: new Date().toISOString(),
        oldToken: ticket.uniqueToken,
        uniqueToken: newToken,
        note: "Курточка перемещена в забытые",
      };

      await update(ref(database, `tickets/${ticket.number}`), ticketUpdates);

      setMessage("📦 Курточка перемещена в забытые. Номерок освобожден!");

      setTimeout(() => {
        onUpdate();
        onClose();
      }, 2000);
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
      free: { text: "Свободен", class: "status-free", icon: "⬜" },
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

          {ticket.movedToLost && (
            <div className="info-row lost-note">
              <span className="info-label">📦 Перемещен в забытые:</span>
              <span className="info-value">
                {new Date(ticket.movedToLostAt).toLocaleString()}
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

        {/* Основные кнопки */}
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
            <>
              <button
                className="action-btn return-btn"
                onClick={handleReturn}
                disabled={loading}
              >
                {loading ? "⏳" : "🎯"} Выдать курточку
              </button>

              {/* НОВОЕ: Кнопка для забытой курточки */}
              <button
                className="action-btn lost-btn"
                onClick={handleMoveToLost}
                disabled={loading}
              >
                {loading ? "⏳" : "📦"} Клиент забыл - в хранилище
              </button>
            </>
          )}

          <button
            className="action-btn manual-btn"
            onClick={() => setShowManualControl(!showManualControl)}
            disabled={loading}
          >
            {showManualControl ? "▲" : "▼"} Ручное управление
          </button>
        </div>

        {/* Информация о забытых */}
        {ticket.status === "issued" && (
          <div className="lost-info-box">
            <p>🔔 Если клиент забыл курточку:</p>
            <ul>
              <li>Нажмите "Клиент забыл - в хранилище"</li>
              <li>Номерок освободится для других</li>
              <li>Курточка уйдет в отдельное хранилище</li>
              <li>Клиент получит специальный QR-код</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetails;
