# Mekanisme Game Habitoria

Habitoria mengubah penyelesaian habit nyata menjadi pertumbuhan peradaban. Setiap habit yang diselesaikan memberi bahan bakar ekonomi, sementara konsistensi harian menentukan apakah kota berkembang atau runtuh.

---

## Konsep Inti

Habitoria menggabungkan dua loop: **habit tracker** dan **city builder**. Progres dunia nyata (menyelesaikan habit) menghasilkan sumber daya in-game (Gold, EXP, Momentum). Sumber daya tersebut dipakai untuk membangun kota, yang pada gilirannya membuka era baru, evolusi budaya, dan strategi yang lebih kompleks.

Hubungan sebab-akibatnya sederhana:

- **Konsisten** → Momentum naik → Reward lebih besar → Kota stabil → Populasi tumbuh → Era maju
- **Tidak konsisten** → Momentum turun → HP berkurang → Kota sakit → Populasi mati → Stagnan

---

## Sistem Progression

### EXP Gain
Setiap habit yang diselesaikan memberi EXP berdasarkan tipe dan momentum saat itu:

| Tipe Habit | Base EXP | Target Count |
|-----------|----------|-------------|
| Daily | 50 | 1 |
| Weekly | 250 | 3 |
| Monthly | 1000 | 10 |

Formula EXP aktual:
```
momentumMult = 1 + (momentum / 100) × 0.5    // max 1.5x
baseMultiplier = overAchievement ? 0.5 : 1
expGain = floor(expReward × baseMultiplier × momentumMult)
```

Overachievement terjadi jika jumlah completions dalam periode saat ini sudah melebihi `targetCount`.

### Level Up
Level naik saat `exp >= maxExp`. Setelah naik level:
```
newMaxExp = floor(previousMaxExp × 1.2)
```

Contoh progression:
- Level 1 → 2: butuh 1000 EXP
- Level 2 → 3: butuh 1200 EXP
- Level 3 → 4: butuh 1440 EXP
- Level 10 → 11: butuh ~6191 EXP

Skala 20% per level membuat progression semakin lambat seiring waktu.

### HP Scaling
HP awal = 100 (`DEFAULT_HP`). `maxHp` tidak berubah secara default.

HP berubah saat End Day:
- Completion rate ≥ 80%: `+10 HP`
- Completion rate < 80%: `-penalty` (max 25% dari maxHp, tiap daily yang terlewat = 5% maxHp)
- Skip Ticket terpakai: `+5 HP` (flat, mengganti perhitungan normal)

HP di-clamp antara `0` dan `maxHp`.

### Momentum Scaling
Momentum adalah angka 0–100 yang merepresentasikan konsistensi:
- Naik `+2` per habit yang diselesaikan
- End Day dengan completion ≥ 80%: `+5`
- End Day dengan completion < 80%: `-(jumlah_daily_terlewat × 10)`
- Di-clamp antara 0 dan 100

Momentum memengaruhi reward habit (hingga 1.5x) dan pendapatan pajak kota.

---

## Sistem Habit

### Tipe Habit
- **Daily** — Target 1 completion per hari. Reset streak jika tidak selesai di End Day.
- **Weekly** — Target 3 completions per minggu (periode dimulai Senin UTC).
- **Monthly** — Target 10 completions per bulan.

### Perhitungan Periode
Periode ditentukan oleh `getPeriodKey()`:
- Daily: tanggal ISO (`2025-01-15`)
- Weekly: tanggal Senin pada minggu tersebut
- Monthly: `tahun-bulan` (`2025-0`)

### Streaks
`currentStreak` bertambah `+1` setiap kali habit diselesaikan. Pada End Day, semua habit daily yang tidak selesai hari itu di-reset ke `0`.

### Reward Calculation
Saat membuat habit:
| Tipe | Gold Base | EXP Base | Target |
|------|-----------|----------|--------|
| Daily | 10 | 50 | 1 |
| Weekly | 50 | 250 | 3 |
| Monthly | 200 | 1000 | 10 |

Reward aktual saat menyelesaikan:
```
finalGold = floor(goldReward × baseMultiplier × momentumMult)
finalExp = floor(expReward × baseMultiplier × momentumMult)
```

---

## Sistem Resource

