// import React, { useState, useEffect } from "react";
// import { ref, set, get } from "firebase/database";
// import { database } from "../../firebase/config";
// import { QRCodeSVG } from "qrcode.react";
// import "./ClientQR.css";

// const ClientQR = () => {
//   const [ticket, setTicket] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [timeLeft, setTimeLeft] = useState(null);

//   // Конфигурация зон с приоритетами
//   const zones = [
//     { name: "Нижний ряд", start: 1, end: 100, priority: 1 },
//     { name: "Средний ряд", start: 200, end: 300, priority: 2 },
//     { name: "Верхний ряд", start: 400, end: 500, priority: 3 },
//   ];

//   // Генерация уникального токена для QR-кода
//   const generateUniqueToken = () => {
//     const timestamp = Date.now();
//     const random = Math.random().toString(36).substring(2, 15);
//     const secret = Math.random().toString(36).substring(2, 15);
//     return `${timestamp}_${random}_${secret}`;
//   };

//   const generateTicket = async () => {
//     setLoading(true);
//     setError("");

//     try {
//       const sortedZones = [...zones].sort((a, b) => a.priority - b.priority);

//       let selectedNumber = null;
//       let selectedZone = null;

//       for (const zone of sortedZones) {
//         const result = await findFirstAvailableInZone(zone);
//         if (result) {
//           selectedNumber = result;
//           selectedZone = zone;
//           break;
//         }
//       }

//       if (!selectedNumber) {
//         setError("Извините, все номерки заняты!");
//         setLoading(false);
//         return;
//       }

//       // Генерируем уникальный токен
//       const uniqueToken = generateUniqueToken();
//       const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // +24 часа

//       const ticketData = {
//         number: selectedNumber,
//         zone: selectedZone.name,
//         zoneStart: selectedZone.start,
//         zoneEnd: selectedZone.end,
//         status: "pending",
//         createdAt: new Date().toISOString(),
//         clientId: generateClientId(),
//         uniqueToken: uniqueToken,
//         expiresAt: expiresAt,
//         isUsed: false,
//       };

//       await set(ref(database, `tickets/${selectedNumber}`), ticketData);

//       // Сохраняем в localStorage
//       localStorage.setItem(
//         "currentTicket",
//         JSON.stringify({
//           number: selectedNumber,
//           uniqueToken: uniqueToken,
//           expiresAt: expiresAt,
//           createdAt: ticketData.createdAt,
//         })
//       );

//       setTicket(ticketData);
//       startTimer(expiresAt);
//     } catch (err) {
//       console.error("Ошибка:", err);
//       setError("Ошибка при получении номерка");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const startTimer = (expiresAt) => {
//     const timer = setInterval(() => {
//       const now = Date.now();
//       const diff = expiresAt - now;

//       if (diff <= 0) {
//         clearInterval(timer);
//         setTimeLeft("Истек");
//         // Автоматически удаляем просроченный номерок
//         localStorage.removeItem("currentTicket");
//         setTicket(null);
//       } else {
//         const hours = Math.floor(diff / (1000 * 60 * 60));
//         const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//         setTimeLeft(`${hours}ч ${minutes}м`);
//       }
//     }, 60000); // Обновляем каждую минуту

//     return () => clearInterval(timer);
//   };

//   const findFirstAvailableInZone = async (zone) => {
//     for (let i = zone.start; i <= zone.end; i++) {
//       const ticketRef = ref(database, `tickets/${i}`);
//       const snapshot = await get(ticketRef);
//       const ticket = snapshot.val();

//       if (
//         !ticket ||
//         ticket.status === "free" ||
//         ticket.status === "completed" ||
//         ticket.status === "cancelled"
//       ) {
//         return i;
//       }
//     }
//     return null;
//   };

//   const generateClientId = () => {
//     return (
//       "client_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
//     );
//   };

//   const getQRValue = () => {
//     // Включаем уникальный токен в QR-код
//     return `${ticket.uniqueToken}`;
//   };

//   useEffect(() => {
//     const savedTicket = localStorage.getItem("currentTicket");
//     if (savedTicket) {
//       try {
//         const parsed = JSON.parse(savedTicket);

//         // Проверяем, не истек ли срок
//         if (parsed.expiresAt < Date.now()) {
//           localStorage.removeItem("currentTicket");
//           return;
//         }

//         const checkTicket = async () => {
//           const ticketRef = ref(database, `tickets/${parsed.number}`);
//           const snapshot = await get(ticketRef);
//           const ticketData = snapshot.val();

