import app from './app.js';
import { initDatabase } from './db/database.js';
import { runMigrations, seedData } from './db/init.js';

const PORT = 3001;

async function startServer() {
  try {
    console.log('Initializing database...');
    await initDatabase();
    
    console.log('Running migrations...');
    await runMigrations();
    
    console.log('Seeding data...');
    await seedData();
    
    const server = app.listen(PORT, () => {
      console.log(`Server ready on port ${PORT}`);
      console.log(`API: http://localhost:${PORT}/api`);
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT signal received');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
