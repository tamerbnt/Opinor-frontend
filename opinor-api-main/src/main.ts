import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters';
import { TransformInterceptor } from './common/interceptors';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const isProduction = process.env.NODE_ENV === 'production';
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  // Gzip compression
  app.use(compression());

  // Global prefix
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // CORS - restrict to actual frontend in production
  app.enableCors({
    origin: isProduction
      ? process.env.FRONTEND_URL
      : [
          process.env.FRONTEND_URL || 'http://localhost:3001',
          'http://localhost:3000',
        ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger documentation (disabled in production)
  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('Opinor API')
      .setDescription(
        `
## Opinor - Anonymous Feedback System for Businesses

Opinor helps business owners collect and manage anonymous customer feedback through QR codes.

### 🔐 Authentication
Most endpoints require a Bearer token. Login with your credentials to get an access token.

**Business Owner Login:** \`POST /auth/login\`
**Admin Login:** \`POST /auth/admin/login\`

### 👤 User Roles
- **Business Owner**: Manages their business, views feedbacks
- **Admin**: Manages all business owners, handles payments, replies to feedbacks, sends notifications

### ✨ Key Features

#### For Business Owners:
- 📝 **Anonymous Feedback**: Customers submit feedback via QR code
- 📊 **Dashboard**: Real-time statistics and achievement tracking
- 🔔 **Notifications**: Auto-alerts for new feedbacks, performance changes, admin replies
- 📱 **QR Code**: View QR code and track scans (read-only)
- 🔒 **Password Management**: Change password securely (admin notified)
- 👀 **View Feedbacks**: Read-only access to feedbacks and admin replies

#### For Admins:
- 👥 **User Management**: View, block/unblock business owners
- 💬 **Reply to Feedbacks**: Respond to any feedback (business owner sees the reply)
- 🗑️ **Soft Delete**: Remove inappropriate feedbacks (can restore)
- 📊 **Global Statistics**: View stats across all businesses
- 📈 **Business Stats**: View specific business performance
- 📢 **Manual Notifications**: Send custom notifications to users
- 📣 **Broadcast**: Send announcements to all users
- 🔔 **Password Alerts**: Notified when business owners change passwords
- 📱 **QR Code Management**: View, track, and regenerate business QR codes
- 📧 **Join Request Alerts**: Automatic email notification when new businesses apply

### 📝 Join Request Flow
1. **Business submits request** → Admin receives email notification at hello.opinor@workmail.com
2. **Admin reviews** → Approves or rejects the request
3. **If approved** → Business receives invitation code via email
4. **Business registers** → Uses invitation code to complete sign-up
### 🔔 Notification Types
| Type | Description |
|------|-------------|
| 🔴 Critical | Negative feedback (1-2★), critical keywords detected |
| 🟢 Positive | Good reviews (4-5★), compliments |
| 🟡 Admin | Subscription, payment, account status, admin replies |
| 🟠 Performance | Drops, improvements, trends |
| 🔵 Reports | Weekly summaries, insights |
| ⚪ System | QR scans, app updates |

### 🚨 Critical Keywords Detection
The system automatically scans feedback comments for **70+ critical keywords** in French. When detected, business owners receive an immediate alert.

**Keyword Categories:**
| Category | Examples |
|----------|----------|
| 🏥 Hygiene & Health | intoxication, malade, vomi, allergie, bactérie, cheveux, cafard |
| 🧹 Cleanliness | sale, dégueulasse, dégoûtant, puant, crasseux |
| 💰 Fraud & Theft | arnaque, vol, escroquerie, fraude, malhonnête |
| ⚠️ Violence & Behavior | agression, insulte, menace, harcèlement, racisme |
| 😤 Extreme Dissatisfaction | scandaleux, inadmissible, catastrophe, cauchemar |
| ⚖️ Legal Threats | avocat, plainte, tribunal, procès, poursuite |
| 🚑 Safety | blessure, accident, urgence, hôpital |
| 🍽️ Quality Issues | immangeable, avarié, contaminé, toxique |
| 👎 Strong Negatives | nul, minable, lamentable, incompétent |
| 💸 Refund | remboursement, réclamation, litige |

When critical keywords are detected, a **"🔴 Mots-clés critiques détectés"** notification is sent with up to 3 detected keywords.

### 👑 Admin Endpoints Summary

#### User Management
| Endpoint | Description |
|----------|-------------|
| \`GET /admin/users\` | List all business owners |
| \`PATCH /admin/users/:id/block\` | Block user (payment control) |
| \`PATCH /admin/users/:id/unblock\` | Unblock user |
| \`POST /admin/users/:id/notify\` | Send notification to user |
| \`POST /admin/users/notify/bulk\` | Notify multiple users |
| \`POST /admin/users/notify/all\` | Broadcast to all |

#### Feedbacks & Statistics
| Endpoint | Description |
|----------|-------------|
| \`GET /admin/feedbacks\` | All feedbacks (filtered) |
| \`GET /admin/feedbacks/statistics\` | Global stats |
| \`GET /admin/feedbacks/business/:id\` | Business feedbacks |
| \`GET /admin/feedbacks/business/:id/statistics\` | Business stats |
| \`POST /admin/feedbacks/:id/reply\` | Reply to feedback |
| \`DELETE /admin/feedbacks/:id\` | Soft delete feedback |
| \`PATCH /admin/feedbacks/:id/restore\` | Restore feedback |

#### QR Code Management
| Endpoint | Description |
|----------|-------------|
| \`GET /admin/qrcode/business/:id\` | Get business QR code |
| \`GET /admin/qrcode/business/:id/stats\` | Get QR scan statistics |
| \`POST /admin/qrcode/business/:id/regenerate\` | Regenerate QR code |

### API Versioning
All endpoints are prefixed with \`/api/v1\`
      `,
      )
      .setVersion('2.0')
      .setContact('Opinor Support', 'https://opinor.app', 'support@opinor.app')
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter your access token',
          in: 'header',
        },
        'access-token',
      )
      .addTag('Auth', 'Authentication, registration & password management')
      .addTag('Users', 'User profile, business info & settings')
      .addTag('Dashboard', 'Home screen data, stats & achievements')
      .addTag('Feedbacks', 'Anonymous feedback submission & management')
      .addTag('Reports', 'Analytics, statistics & export')
      .addTag('Notifications', 'Push notifications & alerts')
      .addTag('QR Code', 'QR code generation & scan tracking')
      .addTag('Join Requests', 'Business registration requests')
      .addTag(
        'Admin - Users Management',
        '👑 Admin: Manage business owners, block/unblock, send notifications',
      )
      .addTag(
        'Admin - Feedbacks',
        '👑 Admin: View all feedbacks, reply, soft delete, global statistics',
      )
      .addTag(
        'Admin - QR Code',
        '👑 Admin: View and manage QR codes for any business',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'Opinor API Documentation',
      customfavIcon: 'https://opinor.app/favicon.ico',
      customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0 }
      .swagger-ui .info .title { color: #3b82f6 }
    `,
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
      },
    });
  }

  const port = process.env.PORT || 3000;
  // Bind to 0.0.0.0 for cloud deployment (Render, Railway, etc.)
  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on port ${port}`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  if (!isProduction) {
    logger.log(`Swagger documentation: /api/docs`);
  }
}
bootstrap();
