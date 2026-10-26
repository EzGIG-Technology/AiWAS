# Logo sources (EzVision Campus Safety demo)

Status as of 2026-10-26: **no logo files have been downloaded yet.** `public/logos/manifest.json` lists all 30 entries with `file: null`, so the dashboard should show an acronym badge for each one until the files are added.

## Trademark statement

All university and ministry logos, crests and emblems are trademarks or official insignia of their respective institutions and of the Government of Malaysia. EzGIG Technology uses them only in an internal sales demo, to identify each institution. Their use does not imply endorsement, partnership or affiliation. The Jata Negara (national coat of arms) is also protected under the Emblems and Names (Prevention of Improper Use) Act 1963 [Act 193]; get clearance before using it outside an internal demo.

## Why the files are missing

The build environment's egress policy denied HTTPS CONNECT (403) to every candidate source:
`upload.wikimedia.org`, `commons.wikimedia.org`, `en.wikipedia.org`, `www.mohe.gov.my`, and the official website of every institution listed below. Because of this, no source file URLs or licences on Wikimedia Commons could be checked, and the `source_url` field is `null` for every entry. No substitute images were used.

To finish this task, allow those hosts in the environment's network settings (or download the files on a machine that has internet access). Then, for each entry: download an SVG (or a PNG of at least 256 px) from the Wikimedia Commons file page or the official site, check it with `file`, and reject any SVG that contains `<script>` or external `http(s)` hrefs. Save it as `public/logos/<id>.svg|png`, and fill in `file`, `source_url` and `licence_note` in the manifest.

## Public university list check

The list of 20 public universities (UA) matches the Ministry of Higher Education list at https://biasiswa.mohe.gov.my/sukan/doc/SENARAI%20INSTITUSI%20PENGAJIAN%20TINGGI%20AWAM(UA).pdf. That list still uses "UMP", which has since been renamed UMPSA.

## Entries

