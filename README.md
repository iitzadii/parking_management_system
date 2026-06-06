# 🅿 ParkOS — Parking Lot Management System
### Setup Guide (VS Code + Maven + Tomcat 11 + MySQL)

---

## 📁 Folder Structure

```
parking-lot-system/
├── pom.xml                                       ← Maven config (dependencies)
├── database-setup.sql                            ← Run this in MySQL Workbench
└── src/
    └── main/
        ├── java/com/parking/
        │   ├── model/
        │   │   └── ParkingSlot.java              ← Data model
        │   ├── dao/
        │   │   └── ParkingSlotDAO.java           ← DB queries (JDBC)
        │   ├── servlet/
        │   │   ├── GetSlotsServlet.java          ← GET  /api/slots
        │   │   ├── CheckInServlet.java           ← POST /api/checkin
        │   │   └── CheckOutServlet.java          ← POST /api/checkout
        │   └── util/
        │       ├── DBConnection.java             ← MySQL connection helper
        │       └── QRCodeGenerator.java          ← ZXing QR generator
        └── webapp/
            ├── index.html                        ← Main UI
            ├── css/style.css                     ← Dark industrial theme
            ├── js/app.js                         ← Frontend JS
            └── WEB-INF/
                └── web.xml                       ← Servlet descriptor
```

---

## ✅ STEP-BY-STEP SETUP GUIDE

### STEP 1 — Configure MySQL

1. Open **MySQL Workbench**
2. Connect to your local server (`localhost:3306`)
3. Open a new SQL tab and paste the contents of `database-setup.sql`
4. Click ⚡ **Execute All** — this creates `parking_db` and seeds 20 slots

---

### STEP 2 — Set Your MySQL Password

Open this file:
```
src/main/java/com/parking/util/DBConnection.java
```

Change line:
```java
private static final String PASSWORD = "root"; // ← put your MySQL password here
```

---

### STEP 3 — Open the Project in VS Code

1. Open VS Code
2. **File → Open Folder** → select the `parking-lot-system` folder
3. Make sure you have these VS Code extensions installed:
   - **Extension Pack for Java** (Microsoft)
   - **Community Server Connectors** (Red Hat) — for Tomcat 11

---

### STEP 4 — Build with Maven

Open the **VS Code Terminal** (`Ctrl + `` ` ``) and run:

```bash
mvn clean package -DskipTests
```

This generates: `target/parking-lot-system.war`

---

### STEP 5 — Deploy to Tomcat 11

**Option A — Community Server Connectors (Recommended)**
1. Open the **Servers** panel in VS Code (bottom panel or sidebar)
2. Click **+** → **Add Server** → select **Tomcat 11**
3. Point it to your Tomcat installation folder
4. Right-click the server → **Add Deployment** → select the generated WAR:
   `target/parking-lot-system.war`
5. Start the server (right-click → **Start**)

**Option B — Manual Copy**
```bash
# Copy WAR into Tomcat's webapps folder
copy target\parking-lot-system.war "C:\apache-tomcat-11.x.x\webapps\"
# Start Tomcat
"C:\apache-tomcat-11.x.x\bin\startup.bat"
```

**Option C — Tomcat Manager UI**
1. Open: `http://localhost:8080/manager/html`
2. Scroll to **Deploy** → **WAR file to deploy**
3. Choose `target/parking-lot-system.war` → **Deploy**

---

### STEP 6 — Open the App

```
http://localhost:8080/parking-lot-system/
```

---

## 🚀 How to Use

| Action | How |
|--------|-----|
| **View slots** | The grid shows 🟢 empty and 🔴 occupied slots |
| **Check In** | Click any green slot → fill car number, owner, type → click CHECK IN |
| **Get QR Token** | After check-in, a QR token is displayed — click PRINT TOKEN |
| **Check Out** | Click any red slot → review details → click CONFIRM CHECKOUT |
| **View Fare** | Checkout receipt shows time parked + fare (₹100/hr first, ₹50/hr after) |
| **Auto-refresh** | Grid refreshes every 30 seconds automatically |

---

## 💰 Fare Calculation

| Duration | Fare |
|----------|------|
| Up to 1 hour | ₹100 |
| 2 hours | ₹150 |
| 3 hours | ₹200 |
| N hours | ₹100 + (N−1) × ₹50 |

Minimum charge is always ₹100 (even for < 1 minute).

---

## ⚠️ Troubleshooting

| Problem | Fix |
|---------|-----|
| 404 on root URL | Confirm `web.xml` welcome-file is `index.html` and WAR deployed correctly |
| DB connection error | Check password in `DBConnection.java`, ensure MySQL is running on port 3306 |
| QR not showing | Ensure `mvn package` succeeded and ZXing JARs are in the WAR |
| Tomcat won't start | Check port 8080 is free: `netstat -ano | findstr :8080` |
| `ClassNotFoundException` for MySQL driver | Ensure mysql-connector JAR is inside `WEB-INF/lib` (Maven handles this) |

---

## 🛠 Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JS
- **Backend**: Java 17, Jakarta Servlet 6.0
- **Database**: MySQL 8 via JDBC
- **QR Codes**: Google ZXing 3.5.3
- **JSON**: Jackson 2.17
- **Build**: Maven 3
- **Server**: Apache Tomcat 11
- **IDE**: VS Code
