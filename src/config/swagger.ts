import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart API Hub',
      version: '1.0.0',
      description: 'REST API Platform tự động sinh từ db.json',
      contact: {
        name: 'Admin',
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Nhập JWT Token của bạn vào đây (không cần chữ Bearer)',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'System', description: 'API hệ thống' },
      { name: 'Auth', description: 'Xác thực người dùng' },
      { name: 'Dynamic CRUD', description: 'Các API tương tác với dữ liệu động' }
    ],
    
    
    
    paths: {
      '/api/health': {
        get: {
          summary: 'Kiểm tra trạng thái máy chủ',
          tags: ['System'],
          responses: { '200': { description: 'OK' } }
        }
      },
      '/api/auth/register': {
        post: {
          summary: 'Đăng ký tài khoản mới',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'user@example.com' },
                    password: { type: 'string', example: 'password123' },
                    role: { type: 'string', enum: ['user', 'admin'], example: 'user' }
                  }
                }
              }
            }
          },
          responses: {
            '201': { description: 'Tạo tài khoản thành công' },
            '400': { description: 'Lỗi dữ liệu đầu vào' }
          }
        }
      },
      '/api/auth/login': {
        post: {
          summary: 'Đăng nhập cấp Token',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'admin@test.com' },
                    password: { type: 'string', example: 'hashed_password' }
                  }
                }
              }
            }
          },
          responses: {
            '200': { description: 'Đăng nhập thành công, trả về JWT' },
            '401': { description: 'Sai thông tin đăng nhập' }
          }
        }
      },
      '/api/{resource}': {
        get: {
          summary: 'Lấy danh sách dữ liệu (Hỗ trợ Pagination, Filter, Search, Sort)',
          tags: ['Dynamic CRUD'],
          parameters: [
            { in: 'path', name: 'resource', required: true, schema: { type: 'string' }, description: 'Tên bảng (vd posts, users)' },
            { in: 'query', name: '_page', schema: { type: 'integer' } },
            { in: 'query', name: '_limit', schema: { type: 'integer' } }
          ],
          responses: { '200': { description: 'Thành công' } }
        },
        post: {
          summary: 'Tạo mới một bản ghi (Cần Token)',
          tags: ['Dynamic CRUD'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'resource', required: true, schema: { type: 'string' } }
          ],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object' } } }
          },
          responses: { '201': { description: 'Tạo thành công' } }
        }
      },
      '/api/{resource}/{id}': {
        get: {
          summary: 'Lấy chi tiết một bản ghi',
          tags: ['Dynamic CRUD'],
          parameters: [
            { in: 'path', name: 'resource', required: true, schema: { type: 'string' } },
            { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
          ],
          responses: { '200': { description: 'Thành công' } }
        },
        put: {
          summary: 'Cập nhật toàn bộ bản ghi (Cần Token)',
          tags: ['Dynamic CRUD'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'resource', required: true, schema: { type: 'string' } },
            { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
          ],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { '200': { description: 'Cập nhật thành công' } }
        },
        patch: {
          summary: 'Cập nhật một phần bản ghi (Cần Token)',
          tags: ['Dynamic CRUD'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'resource', required: true, schema: { type: 'string' } },
            { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
          ],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { '200': { description: 'Cập nhật thành công' } }
        },
        delete: {
          summary: 'Xóa một bản ghi (Cần Admin Token)',
          tags: ['Dynamic CRUD'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'resource', required: true, schema: { type: 'string' } },
            { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
          ],
          responses: { '204': { description: 'Xóa thành công' } }
        }
      }
    }
  },

  apis: [], 
};

export const swaggerDocs = (app: Express) => {
  const specs = swaggerJsDoc(options);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
  console.log('Swagger UI đã sẵn sàng tại: http://localhost:3000/docs');
};