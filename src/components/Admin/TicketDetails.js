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

  // Генерация токена для забытой вещи
  const generateLostToken = (ticketNumber) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `LOST_${ticketNumber}_${timestamp}_${random}`;
  };

  // Принять курточку
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

  // Выдать курточку
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

  // Отменить
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

  // НОВОЕ: Отметить что клиент должен забрать (забытая курточка)
  const handleMarkForPickup = async () => {
    setLoading(true);
    setMessage("");

    try {
      // 1. Создаем запись в отдельной таблице "lostItems"
      const lostToken = generateLostToken(ticket.number);
      const lostItem = {
        originalTicketNumber: ticket.number,
        originalZone: ticket.zone,
        lostAt: new Date().toISOString(),
        movedBy: "admin",
        description: "Курточка ожидает возврата",
        status: "waiting",
        uniqueToken: lostToken,
        clientId: ticket.clientId,
        notes: "Клиент должен забрать в следующее открытие",
      };

      // Сохраняем в отдельную папку lostItems
      const lostRef = ref(database, `lostItems/${ticket.number}_${Date.now()}`);
      await set(lostRef, lostItem);

      // 2. Освобождаем основной номерок
      const newToken = generateNewToken();
      const ticketUpdates = {
        status: "completed",
        completedAt: new Date().toISOString(),
        movedToLost: true,
        movedToLostAt: new Date().toISOString(),
        oldToken: ticket.uniqueToken,
        uniqueToken: newToken,
        note: "Курточка перемещена в ожидание возврата",
      };

      await update(ref(database, `tickets/${ticket.number}`), ticketUpdates);

      setMessage("📦 Клиент отмечен для возврата. Номерок освобожден!");

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

              {/* НОВАЯ КНОПКА: Клиент должен забрать */}
              <button
                className="action-btn pickup-btn"
                onClick={handleMarkForPickup}
                disabled={loading}
              >
                {loading ? "⏳" : "📋"} Клиент должен забрать
              </button>
            </>
          )}
        </div>

        {/* Пояснение для кнопки */}
        {ticket.status === "issued" && (
          <div className="pickup-info">
            <p>
              🔔 <strong>Клиент должен забрать</strong> - использовать если:
            </p>
            <ul>
              <li>Клиент ушел и не забрал курточку</li>
              <li>Нужно освободить номерок для других</li>
              <li>Курточка перемещается в специальное хранение</li>
            </ul>
            <p className="note">
              Клиент получит специальный QR-код для возврата
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetails;
