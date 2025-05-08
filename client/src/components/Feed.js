import React, { useState, useRef, useEffect } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  List,
  ListItemText,
  Typography,
  IconButton,
  Box,
  Fade,
  Autocomplete,
  Popper,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Send as SendIcon,
  FileDownload as FileDownloadIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useTheme } from "@mui/material/styles";

function Feed({ posts, onNewPost }) {
  const theme = useTheme();
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [rows, setRows] = useState(1);
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textFieldRef = useRef(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    // Load contacts when component mounts
    fetch("/api/contacts")
      .then((res) => res.json())
      .then((data) => setContacts(data))
      .catch((err) => console.error("Error loading contacts:", err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onNewPost(content);
    setContent("");
    setIsExpanded(false);
    setRows(1);
  };

  const handleKeyDown = (e) => {
    // If Enter is pressed without Option/Alt or Shift
    if (e.key === "Enter" && !e.altKey && !e.shiftKey) {
      e.preventDefault(); // Prevent default newline
      handleSubmit(e);
    } else if (e.key === "Enter" && (e.altKey || e.shiftKey)) {
      // Count the number of lines after adding the newline
      const newContent = content + "\n";
      const lineCount = newContent.split("\n").length;
      setRows(Math.max(rows, lineCount));
    }
  };

  const handleChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Update rows based on content
    const lineCount = newContent.split("\n").length;
    setRows(Math.max(1, lineCount));

    // Get cursor position
    const cursorPos = e.target.selectionStart;
    setCursorPosition(cursorPos);

    // Check for @ symbol before cursor
    const textBeforeCursor = newContent.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const searchText = textBeforeCursor.substring(lastAtIndex + 1).trim();
      if (searchText) {
        console.log("Searching for contact:", searchText);
        // Search contacts
        fetch(`/api/contacts/search?q=${encodeURIComponent(searchText)}`)
          .then((res) => res.json())
          .then((data) => {
            console.log("Contact search results:", data);
            setSuggestions(data);
            setShowSuggestions(true);
          })
          .catch((err) => {
            console.error("Error searching contacts:", err);
            setShowSuggestions(false);
          });
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (contact, alias = null) => {
    const textBeforeCursor = content.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    const textAfterCursor = content.substring(cursorPosition);

    // Use first name as default alias if no alias is provided
    const defaultAlias = contact.firstName || contact.fullName.split(" ")[0];
    const tag = `[[@/${contact.fullName}|${alias || defaultAlias}]]`;

    const newContent =
      textBeforeCursor.substring(0, lastAtIndex) + tag + textAfterCursor;
    setContent(newContent);
    setShowSuggestions(false);
  };

  const handleExport = async () => {
    try {
      // If no dates are selected, use yesterday's date
      if (!startDate && !endDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const startDate = yesterday.toISOString().split("T")[0];
        const response = await fetch(`/api/export?start=${startDate}`);
        const { content } = await response.json();

        // Create a temporary textarea element
        const textarea = document.createElement("textarea");
        textarea.value = content;
        textarea.style.position = "fixed"; // Prevent scrolling to bottom
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        try {
          // Try the modern clipboard API first
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(content);
          } else {
            // Fallback for Safari and non-HTTPS contexts
            document.execCommand("copy");
          }
          setSnackbarMessage("Copied to clipboard and opening Obsidian...");
          setSnackbarSeverity("success");
          window.location.href =
            "obsidian://daily?vault=🧠&append=true&clipboard=true";
        } catch (clipboardError) {
          setSnackbarMessage(
            "Please copy the content manually and paste it into Obsidian"
          );
          setSnackbarSeverity("warning");
          alert(content);
        } finally {
          // Clean up
          document.body.removeChild(textarea);
        }
      } else {
        // Use selected date range
        let url = "/api/export";
        const params = new URLSearchParams();

        if (startDate) {
          params.append("start", startDate);
        }
        if (endDate) {
          params.append("end", endDate);
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await fetch(url);
        const { content } = await response.json();

        // Create a temporary textarea element
        const textarea = document.createElement("textarea");
        textarea.value = content;
        textarea.style.position = "fixed"; // Prevent scrolling to bottom
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        try {
          // Try the modern clipboard API first
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(content);
          } else {
            // Fallback for Safari and non-HTTPS contexts
            document.execCommand("copy");
          }
          setSnackbarMessage("Copied to clipboard and opening Obsidian...");
          setSnackbarSeverity("success");
          window.location.href =
            "obsidian://daily?vault=🧠&append=true&clipboard=true";
        } catch (clipboardError) {
          setSnackbarMessage(
            "Please copy the content manually and paste it into Obsidian"
          );
          setSnackbarSeverity("warning");
          alert(content);
        } finally {
          // Clean up
          document.body.removeChild(textarea);
        }
      }

      setShowSnackbar(true);
      setShowDatePicker(false);
    } catch (error) {
      console.error("Error exporting posts:", error);
      setSnackbarMessage("Error exporting posts");
      setSnackbarSeverity("error");
      setShowSnackbar(true);
    }
  };

  const processContent = (content) => {
    const parts = content.split(/(\[\[.*?\]\])/g);
    return parts.map((part, index) => {
      if (part.startsWith("[[") && part.endsWith("]]")) {
        // Extract the name from the format [[@/Name|Alias]] or [[@/Name]]
        const match = part.match(/\[\[@\/([^|]+)(?:\|([^\]]+))?\]\]/);
        if (match) {
          const fullName = match[1];
          const alias = match[2] || fullName;
          const obsidianUri = `obsidian://open?vault=🧠&file=%40%2F${encodeURIComponent(
            fullName
          )}`;
          return (
            <span
              key={index}
              style={{
                color: "#2e7d32",
                cursor: "pointer",
                textDecoration: "underline",
              }}
              onClick={() => window.open(obsidianUri, "_blank")}
            >
              {alias}
            </span>
          );
        }
      }
      return part;
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow:
              theme.palette.mode === "light"
                ? "0 8px 16px rgba(0,0,0,0.1)"
                : "0 8px 16px rgba(0,0,0,0.3)",
          },
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              background:
                theme.palette.mode === "light"
                  ? "linear-gradient(45deg, #2e7d32 30%, #4caf50 90%)"
                  : "linear-gradient(45deg, #4caf50 30%, #81c784 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Murmurs
          </Typography>
          <Box>
            <Tooltip title="Export yesterday's posts">
              <IconButton
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  handleExport();
                }}
                sx={{
                  color: theme.palette.primary.main,
                  "&:hover": {
                    transform: "scale(1.1)",
                    transition: "transform 0.2s ease-in-out",
                    backgroundColor:
                      theme.palette.mode === "light"
                        ? "rgba(46, 125, 50, 0.1)"
                        : "rgba(76, 175, 80, 0.1)",
                  },
                }}
              >
                <FileDownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export custom date range">
              <IconButton
                onClick={() => setShowDatePicker(true)}
                sx={{
                  color: theme.palette.primary.main,
                  "&:hover": {
                    transform: "scale(1.1)",
                    transition: "transform 0.2s ease-in-out",
                    backgroundColor:
                      theme.palette.mode === "light"
                        ? "rgba(46, 125, 50, 0.1)"
                        : "rgba(76, 175, 80, 0.1)",
                  },
                }}
              >
                <AccessTimeIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={rows}
            variant="outlined"
            placeholder="What's going on?"
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsExpanded(true)}
            ref={textFieldRef}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                transition: "all 0.3s ease",
                backgroundColor: theme.palette.background.paper,
                "&:hover": {
                  "& > fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                },
                "&.Mui-focused": {
                  "& > fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                },
              },
            }}
          />

          {showSuggestions && suggestions.length > 0 && (
            <Paper
              elevation={3}
              sx={{
                position: "absolute",
                zIndex: 1,
                mt: -2,
                maxHeight: 200,
                overflow: "auto",
                width: textFieldRef.current?.offsetWidth,
              }}
            >
              <List>
                {suggestions.map((contact, index) => (
                  <React.Fragment key={index}>
                    <ListItemText
                      primary={contact.fullName}
                      onClick={() => handleSuggestionSelect(contact)}
                      sx={{
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "rgba(46, 125, 50, 0.1)",
                        },
                        p: 1,
                      }}
                    />
                    {contact.aliases?.map((alias, aliasIndex) => (
                      <ListItemText
                        key={aliasIndex}
                        primary={`${contact.fullName} (${alias})`}
                        onClick={() => handleSuggestionSelect(contact, alias)}
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            backgroundColor: "rgba(46, 125, 50, 0.1)",
                          },
                          p: 1,
                          pl: 4,
                        }}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          )}

          <Button
            type="submit"
            variant="contained"
            endIcon={<SendIcon />}
            disabled={!content.trim()}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 4,
              py: 1,
              background:
                theme.palette.mode === "light"
                  ? "linear-gradient(45deg, #2e7d32 30%, #4caf50 90%)"
                  : "linear-gradient(45deg, #4caf50 30%, #81c784 90%)",
              "&:hover": {
                background:
                  theme.palette.mode === "light"
                    ? "linear-gradient(45deg, #1b5e20 30%, #388e3c 90%)"
                    : "linear-gradient(45deg, #388e3c 30%, #66bb6a 90%)",
              },
            }}
          >
            Post
          </Button>
        </form>
      </Paper>

      <List sx={{ width: "100%" }}>
        {posts.map((post, index) => (
          <Fade in={true} timeout={500} key={index}>
            <Paper
              elevation={2}
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow:
                    theme.palette.mode === "light"
                      ? "0 4px 8px rgba(0,0,0,0.1)"
                      : "0 4px 8px rgba(0,0,0,0.3)",
                },
              }}
            >
              <ListItemText
                primary={
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: "pre-wrap",
                      mb: 1,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {processContent(post.content)}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {format(new Date(post.created_at), "MMM d, yyyy h:mm a")}
                  </Typography>
                }
              />
            </Paper>
          </Fade>
        ))}
      </List>

      <Dialog
        open={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <DialogTitle sx={{ color: theme.palette.text.primary }}>
          Select Date Range
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{
                "& .MuiInputLabel-root": {
                  color: theme.palette.text.secondary,
                },
                "& .MuiInputBase-input": {
                  color: theme.palette.text.primary,
                },
              }}
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{
                "& .MuiInputLabel-root": {
                  color: theme.palette.text.secondary,
                },
                "& .MuiInputBase-input": {
                  color: theme.palette.text.primary,
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowDatePicker(false)}
            sx={{ color: theme.palette.text.secondary }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            variant="contained"
            sx={{
              background:
                theme.palette.mode === "light"
                  ? "linear-gradient(45deg, #2e7d32 30%, #4caf50 90%)"
                  : "linear-gradient(45deg, #4caf50 30%, #81c784 90%)",
              "&:hover": {
                background:
                  theme.palette.mode === "light"
                    ? "linear-gradient(45deg, #1b5e20 30%, #388e3c 90%)"
                    : "linear-gradient(45deg, #388e3c 30%, #66bb6a 90%)",
              },
            }}
          >
            Export
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={5000}
        onClose={() => setShowSnackbar(false)}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Feed;
