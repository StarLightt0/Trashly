export const initialCategories = [
  {
    id: 1,
    name: "Sampah Organik",
    slug: "organik",
    color: "#16A34A", // green-600
    badge_bg: "#DCFCE7",
    badge_text: "#15803D",
    description: "Sampah yang berasal dari sisa makhluk hidup dan dapat terurai secara alami oleh mikroorganisme tanah (biodegradable).",
    icon: "Leaf"
  },
  {
    id: 2,
    name: "Sampah Anorganik",
    slug: "anorganik",
    color: "#2563EB", // blue-600
    badge_bg: "#DBEAFE",
    badge_text: "#1D4ED8",
    description: "Sampah dari bahan non-hayati atau sintetis yang sulit terurai secara alami, namun sebagian besar dapat didaur ulang.",
    icon: "Recycle"
  },
  {
    id: 3,
    name: "Sampah B3 (Berbahaya & Beracun)",
    slug: "b3",
    color: "#DC2626", // red-600
    badge_bg: "#FEE2E2",
    badge_text: "#B91C1C",
    description: "Limbah yang mengandung zat berbahaya atau beracun yang dapat merusak lingkungan dan kesehatan manusia jika tidak ditangani khusus.",
    icon: "AlertTriangle"
  },
  {
    id: 4,
    name: "Sampah Residu",
    slug: "residu",
    color: "#6B7280", // gray-500
    badge_bg: "#F3F4F6",
    badge_text: "#374151",
    description: "Sampah yang tidak dapat didaur ulang maupun dikomposkan karena keterbatasan teknologi daur ulang atau telah terkontaminasi berat.",
    icon: "Trash2"
  },
  {
    id: 5,
    name: "E-Waste (Elektronik)",
    slug: "e-waste",
    color: "#9333EA", // purple-600
    badge_bg: "#F3E8FF",
    badge_text: "#7E22CE",
    description: "Peralatan listrik dan elektronik yang sudah tidak terpakai dan mengandung logam berharga sekaligus logam berat berbahaya.",
    icon: "Cpu"
  }
];

