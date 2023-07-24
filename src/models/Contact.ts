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

@Table({ paranoid: true })
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
    const primaryContact = await Contact.findOne({
      where: { id: primaryContactId },
    });
    const secondaryContacts = await Contact.findAll({
      where: Sequelize.or(
        { id: primaryContactId },
        { linkedId: primaryContactId }
      ),
      order: [["createdAt", "ASC"]],
    });
    const emails = new Set();
    const secondaryContactIds = [];
    const phoneNumbers = new Set();
    for (let i = 0; i < secondaryContacts.length; i++) {
      if (secondaryContacts[i].get("linkPrecedence") !== "primary") {
        secondaryContactIds.push(secondaryContacts[i].get("id"));
      }
      emails.add(secondaryContacts[i].get("email"));
      phoneNumbers.add(secondaryContacts[i].get("phoneNumber"));
    }
    // since primary contact email and phone should be first
    emails.delete(primaryContact?.get("email"));
    phoneNumbers.delete(primaryContact?.get("phoneNumber"));

    const consolidatedContact = {
      primaryContactId: primaryContactId,
      emails: [primaryContact?.get("email"), ...emails],
      phoneNumbers: [primaryContact?.get("phoneNumber"), ...phoneNumbers],
      secondaryContactIds: secondaryContactIds,
    };
    return consolidatedContact;
  }
}