//           if (
//             ticketData &&
//             (ticketData.status === "pending" ||
//               ticketData.status === "issued") &&
//             ticketData.uniqueToken === parsed.uniqueToken &&
//             !ticketData.isUsed
//           ) {
//             setTicket(ticketData);
//             startTimer(parsed.expiresAt);
//           } else {
//             localStorage.removeItem("currentTicket");
//           }
//         };
//         checkTicket();
//       } catch (e) {
//         localStorage.removeItem("currentTicket");
//       }
//     }
//   }, []);

//   return (
//     <div className="client-container">
//       <div className="client-card">
//         <h1 className="client-title">🎩 Гардероб Шатни</h1>

//         {!ticket ? (
//           <div className="client-content">
//             <p className="client-description">
//               Нажмите кнопку, чтобы получить номерок для вашей курточки
//             </p>

//             {error && <div className="client-error">⚠️ {error}</div>}

//             <button
//               className="client-button"
//               onClick={generateTicket}
//               disabled={loading}
//             >
//               {loading ? "Получение..." : "Получить номерок"}
//             </button>

//             <div className="client-info">
//               <p>Система автоматически выберет свободный номерок:</p>
//               <ul>
//                 <li>1. Нижний ряд (1-100)</li>
//                 <li>2. Средний ряд (200-300)</li>
//                 <li>3. Верхний ряд (400-500)</li>
//               </ul>
//             </div>
//           </div>
//         ) : (
//           <div className="ticket-container">
//             <div className="ticket-header">
//               <span className="ticket-status">✅ Активен</span>
//               {timeLeft && <span className="ticket-timer">⏳ {timeLeft}</span>}
//             </div>

//             <h2 className="ticket-number">#{ticket.number}</h2>
//             <p className="ticket-zone">{ticket.zone}</p>

//             <div className="qr-container">
//               <QRCodeSVG
//                 value={getQRValue()}
//                 size={250}
//                 level="H"
//                 includeMargin={true}
//               />
//             </div>

//             <div className="ticket-warning">
//               <p>⚠️ Этот QR-код действителен только 24 часа</p>
//               <p>Не показывайте его никому, кроме работника гардероба!</p>
//             </div>

//             <div className="ticket-instructions">
//               <h3>Как пользоваться:</h3>
//               <ol>
//                 <li>Покажите этот код при сдаче курточки</li>
//                 <li>Работник отсканирует и подтвердит приём</li>
//                 <li>Сохраните код до получения курточки обратно</li>
//                 <li>При получении снова покажите этот же код</li>
//               </ol>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ClientQR;
import React, { useState, useEffect } from "react";
import { ref, set, get, onValue, onDisconnect } from "firebase/database";
import { database } from "../../firebase/config";
import { QRCodeSVG } from "qrcode.react";
import "./ClientQR.css";