### Gold
Mata uang personal. Didapat dari habit dan gacha. Digunakan untuk:
- Recovery item (Espresso 50, Potion 200, Elysium Ticket 500)
- Skip Ticket (1500 Gold)
- Gacha (100 Gold per pull)
- Konversi ke Silver (kurs dinamis berdasarkan `dayCount`, ada fee 5%)

### Silver
Mata uang kota. Didapat dari pajak harian saat End Day. Digunakan untuk:
- Membangun bangunan (costSilver)
- Upgrade bangunan (silverCost per level)
- Konversi ke Gold (kurs dinamis)

Formula pajak harian:
```
taxes = floor(totalSilverIncome × (0.8 + (momentum / 100) × 0.4))
```
Tax multiplier dipengaruhi oleh: feudal evolution (+15%), sick ratio, kelaparan (×0.6), tunawisma (×0.7), health <40 (×0.8), health <20 (×0.5).

### Food
Diproduksi oleh bangunan (Farm, Restaurant). Dibutuhkan `2 unit × populasi` per hari. Defisit food memicu:
- Warga sakit baru: `ceil(foodDeficit / 5)`
- Penalti health (-10) dan happiness (-20)
- Tax multiplier ×0.6

### Housing
Disediakan oleh bangunan residential (House, Clone Center). Jika `populasi > totalHousing`:
- Tunawisma = `populasi - totalHousing`
- Warga sakit baru: `ceil(homelessCount / 2)`
- Penalti health (-15) dan happiness (-25)
- Tax multiplier ×0.7

### Happiness (0–100)
Dipengaruhi oleh:
- Bonus happiness dari bangunan
- Evolution bonuses (Modernist +15)
- Completion rate ≥80% di End Day: +10
- Completion rate <80%: `-(daily_terlewat × 6)`
- Bencana tipe happiness (severity dikurangkan langsung)
- Kelaparan: -20, Tunawisma: -25

### Health (0–100)
Dipengaruhi oleh:
- Bonus health dari bangunan
- Evolution bonuses (Agrarian +5, Cybernetic +50)
- Completion rate ≥80% di End Day: +5
- Completion rate <80%: `-(daily_terlewat × 4)`
- Bencana tipe health (severity dikurangkan langsung)
- Kelaparan: -10, Tunawisma: -15

---

## Sistem Kota

### Population
Pertumbuhan terjadi saat End Day jika syarat terpenuhi:
```
Syarat: !isHungry && health > 60 && population < totalHousing
Growth = ceil((totalHousing - population) × 0.1) + 1
```

### Population Sick
Warga sakit bertambah jika kondisi buruk:
```
if (isHungry || isHomeless):
  newSick = ceil(foodDeficit / 5) + ceil(homelessCount / 2)
```

Warga sakit sembuh jika health > 70:
```
recovered = ceil(populationSick × 0.3)
```

### Kematian
Death rate bergantung pada health kota:
| Health | Death Rate |
|--------|-----------|
| < 20 | 40% dari sick |
| < 50 | 15% dari sick |
| ≥ 50 | 5% dari sick |

Jika health < 10, tambahan kematian: `ceil(population × 0.05)`.

### Building Slots
Grid 10×10 (100 slot total). Setiap tile diidentifikasi oleh koordinat `(gridX, gridY)` dimana `0 ≤ gridX < 10` dan `0 ≤ gridY < 10`.

### Housing Dependency
Populasi tidak bisa melebihi kapasitas housing secara efisien. Jika populasi melebihi housing, selisihnya menjadi tunawisma yang memicu rantai penalti (sakit → kematian → penurunan tax).

### Food Dependency
Setiap warga membutuhkan 2 food per hari. Bangunan produksi food:
- Communal Farm: 25 food (×level multiplier)
- Village Restaurant: 60 food (×level multiplier)
- Population Clone Center: −50 food (konsumsi)

---

## Sistem Building

### Placement
Bangunan ditempatkan di grid 10×10 menggunakan koordinat `(gridX, gridY)`. Dokumen Firestore menggunakan ID deterministik:
```
documentId = "${gridX}_${gridY}"
```
Contoh: bangunan di koordinat (3, 7) memiliki ID dokumen `3_7`.

Sebelum placement, sistem memeriksa apakah dokumen deterministik sudah ada untuk mencegah duplikasi tile.

### Upgrade System
Setiap level upgrade menambah 20% output:
```
levelMultiplier = 1 + (level - 1) × 0.2
```
Contoh: Farm Level 3 menghasilkan `floor(25 × 1.4) = 35` food.

