โปรเจค: ผจญภัยโค้ดจิ๋ว (Code Adventure Game) — ตัวอย่างโปรโตไทป์

คำอธิบาย:
  เกมสอนเขียนโปรแกรมสำหรับเด็กประถมด้วยบล็อก Blockly (ภาษาไทย)
  - รันแบบ static website (ไม่ต้อง backend)
  - บันทึกความก้าวหน้าใน localStorage (สามารถขยายเพิ่มได้)

ไฟล์สำคัญ:
  - index.html        (หน้าเว็บหลัก)
  - style.css         (สไตล์)
  - levels.js         (ข้อมูลด่าน)
  - blocks.js         (นิยามบล็อก)
  - app.js            (engine เกม, runner, UI)

วิธีรัน (ทดสอบในเครื่อง):
  1) ดาวน์โหลดไฟล์ทั้งหมดลงโฟลเดอร์
  2) เปิด terminal ในโฟลเดอร์นั้นแล้วรัน (แนะนำเพื่อหลีกเลี่ยงปัญหา CORS ของบาง CDN):
     - Python3: python -m http.server 8000
     - Node (http-server): npx http-server -c-1
  3) ไปที่ http://localhost:8000

วิธี deploy บน GitHub Pages:
  1) สร้าง repository ใหม่บน GitHub และ push ไฟล์ทั้งหมดเข้า branch main
  2) Settings > Pages > เลือก branch main / root แล้วบันทึก
  3) รอไม่กี่นาที แล้ว site จะพร้อม

ใบอนุญาต: MIT
