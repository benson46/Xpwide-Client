# 🛒 XPWide Client

Frontend of **XPWide**, a full-featured e-commerce platform built with **React.js**, **Redux**, and **Vite**, featuring user and admin panels, real-time payment integrations, and a responsive UI.

> 🔗 **Live Site:** [xpwide.vercel.app](https://xpwide.vercel.app)  
> 💻 **Server Repo:** [XPWide Server](https://github.com/benson46/Xpwide-Server)

---

## 🚀 Features

- ✅ Responsive UI for users and admins
- 🛍️ Product browsing, cart, orders, and checkout
- 🔐 JWT-based auth (login/register/Google OAuth)
- 🧾 Razorpay, Wallet & COD payments
- 📦 Admin dashboard for product, order, banner & offer management
- 📊 Simple analytics dashboard
- ☁️ Cloudinary for optimized image handling

---

## 🛠️ Tech Stack

| Tech           | Description                       |
|----------------|-----------------------------------|
| React.js       | Frontend UI                       |
| Redux Toolkit  | State Management                  |
| React Router   | Routing & Navigation              |
| Axios          | API Communication                 |
| Vite           | Lightning-fast dev/build tool     |
| Tailwind CSS   | Utility-first styling             |
| Razorpay       | Payment Gateway Integration       |
| Cloudinary     | Image Hosting                     |
| Google OAuth   | Social Login                      |

---


## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/benson46/Xpwide-Client.git
cd Xpwide-Client
```
### 2. Install Dependencies
```
npm install
```

### 3. Setup Environment Variables
Create a .env file in the root directory and add:
```
VITE_USER_API_BASE_URL=http://localhost:5000/api/user
VITE_ADMIN_API_BASE_URL=http://localhost:5000/api/admin
VITE_GOOGLE_USER_API_BASE_URL=http://localhost:5000/api/google

VITE_APP_TITLE=XPWide
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_RAZORPAY_KEY=your_razorpay_key
```

### 4. Start Development Server
```
npm run dev
App will run at: http://localhost:5173

```

### 🖼️ UI Previews
![](https://github.com/benson46/Xpwide-Client/blob/main/xpwide2.png?raw=true)

![](https://github.com/benson46/Xpwide-Client/blob/main/xpwide1.png?raw=true)

🤝 Contributions
Contributions, feedback, and suggestions are welcome!
Feel free to fork the repo and submit a pull request. 💡

🧾 License
This project is open-source and available under the MIT License.