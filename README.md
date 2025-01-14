# ms-user-service

Microservice for user management. This service provides CRUD (Create, Read, Update, Delete) operations for users, along with authentication and authorization functionalities.

## Table of Contents
- [Description](#description)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Database Configuration](#database-configuration)
- [Contributing](#contributing)
- [License](#license)

---

## Description

The `ms-user-service` is a microservice designed to handle user-related operations in a microservices architecture. It provides endpoints for user management, authentication, and role-based authorization.

---

## Features

- **User Management**: Create, read, update, and delete user records.
- **Authentication**: Token-based authentication using JWT.
- **Authorization**: Role-based access control for secure endpoints.
- **Scalability**: Designed to integrate seamlessly into a microservices ecosystem.

---

## Requirements

- Node.js (v18+)
- PostgreSQL
- Docker (optional, for containerized deployment)
- Other dependencies as specified in `package.json`

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/roqueheli/ms-user-service.git
   cd ms-user-service
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory and add the following:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=admin
   DB_NAME=user_service_db
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRATION_TIME=24h
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   NODE_ENV=development
   ```
4. Run the command:
   ```bash
   psql -U postgres -f create_database.sql
   ```
5. Run the service:
   ```bash
   npm start:dev
   ```

---

## Usage

### Endpoints

#### User Management
- `POST /api/users/register`: Create a new user.
- `POST /api/users/login`: Login
- `GET /api/users/profile`: Retrieve profile actual user.
- `GET /api/users/{user_id}`: Retrieve an user by ID.
- `DELETE /api/users/{id}`: Delete a user.
- `PATCH /api/users/{user_id}`: Update user.
- `PUT /api/users/{user_id}/profile`: Update user profile.
- `GET /api/users/profile/{user_id}`: Retrieve user profile by ID.

#### Authentication
- `GET /api/auth/google`: Google Login and receive a JWT token.
- `GET /api/auth/google/redirect`: Google callback.
- `GET /api/auth/github`: Github Login and receive a JWT token.
- `GET /api/auth/github/redirect`: Github callback.

### API Documentation
API documentation is available via Swagger at `/api-docs` (if configured).

---

## Project Structure

```plaintext
ms-user-service/
├── src/
│   ├── controllers/    # API controllers
│   ├── models/         # Database models
│   ├── services/       # Business logic
│   ├── routes/         # API routes
│   └── utils/          # Utility functions
├── database/           # Database scripts and migrations
├── tests/              # Unit and integration tests
├── .env.example        # Example environment variables
├── Dockerfile          # Docker configuration
├── README.md           # Project documentation
└── package.json        # Project dependencies and scripts
```

---

## Database Configuration

The service uses PostgreSQL as the database. Ensure the `DB_NAME` is correctly set in the `.env` file.

### Example `.env` Configuration
```env
DATABASE_URL=postgresql://user:password@localhost:5432/user_service_db
```

### Running Migrations
If using a migration tool, run the following command to apply migrations:
```bash
npm run migrate
```

---

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.