# ms-appointment

Microservicio Serverless para la gestión de citas médicas (Reto Rimac Backend 2025). Utiliza AWS Lambda, API Gateway, DynamoDB, RDS, SNS, SQS y EventBridge, todo desplegado con Serverless Framework v3.

---

## Requisitos

- Node.js v18+
- AWS CLI configurado (`aws configure`)
- Permisos para desplegar recursos en AWS
- `.env` configurado (si usas variables de entorno locales)

---

## Instalación

```bash
npm install
```

---

## Configuración del entorno

Crea un archivo `.env` en la raíz con tus variables sensibles si estás usando `dotenv`. Por ejemplo:

```env
MYSQL_HOST=your-rds-host.amazonaws.com
MYSQL_USER=admin
MYSQL_PASSWORD=yourPassword
MYSQL_DB=Agendamiento
MYSQL_PORT=3306
DYNAMO_TABLE_NAME=appointments
```

---

## Despliegue

### Opción 1 – Con `npx`

```bash
npx serverless deploy --stage dev
```

### Opción 2 – Con script (recomendado)

Agrega este script en `package.json`:

```json
"scripts": {
  "deploy": "serverless deploy --stage dev"
}
```

Luego ejecuta:

```bash
npm run deploy
```

---

## Estructura del Proyecto

```
src/
├── appointment/
│   ├── setup.ts                  # Crear cita y actualizar estado
│   └── ...                      
├── appointment_pe/
│   └── interfaces/sqs/handler.ts # Manejo de mensajes PE
├── appointment_cl/
│   └── interfaces/sqs/handler.ts # Manejo de mensajes CL
serverless.ts                     # Configuración principal de Serverless
.env                              # Variables de entorno
```

---

## Endpoints API REST

| Método | Endpoint                   | Descripción                     |
|--------|----------------------------|----------------------------------|
| POST   | `/appointments/create`     | Crear nueva cita médica         |
| GET    | `/appointments`            | Obtener todas las citas         |

Puedes ver la documentación Swagger en:  
**`http://localhost:4000/api-docs`** (modo local con Express)

---

## Despliegue CI/CD (opcional)

Este proyecto puede desplegarse automáticamente desde GitHub Actions.

---