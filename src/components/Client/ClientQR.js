// import React, { useState, useEffect } from "react";
// import { ref, set, get, onValue } from "firebase/database";
// import { database } from "../../firebase/config";
// import { QRCodeSVG } from "qrcode.react";
// import "./ClientQR.css";

// const ClientQR = () => {
//   const [ticket, setTicket] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [isLost, setIsLost] = useState(false);
//   const [showLostMessage, setShowLostMessage] = useState(false);

//   const zones = [
//     { name: "Нижний ряд", start: 1, end: 100, priority: 1 },
//     { name: "Средний ряд", start: 200, end: 300, priority: 2 },
//     { name: "Верхний ряд", start: 400, end: 500, priority: 3 },
//   ];

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

//       const uniqueToken = generateUniqueToken();
//       const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

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

//       localStorage.setItem(
//         "currentTicket",
//         JSON.stringify({
//           number: selectedNumber,
//           uniqueToken: uniqueToken,
//           expiresAt: expiresAt,
//           type: "normal",
//         })
//       );

//       setTicket(ticketData);
//       setIsLost(false);
//       setShowLostMessage(false);
//     } catch (err) {
//       console.error("Ошибка:", err);
//       setError("Ошибка при получении номерка");
//     } finally {
//       setLoading(false);
//     }
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

//   // Слушаем изменения в реальном времени
//   useEffect(() => {
//     const savedTicket = localStorage.getItem("currentTicket");
//     if (savedTicket) {
//       try {
//         const parsed = JSON.parse(savedTicket);

//         // Проверяем, не является ли это LOST токеном
//         if (parsed.uniqueToken && parsed.uniqueToken.startsWith("LOST_")) {
//           // Слушаем изменения в lostItems
//           const lostRef = ref(database, "lostItems");
//           const unsubscribe = onValue(lostRef, (snapshot) => {
//             const lostData = snapshot.val() || {};

//             // Ищем нашу запись
//             const foundLost = Object.values(lostData).find(
//               (item) => item.uniqueToken === parsed.uniqueToken
//             );

//             if (foundLost) {
//               // Запись еще существует - показываем уведомление
//               setTicket({
//                 number: foundLost.originalTicketNumber,
//                 zone: foundLost.originalZone,
//                 uniqueToken: foundLost.uniqueToken,
//                 isLost: true,
//               });
//               setIsLost(true);
//               setShowLostMessage(true);
//             } else {
//               // Запись удалена - курточку выдали, убираем уведомление
//               console.log("Забытая курточка выдана, убираем уведомление");
//               setIsLost(false);
//               setShowLostMessage(false);
//               // Можно показать обычный экран или очистить
//               setTicket(null);
//               localStorage.removeItem("currentTicket");
//             }
//           });

//           return () => unsubscribe();
//         } else {
//           // Обычный токен - слушаем изменения в tickets
//           const ticketRef = ref(database, `tickets/${parsed.number}`);
//           const unsubscribe = onValue(ticketRef, (snapshot) => {
//             const ticketData = snapshot.val();

//             if (ticketData) {
//               // Проверяем, не стала ли курточка забытой
//               if (ticketData.isLost && ticketData.lostToken) {
//                 // Меняем токен в localStorage на lostToken
//                 localStorage.setItem(
//                   "currentTicket",
//                   JSON.stringify({
//                     number: parsed.number,
//                     uniqueToken: ticketData.lostToken,
//                     expiresAt: parsed.expiresAt,
//                     type: "lost",
//                   })
//                 );

//                 // Обновляем отображение
//                 setTicket({
//                   number: parsed.number,
//                   zone: ticketData.zone,
//                   uniqueToken: ticketData.lostToken,
//                   isLost: true,
//                 });
//                 setIsLost(true);
//                 setShowLostMessage(true);
//               } else if (
//                 ticketData.status === "pending" ||
//                 ticketData.status === "issued"
//               ) {
//                 // Обычное состояние
//                 setTicket({
//                   number: parsed.number,
//                   zone: ticketData.zone,
//                   uniqueToken: ticketData.uniqueToken,
//                   status: ticketData.status,
//                 });
//                 setIsLost(false);
//                 setShowLostMessage(false);
//               }
//             }
//           });

