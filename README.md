# Deployed Link: https://hack4delhi-frontend-7xm4.onrender.com

# 🗳️ Voter List Management System

A secure, intelligent, and scalable **Voter Identification & De-duplication System** designed to prevent duplicate voter registrations while ensuring transparency, privacy, and user trust. The system combines **rule-based validation** with **machine learning–driven similarity detection** to accurately identify duplicates before adding voters to the final electoral database.

---

## 📌 Problem Statement

Traditional voter registration systems often rely on isolated databases and manual verification processes. This leads to duplicate registrations, delayed approvals, data inconsistency, and reduced voter confidence. Migrant populations and large-scale electoral systems further amplify these challenges, making duplication detection and auditability critical.

---

## 🚀 Solution Overview

The Voter List Management System introduces a **layered verification architecture** where every new voter application undergoes multiple validation stages before final approval. Instead of directly inserting data into the voter list, applications are first processed through a verification pipeline that ensures accuracy, fairness, and accountability.

---

## ✨ Key Features

- **User-Centric Registration Flow**  
  A single unified application form with real-time status tracking (*pending, approved, under review*), ensuring transparency and improved user experience.

- **Hybrid Duplicate Detection Engine**  
  Combines deterministic rule-based checks (Aadhaar hash, DOB, name similarity) with an ML-powered similarity model for high-accuracy duplicate detection.

- **Privacy-First & Audit-Ready Design**  
  Sensitive identifiers are securely hashed, while detailed logs and manual review workflows provide full transparency and traceability.

---

## 🧠 System Architecture

1. Voter Application Layer – Captures all new registration requests  
2. Rule-Based Validation – Performs fast checks against the full voter database  
3. ML Similarity Model – Calculates duplication probability using multiple attributes  
4. Decision Engine – Approves, rejects, or forwards applications for manual review  
5. Verified Voter Database – Stores only clean, verified voter records  

---

## 🗄️ Database Design

- **voter_applications** – Stores all incoming registration requests  
- **voters** – Contains verified, non-duplicate voters  
- **duplicate_checks** – Logs rule scores, model scores, and decisions  
- **manual_reviews** – Handles human verification for edge cases  

This separation ensures data integrity and prevents premature or incorrect insertions.

---

## 🛠️ Tech Stack

- **Backend:** Node.js / Express  
- **Database:** PostgreSQL  
- **ML Component:** Python-based similarity model  
- **Security:** Hashing for sensitive identifiers  
- **Deployment Ready:** Cloud PostgreSQL (Supabase / Neon / Railway)

---

## ⚙️ Installation & Setup

```bash
## Clone the repository
git clone https://github.com/GoyalHarshit18/VoterList-Management-System.git

# Navigate to the project directory
cd VoterList-Management-System

# Install dependencies
npm install

# Configure environment variables
DB_HOST=localhost
DB_PORT=5432
DB_NAME=voter_db
DB_USER=postgres
DB_PASSWORD=your_password

# Start the backend server
npm start

## 🔐 Deployment Notes

- Local development uses local PostgreSQL  
- Production deployment uses cloud-hosted PostgreSQL  
- `localhost` is never used in production environments  
- SSL-enabled database connections are supported  

---

## 📊 Why This Project Stands Out

- Real-world voter verification logic  
- ML + rule-based hybrid approach  
- Privacy-compliant and explainable decisions  
- Scalable architecture suitable for national-level elections  

---

## 📌 Future Enhancements

- Facial recognition–based photo matching  
- Aadhaar-based secure API integration  
- Blockchain-backed audit logs  
- Advanced analytics dashboard for election authorities  

---

## 👥 Team

- **Team Name:** Innovex  
- **Project Type:** Hackathon / Academic Project  
- **Domain:** Civic Tech & Electoral Systems  

Enhance it 
