# IdentityReconciliationAPI

## Tech stack:

- Nodejs
- TypeScript
- Sequelize
- Postgres
- Express

## Schema:

- Contact

```TypeScript
Contact {
	id                   Int
  phoneNumber          String?
  email                String?
  linkedId             Int? // the ID of another Contact linked to this one
  linkPrecedence       "secondary"|"primary" // "primary" if it's the first Contact in the link
  createdAt            DateTime
  updatedAt            DateTime
  deletedAt            DateTime?
}
```

## End-points:

- `GET /api/identify`: gets all contacts in database(only used to check state of DB)

  - Response: `Contact[]`

- `POST /api/identify`: Adds a new contact into the database and returns a consolidated contact object.
  - Response:
    ```TypeScript
        ConsolidatedContact {
            "contact":{
                "primaryContatctId": number,
                "emails": string[], // first element being email of primary contact
                "phoneNumbers": string[], // first element being phoneNumber of primary contact
                "secondaryContactIds": number[] // Array of all Contact IDs that are "secondary" to the primary contact
            }
        }
    ```

## Getting started:

- clone this repo - `git clone https://github.com/S-Swaroop/IdentityReconAPI.git`

- spin up docker containers - `docker compose up --build -d`

- attach to the backend server - `docker attach identityreconciliationapi-server-1`

The server is now running on `http://localhost:8080`