const ClientQR = () => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLost, setIsLost] = useState(false);
  const [showLostMessage, setShowLostMessage] = useState(false);

  const zones = [
    { name: "Нижний ряд", start: 1, end: 100, priority: 1 },
    { name: "Средний ряд", start: 200, end: 300, priority: 2 },
    { name: "Верхний ряд", start: 400, end: 500, priority: 3 },
  ];

  const generateUniqueToken = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const secret = Math.random().toString(36).substring(2, 15);
    return `${timestamp}_${random}_${secret}`;
  };

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

      const uniqueToken = generateUniqueToken();
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

      const ticketData = {
        number: selectedNumber,
        zone: selectedZone.name,
        zoneStart: selectedZone.start,
        zoneEnd: selectedZone.end,
        status: "pending",
        createdAt: new Date().toISOString(),
        clientId: generateClientId(),
        uniqueToken: uniqueToken,
        expiresAt: expiresAt,
        isUsed: false,
      };

      await set(ref(database, `tickets/${selectedNumber}`), ticketData);

      localStorage.setItem(
        "currentTicket",
        JSON.stringify({
          number: selectedNumber,
          uniqueToken: uniqueToken,
          expiresAt: expiresAt,
          type: "normal",
        })
      );

      setTicket(ticketData);
      setIsLost(false);
      setShowLostMessage(false);
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

  // Слушаем изменения в реальном времени
  useEffect(() => {
    const savedTicket = localStorage.getItem("currentTicket");
    if (savedTicket) {
      try {
        const parsed = JSON.parse(savedTicket);

        // Проверяем, не является ли это LOST токеном
        if (parsed.uniqueToken && parsed.uniqueToken.startsWith("LOST_")) {
          // Слушаем изменения в lostItems
          const lostRef = ref(database, "lostItems");
          const unsubscribe = onValue(lostRef, (snapshot) => {
            const lostData = snapshot.val() || {};

            // Ищем нашу запись
            const foundLost = Object.values(lostData).find(
              (item) => item.uniqueToken === parsed.uniqueToken
            );

            if (foundLost) {
              // Запись еще существует - показываем уведомление
              setTicket({
                number: foundLost.originalTicketNumber,
                zone: foundLost.originalZone,
                uniqueToken: foundLost.uniqueToken,
                isLost: true,
              });
              setIsLost(true);
              setShowLostMessage(true);
            } else {
              // Запись удалена - курточку выдали, убираем уведомление
              console.log("Забытая курточка выдана, убираем уведомление");
              setIsLost(false);
              setShowLostMessage(false);
              // Можно показать обычный экран или очистить
              setTicket(null);
              localStorage.removeItem("currentTicket");
            }
          });

          return () => unsubscribe();
        } else {
          // Обычный токен - слушаем изменения в tickets
          const ticketRef = ref(database, `tickets/${parsed.number}`);
          const unsubscribe = onValue(ticketRef, (snapshot) => {
            const ticketData = snapshot.val();

            if (ticketData) {
              // Проверяем, не стала ли курточка забытой
              if (ticketData.isLost && ticketData.lostToken) {
                // Меняем токен в localStorage на lostToken
                localStorage.setItem(
                  "currentTicket",
                  JSON.stringify({
                    number: parsed.number,
                    uniqueToken: ticketData.lostToken,
                    expiresAt: parsed.expiresAt,
                    type: "lost",
                  })
                );

                // Обновляем отображение
                setTicket({
                  number: parsed.number,
                  zone: ticketData.zone,
                  uniqueToken: ticketData.lostToken,
                  isLost: true,
                });
                setIsLost(true);
                setShowLostMessage(true);
              } else if (
                ticketData.status === "pending" ||
                ticketData.status === "issued"
              ) {
                // Обычное состояние
                setTicket({
                  number: parsed.number,
                  zone: ticketData.zone,
                  uniqueToken: ticketData.uniqueToken,
                  status: ticketData.status,
                });
                setIsLost(false);
                setShowLostMessage(false);
              }
            }
          });

          return () => unsubscribe();
        }
      } catch (e) {
        console.error("Ошибка:", e);
      }
    }
  }, []);

  // Если нет билета, показываем кнопку получения
  if (!ticket) {
    return (
      <div className="client-container">
        <div className="client-card">
          <h1 className="client-title">🎩 Гардероб Шатни</h1>
          <div className="client-content">
            <p className="client-description">
              Нажмите кнопку, чтобы получить номерок
            </p>

            {error && <div className="client-error">⚠️ {error}</div>}

            <button
              className="client-button"
              onClick={generateTicket}
              disabled={loading}
            >
              {loading ? "Получение..." : "Получить номерок"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Если есть билет, показываем его
  return (
    <div className="client-container">
      <div className="client-card">
        <h1 className="client-title">🎩 Гардероб Шатни</h1>

        <div className="ticket-container">
          <div
            className={`ticket-header ${
              isLost && showLostMessage ? "lost-header" : ""
            }`}
          >
            <span
              className={`ticket-status ${
                isLost && showLostMessage ? "lost-status" : ""
              }`}
            >
              {isLost && showLostMessage ? "🔔 Забытая курточка" : "✅ Активен"}
            </span>
          </div>

          <h2 className="ticket-number">#{ticket.number}</h2>
          <p className="ticket-zone">{ticket.zone}</p>

          {isLost && showLostMessage && (
            <div className="lost-message">
              <p>🔔 Вы забыли курточку!</p>
              <p>Приходите в любое открытие и покажите этот QR-код</p>
            </div>
          )}

          <div className="qr-container">
            <QRCodeSVG value={ticket.uniqueToken} size={250} level="H" />
          </div>

          {isLost && showLostMessage ? (
            <div className="lost-instructions">
              <p>📋 Сохраните этот код</p>
              <p>Он действителен для получения забытой курточки</p>
            </div>
          ) : (
            <div className="ticket-warning">
              <p>⚠️ Не показывайте код никому, кроме работника</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientQR;
