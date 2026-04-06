import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaHome, FaArrowRight } from "react-icons/fa";
function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();
  const handleContinue = () => {
    if (selectedRole) {
      navigate("/signup", { state: { role: selectedRole } });
    }
  };
  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
    },
    card: {
      background: "white",
      borderRadius: "1.5rem",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      width: "100%",
      maxWidth: "20rem",
      padding: "1.5rem",
    },
    header: { textAlign: "center", marginBottom: "1.5rem" },
    title: { fontSize: "1.25rem", fontWeight: "bold", color: "#1f2937", marginBottom: "0.5rem" },
    subtitle: { color: "#6b7280", fontSize: "0.875rem" },
    grid: { display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" },
    option: (rol, selected) => ({
      padding: "1.25rem",
      border: `2px ${selected ? "solid" : "solid"} ${selected ? (rol === 1 ? "#3b82f6" : "#10b981") : "#e5e7eb"}`,
      borderRadius: "1rem",
      cursor: "pointer",
      transition: "all 0.3s",
      textAlign: "center",
      background: selected ? (rol === 1 ? "#eff6ff" : "#ecfdf5") : "white",
    }),
    icon: (rol) => ({
      width: "3.5rem",
      height: "3.5rem",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 0.75rem",
      fontSize: "1.5rem",
      background: rol === 1 ? "#dbeafe" : "#d1fae5",
      color: rol === 1 ? "#3b82f6" : "#10b981",
    }),
    optionTitle: { fontSize: "1rem", fontWeight: "600", color: "#1f2937", marginBottom: "0.25rem" },
    optionDesc: { color: "#6b7280", fontSize: "0.75rem" },
    button: (active) => ({
      width: "100%",
      padding: "0.875rem",
      background: active ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#6b7280",
      color: "white",
      border: "none",
      borderRadius: "0.75rem",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: active ? "pointer" : "not-allowed",
      transition: "all 0.3s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
    }),
  };
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>¿Qué tipo de cuenta necesitas?</h1>
          <p style={styles.subtitle}>Selecciona tu rol para continuar</p>
        </div>
        <div style={styles.grid}>
          <div style={styles.option(1, selectedRole === 1)} onClick={() => setSelectedRole(1)}>
            <div style={styles.icon(1)}><FaUser /></div>
            <h3 style={styles.optionTitle}>Soy Inquilino</h3>
            <p style={styles.optionDesc}>Quiero rentar un espacio</p>
          </div>
          <div style={styles.option(2, selectedRole === 2)} onClick={() => setSelectedRole(2)}>
            <div style={styles.icon(2)}><FaHome /></div>
            <h3 style={styles.optionTitle}>Soy Propietario</h3>
            <p style={styles.optionDesc}>Quiero publicar propiedades</p>
          </div>
        </div>
        <button style={styles.button(!!selectedRole)} disabled={!selectedRole} onClick={handleContinue}>
          Continuar <FaArrowRight />
        </button>
      </div>
    </div>
  );
}
export default RoleSelection;