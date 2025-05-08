import React, { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
} from "@mui/material";

function Login({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple password check - you should use a more secure method in production
    if (password === "murmur") {
      localStorage.setItem("isAuthenticated", "true");
      onLogin();
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          background: "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              background: "linear-gradient(45deg, #2e7d32 30%, #4caf50 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Murmur
          </Typography>

          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <TextField
              fullWidth
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!error}
              helperText={error}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover": {
                    "& > fieldset": {
                      borderColor: "#2e7d32",
                    },
                  },
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                py: 1,
                background: "linear-gradient(45deg, #2e7d32 30%, #4caf50 90%)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #1b5e20 30%, #388e3c 90%)",
                },
              }}
            >
              Enter
            </Button>
          </form>
        </Box>
      </Paper>
    </Container>
  );
}

export default Login;
