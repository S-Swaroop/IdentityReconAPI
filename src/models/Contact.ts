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

  static async getConsolidatedContact(primaryContactId: number) {
    const connectedContacts = await Contact.findAll({
      where: Sequelize.or(
        { id: primaryContactId },
        { linkedId: primaryContactId }
      ),
      order: [["createdAt", "ASC"]],
    });
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
