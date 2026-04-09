import express from 'express';
import dotenv from 'dotenv';
import { runMigration } from './db/migrate';
import { globalErrorHandler } from './middlewares/error.middleware';
import { rateLimiter } from './middlewares/rateLimit.middleware';
import { swaggerDocs } from './config/swagger';
import apiRoutes from './routes/api.route';


dotenv.config();

const app = express();
app.use(express.json()); 


app.use(rateLimiter);


swaggerDocs(app);


app.use('/api', apiRoutes); 


app.use((req, res, next) => {
  next({ statusCode: 404, message: `Route ${req.originalUrl} không tồn tại` });
});


app.use(globalErrorHandler);


const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`\nHệ thống khởi động thành công!`);
  console.log(`Server đang lắng nghe tại: http://localhost:${PORT}`);
  
  
  await runMigration();
});