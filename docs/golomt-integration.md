# Голомт интеграц — API баримт бичиг

Огноо: 2026-08-10

Энэ баримт нь хоёр хэсэгтэй:

1. **Core систем дээр үүсгэх ёстой endpoint** — энэ систем (gateway) core систем рүү дуудна.
2. **Энэ систем дээр нэмэгдсэн endpoint-ууд** — core систем болон бусад дуудагч ашиглана.

---

## 1. Core систем дээр үүсгэх ёстой endpoint

### 1.1 Гүйлгээ бүртгэх (batch)

Gateway 2 минут тутамд core-д бүртгэгдээгүй (`PENDING`) банкны гүйлгээнүүдийг
**нэг багцаар** илгээнэ. Core систем дараах endpoint-ийг үүсгэнэ:

```
POST <HES_TRANSACTION_URI>
Content-Type: application/json
X-Api-Key: <HES_API_KEY>
```

Body — гүйлгээний массив (нэг удаад дээд тал нь 100):

```json
[
    {
        "id": 15,
        "accountId": "1105001234",
        "tranId": "122213110",
        "tranPostedDate": "2026-08-10",
        "currency": "MNT",
        "amount": 150000.0,
        "drOrCr": "CR",
        "relatedAccount": "5041234567",
        "description": "Fee CUST100234"
    }
]
```

| Талбар         | Төрөл          | Тайлбар                                        |
| -------------- | -------------- | ---------------------------------------------- |
| id             | int            | Gateway дээрх гүйлгээний дугаар (давхардахгүй) |
| accountId      | string         | Хуулга татсан данс (өөрийн данс)               |
| tranId         | string\|null   | Банкны гүйлгээний дугаар                       |
| tranPostedDate | string\|null   | Гүйлгээ бүртгэгдсэн огноо                      |
| currency       | string\|null   | Валют                                          |
| amount         | number\|null   | Дүн                                            |
| drOrCr         | string\|null   | Дебит/Кредит                                   |
| relatedAccount | string\|null   | Харьцсан данс                                  |
| description    | string\|null   | Гүйлгээний утга                                |

**Хариу:** HTTP `200` = амжилттай. 200 ирсэн тохиолдолд gateway гүйлгээнүүдийг
`REGISTERED` болгоно. Өөр ямар ч хариу ирвэл `PENDING` хэвээр үлдэж дараагийн
ажиллагаанд **дахин илгээгдэнэ** — тиймээс core тал `id` (эсвэл `refno`)-оор
давхардал шалгаж idempotent байдлаар хүлээж авах шаардлагатай.

### 1.2 Төлбөрийн статус (аль хэдийн байгаа)

Payment check үед gateway дараах руу илгээдэг (одоо ажиллаж буй):

```
POST https://bds.techfi.mn/bdc/api/kyc/payment_status
X-Api-Key: <HES_API_KEY>
```

```json
{
    "uid": "CUST100234",
    "date": "2026-07-29T10:30:00Z",
    "amount": 150000.0,
    "curCode": "MNT",
    "terminalId": "222",
    "description": "Fee CUST100234",
    "type": "FEE",
    "transaction": "122213110"
}
```

`type`: `FEE` эсвэл `DEPOSIT` (gateway дээр `CHARGE` → `DEPOSIT` болж хувирна).
HTTP `200` = амжилттай.

---

## 2. Энэ систем дээр нэмэгдсэн endpoint-ууд

### 2.1 Төлбөр (NEGDI)

#### POST /api/payment/link — төлбөрийн линк үүсгэх

```json
{
    "custid": "CUST100234",
    "amount": 10000,
    "currency": "MNT",
    "txntype": "FEE",
    "action": "QR"
}
```

- `txntype`: `FEE` | `CHARGE`
- `action`: `QR` (→ NEGDI `QPAY`) | `CARD` (→ NEGDI `3dsOrder`)
- `currency`: заавал биш, default `MNT`

Хариу:

```json
{ "code": 0, "response": { "negdiurl": "http://.../pay?tranid=...&checkid=..." }, "title": "Success" }
```

#### GET /api/payment/check?tranid=...&checkid=... — төлбөр шалгах

