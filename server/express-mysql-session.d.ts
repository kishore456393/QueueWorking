declare module "express-mysql-session" {
  import type * as session from "express-session";

  interface MySQLSessionOptions {
    clearExpired?: boolean;
    checkExpirationInterval?: number;
    expiration?: number;
    createDatabaseTable?: boolean;
    schema?: {
      tableName?: string;
      columnNames?: {
        session_id?: string;
        expires?: string;
        data?: string;
      };
    };
  }

  function factory(
    sessionModule: typeof session.default,
  ): new (options: MySQLSessionOptions, connection?: unknown) => session.Store;

  export default factory;
}