export const initialWasteItems = [
  {
    id: 1,
    category_id: 2,
    name: "Botol Plastik PET (Kode 1)",
    slug: "botol-plastik-pet",
    image_url: "https://images.unsplash.com/photo-1526951521990-620dc14c214b?auto=format&fit=crop&w=800&q=80",
    decomposition_time: "450 tahun",
    is_recyclable: 1,
    impact_level: "Tinggi",
    summary: "Botol minuman bening seperti air mineral dan soda yang paling umum ditemukan.",
    disposal_steps: JSON.stringify([
      "Kosongkan seluruh cairan yang tersisa di dalam botol.",
      "Lepaskan label plastik dan pisahkan tutup botolnya.",
      "Bilas bagian dalam dengan sedikit air agar tidak mengundang semut/bakteri.",
      "Remas atau pipihkan botol untuk menghemat volume tempat sampah.",
      "Setorkan ke Bank Sampah terdekat atau titik pengumpulan daur ulang."
    ]),
    recycling_potential: "Dapat didaur ulang menjadi serat polyester (bahan pakaian, karpet), botol baru rPET, atau kerajinan tangan.",
    danger_notes: "Jika dibakar mengeluarkan gas karsinogenik (dioksin). Jika terfragmentasi di laut menjadi mikroplastik yang meracuni rantai makanan."
  },
  {
    id: 2,
    category_id: 1,
    name: "Sisa Buah & Sayur",
    slug: "sisa-buah-sayur",
    image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    decomposition_time: "1 - 4 minggu",
    is_recyclable: 1,
    impact_level: "Rendah",
    summary: "Kulit pisang, sisa potongan sayuran, ampas buah, dan sisa bahan dapur nabati.",
    disposal_steps: JSON.stringify([
      "Pisahkan dari plastik pembungkus, karet gelang, atau staples.",
      "Potong kecil-kecil untuk mempercepat proses dekomposisi.",
      "Masukkan ke dalam komposter rumah tangga atau lubang biopori.",
      "Dapat diolah dengan teknik Eco-Enzyme (kulit buah + gula merah + air) untuk pembersih alami."
    ]),
    recycling_potential: "Dapat diubah menjadi pupuk kompos organik bernutrisi tinggi, pakan maggot BSF, atau cairan serbaguna Eco-Enzyme.",
    danger_notes: "Jika membusuk di TPA tanpa oksigen (kondisi anaerob), menghasilkan gas metana (CH4) yang memicu efek rumah kaca 25x lebih kuat dari CO2."
  },
  {
    id: 3,
    category_id: 2,
    name: "Kardus & Kertas Karton",
    slug: "kardus-karton",
    image_url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
    decomposition_time: "2 - 5 bulan",
    is_recyclable: 1,
    impact_level: "Sedang",
    summary: "Kardus paket belanja online, kotak sereal, dan lembaran karton bersih.",
    disposal_steps: JSON.stringify([
      "Buka segel selotip, lakban bening, dan staples logam.",
      "Lipat kardus hingga pipih agar rapi dan hemat tempat.",
      "Jaga agar tetap kering dan jangan sampai terkena minyak atau sisa makanan.",
      "Ikat rapi dengan tali dan serahkan ke pengepul atau bank sampah."
    ]),
    recycling_potential: "Sangat tinggi! Serat kardus dapat didaur ulang hingga 5-7 kali menjadi kardus kemasan baru atau kertas kraft.",
    danger_notes: "Kardus yang basah dan berjamur kehilangan nilai daur ulang dan sering kali berakhir menjadi tumpukan sampah di TPA."
  },
  {
    id: 4,
    category_id: 3,
    name: "Baterai Bekas (Alkaline & Litium)",
    slug: "baterai-bekas",
    image_url: "https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=600&q=80",
    decomposition_time: "100 tahun (beracun selamanya)",
    is_recyclable: 1,
    impact_level: "Sangat Berbahaya",
    summary: "Baterai jam dinding, remote TV, baterai smartphone, dan powerbank.",
    disposal_steps: JSON.stringify([
      "JANGAN PERNAH buang ke tempat sampah umum atau membakarnya.",
      "Lapisi kutub positif dan negatif baterai dengan isolasi bening untuk mencegah korsleting.",
      "Kumpulkan dalam wadah plastik atau toples kaca kering khusus limbah B3.",
      "Antarkan ke drop box e-waste di mal, dinas lingkungan hidup, atau bank sampah bersertifikasi B3."
    ]),
    recycling_potential: "Logam berat seperti kadmium, nikel, dan kobalt dapat diekstrak kembali oleh pabrik pengolah limbah B3 berizin.",
    danger_notes: "Mengandung merkuri, asam sulfat, dan timbal yang dapat merembes mencemari air tanah dan menyebabkan kanker serta kerusakan saraf jika tertelan makhluk hidup."
  },
  {
    id: 5,
    category_id: 2,
    name: "Kaleng Minuman Aluminium",
    slug: "kaleng-aluminium",
    image_url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
    decomposition_time: "80 - 200 tahun",
    is_recyclable: 1,
    impact_level: "Sedang",
    summary: "Kaleng minuman bersoda, jus, dan kaleng susu olahan.",
    disposal_steps: JSON.stringify([
      "Bilas sisa minuman manis di dalam kaleng dengan air.",
      "Pipihkan atau injak kaleng untuk menghemat tempat penyimpanan.",
      "Kumpulkan dalam kantong khusus kaleng logam.",
      "Jual atau donasikan ke Bank Sampah terdekat."
    ]),
    recycling_potential: "Aluminium dapat didaur ulang tanpa batas (infinite recycling) tanpa kehilangan kualitasnya, menghemat 95% energi dibanding produksi aluminium primer.",
    danger_notes: "Penambangan bijih bauksit untuk aluminium murni merusak hutan dan menghasilkan limbah lumpur merah beracun."
  },
  {
    id: 6,
    category_id: 4,
    name: "Masker Medis Sekali Pakai",
    slug: "masker-medis",
    image_url: "https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=600&q=80",
    decomposition_time: "450 tahun",
    is_recyclable: 0,
    impact_level: "Tinggi & Infeksius",
    summary: "Masker bedah 3-ply atau N95 yang mengandung lapisan serat mikro polypropylene sintetis.",
    disposal_steps: JSON.stringify([
      "Gunting tali elastis masker agar tidak menjerat satwa liar di alam terbuka.",
      "Semprotkan cairan disinfektan atau air sabun untuk membunuh kuman.",
      "Bungkus rapat dalam kantong plastik terpisah.",
      "Buang ke tempat sampah kategori RESIDU (warna abu-abu/hitam)."
    ]),
    recycling_potential: "Belum umum didaur ulang secara publik karena potensi limbah medis infeksius (hanya dengan teknologi pirolisis industri tertentu).",
    danger_notes: "Tali masker kerap menjerat burung dan penyu laut. Serat plastiknya terurai menjadi jutaan mikroplastik beracun."
  },
  {
    id: 7,
    category_id: 3,
    name: "Minyak Jelantah (Used Cooking Oil)",
    slug: "minyak-jelantah",
    image_url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
    decomposition_time: "Sangat lama & menyumbat air",
    is_recyclable: 1,
    impact_level: "Tinggi",
    summary: "Sisa minyak goreng bekas pakai rumah tangga atau pedagang makanan.",
    disposal_steps: JSON.stringify([
      "Biarkan minyak hingga benar-benar dingin setelah memasak.",
      "Saring dari sisa remah makanan atau kotoran penggorengan.",
      "Tuangkan ke dalam botol jeriken plastik bertutup rapat.",
      "Setorkan ke komunitas pengumpul minyak jelantah atau bank sampah (sering dihargai Rp 5.000 - Rp 8.000/liter!)."
    ]),
    recycling_potential: "Bahan baku bernilai tinggi untuk pembuatan bahan bakar ramah lingkungan Biodiesel (B100) dan lilin aromaterapi.",
    danger_notes: "DILARANG menuang ke wastafel! Minyak akan membeku membentuk bongkahan 'fatberg' yang menyumbat saluran pipa kota dan menutupi permukaan air danau/sungai hingga ikan mati kehabisan oksigen."
  },
  {
    id: 8,
    category_id: 5,
    name: "Smartphone & Aksesoris Elektronik",
    slug: "smartphone-rusak",
    image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
    decomposition_time: "1000+ tahun",
    is_recyclable: 1,
    impact_level: "Tinggi & Logam Berat",
    summary: "Handphone jadul, kabel charger putus, powerbank mati, dan earphone rusak.",
    disposal_steps: JSON.stringify([
      "Lakukan factory reset jika perangkat masih dapat menyala untuk menghapus data pribadi.",
      "Lepaskan kartu SIM dan MicroSD.",
      "Jangan membongkar paksa baterai yang kembung.",
      "Kumpulkan dalam satu wadah dan bawa ke Dropbox E-Waste terdaftar."
    ]),
    recycling_potential: "Komponen motherboard mengandung emas, perak, tembaga, dan paladium murni yang dapat diekstraksi kembali melalui urban mining.",
    danger_notes: "Mengandung timbal, brominated flame retardants (BFR), dan merkuri yang memicu kerusakan ginjal serta polusi udara jika dibakar sembarangan."
  },
  {
    id: 9,
    category_id: 4,
    name: "Styrofoam (Gabus Wadah Makanan)",
    slug: "styrofoam-makanan",
    image_url: "https://images.unsplash.com/photo-1594498653385-d5172c532c00?auto=format&fit=crop&w=600&q=80",
    decomposition_time: "500+ tahun (hampir tidak hancur)",
    is_recyclable: 0,
    impact_level: "Sangat Berbahaya",
    summary: "Kotak makanan gabus putih dari polystyrene yang rapuh dan mudah terbang.",
    disposal_steps: JSON.stringify([
      "Bersihkan dari sisa kuah atau minyak makanan.",
      "Patahkan menjadi ukuran lebih kecil dan masukkan ke kantong residu.",
      "Paling bijak: HINDARI penggunaannya sejak awal dengan membawa kotak makan sendiri (tumbler/lunch box)."
    ]),
    recycling_potential: "Sangat rendah di fasilitas daur ulang konvensional karena 95% komposisinya adalah udara, sehingga tidak ekonomis untuk ditransportasikan.",
    danger_notes: "Jika bersentuhan dengan makanan panas/berminyak, monomer stirena berisiko bermigrasi ke makanan yang bersifat karsinogenik (pemicu kanker)."
  }
];

