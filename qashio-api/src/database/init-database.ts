import { Client } from 'pg';

export async function initializeDatabase(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  let connectionConfig: {
    host: string;
    port: number;
    user: string;
    password: string;
    database?: string;
  };

  if (databaseUrl) {
    const url = new URL(databaseUrl);
    connectionConfig = {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
    };
  } else {
    connectionConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'qashio_points',
    };
  }

  const dbName = connectionConfig.database || 'qashio_points';

  const adminClient = new Client({
    host: connectionConfig.host,
    port: connectionConfig.port,
    user: connectionConfig.user,
    password: connectionConfig.password,
    database: 'postgres',
  });

  try {
    await adminClient.connect();
    console.log('Connected to PostgreSQL server');

    const result = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rows.length === 0) {
      console.log(`Database "${dbName}" does not exist. Creating...`);
      const escapedDbName = `"${dbName.replace(/"/g, '""')}"`;
      await adminClient.query(`CREATE DATABASE ${escapedDbName}`);
      console.log(`Database "${dbName}" created successfully`);
    } else {
      console.log(`Database "${dbName}" already exists`);
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await adminClient.end();
  }
}

