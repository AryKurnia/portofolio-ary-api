// Hanya memaksa mode tes; kredensial database dibaca dotenv dari .env (tidak ditimpa nilai palsu).
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