//           return () => unsubscribe();
//         }
//       } catch (e) {
//         console.error("Ошибка:", e);
//       }
//     }
//   }, []);

//   // Если нет билета, показываем кнопку получения
//   if (!ticket) {
//     return (
//       <div className="client-container">
//         {/* Фоновое видео */}
//         <video autoPlay loop muted playsInline className="background-video">
//           <source src="/bg.mp4" type="video/mp4" />
//           Ваш браузер не поддерживает видео.
//         </video>
//         <div className="video-overlay"></div>
//         <img src="/logotit.png" alt="title" className="card-title-image" />
//         <div className="client-card">
//           <h1>Garderoba LaPose</h1>
//           <div>
//             <p
//               style={{
//                 fontSize: "16px",
//                 lineHeight: 1.5,
//                 textAlign: "center",
//                 color: "#727272",
//               }}
//             >
//               Naciśnij przycisk, aby otrzymać numerek oraz{" "}
//               <strong>kod QR.</strong> Szatnia jest <strong>płatna</strong> —
//               podejdź do pracownika szatni, <strong>dokonaj płatności</strong>,
//               a następnie pozwól zeskanować swój <strong>kod QR</strong> w celu
//               <strong>potwierdzenia.</strong>
//             </p>
//             {error && <div className="error-message">⚠️ {error}</div>}
//             <button onClick={generateTicket} disabled={loading}>
//               {loading ? "Trwa pobieranie..." : "Otrzymaj numer"}
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Если есть билет, показываем его
//   return (
//     <div className="client-container">
//       {/* Фоновое видео */}
//       <video autoPlay loop muted playsInline className="background-video">
//         <source src="/bg.mp4" type="video/mp4" />
//         Ваш браузер не поддерживает видео.
//       </video>
//       <div className="video-overlay"></div>
//       {/* <img src="/logotit.png" alt="title" className="card-title-image" /> */}
//       <div className="client-card">
//         <div>
//           <div>
//             <span>
//               {isLost && showLostMessage ? (
//                 <>
//                   <i
//                     className="fa-solid fa-bell"
//                     style={{ color: "rgb(242, 242, 242)" }}
//                   ></i>{" "}
//                   Zagubiona kurteczka
//                 </>
//               ) : (
//                 <>
//                   <i
//                     className="fa-solid fa-check-double"
//                     style={{ color: "rgb(242, 242, 242)", fontSize: "20px" }}
//                   ></i>{" "}
//                   <span className="spantextstat">Aktywny</span>
//                 </>
//               )}
//             </span>
//             <h1>Garderoba LaPose</h1>
//           </div>
//           <h2>#{ticket.number}</h2>
//           <p>{ticket.zone}</p>
//           {isLost && showLostMessage && (
//             <div className="lost-message">
//               <p>🔔 Вы забыли курточку!</p>
//               <p>Приходите в любое открытие и покажите этот QR-код</p>
//             </div>
//           )}
//           <div className="qr-container">
//             <QRCodeSVG value={ticket.uniqueToken} size={250} level="H" />
//           </div>
//           {isLost && showLostMessage ? (
//             <div className="info-message">
//               <p>📋 Сохраните этот код</p>
//               <p>Он действителен для получения забытой курточки</p>
//             </div>
//           ) : (
//             <div className="warning-message">
//               <p>⚠️ Не показывайте код никому, кроме работника</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ClientQR;
import React, { useState, useEffect } from "react";
import { ref, set, get, onValue } from "firebase/database";
import { database } from "../../firebase/config";
import { QRCodeSVG } from "qrcode.react";
import "./ClientQR.css";