| id | Institution | Type | Main campus | File | Where to obtain (official site) | Source URL | Licence / trademark note |
|---|---|---|---|---|---|---|---|
| kpt | Kementerian Pendidikan Tinggi Malaysia (KPT) | ministry | Putrajaya (WP Putrajaya) | missing | https://www.mohe.gov.my/ | not obtained | Trademark of the institution; identification only |
| jata-negara | Jata Negara Malaysia (Jata Negara) | ministry | National emblem (Putrajaya) | missing | official government source | not obtained | National emblem; Act 193 applies |
| um | Universiti Malaya (UM) | public | Kuala Lumpur (WP Kuala Lumpur) | um.png (crest), um-lockup.png (full) | Supplied by EzGIG, 26 Oct 2026 | supplied | Trademark of the institution; identification only |
| usm | Universiti Sains Malaysia (USM) | public | Gelugor, George Town, Pulau Pinang | missing | https://www.usm.my/ | not obtained | Trademark of the institution; identification only |
| ukm | Universiti Kebangsaan Malaysia (UKM) | public | Bangi, Selangor | missing | https://www.ukm.my/ | not obtained | Trademark of the institution; identification only |
| upm | Universiti Putra Malaysia (UPM) | public | Serdang, Selangor | missing | https://www.upm.edu.my/ | not obtained | Trademark of the institution; identification only |
| utm | Universiti Teknologi Malaysia (UTM) | public | Skudai, Johor Bahru, Johor | missing | https://www.utm.my/ | not obtained | Trademark of the institution; identification only |
| uitm | Universiti Teknologi MARA (UiTM) | public | Shah Alam, Selangor | missing | https://www.uitm.edu.my/ | not obtained | Trademark of the institution; identification only |
| iium | Universiti Islam Antarabangsa Malaysia (IIUM / UIAM) | public | Gombak, Selangor | missing | https://www.iium.edu.my/ | not obtained | Trademark of the institution; identification only |
| uum | Universiti Utara Malaysia (UUM) | public | Sintok, Kedah | missing | https://www.uum.edu.my/ | not obtained | Trademark of the institution; identification only |
| unimas | Universiti Malaysia Sarawak (UNIMAS) | public | Kota Samarahan, Sarawak | missing | https://www.unimas.my/ | not obtained | Trademark of the institution; identification only |
| ums | Universiti Malaysia Sabah (UMS) | public | Kota Kinabalu, Sabah | missing | https://www.ums.edu.my/ | not obtained | Trademark of the institution; identification only |
| upsi | Universiti Pendidikan Sultan Idris (UPSI) | public | Tanjong Malim, Perak | missing | https://www.upsi.edu.my/ | not obtained | Trademark of the institution; identification only |
| usim | Universiti Sains Islam Malaysia (USIM) | public | Nilai, Negeri Sembilan | missing | https://www.usim.edu.my/ | not obtained | Trademark of the institution; identification only |
| umt | Universiti Malaysia Terengganu (UMT) | public | Kuala Nerus, Terengganu | missing | https://www.umt.edu.my/ | not obtained | Trademark of the institution; identification only |
| uthm | Universiti Tun Hussein Onn Malaysia (UTHM) | public | Parit Raja, Batu Pahat, Johor | missing | https://www.uthm.edu.my/ | not obtained | Trademark of the institution; identification only |
| utem | Universiti Teknikal Malaysia Melaka (UTeM) | public | Durian Tunggal, Melaka | missing | https://www.utem.edu.my/ | not obtained | Trademark of the institution; identification only |
| unimap | Universiti Malaysia Perlis (UniMAP) | public | Arau, Perlis | missing | https://www.unimap.edu.my/ | not obtained | Trademark of the institution; identification only |
| umpsa | Universiti Malaysia Pahang Al-Sultan Abdullah (UMPSA) | public | Pekan, Pahang | missing | https://www.umpsa.edu.my/ | not obtained | Trademark of the institution; identification only |
| unisza | Universiti Sultan Zainal Abidin (UniSZA) | public | Kuala Nerus, Terengganu | missing | https://www.unisza.edu.my/ | not obtained | Trademark of the institution; identification only |
| umk | Universiti Malaysia Kelantan (UMK) | public | Kota Bharu, Kelantan | missing | https://www.umk.edu.my/ | not obtained | Trademark of the institution; identification only |
| upnm | Universiti Pertahanan Nasional Malaysia (UPNM) | public | Sungai Besi, Kuala Lumpur | missing | https://www.upnm.edu.my/ | not obtained | Trademark of the institution; identification only |
| taylors | Universiti Taylor's (Taylor's) | private | Subang Jaya, Selangor | missing | https://university.taylors.edu.my/ | not obtained | Trademark of the institution; identification only |
| monash-my | Universiti Monash Malaysia (Monash Malaysia) | private | Bandar Sunway, Selangor | missing | https://www.monash.edu.my/ | not obtained | Trademark of the institution; identification only |
| sunway | Universiti Sunway (Sunway) | private | Bandar Sunway, Selangor | missing | https://sunway.edu.my/ | not obtained | Trademark of the institution; identification only |
| ucsi | Universiti UCSI (UCSI) | private | Cheras, Kuala Lumpur | missing | https://www.ucsiuniversity.edu.my/ | not obtained | Trademark of the institution; identification only |
| mmu | Universiti Multimedia (MMU) | private | Cyberjaya, Selangor | missing | https://www.mmu.edu.my/ | not obtained | Trademark of the institution; identification only |
| uniten | Universiti Tenaga Nasional (UNITEN) | private | Kajang, Selangor (Putrajaya Campus) | missing | https://www.uniten.edu.my/ | not obtained | Trademark of the institution; identification only |
| utp | Universiti Teknologi PETRONAS (UTP) | private | Seri Iskandar, Perak | missing | https://www.utp.edu.my/ | not obtained | Trademark of the institution; identification only |
| apu | Universiti Teknologi & Inovasi Asia Pasifik (APU) | private | Bukit Jalil, Kuala Lumpur | missing | https://www.apu.edu.my/ | not obtained | Trademark of the institution; identification only |
