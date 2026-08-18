// D1 schema mirrored in migrations/0001_auth.sql. Keeping the SQL explicit
// avoids pulling an ORM into the lightweight Sites worker.
export const usersTable = "users";
export const sessionsTable = "sessions";
export const userProgressTable = "user_progress";