export const initialQuizzes = [
  {
    id: 1,
    title: "Tantangan Pilah Sampah Rumah Tangga",
    slug: "pilah-sampah-rumah-tangga",
    description: "Uji seberapa cermat Anda membedakan sampah organik, anorganik, dan residu yang ada di dapur dan rumah setiap hari.",
    difficulty: "Mudah",
    duration_minutes: 5,
    reward_points: 100,
    icon: "Recycle",
    badge_name: "Master Pemilah Pemula"
  },
  {
    id: 2,
    title: "Detektif Limbah B3 & Elektronik (E-Waste)",
    slug: "b3-dan-e-waste",
    description: "Ketahui bahaya tersembunyi dari baterai bekas, lampu neon pecah, minyak jelantah, dan komponen gadget yang tidak terpakai.",
    difficulty: "Menengah",
    duration_minutes: 6,
    reward_points: 150,
    icon: "AlertTriangle",
    badge_name: "Penjaga Bahaya Toksik"
  }
];

export const initialQuestions = [
  // Quiz 1 Questions
  {
    id: 1,
    quiz_id: 1,
    question_text: "Kulit pisang dan sisa potongan sayuran dari dapur termasuk ke dalam kategori sampah apa?",
    options: JSON.stringify([
      "Sampah Anorganik",
      "Sampah Organik",
      "Sampah Residu",
      "Limbah B3"
    ]),
    correct_answer: "Sampah Organik",
    explanation: "Sisa makanan dan tumbuhan mudah diurai secara alami oleh mikroorganisme tanah dan dapat diolah menjadi kompos atau pupuk cair."
  },
  {
    id: 2,
    quiz_id: 1,
    question_text: "Sebelum botol plastik PET bekas air mineral disetorkan ke Bank Sampah, langkah apa yang paling tepat dilakukan?",
    options: JSON.stringify([
      "Dibakar di pekarangan agar ringkas",
      "Dikosongkan, dibilas dengan sedikit air, dilepas labelnya, lalu dipipihkan",
      "Diisi batu atau pasir agar berat saat ditimbang",
      "Dibiarkan dengan sisa air manis di dalamnya"
    ]),
    correct_answer: "Dikosongkan, dibilas dengan sedikit air, dilepas labelnya, lalu dipipihkan",
    explanation: "Membilas botol mencegah timbulnya semut/bakteri, sedangkan memipihkannya menghemat kapasitas ruang tempat sampah hingga 70%."
  },
  {
    id: 3,
    quiz_id: 1,
    question_text: "Popok bayi sekali pakai, tisu basah kotor, dan pembalut digolongkan ke dalam wadah sampah apa?",
    options: JSON.stringify([
      "Sampah Organik Kompos",
      "Sampah Residu (Non-Recyclable)",
      "Sampah Anorganik Plastik",
      "Limbah E-Waste"
    ]),
    correct_answer: "Sampah Residu (Non-Recyclable)",
    explanation: "Barang-barang ini mengandung gel kimia penyerap dan terkontaminasi cairan tubuh, sehingga tidak higienis dan belum dapat didaur ulang konvensional."
  },
  {
    id: 4,
    quiz_id: 1,
    question_text: "Apa urutan prioritas yang benar dari prinsip dasar hierarki 3R dalam pengelolaan sampah?",
    options: JSON.stringify([
      "Recycle -> Reuse -> Reduce",
      "Reduce (Kurangi) -> Reuse (Gunakan Kembali) -> Recycle (Daur Ulang)",
      "Replace -> Repair -> Refund",
      "Reuse -> Recycle -> Remove"
    ]),
    correct_answer: "Reduce (Kurangi) -> Reuse (Gunakan Kembali) -> Recycle (Daur Ulang)",
    explanation: "Tindakan paling utama adalah 'Reduce' (mencegah timbulnya sampah sejak awal), disusul 'Reuse' memakai ulang barang, dan terakhir 'Recycle' daur ulang."
  },
  {
    id: 5,
    quiz_id: 1,
    question_text: "Berapa lama estimasi waktu yang dibutuhkan oleh botol plastik sintetis untuk terurai secara alami di tanah?",
    options: JSON.stringify([
      "1 sampai 2 tahun",
      "10 sampai 20 tahun",
      "Sekitar 450 tahun",
      "Hanya 6 bulan"
    ]),
    correct_answer: "Sekitar 450 tahun",
    explanation: "Plastik PET berbahan polietilen sangat stabil secara kimiawi, membutuhkan waktu hingga 450 tahun di TPA dan berisiko hancur menjadi mikroplastik berbahaya."
  },

  // Quiz 2 Questions
  {
    id: 6,
    quiz_id: 2,
    question_text: "Baterai bekas remote TV atau jam dinding dilarang dibuang ke tempat sampah biasa karena mengandung...",
    options: JSON.stringify([
      "Logam berat beracun seperti merkuri, kadmium, dan timbal",
      "Zat gula buatan yang mengundang serangga",
      "Oksigen konsentrasi tinggi",
      "Mineral kalsium murni"
    ]),
    correct_answer: "Logam berat beracun seperti merkuri, kadmium, dan timbal",
    explanation: "Jika lapisan baterai bocor di tanah, logam beratnya akan mencemari air sumur penduduk dan memicu kerusakan saraf permanen."
  },
  {
    id: 7,
    quiz_id: 2,
    question_text: "Jika Anda memiliki sisa minyak goreng bekas (minyak jelantah), tindakan apa yang PALING DILARANG?",
    options: JSON.stringify([
      "Menampungnya di jeriken plastik tertutup",
      "Menyetorkannya ke komunitas pengolah biodiesel",
      "Menuangkannya langsung ke saluran wastafel dapur atau got",
      "Menggunakannya sebagai bahan baku lilin aromaterapi"
    ]),
    correct_answer: "Menuangkannya langsung ke saluran wastafel dapur atau got",
    explanation: "Minyak jelantah akan membeku dan menggumpal di pipa (fatberg) hingga menyumbat saluran kota serta meracuni lapisan permukaan air sungai."
  },
  {
    id: 8,
    quiz_id: 2,
    question_text: "Smartphone yang mati total dan kabel charger yang terkelupas sebaiknya ditangani dengan cara apa?",
    options: JSON.stringify([
      "Ditanam di bawah pohon halaman rumah",
      "Diserahkan ke Dropbox E-Waste terdaftar atau toko elektronik resmi",
      "Dibakar bersama tumpukan daun kering",
      "Dibuang ke tong sampah organik"
    ]),
    correct_answer: "Diserahkan ke Dropbox E-Waste terdaftar atau toko elektronik resmi",
    explanation: "Komponen elektronik mengandung logam mulia (emas, tembaga) yang dapat didaur ulang via urban mining serta bahan beracun BFR yang berbahaya jika dibakar."
  },
  {
    id: 9,
    quiz_id: 2,
    question_text: "Sebelum mengumpulkan baterai litium atau alkaline bekas, tindakan keamanan apa yang disarankan pada kedua kutubnya?",
    options: JSON.stringify([
      "Menutup kutub positif dan negatif dengan selotip/isolasi bening",
      "Merendamnya di air dingin",
      "Memukul kutubnya sampai penyok",
      "Mengolesinya dengan minyak goreng"
    ]),
    correct_answer: "Menutup kutub positif dan negatif dengan selotip/isolasi bening",
    explanation: "Menutup kutub dengan pita isolator mencegah risiko korsleting atau timbulnya percikan api saat baterai saling bersentuhan dalam wadah penampung."
  },
  {
    id: 10,
    quiz_id: 2,
    question_text: "Mengapa pecahan lampu neon (CFL) tidak boleh langsung disentuh dan ruangannya harus segera diberi ventilasi?",
    options: JSON.stringify([
      "Karena melepaskan uap merkuri (raksa) yang berbahaya bagi sistem pernapasan",
      "Karena dapat menarik medan magnet petir",
      "Karena mengandung zat pemutih baju",
      "Karena baunya membuat mengantuk"
    ]),
    correct_answer: "Karena melepaskan uap merkuri (raksa) yang berbahaya bagi sistem pernapasan",
    explanation: "Lampu neon menggunakan uap merkuri untuk memancarkan cahaya. Jika pecah, segera buka jendela dan hindari menghirup udaranya."
  }
];

