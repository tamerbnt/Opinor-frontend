import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User, Admin, JoinRequest, Feedback } from '../entities';

// Determine if SSL is needed
const shouldUseSSL = () => {
  const host = process.env.DB_HOST || '';
  return (
    process.env.DB_SSL === 'true' ||
    process.env.NODE_ENV === 'production' ||
    host.includes('aivencloud.com') ||
    host.includes('render.com') ||
    host.includes('neon.tech')
  );
};

async function runSeeds() {
  const useSSL = shouldUseSSL();
  console.log(`Connecting to database at ${process.env.DB_HOST}...`);
  console.log(`SSL enabled: ${useSSL}`);

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5434', 10),
    username: process.env.DB_USERNAME || 'opinor',
    password: process.env.DB_PASSWORD || 'opinor123',
    database: process.env.DB_NAME || 'opinor',
    entities: [User, Admin, JoinRequest, Feedback],
    synchronize: true,
    ssl: useSSL ? { rejectUnauthorized: false } : false,
  });
}

runSeeds();
