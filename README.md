# YapAway – Real-Time WebSocket Chat App

YapAway is a lightweight real-time chat application built with **React** and **WebSockets**, allowing users to communicate in room-based chats with instant message delivery and a soft pastel-themed interface.

---

## 🚀 Features

### 🔑 Room-Based Chat System

* Join specific chat rooms using a Room ID
* Multiple rooms operate independently
* See only messages from your current room

### 🔁 Real-Time Communication

* Powered by **WebSockets**
* Instant message delivery without page refresh
* Connection status indicator (Connected / Disconnected / Error)

### 👤 User Identity

* Choose your own username when joining
* Messages display usernames
* System messages styled distinctly

### 🎨 Clean Pastel UI

* Soft pastel color scheme
* Different styles for your messages, others', and system messages
* Empty state message when no messages are present

### 📱 Responsive UX

* Auto-scroll to newest message
* Input clears after sending
* Use `Enter` to send messages or join rooms

---

## 🧑‍💻 Tech Stack

### Frontend

* **React** + **TypeScript**
* **Tailwind CSS** for styling
* Custom CSS variables for theme consistency
* Smooth animations for message appearance

### Backend

* **Node.js WebSocket Server**
* Handles room-based routing and message broadcasting
* Supports different message types (`join`, `message`, `system`)

### State Management

* `useState` and `useRef` for client-side state
* WebSocket connection managed within React
* Filters duplicate messages client-side

---

## 🖥️ UI Components

* Join Room Form (Username + Room ID)
* Chat Interface (Message History + Input Field)
* Room Info Display
* Real-time Connection Status

---

## 📸 Preview
<img width="1470" alt="Screenshot 2025-05-24 at 7 20 52 AM" src="https://github.com/user-attachments/assets/2a9f433e-11a8-4a06-8bf3-9896554a3f7a" />


---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/yapaway.git
cd yapaway

# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

---

## 🧪 Running the App

### Start Backend:

```bash
cd server
node index.js
```

### Start Frontend:

```bash
cd client
npm run dev
```

Open `http://localhost:5173` in your browser.
