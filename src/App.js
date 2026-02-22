import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import ClientQR from "./components/Client/ClientQR";
import AdminPanel from "./components/Admin/AdminPanel";

function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Гардероб Шатни
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Клиент
          </Button>
          <Button color="inherit" component={Link} to="/admin">
            Администратор
          </Button>
        </Toolbar>
      </AppBar>
      <Container>
        <Routes>
          <Route path="/" element={<ClientQR />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