NEGDI төлбөрийн дараа `returnurl` руу энэ хэлбэрээр redirect хийнэ. Gateway
гүйлгээг олж core руу payment_status илгээгээд **result.html** хуудас руу
шилжүүлнэ (`/result?result=success|fail`). Амжилттай бол payment мөрийн статус
`Notified` болно.

### 2.2 Голомт банк

Бүх endpoint **IP allowlist** (`ALLOWED_IPS`) ба **X-Api-Key** (`X_API_KEY`)
шалгалттай:

```
X-Api-Key: <X_API_KEY>
```

#### POST /api/golomt/withdraw — зарлага (шилжүүлэг)

```json
{
    "type": "OPERATING",
    "custid": "CUST100234",
    "acctName": "Бат Болд",
    "acctNo": "5041234567",
    "bank": "04",
    "amount": 50000,
    "currency": "MNT",
    "registerNumber": "АА00000000",
    "description": "buцаалт"
}
```

- `type` — **шилжүүлэгч дансны төрөл** (bank_account хүснэгтээс сонгогдоно, байхгүй бол алдаа 2004)
- `acctName`/`acctNo`/`bank` — хүлээн авагчийн мэдээлэл (bank = банкны код)
- `custid`, `registerNumber`, `description` — заавал биш

Алхам бүр статусаар хянагдана (`withdraw` хүснэгт):
`PENDING` → шилжүүлэг амжилттай `TRANSFERRED` → лавлагаа амжилттай `CONFIRMED`.
Алдаа гарвал `TRANSFER_FAILED` / `CONFIRM_FAILED` + `error` талбарт шалтгаан.

Хариу — withdraw мөр (id, status, clientId/state/scope, банкны хариунууд).

#### POST /api/golomt/statement — хуулга татах (гараар)

```json
{ "accountId": "1105001234", "startDate": "2026-08-01", "endDate": "2026-08-10" }
```

Шинэ гүйлгээнүүд `bank_transaction` хүснэгтэд `PENDING` статустай хадгалагдана
(давхардал hash-аар шалгагдана). Хариу: `{ total, saved, statements: [...] }`.

#### POST /api/golomt/account — данс бүртгэх/засах

```json
{
    "type": "OPERATING",
    "bank": "15",
    "account": "1105001234",
    "name": "Mandal Capital",
    "currency": "MNT",
    "statement": true
}
```

- `type` давхардахгүй — дахин илгээвэл шинэчилнэ (upsert)
- `statement: true` — энэ дансны хуулгыг автомат жоб татна

#### GET /api/golomt/accounts — бүртгэлтэй данснууд

#### GET /api/golomt/rate?currency=MNT — ханшийн мэдээлэл

Голомтоос шууд лавлаад хариулна (хадгалахгүй).

### 2.3 Автомат жобууд

| Жоб       | Давтамж | Үүрэг                                                                  |
| --------- | ------- | ---------------------------------------------------------------------- |
| statement | 4 мин   | `statement: true` данснуудын хуулга татаж шинэ гүйлгээ хадгална        |
| register  | 2 мин   | `PENDING` гүйлгээнүүдийг core руу багцаар илгээнэ (§1.1)                |

Жоб бүрийн ажиллагаа `job_run` хүснэгтэд бүртгэгдэнэ (`RUNNING`/`DONE`/`FAILED`).
Өмнөх ажиллагаа дуусаагүй бол дараагийнх алгасна; 3 интервал дотор дуусаагүй
ажиллагаа `FAILED` болно.

---

## 3. Тохиргоо (орчны хувьсагч)

| Хувьсагч            | Тайлбар                                              |
| ------------------- | ---------------------------------------------------- |
| HES_TRANSACTION_URI | §1.1 core endpoint URL (заагаагүй бол жоб унтарна)   |
| HES_PAYMENT_URI     | §1.2 payment_status URL                              |
| X_API_KEY           | Голомт endpoint-уудын API түлхүүр                    |
| ALLOWED_IPS         | IP allowlist, таслалаар (хоосон бол шалгахгүй)       |
| GOLOMT_URL/…        | Голомт CGW холболтын тохиргоо                        |
| NEGDI_URI/…         | NEGDI төлбөрийн системийн тохиргоо                   |
