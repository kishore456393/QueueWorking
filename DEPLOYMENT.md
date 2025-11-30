# Project Deployment & Database Guide

This guide answers your questions about how the system works, how data is stored, and how to move the project to another computer.

## 1. How the Database Communicates 📡

The application uses a standard client-server architecture:

1.  **Frontend (React)**: The user interface running in your browser sends HTTP requests (like "Get latest data") to the backend.
2.  **Backend (Node.js/Express)**: The server receives these requests. It uses a tool called **Drizzle ORM** to talk to the database.
3.  **Database Driver (MySQL2)**: This is the actual connector that establishes a TCP/IP connection to your MySQL server (running on port 3306).
4.  **Database (MySQL)**: The database executes the queries and returns the data.

**Flow:** `User Action` -> `React` -> `API` -> `Drizzle` -> `MySQL` -> `Data Returned`

## 2. How Data is Stored 💾

Data is split between the **Database** and the **File System**:

### In the Database (MySQL)
We use specific tables defined in `shared/schema.ts`:
- **`users`**: Stores username, hashed passwords, and roles.
- **`videos`**: Stores metadata about videos (filename, upload date, owner) and the *path* to the file.
- **`queue_zones`**: Stores the coordinates of the zones you draw.
- **`detection_snapshots`**: Stores the analytics data (queue counts, wait times) and the **processed image frame** (as a Base64 text string).
- **`settings`**: Stores dashboard preferences (language, audio settings).

### In the File System
- **Video Files**: The actual `.mp4` files you upload are stored in the `uploads/` folder on your computer. The database only keeps the *link* to these files.

## 3. How to View Stored Data 🔍

Since you are using MySQL, the best way to view data is using **MySQL Workbench**:

1.  Open **MySQL Workbench**.
2.  Click on your Local instance connection.
3.  In the left sidebar (Schemas), find the `artistry_edu` database (or whatever you named it in `.env`).
4.  Expand **Tables**.
5.  Right-click on a table (e.g., `users` or `videos`) and select **"Select Rows - Limit 1000"**.
6.  You will see the raw data stored in the grid view.

## 4. Data Storage Limits 📉

**How much data can be stored?**
- **The Limit**: The limit is defined by the **hard drive space** of the computer running the MySQL server, not the dashboard itself.
- **Snapshots**: Storing images in the database takes up space quickly.
- **Optimization**: We implemented a **Retention Policy** that automatically deletes detection snapshots older than **1 minute**.
  - This keeps the database size very small and manageable.
  - If you disable this, the database could grow by hundreds of megabytes per hour depending on the frame rate.

## 5. Deploying to a Friend's Laptop 💻 -> 💻

To run this project on another computer (e.g., your friend's laptop), follow these steps:

### Prerequisites on Friend's Laptop
1.  **Install Node.js**: Download and install from [nodejs.org](https://nodejs.org/).
2.  **Install MySQL**: Download and install MySQL Server and Workbench.

### Step-by-Step Transfer
1.  **Copy Files**: Copy the entire project folder to the friend's laptop.
    - *Exclude* the `node_modules` folder (it's huge and will be re-installed).
    - *Exclude* the `.git` folder if you don't want the version history.
2.  **Install Dependencies**:
    - Open a terminal in the project folder on the new laptop.
    - Run: `npm install`
3.  **Setup Database**:
    - Open MySQL Workbench on the new laptop.
    - Create a new schema (database) named `artistry_edu`.
4.  **Configure Environment**:
    - Create a `.env` file in the project root (copy your `.env`).
    - Update `DATABASE_URL` with the friend's MySQL password:
      ```
      DATABASE_URL=mysql://root:FRIENDS_PASSWORD@localhost:3306/artistry_edu
      ```
5.  **Initialize Data**:
    - Run the migration script to create tables: `npm run db:push`
    - (Optional) Seed dummy data: `npm run db:seed`
6.  **Start the App**:
    - Run: `npm run dev` (or use the `start-all.bat` script).
