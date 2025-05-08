import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Feed from "./components/Feed";
import { registerServiceWorker } from "./serviceWorker";
import Login from "./components/Login";
import IconButton from "@mui/material/IconButton";
import { Brightness4, Brightness7 } from "@mui/icons-material";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [posts, setPosts] = useState([]);
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem("themeMode");
    if (savedMode) return savedMode;

    // Check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      if (!localStorage.getItem("themeMode")) {
        setMode(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "light" ? "#2e7d32" : "#4caf50",
      },
      secondary: {
        main: mode === "light" ? "#1b5e20" : "#388e3c",
      },
      background: {
        default: mode === "light" ? "#f5f5f5" : "#121212",
        paper: mode === "light" ? "#ffffff" : "#1e1e1e",
      },
      text: {
        primary:
          mode === "light"
            ? "rgba(0, 0, 0, 0.87)"
            : "rgba(255, 255, 255, 0.87)",
        secondary:
          mode === "light" ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.6)",
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
    },
  });

  const toggleColorMode = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("themeMode", newMode);
  };

  useEffect(() => {
    // Register service worker for push notifications
    registerServiceWorker();

    // Check if user is already authenticated
    const auth = localStorage.getItem("isAuthenticated");
    if (auth === "true") {
      setIsAuthenticated(true);
    }

    // Load posts
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleNewPost = async (content) => {
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        fetchPosts(); // Refresh posts after adding new one
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <IconButton
          onClick={toggleColorMode}
          sx={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 1000,
            color: mode === "light" ? "#2e7d32" : "#4caf50",
            backgroundColor:
              mode === "light"
                ? "rgba(46, 125, 50, 0.1)"
                : "rgba(76, 175, 80, 0.1)",
            "&:hover": {
              backgroundColor:
                mode === "light"
                  ? "rgba(46, 125, 50, 0.2)"
                  : "rgba(76, 175, 80, 0.2)",
            },
          }}
        >
          {mode === "light" ? <Brightness4 /> : <Brightness7 />}
        </IconButton>
        <Routes>
          <Route
            path="/"
            element={<Feed posts={posts} onNewPost={handleNewPost} />}
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
