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
      database: url.pathname.slice(1), // Remove leading '/'
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
  
  // Connect to PostgreSQL server (not to a specific database)
  const adminClient = new Client({
    host: connectionConfig.host,
    port: connectionConfig.port,
    user: connectionConfig.user,
    password: connectionConfig.password,
    database: 'postgres', // Connect to default 'postgres' database
  });

  try {
    await adminClient.connect();
    console.log('Connected to PostgreSQL server');

    // Check if database exists
    const result = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rows.length === 0) {
      // Database doesn't exist, create it
      console.log(`Database "${dbName}" does not exist. Creating...`);
      // Escape database name with double quotes (PostgreSQL identifier quoting)
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