Upgrade membutuhkan Silver. Biaya naik seiring jumlah bangunan total:
```
constructionCostMultiplier = 1 + (totalBuildings × 0.05)
```
Evolution Nomadic (×0.9) dan Industrialist (×0.8) bisa mengurangi biaya.

### Health System
Setiap bangunan memiliki `health: 100` saat dibangun. Health bangunan bisa terdampak oleh bencana (earthquake). Bangunan dengan health 0 masih ada tetapi tidak memberikan bonus.

### Kategori Bangunan

| ID | Nama | Era | Kategori | Silver | Gold | Housing | Food | Income |
|----|------|-----|----------|--------|------|---------|------|--------|
| house | Simple House | Stone Age | residential | 100 | 0 | +10 | 0 | 0 |
| farm | Communal Farm | Stone Age | food | 80 | 0 | 0 | +25 | 0 |
| restaurant | Village Restaurant | Medieval | food | 500 | 0 | 0 | +60 | +10 |
| taxOffice | Tax Office | Medieval | economic | 1200 | 2 | −2 | 0 | +80 |
| medicalClinic | Medical Clinic | Medieval | utility | 800 | 0 | 0 | 0 | −10 |
| coffeeShop | Artisan Coffee Shop | Industrial | economic | 3000 | 10 | 0 | +10 | +150 |
| cloneCenter | Population Clone Center | Modern | special | 10000 | 100 | +200 | −50 | 0 |

Setiap bangunan juga memiliki `healthBonus` dan `happinessBonus` yang berkontribusi langsung ke stats kota.

---

## Sistem Era

### currentEra
Era saat ini dari peradaban. Ditentukan oleh milestone populasi yang tercapai. Era tidak pernah turun (no demotion).

### Unlocked Eras
Array era yang sudah pernah dicapai. Dimulai dengan `[STONE_AGE]`.

### Era Progression
Proses pengecekan terjadi di End Day:
```
Era berikutnya = eraOrder[currentIndex + 1]
Jika population >= ERA_MILESTONES[nextEra].populationTarget:
  currentEra = nextEra
```

| Era | Population Target | Min Level |
|-----|------------------|-----------|
| Stone Age | 0 | 1 |
| Medieval | 100 | 5 |
| Industrial | 500 | 15 |
| Modern | 2000 | 30 |
| Digital | 10000 | 50 |

### unlockedEvolutions
Array ID evolution branch yang sudah dibuka. Setiap branch memberikan bonus permanen selama branch tersebut ada di array.

Evolution branches tersedia:
- **nomadic** (Stone Age, Level 2) — Biaya bangunan −10%
- **agrarian** (Stone Age, Level 3) — Food +20%, Health +5%
- **feudal** (Medieval, Level 8) — Tax +15%
- **mercantile** (Medieval, Level 12) — Silver income +100
- **industrialist** (Industrial, Level 20) — Biaya upgrade −20%, Food +30%
- **modernist** (Modern, Level 35) — Happiness +15
- **cybernetic** (Digital, Level 60) — Health +50, Pop growth +50%

---

## Sistem Event

Setiap End Day memiliki peluang **15%** memunculkan bencana acak.

### Bencana

| ID | Nama | Impact Type | Severity | Deskripsi |
|----|------|------------|----------|-----------|
| plague | Mysterious Plague | health | 15 | Kesehatan kota turun drastis |
| earthquake | Tremor of Gaia | building | 5 | Merusak infrastruktur |
| famine | Great Drought | happiness | 10 | Stok makanan menipis |
| revolt | Citizen Unrest | happiness | 20 | Kebahagiaan turun tajam |

### Dampak yang Diimplementasikan
- **health**: `finalHealth = max(0, finalHealth - severity)`
- **happiness**: `finalHappiness = max(0, finalHappiness - severity)`
- **building** dan **population**: didefinisikan tetapi dampak langsungnya belum diterapkan di End Day

### Emergency Habits
Saat bencana muncul, sistem otomatis menambahkan habit daily baru:
```
addHabit(`Mitigasi: ${disaster.name}`, 'daily')
```
Habit ini muncul di keesokan hari dan memaksa pemain untuk segera bertindak.

