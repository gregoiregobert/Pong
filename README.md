# Pong (ft_transcendence)

A fullstack project that brings the legendary **Pong** game to the web, with modern features, real-time gameplay, and social interactions.  

---

## 🚀 Features

- 🎮 Play **Pong** directly in your browser  
- 👥 **Real-time multiplayer** matches using WebSockets  
- 📝 Alias system to identify players  
- 💬 Social features: add friends, chat in real time  
- ⚡ Special mode: the ball changes speed during the game  
- 🔐 Security: hashed passwords, protection against SQL injections/XSS, HTTPS connections  

---

## 🛠️ Tech Stack

- **Frontend**: Angular (TypeScript, Single Page Application)  
- **Backend**: NestJS (REST API + WebSockets)  
- **Database**: PostgreSQL  
- **Containerization**: Docker (single-command launch)  

---

## 📦 Installation & Prerequisites

### Prerequisites

- **Node Package Manager (NPM)**  
   `brew install npm`  
  or  
   `brew install node`

- **NestJS CLI (backend framework)**  
   `npm install -g @nestjs/cli`

- **Angular CLI (frontend framework)**  
   `npm install -g @angular/cli`

### Makefile commands

- **make** – Build and launch containers (does not remove cache or volumes)  
   `make`  

- **make stop** – Stop containers  
   `make stop`  

- **make clean** – Stop containers and clean resources (including cache, but not volumes)  
   `make clean`  

- **make fclean** – Stop containers and clean all resources including volumes  
   `make fclean`  

- **make re** – Run `fclean` then `make`  
   `make re`  

Access the app at: [http://localhost:4200](http://localhost:4200)  

---

## 🎯 Game Rules

- Each player controls a paddle with the same speed  
- Matches are played in **1 vs 1**  
- Special mode allows the ball to **change speed** during the game  

---

## 🔒 Security

- Passwords are **hashed** before storage  
- Protection against **XSS/SQL injection**  
- Secure connections with **HTTPS/WSS**  
- Sensitive variables stored in a `.env` file (ignored by git)  

---

👉 This project recreates the iconic **Pong (1972)** and adapts it into a modern version with a **NestJS + Angular** architecture: secure, scalable, and modular.  
