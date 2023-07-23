import {
  Model,
  Column,
  Table,
  Sequelize,
  DataType,
  AllowNull,
  PrimaryKey,
  Default,
  AutoIncrement,
  Index,
  BeforeSave,
} from "sequelize-typescript";
import {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

@Table
export class Contact extends Model<
  InferAttributes<Contact>,
  InferCreationAttributes<Contact>
> {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  declare id: CreationOptional<number>;

  @Column
  @Index("phone_email")
  phoneNumber!: string;

  @Column
  @Index("phone_email")
  email!: string;

  @AllowNull
  @Column(DataType.INTEGER)
  linkedId?: CreationOptional<number | null>;

  @Default("secondary")
  @Column(DataType.ENUM("primary", "secondary"))
  linkPrecedence!: CreationOptional<string>;

  @BeforeSave
  static async setLink(contact: Contact) {
    const { email, phoneNumber } = contact.get({ plain: true });
    const connectedContacts = await Contact.findAll({
      where: Sequelize.or(
        { phoneNumber: phoneNumber || "" },
        { email: email || "" }
      ),
      order: [["createdAt", "ASC"]],
    });
    let isNewEmail = true,
      isNewPhoneNumber = true;
    for (let i = 0; i < connectedContacts.length; i++) {
      if (connectedContacts[i].get("email") === email) {
        isNewEmail = false;
      }
      if (connectedContacts[i].get("phoneNumber") === phoneNumber) {
        isNewPhoneNumber = false;
      }
    }
    // if (isNewEmail || isNewPhoneNumber) {
    const primaryContact =
      connectedContacts.length > 0 ? connectedContacts[0] : null;
    if (!primaryContact) {
      contact.set("linkPrecedence", "primary");
      contact.set("linkedId", null);
    } else {
      contact.set("linkPrecedence", "secondary");
      contact.set("linkedId", primaryContact.get("id"));
    }
    // update all connected contacts linkePrecedence
    const toSecondaryIds = [];
    for (let i = 1; i < connectedContacts.length; i++) {
      if (connectedContacts[i].get("linkPrecedence") !== "secondary") {
        toSecondaryIds.push(connectedContacts[i].get("id"));
      }
    }
    if (toSecondaryIds.length > 0) {
      await Contact.update(
        { linkPrecedence: "secondary" },
        { where: { id: toSecondaryIds } }
      );
    }
    if (primaryContact) {
      await Contact.update(
        { linkPrecedence: "primary" },
        { where: { id: primaryContact?.get("id") } }
      );
    }
    if (!isNewEmail && !isNewPhoneNumber) {
      throw new Error(
        "***Email and phone values already present in different entries***",
        { cause: "DB_CONFLICT_SOFT" }
      );
    }
    // } else {
    //   throw new Error("***Entity already present***", { cause: "DB_CONFLICT" });
    // }
  }

  static async getConsolidatedContact(primaryContactId: number) {
    const connectedContacts = await Contact.findAll({
      where: Sequelize.or(
        { id: primaryContactId },
        { linkedId: primaryContactId }
      ),
      order: [["createdAt", "ASC"]],
    });
    // console.log("***Connected contacts at consolidated***", connectedContacts);
    const emails = [];
    const secondaryContactIds = [];
    const phoneNumbers = [];
    for (let i = 0; i < connectedContacts.length; i++) {
      if (connectedContacts[i].get("linkPrecedence") !== "primary") {
        secondaryContactIds.push(connectedContacts[i].get("id"));
      }
      emails.push(connectedContacts[i].get("email"));
      phoneNumbers.push(connectedContacts[i].get("phoneNumber"));
    }
    const consolidatedContact = {
      primaryContactId: primaryContactId,
      emails: emails,
      phoneNumbers: phoneNumbers,
      secondaryContactIds: secondaryContactIds,
    };
    return consolidatedContact;
  }
}
