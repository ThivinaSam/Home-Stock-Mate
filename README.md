
# 🏠 Home Stock Mate

**Home Stock Mate** is a web application designed to help users manage and track their household inventory efficiently. Built with React and Firebase, it offers a seamless experience for adding, updating, and monitoring home items in real-time.

---

## 🚀 Features

- 📋 Add, update, and delete household items
- 📦 Organize items into categories
- 📊 Monitor item quantities and details
- 🔔 Receive low-stock alerts (planned feature)
- 📈 View inventory summaries

---

## 🛠️ Technologies Used

- **Frontend:** React.js
- **Backend-as-a-Service:** Firebase
  - **Database:** Cloud Firestore
  - **Authentication:** Firebase Authentication
  - **Hosting:** Firebase Hosting

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js and npm](https://nodejs.org/)
- [Firebase CLI](https://firebase.google.com/docs/cli)

---

## 📦 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ThivinaSam/Home-Stock-Mate.git
cd Home-Stock-Mate
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Configuration

- Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
- In the project settings, add a new web app to obtain your Firebase configuration.
- Create a `firebase-config.js` file in the `src` directory and add your Firebase configuration:

```javascript
// src/firebase-config.js
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);

export default app;
```

### 4. Start the Development Server

```bash
npm start
```

The application will run at `http://localhost:3000`.

---

## 🚀 Deployment

To deploy the application using Firebase Hosting:

### 1. Build the Application

```bash
npm run build
```

### 2. Deploy to Firebase

```bash
firebase login
firebase init
firebase deploy
```

For detailed instructions, refer to the [Firebase Hosting documentation](https://firebase.google.com/docs/hosting).

---

## 📸 Screenshots

*(Add screenshots of your application here)*

---

## 🧑‍💻 Author

- **Thivina Samarakkody**  
  [GitHub Profile](https://github.com/ThivinaSam)

---

## 📜 License

This project is licensed under the MIT License.

---

## ⭐ Support

If you find this project helpful, please consider giving it a ⭐ on GitHub!