export const initialDropPoints = [
  {
    id: 1,
    name: "Bank Sampah Bersinar (BSB) Pusat",
    city: "Bandung",
    address: "Jl. Terusan Bojongsoang No.174, Baleendah, Kec. Baleendah, Kabupaten Bandung, Jawa Barat 40375",
    accepted_types: JSON.stringify(["Plastik", "Kertas", "Kardus", "Logam/Kaleng", "Minyak Jelantah"]),
    opening_hours: "Senin - Sabtu: 08.00 - 16.00 WIB",
    contact_phone: "+62 811-2345-678",
    incentive: "Tabungan Rupiah, Emas Pegadaian, dan Sembako Ramah Lingkungan",
    latitude: -6.994500,
    longitude: 107.630806,
    map_link: "https://www.google.com/maps/search/?api=1&query=Bank+Sampah+Bersinar+Pusat+Jl+Terusan+Bojongsoang+No+174+Baleendah+Bandung"
  },
  {
    id: 2,
    name: "Bank Sampah Induk (BSI) Kota Bandung",
    city: "Bandung",
    address: "Jl. Terusan Bojongsoang No.174, Baleendah, Kec. Baleendah, Kabupaten Bandung, Jawa Barat 40375",
    accepted_types: JSON.stringify(["Plastik PET", "Kardus", "Kertas HVS", "Kaleng Aluminium", "Kaca Botol"]),
    opening_hours: "Senin - Jumat: 08.30 - 15.30 WIB",
    contact_phone: "+62 822-1234-5678",
    incentive: "Uang tunai per kilogram atau saldo dompet digital (Gopay/OVO)",
    latitude: -6.898333,
    longitude: 107.662917,
    map_link: "https://www.google.com/maps/search/?api=1&query=Bank+Sampah+Induk+Kota+Bandung+Jl+Terusan+Bojongsoang+No+174+Baleendah+Bandung"
  },
  {
    id: 3,
    name: "Dropbox E-Waste Dinas Lingkungan Hidup Bandung",
    city: "Bandung",
    address: "Jl. Sadang Tengah No.4-6, Sekeloa, Kecamatan Coblong, Kota Bandung, Jawa Barat 40133",
    accepted_types: JSON.stringify(["E-Waste", "Baterai Bekas", "Lampu Neon", "Kabel & Charger", "Ponsel Rusak"]),
    opening_hours: "Senin - Jumat: 08.00 - 16.00 WIB",
    contact_phone: "+62 22 423-2287",
    incentive: "Lencana Resmi Eco Hero & Penanganan Limbah B3 Bersertifikasi",
    latitude: -6.890722,
    longitude: 107.625278,
    map_link: "https://www.google.com/maps/search/?api=1&query=Dropbox+E-Waste+Dinas+Lingkungan+Hidup+Jl+Sadang+Tengah+No+4-6+Sekeloa+Coblong+Bandung"
  },
  {
    id: 4,
    name: "Bank Sampah Induk Satu Hati Jakarta",
    city: "Jakarta",
    address: "Blk. B, RT.5/RW.5, Cengkareng Bar., Kecamatan Cengkareng, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11830",
    accepted_types: JSON.stringify(["Plastik", "Kertas", "Minyak Jelantah", "Logam", "Elektronik Kecil"]),
    opening_hours: "Senin - Sabtu: 08.00 - 15.00 WIB",
    contact_phone: "+62 813-8899-7766",
    incentive: "Pencairan Tabungan Bank DKI & Konversi Emas Antam",
    latitude: -6.142000,
    longitude: 106.719111,
    map_link: "https://www.google.com/maps/search/?api=1&query=Bank+Sampah+Induk+Satu+Hati+Blk+B+Cengkareng+Barat+Jakarta+Barat"
  },
  {
    id: 5,
    name: "Bank Sampah Induk Surabaya (BSI Surabaya)",
    city: "Surabaya",
    address: "Jl. Raya Menur No.31-A, Manyar Sabrangan, Kec. Mulyorejo, Surabaya, Jawa Timur 60116",
    accepted_types: JSON.stringify(["Plastik", "Kardus", "Kaleng", "Minyak Jelantah", "Botol Kaca"]),
    opening_hours: "Selasa - Minggu: 08.30 - 16.00 WIB",
    contact_phone: "+62 856-4321-9876",
    incentive: "Buku Tabungan Lingkungan & Pembayaran Tagihan Listrik PLN",
    latitude: -7.278417,
    longitude: 112.762944,
    map_link: "https://www.google.com/maps/search/?api=1&query=Bank+Sampah+Induk+Surabaya+Jl+Raya+Menur+No+31-A+Mulyorejo+Surabaya"
  },
  {
    id: 6,
    name: "Bank Sampah Jempol",
    city: "Bandung",
    address: "Jl. Ciwastra No.3, Margasari, Kec. Buahbatu, Kota Bandung, Jawa Barat 40287",
    accepted_types: JSON.stringify(["Plastik PET", "Kardus", "Kertas", "Buku Bekas", "Kaleng Aluminium"]),
    opening_hours: "Senin - Sabtu: 08.30 - 16.30 WIB",
    contact_phone: "+62 821-4455-6677",
    incentive: "Tabungan Tunai, Poin Trashly, & Paket Sembako",
    latitude: -6.955806,
    longitude: 107.655139,
    map_link: "https://www.google.com/maps/search/?api=1&query=Bank+Sampah+Jempol+Jl+Ciwastra+No+3+Margasari+Buahbatu+Bandung"
  },
  {
    id: 7,
    name: "Bank Sampah Hijau Dago Kreatif",
    city: "Bandung",
    address: "Jl. Dago Barat No.83, Dago, Kecamatan Coblong, Kota Bandung, Jawa Barat 40135",
    accepted_types: JSON.stringify(["Plastik Botol", "Gelas Kaca", "Kardus", "E-Waste"]),
    opening_hours: "Setiap Hari: 09.00 - 17.00 WIB",
    contact_phone: "+62 813-7788-9900",
    incentive: "Voucher Kedai Kopi Dago, Bibit Tanaman Gratis, & Uang Tunai Kilat",
    latitude: -6.874833,
    longitude: 107.616694,
    map_link: "https://www.google.com/maps/search/?api=1&query=Bank+Sampah+Hijau+Dago+Kreatif+Jl+Dago+Barat+No+83+Coblong+Bandung"
  }
];
