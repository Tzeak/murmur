const fs = require("fs");
const path = require("path");

class ContactManager {
  constructor() {
    this.contacts = new Map();
    this.aliases = new Map();
    this.loadContacts();
  }

  loadContacts() {
    try {
      const vcfPath = path.join(__dirname, "../contacts.vcf");
      console.log("Loading contacts from VCF file");

      if (!fs.existsSync(vcfPath)) {
        console.log("No contacts.vcf file found");
        return;
      }

      const vcfContent = fs.readFileSync(vcfPath, "utf8");
      const contactBlocks = vcfContent
        .split("BEGIN:VCARD")
        .filter((block) => block.trim());

      console.log(`Found ${contactBlocks.length} contact blocks`);

      contactBlocks.forEach((block) => {
        const lines = block.split("\n");
        let contact = {
          fullName: "",
          firstName: "",
          lastName: "",
          aliases: new Set(),
        };

        lines.forEach((line) => {
          if (line.startsWith("FN:")) {
            contact.fullName = line.substring(3).trim();
          } else if (line.startsWith("N:")) {
            const nameParts = line.substring(2).split(";");
            contact.lastName = nameParts[0] || "";
            contact.firstName = nameParts[1] || "";
          } else if (line.startsWith("NICKNAME:")) {
            const nicknames = line
              .substring(9)
              .split(",")
              .map((n) => n.trim());
            nicknames.forEach((nickname) => {
              contact.aliases.add(nickname);
              this.aliases.set(nickname.toLowerCase(), contact);
            });
          }
        });

        if (contact.fullName) {
          this.contacts.set(contact.fullName.toLowerCase(), contact);
          if (contact.firstName) {
            this.aliases.set(contact.firstName.toLowerCase(), contact);
          }
          if (contact.lastName) {
            this.aliases.set(contact.lastName.toLowerCase(), contact);
          }
        }
      });

      console.log(
        `Loaded ${this.contacts.size} contacts with ${this.aliases.size} aliases`
      );
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  }

  findContact(query) {
    query = query.toLowerCase();
    console.log(`Searching for contact with query: ${query}`);

    // Try exact match first
    if (this.contacts.has(query)) {
      const contact = this.contacts.get(query);
      return [
        {
          ...contact,
          aliases: Array.from(contact.aliases),
        },
      ];
    }

    // Try alias match
    if (this.aliases.has(query)) {
      const contact = this.aliases.get(query);
      return [
        {
          ...contact,
          aliases: Array.from(contact.aliases),
        },
      ];
    }

    // Try partial matches
    const matches = [];

    // Search in full names
    for (const [name, contact] of this.contacts) {
      if (name.includes(query)) {
        matches.push({
          ...contact,
          aliases: Array.from(contact.aliases),
        });
      }
    }

    // Search in aliases
    for (const [alias, contact] of this.aliases) {
      if (alias.includes(query) && !matches.includes(contact)) {
        matches.push({
          ...contact,
          aliases: Array.from(contact.aliases),
        });
      }
    }

    console.log(`Found ${matches.length} matches`);
    return matches;
  }

  formatTag(contact, alias = null) {
    if (alias) {
      return `[[@/${contact.fullName}|${alias}]]`;
    }
    return `[[@/${contact.fullName}]]`;
  }
}

const contactManager = new ContactManager();
module.exports = contactManager;