### Interaksi dengan Kondisi Kota
Bencana bersifat acak, tetapi **dampaknya dipengaruhi manajemen kota**:
- Kota dengan food defisit dan housing kurang sudah terkena penalti kesehatan dan kebahagiaan
- Bencana menambah penalti di atas kondisi yang sudah buruk
- Pemain dengan kota sehat bisa menyerap dampak bencana tanpa kolaps

---

## Sistem Survival

### HP (Personal)
HP adalah "nyawa" pemain. Turun saat End Day buruk, naik saat hari bagus. HP rendah membuat pemain rentan terhadap rangkaian hari buruk berturut-turut.

### Health (Kota)
Menentukan death rate warga dan kapasitas recovery dari sakit. Status:
| Health | Status | Efek |
|--------|--------|------|
| ≥ 80 | Optimal | Normal |
| 60–79 | Baik | Recovery sick 30% |
| 40–59 | Fair | Tax ×0.8 |
| 20–39 | Krisis | Tax ×0.5, death rate 15% |
| < 20 | Epidemi | Tax ×0.5, death rate 40% |

### Happiness
Mempengaruhi produktivitas secara tidak langsung melalui tax multiplier dan pertumbuhan. Kebahagiaan rendah = warga tidak produktif = pendapatan pajak rendah.

### Sickness
Warga sakit (`populationSick`) adalah beban ganda:
1. Tidak menghasilkan pajak (tax multiplier dikurangi sick ratio)
2. Bisa meninggal tergantung health kota
3. Memicu efek spiral: kematian → populasi turun → produksi turun

### Death Count
`deathCount` di-track per End Day dan dilaporkan di daily report. Kematian berasal dari:
- Warga sakit yang tidak sembuh (death rate × populationSick)
- Jika health < 10: tambahan 5% dari total populasi

### Skip Ticket
Proteksi otomatis untuk hari buruk. Terpakai jika:
- Pemain punya ≥ 1 tiket
- Daily habits yang tidak selesai > 50%

Efek: HP menjadi +5 (flat), momentum tidak mendapat penalti skenario gagal berat. Tiket berkurang 1.

---

## Sistem Leaderboard

### Ranking Logic
Leaderboard adalah collection terpisah `/leaderboard/{uid}` yang diupdate setiap:
1. End Day (syncStatsAndCity + batch write)
2. Bangunan di-place atau di-upgrade (syncStatsAndCity)

### Sort Order
```
orderBy('level', 'desc')
orderBy('population', 'desc')
limit(20)
```
Ranking utama: **Level** (descending). Tiebreaker: **Population** (descending).

### Data yang Disimpan
```
displayName, photoURL, level, population, currentEra, updatedAt
```
Hanya 20 pemain teratas yang ditampilkan di UI.

---

## Daily Gameplay Flow

Contoh siklus permainan harian:

```
1. Bangun → Buka app
   └ Cek pending report dari End Day kemarin

2. Selesaikan Habits
   ├ Daily habit → +Gold, +EXP, +Momentum
   ├ Weekly habit → +Gold besar, +EXP besar
   └ Streak bertambah

3. Kelola Kota (opsional)
   ├ Bangun Farm → +Food production
   ├ Upgrade House → +Housing capacity
   └ Beli bangunan era baru jika sudah unlock

4. Shop (opsional)
   ├ Beli Espresso jika HP rendah (50 Gold → +10 HP)
   ├ Beli Skip Ticket untuk proteksi (1500 Gold)
   └ Gacha untuk reward acak (100 Gold)

5. End Day
   ├ Sistem hitung: completion rate, pajak, growth, sickness
   ├ 15% chance bencana random
   ├ Generate daily report
   ├ Update leaderboard
   ├ Reset streak daily yang tidak selesai
   └ Jika disaster → tambah emergency habit

6. Baca Report
   └ Lihat: gold gained, exp gained, population growth,
     health/happiness change, deaths, events
```

### Siklus Mingguan Ideal
- **Senin–Jumat**: Fokus daily habits, bangun ekonomi kota
- **Sabtu**: Pastikan weekly habits tercapai (3 completions)
- **Minggu**: Review weekly, upgrade bangunan strategis, siapkan weekly baru

### Kondisi Kemenangan Jangka Panjang
Tidak ada "game over" absolut, tetapi stagnasi terjadi jika:
- Populasi turun ke 0 (semua mati)
- HP terus-menerus di 0 (tidak bisa sustain)
- Momentum di 0 (reward minimal)

Target progression: capai era **Digital** dengan populasi 10.000 dan evolution **Cybernetic**.
