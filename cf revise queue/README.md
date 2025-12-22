# 🔥 CF Revise Queue - Codeforces Editorial Tracking Tool

A beautiful, modern MERN stack single-page application to help competitive programmers track and revise Codeforces problems after watching editorials.

## ✨ Features

- 📝 **Add Problems**: Add Codeforces problem links after watching editorials
- 🗓️ **Auto-Schedule**: Automatically schedules revision 7 days from watching date
- 🎯 **Smart Queue**: Pop the next problem to revise (earliest revise date)
- 🎨 **Beautiful UI**: Clean, modern, and responsive design with Tailwind CSS
- 📱 **Mobile Friendly**: Fully responsive design works on all devices
- 🔔 **Smart Notifications**: Visual indicators for problems due today or overdue
- ⚡ **Real-time Updates**: Instant UI updates after any action
- 🎯 **Link Validation**: Validates Codeforces problem link format

## 🛠️ Tech Stack

### Frontend
- **React** (Vite) - Fast, modern React setup
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Beautiful toast notifications
- **Lucide React** - Modern icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

## 📁 Project Structure

```
root/
├── backend/
│   ├── models/
│   │   └── problemModel.js       # Mongoose schema for problems
│   ├── routes/
│   │   └── problemRoutes.js      # API routes
│   ├── server.js                 # Express server setup
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx        # App header component
    │   │   ├── ProblemForm.jsx   # Form to add problems
    │   │   └── ProblemList.jsx   # Display problems list
    │   ├── utils/
    │   │   ├── api.js            # Axios API configuration
    │   │   └── dateUtils.js      # Date utility functions
    │   ├── App.jsx               # Main app component
    │   ├── main.jsx              # React entry point
    │   └── index.css             # Tailwind styles
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    ├── .env.example
    └── .gitignore
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (Local installation or MongoDB Atlas account)
- **npm** or **yarn**

### Installation

#### 1️⃣ Clone and Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your MongoDB URI
# For local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/cf-revise-queue
#
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cf-revise-queue?retryWrites=true&w=majority

# Start the backend server
npm run dev
```

The backend will run on **http://localhost:5000**

#### 2️⃣ Setup Frontend

```bash
# Open a new terminal
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# (Optional) Create .env file if needed
cp .env.example .env

# Start the frontend development server
npm run dev
```

The frontend will run on **http://localhost:3000**

### 🗄️ MongoDB Setup

#### Option 1: Local MongoDB
```bash
# Install MongoDB locally
# On Ubuntu/Debian:
sudo apt-get install mongodb

# On macOS (using Homebrew):
brew install mongodb-community

# Start MongoDB service
sudo systemctl start mongodb   # Ubuntu/Debian
brew services start mongodb-community  # macOS
```

#### Option 2: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Add it to `backend/.env`

## 📡 API Endpoints

### Problems

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/problems` | Get all problems sorted by revise date |
| `POST` | `/api/problems` | Add a new problem |
| `DELETE` | `/api/problems/pop` | Pop and delete the next problem |
| `DELETE` | `/api/problems/:id` | Delete a specific problem |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Check if API is running |

## 🎯 Usage

1. **Add a Problem**:
   - Copy a Codeforces problem link (e.g., `https://codeforces.com/problemset/problem/1234/A`)
   - Paste it in the input field
   - Click "Add Problem"
   - The problem will be scheduled for revision in 7 days

2. **Pop Next Problem**:
   - Click "Pop Next Problem" to get the earliest problem
   - The problem will be removed from the queue
   - A toast will show you the link to solve

3. **View Queue**:
   - See all problems sorted by revise date
   - Problems due today are highlighted in yellow
   - Overdue problems are marked in red
   - Click any problem link to open it in Codeforces

4. **Delete Problem**:
   - Click the trash icon next to any problem to delete it

## 🎨 Features Explained

### Auto Date Calculation
- **Watched Date**: Set to current date when adding
- **Revise Date**: Automatically calculated as watched date + 7 days

### Smart Status Indicators
- 🟢 **Upcoming**: Shows days until revision
- 🟡 **Today**: Highlighted when revision is due today
- 🔴 **Overdue**: Shows how many days overdue

### Responsive Design
- Desktop: Full table view with all information
- Mobile: Card-based layout optimized for small screens

## 🔧 Configuration

### Backend Configuration (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cf-revise-queue
```

### Frontend Configuration (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📦 Build for Production

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Built with ❤️ by a competitive programming enthusiast

## 🙏 Acknowledgments

- Codeforces for providing an amazing platform
- The MERN stack community
- All competitive programmers out there! 🚀

---

**Happy Coding & Keep Revising! 💪**
