# Demand Management - Registration and Legalization Department

Web application built with **Next.js** for managing internal demands related to company registration, legalization, process tracking, and operational follow-up.

The system allows users to create, track, update, complete, and manage demands, with user permissions, movement history, file attachments, and administrative controls.

---

## Tech Stack

* Next.js 15
* TypeScript
* Tailwind CSS
* MongoDB Atlas
* Mongoose
* GridFS
* Vercel

---

## Main Features

* User registration
* Login access
* Role-based permissions
* New demand creation
* Demand tracking panel
* Administrative dashboard
* Status updates
* Priority management
* Responsible user assignment
* Internal notes and observations
* Demand history
* File upload
* File download
* Automatic attachment deletion when a demand is completed
* User approval and management by administrators

---

## MongoDB Collections

Mongoose automatically creates the collections on first use:

```text
users
demands
demand_history
```

Uploaded files are stored in MongoDB Atlas using **GridFS**.

---

## MongoDB Atlas Setup

1. Create a MongoDB Atlas account.
2. Create a project.
3. Create a cluster.
4. Go to **Database Access** and create a database user.
5. Go to **Network Access** and allow your local IP address for development.
6. For Vercel deployment, it may be necessary to allow:

```text
0.0.0.0/0
```

Warning: this rule allows broad external access to the database. Use it only if it complies with your security policy and always use strong database credentials.

7. Go to **Connect** and copy the `mongodb+srv` connection string.
8. Use the following database name:

```text
controle_demandas
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/controle_demandas?retryWrites=true&w=majority&appName=Cluster0
NEXTAUTH_SECRET=replace-with-a-long-secure-secret-with-at-least-32-characters
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Never place `MONGODB_URI`, passwords, tokens, or secret keys directly in the source code.

The `.env.local` file must not be committed to GitHub.

---

## Local Installation

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000/login
```

---

## Local Build

Before deploying or pushing production changes, it is recommended to test the build:

```bash
npm run build
```

If the build completes without errors, the project is ready for deployment.

---

## First Access

The first user created through the registration screen is automatically assigned as an administrator, as long as the `users` collection is still empty.

All other users created afterwards are registered as requesters with pending access, waiting for administrator approval on the following page:

```text
/usuarios
```

---

## Optional Seed

The project includes an optional seed script to create an administrator user and sample demands.

Run:

```bash
npm run seed
```

Optional seed variables:

```env
SEED_ADMIN_EMAIL=admin@cadastro.local
SEED_ADMIN_PASSWORD=replace-with-a-strong-password
```

The seed should preferably be used only in local or testing environments.

Do not use weak or example passwords in production.

---

## Main Routes

```text
/login
```

Login and access creation page.

```text
/nova-demanda
```

Page for creating a new demand.

```text
/demandas
```

Operational panel for searching, viewing, and tracking demands.

```text
/admin
```

Administrative dashboard for editing demands, changing status, setting priority, assigning responsible users, completing, canceling, and deleting demands.

```text
/usuarios
```

User approval and management page. Available only to administrators.

---

## User Roles

### Requester

A requester can:

* Create demands
* View demands
* Search demands
* Track progress
* View history
* Update observations
* Attach documents to open demands

### Administrator

An administrator can:

* Approve users
* Change user permissions
* Edit demands
* Change demand status
* Set priority
* Assign a responsible user
* Complete demands
* Cancel demands
* Delete demands
* Download attachments
* Access the administrative dashboard

---

## File Attachments

Files uploaded to demands are stored in MongoDB Atlas using **GridFS**.

Attachments are not stored in the frontend and are not stored on Vercel disk storage.

Accepted file formats:

```text
PDF
JPG
PNG
DOCX
XLSX
```

Current file size limit:

```text
4 MB per file
```

Important: when a demand is marked as **Completed**, all attachments linked to that demand are automatically deleted.

Before completing a demand, download and save any documents that must be preserved.

---

## Deploying to Vercel

1. Push the project to a Git repository.
2. Open Vercel.
3. Click **Add New Project**.
4. Import the repository.
5. Configure the environment variables in:

```text
Settings > Environment Variables
```

Add:

```env
MONGODB_URI
NEXTAUTH_SECRET
NEXT_PUBLIC_APP_URL
```

6. Deploy the project.
7. After the first deployment, copy the URL generated by Vercel and update:

```env
NEXT_PUBLIC_APP_URL=https://your-url.vercel.app
```

8. Redeploy the project after updating the variable.

---

## Before Making the Repository Public

Before changing the repository visibility to public, make sure it does not contain sensitive files or information, such as:

```text
.env
.env.local
.env.production
tokens
passwords
API keys
MongoDB credentials
real client data
internal documents
database files
```

Also check that `.gitignore` is properly blocking sensitive files.

Recommended `.gitignore` entries:

```gitignore
.env
.env.*
!.env.example
.vercel
node_modules
.next
```

---

## `.env.example`

It is recommended to keep a `.env.example` file in the repository to guide project configuration without exposing real credentials:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/controle_demandas?retryWrites=true&w=majority&appName=Cluster0
NEXTAUTH_SECRET=replace-with-a-long-secure-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000

SEED_ADMIN_EMAIL=admin@cadastro.local
SEED_ADMIN_PASSWORD=replace-with-a-strong-password
```

---

## Security Notes

* Never expose the real MongoDB connection string in frontend code.
* Never commit `.env.local` to GitHub.
* Use a strong password for the database user.
* Use a secure value for `NEXTAUTH_SECRET`.
* Review all sample data before publishing the repository.
* Avoid using real client names in seed files or public documentation.
* Restrict MongoDB Atlas network access whenever possible.

---

## License

Internal project for operational demand management in the registration and legalization department.

If the repository is made public, define a license according to the project owner’s usage policy.
