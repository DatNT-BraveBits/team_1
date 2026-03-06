# Live Shopping — Nghien cuu thi truong & Chien luoc

## Co hoi thi truong

### Van de

Ty le chuyen doi e-commerce trung binh chi **2-3%**. Trang san pham thi tinh — khach hang khong the hoi, khong thay san pham thuc te, khong co cam giac gap. Trong khi do, social commerce (TikTok Shop, Instagram Live) dang keo khach ra khoi cua hang Shopify.

### Quy mo thi truong

- Live commerce dat **$512B tai Trung Quoc (2023)**, du kien dat **$55B tai My vao 2026** (Coresight Research).
- **72% nguoi tieu dung** thich video hon van ban khi tim hieu san pham (Wyzowl).
- Shopify hien **khong co giai phap live shopping native** — merchant phai dung app ben thu ba hoac platform ngoai.

### Ai can tinh nang nay

| Phan khuc | Van de gap phai |
|-----------|----------------|
| Thuong hieu thoi trang & lam dep | Can show chat lieu, mau sac, form dang truc tiep |
| Thuong hieu nho chua co follower | Khong the dua vao TikTok/IG — can ban ngay tren store cua minh |
| San pham gia cao / phuc tap | Khach can hoi dap truoc khi mua |
| Brand chay drop/launch | Can su gap gap + tuong tac real-time |

---

## Giai phap cua chung toi

**Live shopping tich hop truc tiep vao cua hang Shopify** — khong redirect, khong platform ben ngoai.

### Tinh nang chinh

**Cho Merchant (Admin)**
- Tao phien livestream voi danh muc san pham
- Stream truc tiep tu trinh duyet (webcam) — khong can OBS
- Ghim/highlight san pham trong luc stream
- Chat real-time voi nguoi xem
- Ho tro RTMP cho setup chuyen nghiep

**Cho Khach hang (Storefront)**
- Xem livestream ngay tren cua hang (theme block)
- Chat truc tiep voi host va nguoi xem khac
- **Tro ly mua sam AI** — hoi bat ky cau hoi nao ve san pham ngay trong stream
- Thay san pham duoc ghim voi nut "Mua ngay"
- Duyet toan bo san pham trong phien stream

### Loi the ky thuat

- **Low-latency HLS** qua Mux — do tre chi 1-4 giay (gan real-time)
- **Stream tu trinh duyet** — ffmpeg xu ly encoding, merchant chi can bam "Go Live"
- **AI Q&A** — Vercel AI SDK voi day du thong tin san pham, tra loi ve size, gia, ton kho
- **Theme extension** — keo tha vao bat ky theme Shopify nao, khong can code

---

## So sanh doi thu

| Tinh nang | Giai phap cua chung toi | Livescale | CommentSold | TikTok Shop |
|-----------|------------------------|-----------|-------------|-------------|
| Tich hop native Shopify | Co (theme block) | 1 phan | Khong | Khong |
| Stream tu trinh duyet | Co | Khong (can OBS) | Khong | Chi mobile app |
| Tro ly AI | Co | Khong | Khong | Khong |
| Khong can redirect | Co | Co | Khong | Khong |
| Gia | Gom trong app | $49-299/thang | $49-499/thang | Mien phi (nhung mat khach hang) |

**Diem khac biet cot loi:** Tro ly AI + stream tu trinh duyet + embed native vao storefront. Khong app live shopping nao tren Shopify co du ca 3.

---

## Chien luoc Marketing

### Dinh vi

> "Bien cua hang Shopify thanh kenh live shopping — stream tu trinh duyet, ban hang real-time, de AI tra loi khach hang."

### Kenh trien khai

1. **Shopify App Store** — toi uu keyword: "live shopping", "live selling", "live stream"
2. **Shopify community forums** — dang case study / video demo
3. **Twitter/X & LinkedIn** — clip ngan demo: trinh duyet -> livestream -> khach mua hang
4. **YouTube** — "Cach them live shopping vao Shopify store trong 2 phut"

### Goc noi dung

- "Dung de mat khach vao TikTok Shop — ban live ngay tren store CUA BAN"
- "Khong OBS, khong setup, khong can biet ky thuat — chi can bam Go Live"
- "Tro ly AI ban hang hoat dong suot phien live"

### Lo trinh ra mat

| Tuan | Hanh dong |
|------|-----------|
| 1 | Quay video demo + dang App Store listing |
| 2 | Lien he 20 merchant Shopify de test va lay feedback |
| 3 | Xuat ban noi dung huong dan (YouTube + blog) |
| 4 | Thu thap danh gia, cap nhat theo feedback |

### Chi so do luong

- **Ty le chuyen doi trong phien live** so voi trang san pham thuong
- **Thoi gian xem trung binh** moi nguoi xem
- **Ty le tuong tac chat** (so tin nhan / nguoi xem)
- **Muc do su dung AI** (so cau hoi / phien)
