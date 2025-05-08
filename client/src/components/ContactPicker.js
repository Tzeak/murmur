import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Search as SearchIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

function ContactPicker({ open, onClose, onSelect }) {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      loadContacts();
    }
  }, [open]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if the Contacts API is available
      if (!navigator.contacts) {
        throw new Error("Contacts API not available");
      }

      // Request permission to access contacts
      const permission = await navigator.permissions.query({
        name: "contacts",
      });
      if (permission.state === "denied") {
        throw new Error("Contact permission denied");
      }

      // Get contacts
      const contacts = await navigator.contacts.select(["name"], {
        multiple: true,
      });

      // Process contacts to get full names and nicknames
      const processedContacts = contacts.map((contact) => ({
        id: contact.id,
        fullName: `${contact.name?.givenName || ""} ${
          contact.name?.familyName || ""
        }`.trim(),
        givenName: contact.name?.givenName || "",
        familyName: contact.name?.familyName || "",
        nickname: contact.name?.nickname || "",
      }));

      setContacts(processedContacts);
    } catch (err) {
      console.error("Error loading contacts:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      contact.fullName.toLowerCase().includes(searchLower) ||
      contact.givenName.toLowerCase().includes(searchLower) ||
      contact.familyName.toLowerCase().includes(searchLower) ||
      (contact.nickname && contact.nickname.toLowerCase().includes(searchLower))
    );
  });

  const handleContactSelect = (contact) => {
    onSelect(contact);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Contact</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {error && (
          <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
        )}

        {loading ? (
          <div>Loading contacts...</div>
        ) : (
          <List>
            {filteredContacts.map((contact) => (
              <ListItem
                key={contact.id}
                button
                onClick={() => handleContactSelect(contact)}
              >
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={contact.fullName}
                  secondary={
                    contact.nickname ? `Nickname: ${contact.nickname}` : null
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ContactPicker;
