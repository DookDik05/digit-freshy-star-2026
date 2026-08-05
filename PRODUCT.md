# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 18 + TypeScript + Vite (frontend) · Node.js + Express.js + TypeScript + Socket.IO (backend)

## Users

**Primary:** กรรมการตัดสิน (Judges) ของงาน DIGIT FRESHY STAR 2026 — Faculty of Digital Technology, CRRU
ใช้งานบนอุปกรณ์หลากหลาย (มือถือ Android/iOS, iPad, Tablet, Notebook) ระหว่างงานจริงที่ Suphanika Hall วันที่ 10 สิงหาคม 2026

**Secondary:** Admin/ผู้ดูแลระบบ ที่ติดตามผลคะแนน real-time

## Product Purpose

ระบบให้คะแนนผู้เข้าประกวด DIGIT FRESHY STAR 2026 แบบ Real-time Single Page Application
กรรมการแต่ละท่านสามารถให้คะแนน 1–5 แก่ผู้เข้าประกวด 5 คน ใน 4 รอบการแข่งขัน
ผลคะแนนส่งทันทีผ่าน Socket.IO และแสดง Leaderboard/Podium อัตโนมัติ

## Positioning

ออกแบบเฉพาะสำหรับงาน DIGIT FRESHY STAR 2026 — ใช้ครั้งเดียวในงานจริง
เน้นความเร็ว ความแม่นยำ และการใช้งานง่ายบนมือถือในสภาพแสงน้อยของงานอีเวนต์

## Operating Context

- ใช้งานระหว่างงานอีเวนต์จริง — ไฟ dim, เสียงดัง, กรรมการใช้มือถือ/แท็บเล็ต
- กรรมการหลายท่านใช้พร้อมกันบนอุปกรณ์ต่างกัน
- 4 Rounds: เปิดตัว, Speech, ชุดนักศึกษา, ตอบคำถาม
- ผู้เข้าประกวด 5 คน: AOM, PHAN, FAHSAI, CHIT, TONAOR

## Capabilities and Constraints

- คะแนน 1–5 ต่อคนต่อรอบ (integer only)
- กรรมการระบุตัวตนด้วย Judge ID (text input, ไม่มี login)
- Real-time broadcast ผ่าน Socket.IO เมื่อมีการส่งคะแนน
- In-memory store (ไม่มี persistent DB — ข้อมูลหายเมื่อ restart server)
- Rate limiting: max 60 req/min per IP

## Brand Commitments

**ชื่อ:** DIGIT FRESHY STAR 2026 — Final Competition
**Tagline:** POWER OF TECHNOLOGY
**สังกัด:** Faculty of Digital Technology, CRRU
**วันงาน:** 10 August 2026 | At Suphanika Hall, CRRU
**Visual identity:** Dark dramatic — สีแดง (#e63012), ส้ม (#ff6b1a), ดำ (#080303)
**Font:** Orbitron (headings) + Inter (body)
**ธีม:** ธงแดงพลิ้วไหวกับไฟ — Power, Energy, Technology

## Evidence on Hand

- รูปโปรโมทผู้เข้าประกวดทั้ง 5 คน (portrait 9:16 style)
- Agenda ของงานพร้อม schedule ครบถ้วน
- Logo event และ visual assets

## Product Principles

1. **Speed over polish** — กรรมการต้องให้คะแนนได้รวดเร็วโดยไม่มี friction
2. **Mobile-first** — ออกแบบสำหรับการใช้งานบนมือถือเป็นหลัก
3. **Real-time truth** — คะแนนที่แสดงต้องตรงกับความเป็นจริงเสมอ
4. **Dramatic brand** — ทุก visual element ต้องสะท้อน energy ของงาน

## Accessibility & Inclusion

- Touch targets ขนาดใหญ่เพียงพอสำหรับการใช้งานบนมือถือ (min 44px)
- Contrast ratio สูงบน dark background
- ARIA labels บนปุ่มและ interactive elements