const ClientQR = () => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLost, setIsLost] = useState(false);
  const [showLostMessage, setShowLostMessage] = useState(false);
  const [ticketStatus, setTicketStatus] = useState("pending");
  const [showThankYou, setShowThankYou] = useState(false);

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
    setShowThankYou(false);

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
      setTicketStatus("pending");
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

  const clearTicket = () => {
    setTicket(null);
    setTicketStatus("pending");
    setIsLost(false);
    setShowLostMessage(false);
    setShowThankYou(false);
    localStorage.removeItem("currentTicket");
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
                status: "lost",
              });
              setIsLost(true);
              setShowLostMessage(true);
              setTicketStatus("lost");
              setShowThankYou(false);
            } else {
              // Запись удалена - курточку выдали, показываем благодарность и очищаем
              console.log("Забытая курточка выдана");
              setShowThankYou(true);
              // Через 3 секунды очищаем для нового номера
              setTimeout(() => {
                clearTicket();
              }, 3000);
            }
          });

          return () => unsubscribe();
        } else {
          // Обычный токен - слушаем изменения в tickets
          const ticketRef = ref(database, `tickets/${parsed.number}`);
          const unsubscribe = onValue(ticketRef, (snapshot) => {
            const ticketData = snapshot.val();

            if (ticketData) {
              // Обновляем статус мгновенно
              setTicketStatus(ticketData.status || "pending");

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
                  status: "lost",
                });
                setIsLost(true);
                setShowLostMessage(true);
                setTicketStatus("lost");
                setShowThankYou(false);
              }
              // Проверяем, не завершен ли билет (курточку выдали)
              else if (ticketData.status === "completed") {
                setTicket({
                  number: parsed.number,
                  zone: ticketData.zone,
                  uniqueToken: ticketData.uniqueToken,
                  status: "completed",
                });
                setIsLost(false);
                setShowLostMessage(false);
                setShowThankYou(true);

                // Через 3 секунды очищаем для нового номера
                setTimeout(() => {
                  clearTicket();
                }, 3000);
              } else {
                // Обычное состояние
                setTicket({
                  number: parsed.number,
                  zone: ticketData.zone,
                  uniqueToken: ticketData.uniqueToken,
                  status: ticketData.status,
                });
                setIsLost(false);
                setShowLostMessage(false);
                setShowThankYou(false);
              }
            } else {
              // Если билет удален из базы
              console.log("Билет не найден в базе");
              clearTicket();
            }
          });

          return () => unsubscribe();
        }
      } catch (e) {
        console.error("Ошибка:", e);
      }
    }
  }, []);

  // Функция для получения текста статуса
  const getStatusText = () => {
    if (showThankYou) {
      return (
        <>
          <i
            className="fa-solid fa-check"
            style={{ color: "#4CAF50", fontSize: "20px" }}
          ></i>{" "}
          <span className="spantextstat" style={{ color: "#4CAF50" }}>
            Dziękujemy!
          </span>
        </>
      );
    }

    if (isLost && showLostMessage) {
      return (
        <>
          <i
            className="fa-solid fa-bell"
            style={{ color: "rgb(168, 0, 0)" }}
          ></i>{" "}
          <span className="zagubtit">Zagubiona kurteczka</span>
        </>
      );
    }

    switch (ticketStatus) {
      case "issued":
      case "active":
        return (
          <>
            <i
              className="fa-solid fa-check-double"
              style={{ color: "#4CAF50", fontSize: "20px" }}
            ></i>{" "}
            <span className="spantextstat" style={{ color: "#4CAF50" }}>
              Aktywny
            </span>
          </>
        );
      case "pending":
        return (
          <>
            <i
              className="fa-solid fa-clock"
              style={{ color: "#FFA500", fontSize: "20px" }}
            ></i>{" "}
            <span className="spantextstat" style={{ color: "#FFA500" }}>
              Oczekuje na potwierdzenie
            </span>
          </>
        );
      case "completed":
        return (
          <>
            <i
              className="fa-solid fa-check"
              style={{ color: "#808080", fontSize: "20px" }}
            ></i>{" "}
            <span className="spantextstat" style={{ color: "#808080" }}>
              Zakończony
            </span>
          </>
        );
      default:
        return (
          <>
            <i
              className="fa-solid fa-clock"
              style={{ color: "#FFA500", fontSize: "20px" }}
            ></i>{" "}
            <span className="spantextstat" style={{ color: "#FFA500" }}>
              Oczekuje na potwierdzenie
            </span>
          </>
        );
    }
  };

  // Если нет билета или показываем благодарность перед очисткой
  if (!ticket) {
    return (
      <div className="client-container">
        <video autoPlay loop muted playsInline className="background-video">
          <source src="/bg.mp4" type="video/mp4" />
          Ваш браузер не поддерживает видео.
        </video>
        <div className="video-overlay"></div>
        <img src="/logotit.png" alt="title" className="card-title-image" />
        <div className="client-card">
          <h1>Garderoba LaPose</h1>
          <div>
            <p
              style={{
                fontSize: "16px",
                lineHeight: 1.5,
                textAlign: "center",
                color: "#727272",
              }}
            >
              Naciśnij przycisk, aby otrzymać numerek oraz{" "}
              <strong>kod QR.</strong> Szatnia jest <strong>płatna</strong> —
              podejdź do pracownika szatni, <strong>dokonaj płatności</strong>,
              a następnie pozwól zeskanować swój <strong>kod QR</strong> w celu
              <strong>potwierdzenia.</strong>
            </p>
            {error && <div className="error-message">⚠️ {error}</div>}
            <button onClick={generateTicket} disabled={loading}>
              {loading ? "Trwa pobieranie..." : "Otrzymaj numer"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Если есть билет, показываем его
  return (
    <div className="client-container">
      <video autoPlay loop muted playsInline className="background-video">
        <source src="/bg.mp4" type="video/mp4" />
        Ваш браузер не поддерживает видео.
      </video>
      <div className="video-overlay"></div>
      <img src="/logotit.png" alt="title" className="card-title-image" />
      <div className="client-card">
        <div>
          <div>
            <span>{getStatusText()}</span>
            <h1>Garderoba LaPose</h1>
          </div>

          {!showThankYou ? (
            <>
              <h2 className="ticket-number">{ticket.number}</h2>
              {/* <p>{ticket.zone}</p> */}

              {/* Сообщение о статусе ожидания */}
              {ticketStatus === "pending" && !isLost && (
                <div className="pending-message">
                  <p>
                    <i
                      className="fa-solid fa-hourglass-start"
                      style={{
                        color: "rgb(104, 104, 104)",
                        paddingRight: "5px",
                      }}
                    ></i>{" "}
                    Oczekiwanie na potwierdzenie przez pracownika
                  </p>
                  <p>
                    <strong>Podejdź do szatni i pokaż kod pracownikowi</strong>
                  </p>
                </div>
              )}

              {/* Сообщение о забытой курточке */}
              {isLost && showLostMessage && (
                <div className="lost-message">
                  <p>
                    <i
                      className="fa-solid fa-bell"
                      style={{
                        color: "rgb(166, 0, 0)",
                        paddingRight: "5px",
                      }}
                    ></i>{" "}
                    Zapomniałeś kurtki!
                  </p>
                  <p>Przyjdź w godzinach otwarcia i pokaż ten kod QR</p>
                </div>
              )}

              {/* Сообщение об активном статусе */}
              {ticketStatus === "active" && !isLost && (
                <div className="active-message">
                  <p>✓ Potwierdzono - możesz zostawić kurtkę</p>
                </div>
              )}

              {/* QR код */}
              <div className="qr-container">
                <QRCodeSVG value={ticket.uniqueToken} size={250} level="H" />
              </div>

              {/* Информационные сообщения внизу */}
              {isLost && showLostMessage ? (
                <div className="info-messageqr">
                  <p> Zachowaj ten kod</p>
                  <p>Ważny do odbioru zapomnianej kurtki</p>
                </div>
              ) : (
                <div className="warning-message">
                  <p>
                    <i
                      className="fa-solid fa-bullhorn"
                      style={{
                        color: "rgb(255, 0, 0)",
                        marginRight: "5px",
                      }}
                    ></i>{" "}
                    Nie pokazuj kodu nikomu poza pracownikiem
                  </p>
                </div>
              )}
            </>
          ) : (
            // Сообщение благодарности после выдачи курточки
            <div className="thank-you-message">
              <i
                className="fa-solid fa-circle-check"
                style={{
                  fontSize: "80px",
                  color: "#4CAF50",
                  marginBottom: "20px",
                }}
              ></i>
              <h2 style={{ color: "#4CAF50", marginBottom: "10px" }}>
                Dziękujemy!
              </h2>
              <p style={{ fontSize: "18px", color: "#666" }}>
                Kurtka została wydana
              </p>
              <p style={{ fontSize: "14px", color: "#999", marginTop: "20px" }}>
                Za chwilę będzie można otrzymać nowy numerek
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientQR;
// v1
