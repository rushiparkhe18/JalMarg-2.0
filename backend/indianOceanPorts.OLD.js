/**
 * Indian Ocean Ports Database
 * Dynamically loaded from indianOceanPorts.json
 * Filtered for reliable Indian Ocean routing
 * East Asian ports (lon > 105°E) removed to prevent Malacca Strait routing issues
 * Total ports: 330 (337 removed for connectivity reasons)
 * Updated: 2025-11-09
 */

const fs = require('fs');
const path = require('path');

// Load ports from JSON file
let portsData;
try {
  const jsonPath = path.join(__dirname, 'indianOceanPorts.json');
  portsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
} catch (error) {
  console.error('❌ Error loading ports from JSON:', error);
  portsData = { ports: [] };
}

const INDIAN_OCEAN_PORTS = portsData.ports || [];
  {
    "name": "Blanglancang",
    "country": "Indonesia",
    "region": "Indonesia -- 50020",
    "lat": 5.233333,
    "lon": 97.1,
    "waterBody": "Andaman Sea; Indian Ocean"
  },
  {
    "name": "Bongkot Terminal",
    "country": "Thailand",
    "region": "Thailand -- 57431",
    "lat": 8.05,
    "lon": 102.333333,
    "waterBody": "Gulf of Thailand; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Donggala",
    "country": "Indonesia",
    "region": "Sulawesi -- 51970",
    "lat": -0.65,
    "lon": 119.733333,
    "waterBody": "Makassar Strait; South Pacific Ocean"
  },
  {
    "name": "Uleelheue",
    "country": "Indonesia",
    "region": "Sumatera -- 50515",
    "lat": 5.566667,
    "lon": 95.283333,
    "waterBody": "Andaman Sea; Indian Ocean"
  },
  {
    "name": "Phuket",
    "country": "Thailand",
    "region": "Thailand -- 49760",
    "lat": 7.833333,
    "lon": 98.4,
    "waterBody": "Andaman Sea; Indian Ocean"
  },
  {
    "name": "Kirteh Oil Terminal",
    "country": "Malaysia",
    "region": "Malaysia -- 57400",
    "lat": 4.566667,
    "lon": 103.466667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Sabang",
    "country": "Indonesia",
    "region": "Sumatera -- 50515",
    "lat": 5.883333,
    "lon": 95.316667,
    "waterBody": "Andaman Sea; Indian Ocean"
  },
  {
    "name": "Laoang",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 12.566667,
    "lon": 125.016667,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Margosatubig",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 7.583333,
    "lon": 123.166667,
    "waterBody": "Celebes Sea; North Pacific Ocean"
  },
  {
    "name": "Bassein",
    "country": "Burma",
    "region": "Burma (Myanmar) -- 49610",
    "lat": 16.78333333,
    "lon": 94.73333333,
    "waterBody": "Andaman Sea; Indian Ocean"
  },
  {
    "name": "Malong Marine Terminal",
    "country": "Malaysia",
    "region": "Malaysia -- 49820",
    "lat": 4.633333,
    "lon": 104.816667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Port Blair",
    "country": "India",
    "region": "Andaman Islands -- 49710",
    "lat": 11.67777778,
    "lon": 92.73333333,
    "waterBody": "Andaman Sea; Indian Ocean"
  },
  {
    "name": "Lingkas",
    "country": "Indonesia",
    "region": "Indonesia - Borneo -- 51760",
    "lat": 3.283333,
    "lon": 117.6,
    "waterBody": "Celebes Sea; North Pacific Ocean"
  },
  {
    "name": "Ankingcheng",
    "country": "China",
    "region": "China Continued -- 59850",
    "lat": 30.516667,
    "lon": 117.033333,
    "waterBody": "East China Sea; North Pacific Ocean"
  },
  {
    "name": "Rangoon",
    "country": "Burma",
    "region": "Burma (Myanmar) -- 49610",
    "lat": 16.766667,
    "lon": 96.166667,
    "waterBody": "Andaman Sea; Indian Ocean"
  },
  {
    "name": "Su-Ao",
    "country": "Taiwan",
    "region": "Taiwan -- 57880",
    "lat": 24.6,
    "lon": 121.866667,
    "waterBody": "East China Sea; North Pacific Ocean"
  },
  {
    "name": "Moulmein Harbor",
    "country": "Burma",
    "region": "Burma (Myanmar) -- 49610",
    "lat": 16.483333,
    "lon": 97.616667,
    "waterBody": "Andaman Sea; Indian Ocean"
  },
  {
    "name": "Victoria Point Harbor",
    "country": "Burma",
    "region": "Burma (Myanmar) -- 49610",
    "lat": 9.983333333,
    "lon": 98.55,
    "waterBody": "Andaman Sea; Indian Ocean"
  },
  {
    "name": "Mandvi",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 22.833333,
    "lon": 69.35,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Tanjungredeb",
    "country": "Indonesia",
    "region": "Indonesia - Borneo -- 51760",
    "lat": 2.15,
    "lon": 117.483333,
    "waterBody": "Celebes Sea; North Pacific Ocean"
  },
  {
    "name": "Santa Clara",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 7.783333,
    "lon": 122.683333,
    "waterBody": "Celebes Sea; North Pacific Ocean"
  },
  {
    "name": "Phsar Ream",
    "country": "Cambodia",
    "region": "Cambodia -- 57478",
    "lat": 10.5,
    "lon": 103.6,
    "waterBody": "Gulf of Thailand; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Ramba",
    "country": "Indonesia",
    "region": "Indonesia -- 50020",
    "lat": -2.616667,
    "lon": 104.133333,
    "waterBody": "Natuna Sea; South China Sea; South Pacific Ocean"
  },
  {
    "name": "Hazira",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 21.083333,
    "lon": 72.633333,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Victoria",
    "country": "Malaysia",
    "region": "Sabah -- 51650",
    "lat": 5.283333,
    "lon": 115.233333,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Bedi",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 22.57305556,
    "lon": 70.04555556,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Tarempah",
    "country": "Indonesia",
    "region": "Kepulauan Anambas -- 51480",
    "lat": 3.216667,
    "lon": 106.216667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Tahuna",
    "country": "Indonesia",
    "region": "Kepulauan Sangihe -- 52400",
    "lat": 3.616667,
    "lon": 125.483333,
    "waterBody": "Celebes Sea; North Pacific Ocean"
  },
  {
    "name": "Petchburi Terminal",
    "country": "Thailand",
    "region": "Thailand -- 57431",
    "lat": 13.166667,
    "lon": 100.15,
    "waterBody": "Gulf of Thailand; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Muhamamad Bin Qasim",
    "country": "Pakistan",
    "region": "Pakistan -- 48580",
    "lat": 24.766667,
    "lon": 67.35,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Karachi",
    "country": "Pakistan",
    "region": "Pakistan -- 48580",
    "lat": 24.783333,
    "lon": 66.983333,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Muntok",
    "country": "Indonesia",
    "region": "Indonesia -- 50020",
    "lat": -2.066667,
    "lon": 105.166667,
    "waterBody": "Natuna Sea; South China Sea; South Pacific Ocean"
  },
  {
    "name": "Ambon",
    "country": "Indonesia",
    "region": "Seram -- 52650",
    "lat": -3.683333,
    "lon": 128.166667,
    "waterBody": "Banda Sea; South Pacific Ocean"
  },
  {
    "name": "Mundra",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 22.72833333,
    "lon": 69.70666667,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Okha",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 22.46805556,
    "lon": 69.07972222,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Veraval",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 20.9,
    "lon": 70.366667,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Vadinar Terminal",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 22.46666667,
    "lon": 69.66666667,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Sikka",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 22.433333,
    "lon": 69.833333,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Kandla",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 23.033333,
    "lon": 70.216667,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Porbandar",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 21.633333,
    "lon": 69.6,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Navlakhi",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 22.95638889,
    "lon": 70.44758333,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Honavar",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 14.28333333,
    "lon": 74.45,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Claveria",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 18.616667,
    "lon": 121.083333,
    "waterBody": "Luzon Strait; North Pacific Ocean"
  },
  {
    "name": "Manila",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 14.583333,
    "lon": 120.966667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Belanak Field Terminal",
    "country": "Indonesia",
    "region": "Kepulauan Anambas -- 51480",
    "lat": 4.15,
    "lon": 106.25,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Bintangor",
    "country": "Malaysia",
    "region": "Malaysia -- 51548",
    "lat": 2.166667,
    "lon": 111.633333,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Port Dabhol",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 17.58333333,
    "lon": 73.16666667,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Jaigarh Bay",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 17.3,
    "lon": 73.21666667,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Jafarabad",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 20.86666667,
    "lon": 71.38333333,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Magdalla",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 21.15,
    "lon": 72.75,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Kendari",
    "country": "Indonesia",
    "region": "Sulawesi -- 51970",
    "lat": -3.966667,
    "lon": 122.583333,
    "waterBody": "Banda Sea; South Pacific Ocean"
  },
  {
    "name": "Beauty Point",
    "country": "Australia",
    "region": "Tasmania -- 54700",
    "lat": -41.15,
    "lon": 146.816667,
    "waterBody": "Bass Strait; South Pacific Ocean"
  },
  {
    "name": "Legazpi Port",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 13.15,
    "lon": 123.75,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "El Hamra Oil Terminal",
    "country": "Egypt",
    "region": "Egypt Mediterranean -- 45120",
    "lat": 30.983333,
    "lon": 28.866667,
    "waterBody": "Mediterranean Sea; North Atlantic Ocean"
  },
  {
    "name": "Jawaharlal Nehru Port (Nhava Shiva)",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 18.95,
    "lon": 72.95,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Bang Saphan",
    "country": "Thailand",
    "region": "Thailand -- 49760",
    "lat": 11.183333,
    "lon": 99.6,
    "waterBody": "Gulf of Thailand; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Blinyu",
    "country": "Indonesia",
    "region": "Indonesia -- 50020",
    "lat": -1.633333,
    "lon": 105.783333,
    "waterBody": "Natuna Sea; South China Sea; South Pacific Ocean"
  },
  {
    "name": "Kuantan New Port",
    "country": "Malaysia",
    "region": "Malaysia -- 57400",
    "lat": 3.966667,
    "lon": 103.433333,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Benchamas Terminal",
    "country": "Thailand",
    "region": "Thailand -- 57431",
    "lat": 10.516667,
    "lon": 101.25,
    "waterBody": "Gulf of Thailand; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Kasim Terminal",
    "country": "Indonesia",
    "region": "New Guinea West Coast - Irian Jaya -- 52900",
    "lat": -1.3,
    "lon": 131.016667,
    "waterBody": "South Pacific Ocean"
  },
  {
    "name": "Amamapare",
    "country": "Indonesia",
    "region": "New Guinea West Coast - Irian Jaya -- 52900",
    "lat": -4.816667,
    "lon": 136.966667,
    "waterBody": "Arafura Sea; South Pacific Ocean"
  },
  {
    "name": "Calapan",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 13.416667,
    "lon": 121.183333,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Haimen",
    "country": "China",
    "region": "China Continued -- 59850",
    "lat": 28.683333,
    "lon": 121.45,
    "waterBody": "East China Sea; North Pacific Ocean"
  },
  {
    "name": "Ishigaki",
    "country": "Japan",
    "region": "Nansei Shoto -- 62470",
    "lat": 24.333333,
    "lon": 124.166667,
    "waterBody": "East China Sea; North Pacific Ocean"
  },
  {
    "name": "Karwar",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 14.816667,
    "lon": 74.116667,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Pipavav Bandar",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 20.916667,
    "lon": 71.516667,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Semarang",
    "country": "Indonesia",
    "region": "Jawa -- 50920",
    "lat": -6.95,
    "lon": 110.416667,
    "waterBody": "Java Sea; South Pacific Ocean"
  },
  {
    "name": "Zamboanga",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 6.9,
    "lon": 122.066667,
    "waterBody": "Celebes Sea; North Pacific Ocean"
  },
  {
    "name": "Bhavnagar",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 21.766667,
    "lon": 72.233333,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Tabaco",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 13.366667,
    "lon": 123.733333,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Sattahip",
    "country": "Thailand",
    "region": "Thailand -- 57431",
    "lat": 12.616667,
    "lon": 100.916667,
    "waterBody": "Gulf of Thailand; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Zhangzhou",
    "country": "China",
    "region": "China -- 57855",
    "lat": 24.683333,
    "lon": 118.15,
    "waterBody": "Taiwan Strait; North Pacific Ocean"
  },
  {
    "name": "Songkhla Harbor",
    "country": "Thailand",
    "region": "Thailand -- 57431",
    "lat": 7.216667,
    "lon": 100.583333,
    "waterBody": "Gulf of Thailand; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Pontianak",
    "country": "Indonesia",
    "region": "Indonesia - Borneo -- 51760",
    "lat": -0.016667,
    "lon": 109.333333,
    "waterBody": "Natuna Sea; South China Sea; South Pacific Ocean"
  },
  {
    "name": "Marmagao",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 15.4175,
    "lon": 73.795,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Mumbai (Bombay)",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 18.966667,
    "lon": 72.866667,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Tawa",
    "country": "Malaysia",
    "region": "Sarawak -- 51550",
    "lat": 4.25,
    "lon": 117.883333,
    "waterBody": "Celebes Sea; North Pacific Ocean"
  },
  {
    "name": "Pulupandan",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 10.516667,
    "lon": 122.8,
    "waterBody": "Sulu Sea; North Pacific Ocean"
  },
  {
    "name": "Zhuhai",
    "country": "China",
    "region": "China -- 57815",
    "lat": 22.233333,
    "lon": 113.583333,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Ujung Pandang",
    "country": "Indonesia",
    "region": "Sulawesi -- 51970",
    "lat": -5.133333,
    "lon": 119.4,
    "waterBody": "Makassar Strait; South Pacific Ocean"
  },
  {
    "name": "Ratnagiri",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 16.983333,
    "lon": 73.283333,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Tanjungpandan",
    "country": "Indonesia",
    "region": "Indonesia -- 50020",
    "lat": -2.75,
    "lon": 107.633333,
    "waterBody": "Natuna Sea; South China Sea; South Pacific Ocean"
  },
  {
    "name": "Belekeri",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 14.7,
    "lon": 74.266667,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Pomalaa",
    "country": "Indonesia",
    "region": "Sulawesi -- 51970",
    "lat": -4.166667,
    "lon": 121.6,
    "waterBody": "Teluk Bone; Banda Sea; South Pacific Ocean"
  },
  {
    "name": "Seria Oil Loading Terminal",
    "country": "Brunei",
    "region": "Brunei -- 51610",
    "lat": 4.616667,
    "lon": 114.316667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Sailolof",
    "country": "Indonesia",
    "region": "New Guinea West Coast - Irian Jaya -- 52900",
    "lat": -1.25,
    "lon": 130.75,
    "waterBody": "Halmahera Sea; South Pacific Ocean"
  },
  {
    "name": "Dahej",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 21.7,
    "lon": 72.533333,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Panaji",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 15.5,
    "lon": 73.816667,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "North Pulau Laut Coal Terminal",
    "country": "Indonesia",
    "region": "Indonesia - Borneo -- 51760",
    "lat": -3.2,
    "lon": 116.283333,
    "waterBody": "Makassar Strait; South Pacific Ocean"
  },
  {
    "name": "Duqm",
    "country": "Oman",
    "region": "Oman -- 48225",
    "lat": 19.67325258,
    "lon": 57.71690892,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Mina Raysut",
    "country": "Oman",
    "region": "Oman -- 48225",
    "lat": 16.95111111,
    "lon": 54.02916667,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Eden",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -37.066667,
    "lon": 149.916667,
    "waterBody": "Tasman Sea; South Pacific Ocean"
  },
  {
    "name": "Nishtun",
    "country": "Yemen",
    "region": "Yemen Sanaa -- 48195",
    "lat": 15.816667,
    "lon": 52.2,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Launceston",
    "country": "Australia",
    "region": "Tasmania -- 54700",
    "lat": -41.45,
    "lon": 147.116667,
    "waterBody": "Bass Strait; South Pacific Ocean"
  },
  {
    "name": "Gwadar",
    "country": "Pakistan",
    "region": "Pakistan -- 48580",
    "lat": 25.133333,
    "lon": 62.3,
    "waterBody": "Arabian Sea; Indian Ocean"
  },
  {
    "name": "Machilipatnam",
    "country": "India",
    "region": "India East Coast -- 49310",
    "lat": 16.15,
    "lon": 81.166667,
    "waterBody": "Bay of Bengal; Indian Ocean"
  },
  {
    "name": "Port Dalrymple",
    "country": "Australia",
    "region": "Tasmania -- 54700",
    "lat": -41.133333,
    "lon": 146.833333,
    "waterBody": "Bass Strait; South Pacific Ocean"
  },
  {
    "name": "Sittwe",
    "country": "Burma",
    "region": "Burma (Myanmar) -- 49610",
    "lat": 20.133333,
    "lon": 92.9,
    "waterBody": "Bay of Bengal; Indian Ocean"
  },
  {
    "name": "Krishnapatnam",
    "country": "India",
    "region": "India East Coast -- 49310",
    "lat": 14.25,
    "lon": 80.13333333,
    "waterBody": "Bay of Bengal; Indian Ocean"
  },
  {
    "name": "Welshpool",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -38.7,
    "lon": 146.466667,
    "waterBody": "Bass Strait; South Pacific Ocean"
  },
  {
    "name": "Western Port",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -38.35,
    "lon": 145.233333,
    "waterBody": "Bass Strait; South Pacific Ocean"
  },
  {
    "name": "Batticaloa Roads",
    "country": "Sri Lanka",
    "region": "Sri Lanka -- 49210",
    "lat": 7.766666667,
    "lon": 81.68333333,
    "waterBody": "Bay of Bengal; Indian Ocean"
  },
  {
    "name": "Dhamra",
    "country": "India",
    "region": "India East Coast -- 49310",
    "lat": 20.81666667,
    "lon": 86.96666667,
    "waterBody": "Bay of Bengal; Indian Ocean"
  },
  {
    "name": "Gangavaram",
    "country": "India",
    "region": "India East Coast -- 49310",
    "lat": 17.63333333,
    "lon": 83.25,
    "waterBody": "Bay of Bengal; Indian Ocean"
  },
  {
    "name": "Kakinada Bay",
    "country": "India",
    "region": "India East Coast -- 49310",
    "lat": 17,
    "lon": 82.316667,
    "waterBody": "Bay of Bengal; Indian Ocean"
  },
  {
    "name": "Karaikal Port",
    "country": "India",
    "region": "India East Coast -- 49310",
    "lat": 10.833333,
    "lon": 79.866667,
    "waterBody": "Bay of Bengal; Indian Ocean"
  },
  {
    "name": "Ampenan",
    "country": "Indonesia",
    "region": "Lesser Sunda Islands -- 51250",
    "lat": -8.566667,
    "lon": 116.066667,
    "waterBody": "Bali Sea; Java Sea; South Pacific Ocean"
  },
  {
    "name": "Guangzhou",
    "country": "China",
    "region": "China -- 57815",
    "lat": 23.116667,
    "lon": 113.233333,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Cuddalore",
    "country": "India",
    "region": "India East Coast -- 49310",
    "lat": 11.716667,
    "lon": 79.766667,
    "waterBody": "Bay of Bengal; Indian Ocean"
  },
  {
    "name": "Fang-Cheng",
    "country": "China",
    "region": "China -- 57740",
    "lat": 21.75,
    "lon": 108.35,
    "waterBody": "Gulf of Tonkin; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Huangpu",
    "country": "China",
    "region": "China -- 57815",
    "lat": 23.083333,
    "lon": 113.416667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Huizhou",
    "country": "China",
    "region": "China -- 57855",
    "lat": 22.716667,
    "lon": 114.516667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Chaozhou",
    "country": "China",
    "region": "China -- 57855",
    "lat": 23.616667,
    "lon": 117.083333,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Salawati",
    "country": "Indonesia",
    "region": "Seram -- 52650",
    "lat": -1.35,
    "lon": 130.983333,
    "waterBody": "South Pacific Ocean"
  },
  {
    "name": "Mongla",
    "country": "Bangladesh",
    "region": "Bangladesh -- 49570",
    "lat": 22.466667,
    "lon": 89.6,
    "waterBody": "Bay of Bengal; Indian Ocean"
  },
  {
    "name": "Trincomalee Harbor",
    "country": "Sri Lanka",
    "region": "Sri Lanka -- 49210",
    "lat": 8.55,
    "lon": 81.216667,
    "waterBody": "Bay of Bengal; Indian Ocean"
  },
  {
    "name": "Calcutta",
    "country": "India",
    "region": "India East Coast -- 49310",
    "lat": 22.55,
    "lon": 88.333333,
    "waterBody": "Bay of Bengal; Indian Ocean"
  },
  {
    "name": "Chittagong",
    "country": "Bangladesh",
    "region": "Bangladesh -- 49570",
    "lat": 22.316667,
    "lon": 91.816667,
    "waterBody": "Bay of Bengal; Indian Ocean"
  },
  {
    "name": "Yantian",
    "country": "China",
    "region": "China -- 57855",
    "lat": 22.583333,
    "lon": 114.266667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Haldia Port",
    "country": "India",
    "region": "India East Coast -- 49310",
    "lat": 22.016667,
    "lon": 88.083333,
    "waterBody": "Bay of Bengal; Indian Ocean"
  },
  {
    "name": "Xiuyu",
    "country": "China",
    "region": "China -- 57855",
    "lat": 25.233333,
    "lon": 118.983333,
    "waterBody": "Taiwan Strait; North Pacific Ocean"
  },
  {
    "name": "Quanzhou",
    "country": "China",
    "region": "China -- 57855",
    "lat": 24.883333,
    "lon": 118.6,
    "waterBody": "Taiwan Strait; North Pacific Ocean"
  },
  {
    "name": "Shui Dong",
    "country": "China",
    "region": "China -- 57815",
    "lat": 21.483333,
    "lon": 111.083333,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Shekou",
    "country": "China",
    "region": "China -- 57740",
    "lat": 22.466667,
    "lon": 113.866667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Sanya",
    "country": "China",
    "region": "China -- 57815",
    "lat": 18.316667,
    "lon": 109.45,
    "waterBody": "Gulf of Tonkin; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Yangpu",
    "country": "China",
    "region": "China -- 57815",
    "lat": 19.733333,
    "lon": 109.183333,
    "waterBody": "Gulf of Tonkin; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Zhanjiang",
    "country": "China",
    "region": "China -- 57740",
    "lat": 21.2,
    "lon": 110.4,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Surabaya",
    "country": "Indonesia",
    "region": "Jawa -- 50920",
    "lat": -7.2,
    "lon": 112.733333,
    "waterBody": "Bali Sea; Java Sea; South Pacific Ocean"
  },
  {
    "name": "Chennai (Madras)",
    "country": "India",
    "region": "India East Coast -- 49310",
    "lat": 13.1,
    "lon": 80.3,
    "waterBody": "Bay of Bengal; Indian Ocean"
  },
  {
    "name": "Pangkalpinang",
    "country": "Indonesia",
    "region": "Indonesia -- 50020",
    "lat": -2.116667,
    "lon": 106.133333,
    "waterBody": "Natuna Sea; South China Sea; South Pacific Ocean"
  },
  {
    "name": "Udang Oilfield",
    "country": "Indonesia",
    "region": "Kepulauan Anambas -- 51480",
    "lat": 4.033333,
    "lon": 106.483333,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Samarinda",
    "country": "Indonesia",
    "region": "Indonesia - Borneo -- 51760",
    "lat": -0.516667,
    "lon": 117.116667,
    "waterBody": "Makassar Strait; South Pacific Ocean"
  },
  {
    "name": "Pondicherry",
    "country": "India",
    "region": "India East Coast -- 49310",
    "lat": 11.933333,
    "lon": 79.833333,
    "waterBody": "Bay of Bengal; Indian Ocean"
  },
  {
    "name": "Vishakhapatnam",
    "country": "India",
    "region": "India East Coast -- 49310",
    "lat": 17.683333,
    "lon": 83.3,
    "waterBody": "Bay of Bengal; Indian Ocean"
  },
  {
    "name": "Tanjungpinang",
    "country": "Indonesia",
    "region": "Indonesia -- 50020",
    "lat": 0.916667,
    "lon": 104.45,
    "waterBody": "Natuna Sea; South China Sea; South Pacific Ocean"
  },
  {
    "name": "Paradip",
    "country": "India",
    "region": "India East Coast -- 49310",
    "lat": 20.266667,
    "lon": 86.683333,
    "waterBody": "Bay of Bengal; Indian Ocean"
  },
  {
    "name": "Jabung Batanghari Marine Terminal",
    "country": "Indonesia",
    "region": "Sumatera -- 50515",
    "lat": -0.916667,
    "lon": 104.066667,
    "waterBody": "Natuna Sea; South China Sea; South Pacific Ocean"
  },
  {
    "name": "Gresik",
    "country": "Indonesia",
    "region": "Jawa -- 50920",
    "lat": -7.15,
    "lon": 112.65,
    "waterBody": "Bali Sea; Java Sea; South Pacific Ocean"
  },
  {
    "name": "Merauke",
    "country": "Indonesia",
    "region": "New Guinea West Coast - Irian Jaya -- 52900",
    "lat": -8.483333,
    "lon": 140.383333,
    "waterBody": "Arafura Sea; South Pacific Ocean"
  },
  {
    "name": "Kamarajar Port",
    "country": "India",
    "region": "India East Coast -- 49310",
    "lat": 13.26138889,
    "lon": 80.3425,
    "waterBody": "Bay of Bengal; Indian Ocean"
  },
  {
    "name": "Banjarmasin",
    "country": "Indonesia",
    "region": "Indonesia - Borneo -- 51760",
    "lat": -3.333333,
    "lon": 114.583333,
    "waterBody": "Java Sea; South Pacific Ocean"
  },
  {
    "name": "Palembang",
    "country": "Indonesia",
    "region": "Indonesia -- 50020",
    "lat": -2.983333,
    "lon": 104.766667,
    "waterBody": "Natuna Sea; South China Sea; South Pacific Ocean"
  },
  {
    "name": "Tanjung Arang  (Bunyu)",
    "country": "Indonesia",
    "region": "Indonesia - Borneo -- 51760",
    "lat": 3.466667,
    "lon": 117.833333,
    "waterBody": "Celebes Sea; North Pacific Ocean"
  },
  {
    "name": "Toboali",
    "country": "Indonesia",
    "region": "Indonesia -- 50020",
    "lat": -3.016667,
    "lon": 106.45,
    "waterBody": "Java Sea; South Pacific Ocean"
  },
  {
    "name": "Gopalpur",
    "country": "India",
    "region": "India East Coast -- 49310",
    "lat": 19.30194444,
    "lon": 84.96666667,
    "waterBody": "Bay of Bengal; Indian Ocean"
  },
  {
    "name": "Nagappattinam",
    "country": "India",
    "region": "India East Coast -- 49310",
    "lat": 10.766667,
    "lon": 79.85,
    "waterBody": "Bay of Bengal; Indian Ocean"
  },
  {
    "name": "Kattupalli Port",
    "country": "India",
    "region": "India East Coast -- 49310",
    "lat": 13.30694444,
    "lon": 80.35222222,
    "waterBody": "Bay of Bengal; Indian Ocean"
  },
  {
    "name": "General Santos",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 6.116667,
    "lon": 125.183333,
    "waterBody": "Celebes Sea; North Pacific Ocean"
  },
  {
    "name": "Nasipit Port",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 8.983333,
    "lon": 125.333333,
    "waterBody": "Bohol Sea; Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Baleshwar",
    "country": "India",
    "region": "India East Coast -- 49310",
    "lat": 21.48333333,
    "lon": 86.95,
    "waterBody": "Bay of Bengal; Indian Ocean"
  },
  {
    "name": "Machilipatnam",
    "country": "India",
    "region": "India East Coast -- 49310",
    "lat": 16.15,
    "lon": 81.15,
    "waterBody": "Bay of Bengal; Indian Ocean"
  },
  {
    "name": "Thevenard",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -32.166667,
    "lon": 133.65,
    "waterBody": "Great Australian Bight; Indian Ocean"
  },
  {
    "name": "Jose Panganiban",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 14.283333,
    "lon": 122.683333,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Hinatuan",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 8.366667,
    "lon": 126.333333,
    "waterBody": "Bohol Sea; Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Mati",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 6.95,
    "lon": 126.216667,
    "waterBody": "Celebes Sea; North Pacific Ocean"
  },
  {
    "name": "Bugo",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 8.516667,
    "lon": 124.75,
    "waterBody": "Bohol Sea; Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Berbera",
    "country": "Somalia",
    "region": "Somalia -- 47810",
    "lat": 10.45,
    "lon": 45.016667,
    "waterBody": "Gulf of Aden; Indian Ocean"
  },
  {
    "name": "Boosaaso",
    "country": "Somalia",
    "region": "Somalia -- 47810",
    "lat": 11.283333,
    "lon": 49.183333,
    "waterBody": "Gulf of Aden; Indian Ocean"
  },
  {
    "name": "Aden",
    "country": "Yemen",
    "region": "Yemen Aden -- 48143",
    "lat": 12.783333,
    "lon": 44.95,
    "waterBody": "Gulf of Aden; Indian Ocean"
  },
  {
    "name": "Macau",
    "country": "Macau",
    "region": "Macau -- 57805",
    "lat": 22.183333,
    "lon": 113.566667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Basco",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 20.45,
    "lon": 121.966667,
    "waterBody": "Luzon Strait; North Pacific Ocean"
  },
  {
    "name": "Guiuan",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 11.033333,
    "lon": 125.716667,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Catbalogan",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 11.766667,
    "lon": 124.883333,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Baybay",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 10.683333,
    "lon": 124.8,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Davao",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 7.066667,
    "lon": 125.616667,
    "waterBody": "Celebes Sea; North Pacific Ocean"
  },
  {
    "name": "Basilian City (Isabela)",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 6.716667,
    "lon": 121.966667,
    "waterBody": "Sulu Sea; North Pacific Ocean"
  },
  {
    "name": "Jolo",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 6.05,
    "lon": 121,
    "waterBody": "Sulu Sea; North Pacific Ocean"
  },
  {
    "name": "Rudum Terminal",
    "country": "Yemen",
    "region": "Yemen Sanaa -- 48195",
    "lat": 13.983333,
    "lon": 47.916667,
    "waterBody": "Gulf of Aden; Indian Ocean"
  },
  {
    "name": "Djibouti",
    "country": "Djibouti",
    "region": "Djibouti -- 47840",
    "lat": 11.6,
    "lon": 43.133333,
    "waterBody": "Gulf of Aden; Indian Ocean"
  },
  {
    "name": "Al Mukalla",
    "country": "Yemen",
    "region": "Yemen Sanaa -- 48195",
    "lat": 14.516667,
    "lon": 49.116667,
    "waterBody": "Gulf of Aden; Indian Ocean"
  },
  {
    "name": "Kampong Saom",
    "country": "Cambodia",
    "region": "Cambodia -- 57478",
    "lat": 10.633333,
    "lon": 103.5,
    "waterBody": "Gulf of Thailand; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Balhaf",
    "country": "Yemen",
    "region": "Yemen Sanaa -- 48195",
    "lat": 13.966667,
    "lon": 48.183333,
    "waterBody": "Gulf of Aden; Indian Ocean"
  },
  {
    "name": "Ash Shihr Oil Terminal",
    "country": "Yemen",
    "region": "Yemen Sanaa -- 48195",
    "lat": 14.7,
    "lon": 49.48333333,
    "waterBody": "Gulf of Aden; Indian Ocean"
  },
  {
    "name": "Doraleh",
    "country": "Djibouti",
    "region": "Djibouti -- 47840",
    "lat": 11.6,
    "lon": 43.083333,
    "waterBody": "Gulf of Aden; Indian Ocean"
  },
  {
    "name": "Elat",
    "country": "Israel",
    "region": "Israel -- 48075",
    "lat": 29.55,
    "lon": 34.95,
    "waterBody": "Gulf of Aqaba; Red Sea; Indian Ocean"
  },
  {
    "name": "Mariveles",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 14.433333,
    "lon": 120.483333,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Masbate",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 12.366667,
    "lon": 123.616667,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Lazi",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 9.133333,
    "lon": 123.633333,
    "waterBody": "Bohol Sea; Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Nuwaybi'",
    "country": "Egypt",
    "region": "Egypt Red Sea -- 47950",
    "lat": 28.966667,
    "lon": 34.65,
    "waterBody": "Gulf of Aqaba; Red Sea; Indian Ocean"
  },
  {
    "name": "Al Aqabah",
    "country": "Jordan",
    "region": "Jordan -- 48080",
    "lat": 29.516667,
    "lon": 35,
    "waterBody": "Gulf of Aqaba; Red Sea; Indian Ocean"
  },
  {
    "name": "Subic Bay",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 14.8,
    "lon": 120.266667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Jask",
    "country": "Iran",
    "region": "Iran -- 48410",
    "lat": 25.633333,
    "lon": 57.766667,
    "waterBody": "Gulf of Oman; Indian Ocean"
  },
  {
    "name": "Tapis Marine Terminal A",
    "country": "Malaysia",
    "region": "Malaysia -- 57400",
    "lat": 5.516667,
    "lon": 105.016667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Siasi",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 5.55,
    "lon": 120.816667,
    "waterBody": "Celebes Sea; North Pacific Ocean"
  },
  {
    "name": "Villanueva",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 8.583333,
    "lon": 124.766667,
    "waterBody": "Bohol Sea; Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Puerto Princesa",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 9.733333,
    "lon": 118.733333,
    "waterBody": "Sulu Sea; North Pacific Ocean"
  },
  {
    "name": "Port Holland",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 6.55,
    "lon": 121.866667,
    "waterBody": "Sulu Sea; North Pacific Ocean"
  },
  {
    "name": "Khawr Fakkan",
    "country": "United Arab Emirates",
    "region": "United Arab Emirates -- 48260",
    "lat": 25.36277778,
    "lon": 56.36888889,
    "waterBody": "Gulf of Oman; Indian Ocean"
  },
  {
    "name": "Tagbilaran",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 9.65,
    "lon": 123.85,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Tubigan",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 9.95,
    "lon": 123.966667,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Mina Qabus",
    "country": "Oman",
    "region": "Oman -- 48225",
    "lat": 23.633333,
    "lon": 58.583333,
    "waterBody": "Gulf of Oman; Indian Ocean"
  },
  {
    "name": "Pagadian",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 7.833333,
    "lon": 123.433333,
    "waterBody": "Celebes Sea; North Pacific Ocean"
  },
  {
    "name": "Mina Al Fahl",
    "country": "Oman",
    "region": "Oman -- 48225",
    "lat": 23.633333,
    "lon": 58.516667,
    "waterBody": "Gulf of Oman; Indian Ocean"
  },
  {
    "name": "Vanimo",
    "country": "Papua New Guinea",
    "region": "New Guinea NE Coast -- 53210",
    "lat": -2.683333,
    "lon": 141.133333,
    "waterBody": "South Pacific Ocean"
  },
  {
    "name": "Qalhat Lng Terminal",
    "country": "Oman",
    "region": "Oman -- 48225",
    "lat": 22.683333,
    "lon": 59.4,
    "waterBody": "Gulf of Oman; Indian Ocean"
  },
  {
    "name": "Ormoc",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 11,
    "lon": 124.6,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Sorsogon",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 12.966667,
    "lon": 124,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Polloc (Cotabato)",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 7.35,
    "lon": 124.216667,
    "waterBody": "Celebes Sea; North Pacific Ocean"
  },
  {
    "name": "Port Of Sohar",
    "country": "Oman",
    "region": "Oman -- 48225",
    "lat": 24.516667,
    "lon": 56.633333,
    "waterBody": "Gulf of Oman; Indian Ocean"
  },
  {
    "name": "Al Fujayrah",
    "country": "United Arab Emirates",
    "region": "United Arab Emirates -- 48260",
    "lat": 25.17305556,
    "lon": 56.36916667,
    "waterBody": "Gulf of Oman; Indian Ocean"
  },
  {
    "name": "Chah Bahar",
    "country": "Iran",
    "region": "Iran -- 48410",
    "lat": 25.266667,
    "lon": 60.616667,
    "waterBody": "Gulf of Oman; Indian Ocean"
  },
  {
    "name": "Zafarana Terminal",
    "country": "Egypt",
    "region": "Egypt Red Sea -- 47950",
    "lat": 29.166667,
    "lon": 32.683333,
    "waterBody": "Gulf of Suez; Red Sea; Indian Ocean"
  },
  {
    "name": "Zeit Bay Lpg Terminal",
    "country": "Egypt",
    "region": "Egypt Red Sea -- 47950",
    "lat": 27.8,
    "lon": 33.566667,
    "waterBody": "Gulf of Suez; Red Sea; Indian Ocean"
  },
  {
    "name": "Erawan Terminal",
    "country": "Thailand",
    "region": "Thailand -- 57431",
    "lat": 9.1,
    "lon": 101.35,
    "waterBody": "Gulf of Thailand; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Hua-Lien Kang",
    "country": "Taiwan",
    "region": "Taiwan -- 57880",
    "lat": 23.983333,
    "lon": 121.6,
    "waterBody": "Taiwan Strait; North Pacific Ocean"
  },
  {
    "name": "Khanom",
    "country": "Thailand",
    "region": "Thailand -- 49760",
    "lat": 9.2,
    "lon": 99.9,
    "waterBody": "Gulf of Thailand; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Pattani",
    "country": "Thailand",
    "region": "Thailand -- 57431",
    "lat": 6.95,
    "lon": 101.3,
    "waterBody": "Gulf of Thailand; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Siam Seaport",
    "country": "Thailand",
    "region": "Thailand -- 57431",
    "lat": 13.133333,
    "lon": 100.883333,
    "waterBody": "Gulf of Thailand; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Nha Trang",
    "country": "Vietnam",
    "region": "Vietnam -- 57510",
    "lat": 12.25,
    "lon": 109.233333,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Da Nang",
    "country": "Vietnam",
    "region": "Vietnam -- 57510",
    "lat": 16.1,
    "lon": 108.216667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Nghe Tinh",
    "country": "Vietnam",
    "region": "Vietnam -- 57510",
    "lat": 18.766667,
    "lon": 105.766667,
    "waterBody": "Gulf of Tonkin; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Cat Lai",
    "country": "Vietnam",
    "region": "Vietnam -- 57510",
    "lat": 10.75,
    "lon": 106.783333,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Cam Pha",
    "country": "Vietnam",
    "region": "Vietnam -- 57510",
    "lat": 21.033333,
    "lon": 107.366667,
    "waterBody": "Gulf of Tonkin; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Simonstown",
    "country": "South Africa",
    "region": "South Africa -- 46725",
    "lat": -34.185,
    "lon": 18.43666667,
    "waterBody": "South Atlantic Ocean"
  },
  {
    "name": "Vung Tau",
    "country": "Vietnam",
    "region": "Vietnam -- 57510",
    "lat": 10.35,
    "lon": 107.066667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Ko Si Chang Terminal",
    "country": "Thailand",
    "region": "Thailand -- 57431",
    "lat": 13.166667,
    "lon": 100.816667,
    "waterBody": "Gulf of Thailand; South China Sea; North Pacific Ocean"
  },
  {
    "name": "El Ghardaqa",
    "country": "Egypt",
    "region": "Egypt Red Sea -- 47950",
    "lat": 27.216667,
    "lon": 33.85,
    "waterBody": "Gulf of Suez; Red Sea; Indian Ocean"
  },
  {
    "name": "Jervis Bay",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -35.116667,
    "lon": 150.8,
    "waterBody": "Tasman Sea; South Pacific Ocean"
  },
  {
    "name": "Batemans Bay",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -35.7,
    "lon": 150.166667,
    "waterBody": "Tasman Sea; South Pacific Ocean"
  },
  {
    "name": "Ras Gharib",
    "country": "Egypt",
    "region": "Egypt Red Sea -- 47950",
    "lat": 28.35,
    "lon": 33.1,
    "waterBody": "Gulf of Suez; Red Sea; Indian Ocean"
  },
  {
    "name": "Ras Shukhier",
    "country": "Egypt",
    "region": "Egypt Red Sea -- 47950",
    "lat": 28.133333,
    "lon": 33.283333,
    "waterBody": "Gulf of Suez; Red Sea; Indian Ocean"
  },
  {
    "name": "Ras Badran Oil Terminal",
    "country": "Egypt",
    "region": "Egypt Red Sea -- 47950",
    "lat": 28.95,
    "lon": 33.166667,
    "waterBody": "Gulf of Suez; Red Sea; Indian Ocean"
  },
  {
    "name": "Iloilo",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 10.7,
    "lon": 122.583333,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Cebu",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 10.3,
    "lon": 123.9,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Masinloc",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 15.55,
    "lon": 119.95,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Hong Kong",
    "country": "Hong Kong",
    "region": "Hong Kong -- 57835",
    "lat": 22.266667,
    "lon": 114.2,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Hai Phong",
    "country": "Vietnam",
    "region": "Vietnam -- 57510",
    "lat": 20.916667,
    "lon": 106.683333,
    "waterBody": "Gulf of Tonkin; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Wadi Feiran",
    "country": "Egypt",
    "region": "Egypt Red Sea -- 47950",
    "lat": 28.75,
    "lon": 33.2,
    "waterBody": "Gulf of Suez; Red Sea; Indian Ocean"
  },
  {
    "name": "Bitung",
    "country": "Indonesia",
    "region": "Sulawesi -- 51970",
    "lat": 1.433333,
    "lon": 125.183333,
    "waterBody": "Molucca Sea; North Pacific Ocean"
  },
  {
    "name": "Lawi Lawi Oil Terminal",
    "country": "Indonesia",
    "region": "Indonesia - Borneo -- 51760",
    "lat": -1.45,
    "lon": 116.766667,
    "waterBody": "Makassar Strait; South Pacific Ocean"
  },
  {
    "name": "Balikpapan",
    "country": "Indonesia",
    "region": "Indonesia - Borneo -- 51760",
    "lat": -1.25,
    "lon": 116.816667,
    "waterBody": "Makassar Strait; South Pacific Ocean"
  },
  {
    "name": "Muara Harbor",
    "country": "Brunei",
    "region": "Brunei -- 51610",
    "lat": 5.033333,
    "lon": 115.066667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Lutong",
    "country": "Malaysia",
    "region": "Sarawak -- 51550",
    "lat": 4.466667,
    "lon": 114,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Ras Sudr",
    "country": "Egypt",
    "region": "Egypt Red Sea -- 47950",
    "lat": 29.583333,
    "lon": 32.7,
    "waterBody": "Gulf of Suez; Red Sea; Indian Ocean"
  },
  {
    "name": "As Suways",
    "country": "Egypt",
    "region": "Egypt Red Sea -- 47950",
    "lat": 29.966667,
    "lon": 32.55,
    "waterBody": "Gulf of Suez; Red Sea; Indian Ocean"
  },
  {
    "name": "Zeit Bay Terminal",
    "country": "Egypt",
    "region": "Egypt Red Sea -- 47950",
    "lat": 27.833333,
    "lon": 33.6,
    "waterBody": "Gulf of Suez; Red Sea; Indian Ocean"
  },
  {
    "name": "Ras Abu Zanimah",
    "country": "Egypt",
    "region": "Egypt Red Sea -- 47950",
    "lat": 29.033333,
    "lon": 33.116667,
    "waterBody": "Gulf of Suez; Red Sea; Indian Ocean"
  },
  {
    "name": "Sokhna Port Gas Tanker Terminal",
    "country": "Egypt",
    "region": "Egypt Red Sea -- 47950",
    "lat": 29.683333,
    "lon": 32.366667,
    "waterBody": "Gulf of Suez; Red Sea; Indian Ocean"
  },
  {
    "name": "At Tur",
    "country": "Egypt",
    "region": "Egypt Red Sea -- 47950",
    "lat": 28.233333,
    "lon": 33.616667,
    "waterBody": "Gulf of Suez; Red Sea; Indian Ocean"
  },
  {
    "name": "Marsa az Zaytiyah",
    "country": "Egypt",
    "region": "Egypt Red Sea -- 47950",
    "lat": 27.85,
    "lon": 33.6,
    "waterBody": "Gulf of Suez; Red Sea; Indian Ocean"
  },
  {
    "name": "North Ain Sukhna Port",
    "country": "Egypt",
    "region": "Egypt Red Sea -- 47950",
    "lat": 29.65,
    "lon": 32.366667,
    "waterBody": "Gulf of Suez; Red Sea; Indian Ocean"
  },
  {
    "name": "El-Adabiya",
    "country": "Egypt",
    "region": "Egypt Red Sea -- 47950",
    "lat": 29.866667,
    "lon": 32.466667,
    "waterBody": "Gulf of Suez; Red Sea; Indian Ocean"
  },
  {
    "name": "Ain Sukhna Terminal",
    "country": "Egypt",
    "region": "Egypt Red Sea -- 47950",
    "lat": 29.583333,
    "lon": 32.366667,
    "waterBody": "Gulf of Suez; Red Sea; Indian Ocean"
  },
  {
    "name": "Iharana",
    "country": "Madagascar",
    "region": "Madagascar -- 47350",
    "lat": -13.35,
    "lon": 50,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Bangkok",
    "country": "Thailand",
    "region": "Thailand -- 57431",
    "lat": 13.75,
    "lon": 100.5,
    "waterBody": "Gulf of Thailand; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Cape Town",
    "country": "South Africa",
    "region": "South Africa -- 46725",
    "lat": -33.916667,
    "lon": 18.416667,
    "waterBody": "South Atlantic Ocean"
  },
  {
    "name": "Jakarta",
    "country": "Indonesia",
    "region": "Jawa -- 50920",
    "lat": -6.1,
    "lon": 106.883333,
    "waterBody": "Java Sea; South Pacific Ocean"
  },
  {
    "name": "Chake Chake",
    "country": "Tanzania",
    "region": "Tanzania -- 46965",
    "lat": -5.25,
    "lon": 39.766667,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Mjimwema Terminal",
    "country": "Tanzania",
    "region": "Tanzania -- 46965",
    "lat": -6.816667,
    "lon": 39.366667,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Labuhanhaji",
    "country": "Indonesia",
    "region": "Lesser Sunda Islands -- 51250",
    "lat": -8.7,
    "lon": 116.566667,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Belida Marine Terminal",
    "country": "Indonesia",
    "region": "Kepulauan Anambas -- 51480",
    "lat": 4.133333,
    "lon": 105.133333,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Port Est",
    "country": "Reunion",
    "region": "Reunion -- 47670",
    "lat": -20.933333,
    "lon": 55.316667,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Bontang Lng Terminal",
    "country": "Indonesia",
    "region": "Indonesia - Borneo -- 51760",
    "lat": 0.1,
    "lon": 117.483333,
    "waterBody": "Makassar Strait; South Pacific Ocean"
  },
  {
    "name": "Labuha",
    "country": "Indonesia",
    "region": "Pulau Batcan -- 52520",
    "lat": -0.633333,
    "lon": 127.466667,
    "waterBody": "Molucca Sea; South Pacific Ocean"
  },
  {
    "name": "Basuo",
    "country": "China",
    "region": "China -- 57740",
    "lat": 19.1,
    "lon": 108.616667,
    "waterBody": "Gulf of Tonkin; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Gingoog",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 8.833333,
    "lon": 125.1,
    "waterBody": "Bohol Sea; Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Port Ouest",
    "country": "Reunion",
    "region": "Reunion -- 47670",
    "lat": -20.933333,
    "lon": 55.283333,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Antsiranana",
    "country": "Madagascar",
    "region": "Madagascar -- 47350",
    "lat": -12.266667,
    "lon": 49.283333,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Dabo",
    "country": "Indonesia",
    "region": "Indonesia -- 50020",
    "lat": -0.5,
    "lon": 104.566667,
    "waterBody": "Natuna Sea; South China Sea; South Pacific Ocean"
  },
  {
    "name": "Kuala Kapus",
    "country": "Indonesia",
    "region": "Sumatera -- 50515",
    "lat": 3,
    "lon": 114.366667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Celukan Bawang",
    "country": "Indonesia",
    "region": "Jawa -- 50920",
    "lat": -8.183333,
    "lon": 114.833333,
    "waterBody": "Bali Sea; Java Sea; South Pacific Ocean"
  },
  {
    "name": "Mananjary",
    "country": "Madagascar",
    "region": "Madagascar -- 47350",
    "lat": -21.25,
    "lon": 48.333333,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Maumere",
    "country": "Indonesia",
    "region": "Lesser Sunda Islands -- 51250",
    "lat": -8.616667,
    "lon": 122.216667,
    "waterBody": "Flores Sea; Java Sea; South Pacific Ocean"
  },
  {
    "name": "Kemaman Harbor",
    "country": "Malaysia",
    "region": "Malaysia -- 57400",
    "lat": 4.25,
    "lon": 103.466667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Kuala Trengganu",
    "country": "Malaysia",
    "region": "Malaysia -- 57400",
    "lat": 5.35,
    "lon": 103.133333,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Dai Hang",
    "country": "Vietnam",
    "region": "Vietnam -- 57510",
    "lat": 8.483333,
    "lon": 108.683333,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Kismaayo",
    "country": "Somalia",
    "region": "Somalia -- 47120",
    "lat": -0.366667,
    "lon": 42.55,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Mombasa",
    "country": "Kenya",
    "region": "Kenya -- 47090",
    "lat": -4.066667,
    "lon": 39.666667,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Cilacap",
    "country": "Indonesia",
    "region": "Jawa -- 50920",
    "lat": -7.733333,
    "lon": 109,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Maroantsetra",
    "country": "Madagascar",
    "region": "Madagascar -- 47350",
    "lat": -15.45,
    "lon": 49.816667,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Bakapit",
    "country": "Malaysia",
    "region": "Malaysia -- 51647",
    "lat": 4.95,
    "lon": 118.583333,
    "waterBody": "Celebes Sea; North Pacific Ocean"
  },
  {
    "name": "Manado",
    "country": "Indonesia",
    "region": "Sulawesi -- 51970",
    "lat": 1.5,
    "lon": 124.833333,
    "waterBody": "Celebes Sea; North Pacific Ocean"
  },
  {
    "name": "Miei",
    "country": "Indonesia",
    "region": "New Guinea West Coast - Irian Jaya -- 52900",
    "lat": -2.733333,
    "lon": 134.5,
    "waterBody": "Teluk Cenderawasih; South Pacific Ocean"
  },
  {
    "name": "Toamasina",
    "country": "Madagascar",
    "region": "Madagascar -- 47350",
    "lat": -18.166667,
    "lon": 49.416667,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Teluk Bayur",
    "country": "Indonesia",
    "region": "Indonesia -- 50020",
    "lat": -1,
    "lon": 100.366667,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Hon Gai",
    "country": "Vietnam",
    "region": "Vietnam -- 57510",
    "lat": 20.95,
    "lon": 107.066667,
    "waterBody": "Gulf of Tonkin; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Beihai",
    "country": "China",
    "region": "China -- 57740",
    "lat": 21.483333,
    "lon": 109.066667,
    "waterBody": "Gulf of Tonkin; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Aparri",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 18.366667,
    "lon": 121.633333,
    "waterBody": "Luzon Strait; North Pacific Ocean"
  },
  {
    "name": "Batangas City",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 13.75,
    "lon": 121.05,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Isabel",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 10.916667,
    "lon": 124.433333,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Dumaguete",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 9.316667,
    "lon": 123.3,
    "waterBody": "Bohol Sea; Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Jordan",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 10.666667,
    "lon": 122.583333,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Iligan",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 8.233333,
    "lon": 124.233333,
    "waterBody": "Bohol Sea; Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Butuan City",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 8.95,
    "lon": 125.533333,
    "waterBody": "Bohol Sea; Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Ningbo",
    "country": "China",
    "region": "China Continued -- 59850",
    "lat": 29.883333,
    "lon": 121.55,
    "waterBody": "East China Sea; North Pacific Ocean"
  },
  {
    "name": "Mersa Matruh",
    "country": "Egypt",
    "region": "Egypt Mediterranean -- 45120",
    "lat": 31.35,
    "lon": 27.233333,
    "waterBody": "Mediterranean Sea; North Atlantic Ocean"
  },
  {
    "name": "Albany",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -35.033333,
    "lon": 117.883333,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Esperance",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -33.866667,
    "lon": 121.9,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Kingscote",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -35.633333,
    "lon": 137.633333,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Anyer Lor",
    "country": "Indonesia",
    "region": "Jawa -- 50920",
    "lat": -6.05,
    "lon": 105.916667,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Flying Fish Cove",
    "country": "Christmas Island",
    "region": "Christmas Island -- 50900",
    "lat": -10.416667,
    "lon": 105.7,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Tanjung Benete",
    "country": "Indonesia",
    "region": "Lesser Sunda Islands -- 51250",
    "lat": -8.9,
    "lon": 116.75,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Panjang",
    "country": "Indonesia",
    "region": "Indonesia -- 50020",
    "lat": -5.466667,
    "lon": 105.316667,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Kilifi",
    "country": "Kenya",
    "region": "Kenya -- 47090",
    "lat": -3.633333,
    "lon": 39.866667,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Malindi",
    "country": "Kenya",
    "region": "Kenya -- 47090",
    "lat": -3.216667,
    "lon": 40.133333,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Lamu",
    "country": "Kenya",
    "region": "Kenya -- 47090",
    "lat": -2.266667,
    "lon": 40.9,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Manakara",
    "country": "Madagascar",
    "region": "Madagascar -- 47350",
    "lat": -22.116667,
    "lon": 48.05,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Dili",
    "country": "Timor-Leste",
    "region": "East Timor -- 51430",
    "lat": -8.533333,
    "lon": 125.583333,
    "waterBody": "Banda Sea; South Pacific Ocean"
  },
  {
    "name": "Laem Chabang",
    "country": "Thailand",
    "region": "Thailand -- 57431",
    "lat": 13.083333,
    "lon": 100.883333,
    "waterBody": "Gulf of Thailand; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Port Mathurin",
    "country": "Mauritius",
    "region": "Rodrigues -- 47740",
    "lat": -19.683333,
    "lon": 63.416667,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Kilwa Kivinje",
    "country": "Tanzania",
    "region": "Tanzania -- 46965",
    "lat": -8.733333,
    "lon": 39.416667,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Bunbury",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -33.316667,
    "lon": 115.633333,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Dar Es Salaam",
    "country": "Tanzania",
    "region": "Tanzania -- 46965",
    "lat": -6.816667,
    "lon": 39.3,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Mtwara",
    "country": "Tanzania",
    "region": "Tanzania -- 46965",
    "lat": -10.266667,
    "lon": 40.2,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Bandar Seri Begawan",
    "country": "Brunei",
    "region": "Brunei -- 51610",
    "lat": 4.883333,
    "lon": 114.883333,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Kota Kinabalu",
    "country": "Malaysia",
    "region": "Sabah -- 51650",
    "lat": 5.983333,
    "lon": 116.066667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Kudat",
    "country": "Malaysia",
    "region": "Sabah -- 51650",
    "lat": 6.883333,
    "lon": 116.85,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Lahad Datu",
    "country": "Malaysia",
    "region": "Sabah -- 51650",
    "lat": 5.016667,
    "lon": 118.316667,
    "waterBody": "Celebes Sea; North Pacific Ocean"
  },
  {
    "name": "Luwuk",
    "country": "Indonesia",
    "region": "Sulawesi -- 51970",
    "lat": -0.95,
    "lon": 122.8,
    "waterBody": "Banda Sea; South Pacific Ocean"
  },
  {
    "name": "Bula",
    "country": "Indonesia",
    "region": "Seram -- 52650",
    "lat": -3.1,
    "lon": 130.5,
    "waterBody": "Ceram Sea; Banda Sea; South Pacific Ocean"
  },
  {
    "name": "Manokwari Road",
    "country": "Indonesia",
    "region": "New Guinea West Coast - Irian Jaya -- 52900",
    "lat": -0.866667,
    "lon": 134.083333,
    "waterBody": "Teluk Cenderawasih; South Pacific Ocean"
  },
  {
    "name": "Jayapura",
    "country": "Indonesia",
    "region": "New Guinea West Coast - Irian Jaya -- 52900",
    "lat": -2.533333,
    "lon": 140.716667,
    "waterBody": "South Pacific Ocean"
  },
  {
    "name": "Lon Shui Terminal",
    "country": "China",
    "region": "China -- 57740",
    "lat": 20.833333,
    "lon": 115.683333,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Chiwan",
    "country": "China",
    "region": "China -- 57815",
    "lat": 19.966667,
    "lon": 110.033333,
    "waterBody": "Gulf of Tonkin; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Kao-Hsiung",
    "country": "Taiwan",
    "region": "Taiwan -- 57880",
    "lat": 22.616667,
    "lon": 120.25,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Hondagua",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 13.95,
    "lon": 122.233333,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Naha Ko",
    "country": "Japan",
    "region": "Nansei Shoto -- 62470",
    "lat": 26.216667,
    "lon": 127.683333,
    "waterBody": "East China Sea; North Pacific Ocean"
  },
  {
    "name": "Bais",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 9.6,
    "lon": 123.116667,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Masao",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 9,
    "lon": 125.416667,
    "waterBody": "Bohol Sea; Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Cagayan De Oro",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 8.5,
    "lon": 124.666667,
    "waterBody": "Bohol Sea; Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Chung Ching",
    "country": "China",
    "region": "China Continued -- 59850",
    "lat": 29.566667,
    "lon": 106.633333,
    "waterBody": "Gulf of Tonkin; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Hirara Ko",
    "country": "Japan",
    "region": "Nansei Shoto -- 62470",
    "lat": 24.8,
    "lon": 125.283333,
    "waterBody": "East China Sea; North Pacific Ocean"
  },
  {
    "name": "Maputo",
    "country": "Mozambique",
    "region": "Mozambique -- 46860",
    "lat": -25.96277778,
    "lon": 32.54472222,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Durban",
    "country": "South Africa",
    "region": "South Africa -- 46725",
    "lat": -29.866667,
    "lon": 31.066667,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "East London",
    "country": "South Africa",
    "region": "South Africa -- 46725",
    "lat": -33.033333,
    "lon": 27.916667,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Benoa",
    "country": "Indonesia",
    "region": "Lesser Sunda Islands -- 51250",
    "lat": -8.75,
    "lon": 115.216667,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Gorontalo",
    "country": "Indonesia",
    "region": "Sulawesi -- 51970",
    "lat": 0.5,
    "lon": 123.05,
    "waterBody": "Teluk Tomini; Molucca Sea; South Pacific Ocean"
  },
  {
    "name": "Al Iskandariyh (Alexandria)",
    "country": "Egypt",
    "region": "Egypt Mediterranean -- 45120",
    "lat": 31.166667,
    "lon": 29.833333,
    "waterBody": "Mediterranean Sea; North Atlantic Ocean"
  },
  {
    "name": "Mikindani",
    "country": "Tanzania",
    "region": "Tanzania -- 46965",
    "lat": -10.266667,
    "lon": 40.133333,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Huangpuxingang",
    "country": "China",
    "region": "China -- 57815",
    "lat": 23.05,
    "lon": 113.5,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Damietta",
    "country": "Egypt",
    "region": "Egypt Mediterranean -- 45120",
    "lat": 31.483333,
    "lon": 31.75,
    "waterBody": "Mediterranean Sea; North Atlantic Ocean"
  },
  {
    "name": "Baraawe",
    "country": "Somalia",
    "region": "Somalia -- 47120",
    "lat": 1.1,
    "lon": 44.05,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Klein Point",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -34.966667,
    "lon": 137.766667,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Sidi Kerir (Kurayr)",
    "country": "Egypt",
    "region": "Egypt Mediterranean -- 45120",
    "lat": 31.1,
    "lon": 29.616667,
    "waterBody": "Mediterranean Sea; North Atlantic Ocean"
  },
  {
    "name": "Ardrossan",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -34.433333,
    "lon": 137.916667,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Bengkulu",
    "country": "Indonesia",
    "region": "Indonesia -- 50020",
    "lat": -3.783333,
    "lon": 102.25,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Kijang",
    "country": "Indonesia",
    "region": "Indonesia -- 50020",
    "lat": 0.85,
    "lon": 104.6,
    "waterBody": "Natuna Sea; South China Sea; South Pacific Ocean"
  },
  {
    "name": "Mossel Bay",
    "country": "South Africa",
    "region": "South Africa -- 46725",
    "lat": -34.17472222,
    "lon": 22.14611111,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Richards Bay",
    "country": "South Africa",
    "region": "South Africa -- 46725",
    "lat": -28.81,
    "lon": 32.09833333,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Ardjuna Oil Field",
    "country": "Indonesia",
    "region": "Indonesia -- 50020",
    "lat": -5.883333,
    "lon": 107.716667,
    "waterBody": "Java Sea; South Pacific Ocean"
  },
  {
    "name": "Moutsamoudu",
    "country": "Comoros",
    "region": "Comoros -- 47295",
    "lat": -12.15,
    "lon": 44.4,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Muqdisho",
    "country": "Somalia",
    "region": "Somalia -- 47120",
    "lat": 2.033333,
    "lon": 45.35,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Gunung Batu Besar",
    "country": "Indonesia",
    "region": "Indonesia - Borneo -- 51760",
    "lat": -2.616667,
    "lon": 116.3,
    "waterBody": "Makassar Strait; South Pacific Ocean"
  },
  {
    "name": "Namlea",
    "country": "Indonesia",
    "region": "Buru -- 52735",
    "lat": -3.283333,
    "lon": 127.083333,
    "waterBody": "Ceram Sea; Banda Sea; South Pacific Ocean"
  },
  {
    "name": "Marka",
    "country": "Somalia",
    "region": "Somalia -- 47120",
    "lat": 1.716667,
    "lon": 44.783333,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Saint-Pierre",
    "country": "Reunion",
    "region": "Reunion -- 47670",
    "lat": -21.35,
    "lon": 55.466667,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Saint-Denis",
    "country": "Reunion",
    "region": "Reunion -- 47670",
    "lat": -20.866667,
    "lon": 55.45,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Victoria",
    "country": "Seychelles",
    "region": "Seychelles -- 47210",
    "lat": -4.616667,
    "lon": 55.45,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Port Hedland",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -20.316667,
    "lon": 118.583333,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Fremantle",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -32.05,
    "lon": 115.75,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Mostyn",
    "country": "Malaysia",
    "region": "Malaysia -- 51647",
    "lat": 4.683333,
    "lon": 118.25,
    "waterBody": "Celebes Sea; North Pacific Ocean"
  },
  {
    "name": "Kota Baru",
    "country": "Indonesia",
    "region": "Indonesia - Borneo -- 51760",
    "lat": -3.233333,
    "lon": 116.216667,
    "waterBody": "Makassar Strait; South Pacific Ocean"
  },
  {
    "name": "Kolonodale",
    "country": "Indonesia",
    "region": "Sulawesi -- 51970",
    "lat": -1.983333,
    "lon": 121.333333,
    "waterBody": "Banda Sea; South Pacific Ocean"
  },
  {
    "name": "Baubau",
    "country": "Indonesia",
    "region": "Sulawesi -- 51970",
    "lat": -5.466667,
    "lon": 122.616667,
    "waterBody": "Banda Sea; South Pacific Ocean"
  },
  {
    "name": "Fakfak",
    "country": "Indonesia",
    "region": "New Guinea West Coast - Irian Jaya -- 52900",
    "lat": -2.933333,
    "lon": 132.283333,
    "waterBody": "Ceram Sea; Banda Sea; South Pacific Ocean"
  },
  {
    "name": "Pelabuhan Sandakan",
    "country": "Malaysia",
    "region": "Sabah -- 51650",
    "lat": 5.833333,
    "lon": 118.116667,
    "waterBody": "Sulu Sea; North Pacific Ocean"
  },
  {
    "name": "Broome",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -17.966667,
    "lon": 122.233333,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Raha Roadstead",
    "country": "Indonesia",
    "region": "Sulawesi -- 51970",
    "lat": -4.85,
    "lon": 122.733333,
    "waterBody": "Banda Sea; South Pacific Ocean"
  },
  {
    "name": "Useless Loop",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -26.083333,
    "lon": 113.4,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Tg. Mani",
    "country": "Malaysia",
    "region": "Malaysia -- 51548",
    "lat": 2.15,
    "lon": 111.35,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Tanjung Sangata",
    "country": "Indonesia",
    "region": "Indonesia - Borneo -- 51760",
    "lat": 0.366667,
    "lon": 117.566667,
    "waterBody": "Makassar Strait; South Pacific Ocean"
  },
  {
    "name": "Widuri Marine Terminal",
    "country": "Indonesia",
    "region": "Kepulauan Anambas -- 51480",
    "lat": -4.666667,
    "lon": 106.65,
    "waterBody": "Java Sea; South Pacific Ocean"
  },
  {
    "name": "Sungaigerong",
    "country": "Indonesia",
    "region": "Indonesia -- 50020",
    "lat": -2.983333,
    "lon": 104.833333,
    "waterBody": "Natuna Sea; South China Sea; South Pacific Ocean"
  },
  {
    "name": "Mangagoy",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 8.233333,
    "lon": 126.316667,
    "waterBody": "Bohol Sea; Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Geraldton",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -28.783333,
    "lon": 114.6,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Diego Garcia",
    "country": "British Indian Ocean Territory",
    "region": "Chagos Archipelago -- 47760",
    "lat": -7.35,
    "lon": 72.466667,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Port Elizabeth",
    "country": "South Africa",
    "region": "South Africa -- 46725",
    "lat": -33.95194444,
    "lon": 25.6425,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Chi-Lung",
    "country": "Taiwan",
    "region": "Taiwan -- 57880",
    "lat": 25.133333,
    "lon": 121.766667,
    "waterBody": "East China Sea; North Pacific Ocean"
  },
  {
    "name": "Mailiao",
    "country": "Taiwan",
    "region": "Taiwan -- 57880",
    "lat": 23.783333,
    "lon": 120.166667,
    "waterBody": "Taiwan Strait; North Pacific Ocean"
  },
  {
    "name": "Jimenez",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 8.333333,
    "lon": 123.866667,
    "waterBody": "Bohol Sea; Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Map Ta Phut",
    "country": "Thailand",
    "region": "Thailand -- 57431",
    "lat": 12.666667,
    "lon": 101.166667,
    "waterBody": "Gulf of Thailand; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Maasin",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 10.133333,
    "lon": 124.833333,
    "waterBody": "Bohol Sea; Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Zanzibar",
    "country": "Tanzania",
    "region": "Tanzania -- 46965",
    "lat": -6.166667,
    "lon": 39.183333,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Tolanaro",
    "country": "Madagascar",
    "region": "Madagascar -- 47350",
    "lat": -25.033333,
    "lon": 47,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Tanga",
    "country": "Tanzania",
    "region": "Tanzania -- 46965",
    "lat": -5.083333,
    "lon": 39.116667,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "San Carlos",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 10.483333,
    "lon": 123.416667,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Palompon",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 11.05,
    "lon": 124.383333,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Tantawan Marine Terminal",
    "country": "Thailand",
    "region": "Thailand -- 57431",
    "lat": 10.083333,
    "lon": 101.416667,
    "waterBody": "Gulf of Thailand; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Si Racha Terminal",
    "country": "Thailand",
    "region": "Thailand -- 57431",
    "lat": 13.116667,
    "lon": 100.883333,
    "waterBody": "Gulf of Thailand; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Port Borongan",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 11.6,
    "lon": 125.433333,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Rayong Tpi Terminal",
    "country": "Thailand",
    "region": "Thailand -- 57431",
    "lat": 12.633333,
    "lon": 101.3,
    "waterBody": "Gulf of Thailand; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Sibolga",
    "country": "Indonesia",
    "region": "Indonesia -- 50020",
    "lat": 1.733333,
    "lon": 98.766667,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Mui Vung Tau",
    "country": "Vietnam",
    "region": "Vietnam -- 57510",
    "lat": 10.316667,
    "lon": 107.066667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Duong Dong",
    "country": "Vietnam",
    "region": "Vietnam -- 57510",
    "lat": 10.216667,
    "lon": 103.966667,
    "waterBody": "Gulf of Thailand; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Port Giles",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -35.033333,
    "lon": 137.766667,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Point Murat",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -21.816667,
    "lon": 114.183333,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Vinh Cam Ranh",
    "country": "Vietnam",
    "region": "Vietnam -- 57510",
    "lat": 11.883333,
    "lon": 109.166667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Warrnambool",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -38.4,
    "lon": 142.483333,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Port Adelaide",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -34.85,
    "lon": 138.5,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Pulau Baai",
    "country": "Indonesia",
    "region": "Indonesia -- 50020",
    "lat": -3.916667,
    "lon": 102.283333,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Hambantota",
    "country": "Sri Lanka",
    "region": "Sri Lanka -- 49210",
    "lat": 6.116666667,
    "lon": 81.13333333,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Galle Harbor",
    "country": "Sri Lanka",
    "region": "Sri Lanka -- 49210",
    "lat": 6.033055556,
    "lon": 80.22833333,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Port Louis",
    "country": "Mauritius",
    "region": "Mauritius -- 47710",
    "lat": -20.15,
    "lon": 57.5,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Fuzhou",
    "country": "China",
    "region": "China Continued -- 59850",
    "lat": 26.083333,
    "lon": 119.3,
    "waterBody": "East China Sea; North Pacific Ocean"
  },
  {
    "name": "Dongshan",
    "country": "China",
    "region": "China -- 57855",
    "lat": 23.75666667,
    "lon": 117.505,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Portland",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -38.333333,
    "lon": 141.6,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Tan-Shui",
    "country": "Taiwan",
    "region": "Taiwan -- 57880",
    "lat": 25.183333,
    "lon": 121.4,
    "waterBody": "East China Sea; North Pacific Ocean"
  },
  {
    "name": "Cape Cuvier",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -24.216667,
    "lon": 113.383333,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Onslow",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -21.65,
    "lon": 115.1,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Port Walcott",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -20.65,
    "lon": 117.183333,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Dampier",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -20.633333,
    "lon": 116.716667,
    "waterBody": "Indian Ocean"
  },
  {
    "name": "Cinta Oil Terminal",
    "country": "Indonesia",
    "region": "Indonesia -- 50020",
    "lat": -5.5,
    "lon": 106.233333,
    "waterBody": "\"Indian Ocean, Java Sea; South Pacific Ocean\""
  },
  {
    "name": "Tanjung Gerem",
    "country": "Indonesia",
    "region": "Jawa -- 50920",
    "lat": -5.966667,
    "lon": 105.983333,
    "waterBody": "\"Indian Ocean, Java Sea; South Pacific Ocean\""
  },
  {
    "name": "Banten",
    "country": "Indonesia",
    "region": "Jawa -- 50920",
    "lat": -6.016667,
    "lon": 105.966667,
    "waterBody": "\"Indian Ocean, Java Sea; South Pacific Ocean\""
  },
  {
    "name": "Kin Wan",
    "country": "Japan",
    "region": "Nansei Shoto -- 62470",
    "lat": 26.416667,
    "lon": 127.9,
    "waterBody": "East China Sea; North Pacific Ocean"
  },
  {
    "name": "Tanjung Sekong",
    "country": "Indonesia",
    "region": "Jawa -- 50920",
    "lat": -5.916667,
    "lon": 106,
    "waterBody": "\"Indian Ocean, Java Sea; South Pacific Ocean\""
  },
  {
    "name": "Nakagusuku",
    "country": "Japan",
    "region": "Nansei Shoto -- 62470",
    "lat": 26.266667,
    "lon": 127.916667,
    "waterBody": "East China Sea; North Pacific Ocean"
  },
  {
    "name": "Xiamen",
    "country": "China",
    "region": "China -- 57855",
    "lat": 24.45,
    "lon": 118.066667,
    "waterBody": "Taiwan Strait; North Pacific Ocean"
  },
  {
    "name": "Haikou",
    "country": "China",
    "region": "China -- 57740",
    "lat": 20.05,
    "lon": 110.283333,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Wenzhou",
    "country": "China",
    "region": "China Continued -- 59850",
    "lat": 28.016667,
    "lon": 120.65,
    "waterBody": "East China Sea; North Pacific Ocean"
  },
  {
    "name": "Hobart",
    "country": "Australia",
    "region": "Tasmania -- 54700",
    "lat": -42.883333,
    "lon": 147.333333,
    "waterBody": "South Pacific Ocean"
  },
  {
    "name": "Nishihara",
    "country": "Japan",
    "region": "Japan -- 61100",
    "lat": 26.216667,
    "lon": 127.8,
    "waterBody": "East China Sea; North Pacific Ocean"
  },
  {
    "name": "Merak Mas Terminal",
    "country": "Indonesia",
    "region": "Jawa -- 50920",
    "lat": -5.919166667,
    "lon": 105.9972222,
    "waterBody": "\"Indian Ocean, Java Sea; South Pacific Ocean\""
  },
  {
    "name": "Wyndham",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -15.466667,
    "lon": 128.1,
    "waterBody": "Joseph Bonaparte Gulf; Timor Sea; Indian Ocean"
  },
  {
    "name": "New Mangalore",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 12.916667,
    "lon": 74.816667,
    "waterBody": "Laccadive Sea; Indian Ocean"
  },
  {
    "name": "Kochi (Cochin)",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 9.966667,
    "lon": 76.233333,
    "waterBody": "Laccadive Sea; Indian Ocean"
  },
  {
    "name": "Male",
    "country": "Maldives",
    "region": "Maldive Islands -- 49190",
    "lat": 4.166667,
    "lon": 73.5,
    "waterBody": "Laccadive Sea; Indian Ocean"
  },
  {
    "name": "Nasugbu",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 14.083333,
    "lon": 120.616667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "El Maadiya",
    "country": "Egypt",
    "region": "Egypt Mediterranean -- 45120",
    "lat": 31.266667,
    "lon": 30.15,
    "waterBody": "Mediterranean Sea; North Atlantic Ocean"
  },
  {
    "name": "Colombo",
    "country": "Sri Lanka",
    "region": "Sri Lanka -- 49210",
    "lat": 6.95,
    "lon": 79.85,
    "waterBody": "Laccadive Sea; Indian Ocean"
  },
  {
    "name": "Beypore",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 11.166667,
    "lon": 75.8,
    "waterBody": "Laccadive Sea; Indian Ocean"
  },
  {
    "name": "Quilon (Kollam)",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 8.871944444,
    "lon": 76.58388889,
    "waterBody": "Laccadive Sea; Indian Ocean"
  },
  {
    "name": "Azhikal (Azhikkal)",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 11.94555556,
    "lon": 75.30944444,
    "waterBody": "Laccadive Sea; Indian Ocean"
  },
  {
    "name": "Trivandrum",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 8.483333,
    "lon": 76.95,
    "waterBody": "Laccadive Sea; Indian Ocean"
  },
  {
    "name": "Kolachel",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 8.166667,
    "lon": 77.25,
    "waterBody": "Laccadive Sea; Indian Ocean"
  },
  {
    "name": "Calicut (Kozhikode)",
    "country": "India",
    "region": "India West Coast -- 48610",
    "lat": 11.25,
    "lon": 75.766667,
    "waterBody": "Laccadive Sea; Indian Ocean"
  },
  {
    "name": "Saldanha Bay",
    "country": "South Africa",
    "region": "South Africa -- 46725",
    "lat": -33.033333,
    "lon": 17.966667,
    "waterBody": "South Atlantic Ocean"
  },
  {
    "name": "Andoany",
    "country": "Madagascar",
    "region": "Madagascar -- 47350",
    "lat": -13.4,
    "lon": 48.3,
    "waterBody": "Mozambique Channel; Indian Ocean"
  },
  {
    "name": "Antsohim Bondrona",
    "country": "Madagascar",
    "region": "Madagascar -- 47350",
    "lat": -13.083333,
    "lon": 48.833333,
    "waterBody": "Mozambique Channel; Indian Ocean"
  },
  {
    "name": "Chinde",
    "country": "Mozambique",
    "region": "Mozambique -- 46860",
    "lat": -18.566667,
    "lon": 36.5,
    "waterBody": "Mozambique Channel; Indian Ocean"
  },
  {
    "name": "Pekalongan",
    "country": "Indonesia",
    "region": "Jawa -- 50920",
    "lat": -6.85,
    "lon": 109.7,
    "waterBody": "Java Sea; South Pacific Ocean"
  },
  {
    "name": "Maintirano",
    "country": "Madagascar",
    "region": "Madagascar -- 47350",
    "lat": -18.066667,
    "lon": 44.016667,
    "waterBody": "Mozambique Channel; Indian Ocean"
  },
  {
    "name": "Shan T Ou",
    "country": "China",
    "region": "China -- 57855",
    "lat": 23.366667,
    "lon": 116.683333,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Port Ozamis",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 8.133333,
    "lon": 123.85,
    "waterBody": "Bohol Sea; Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "San Fernando Harbor",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 16.616667,
    "lon": 120.316667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Pebane",
    "country": "Mozambique",
    "region": "Mozambique -- 46860",
    "lat": -17.266667,
    "lon": 38.15,
    "waterBody": "Mozambique Channel; Indian Ocean"
  },
  {
    "name": "Nacala",
    "country": "Mozambique",
    "region": "Mozambique -- 46860",
    "lat": -14.533333,
    "lon": 40.666667,
    "waterBody": "Mozambique Channel; Indian Ocean"
  },
  {
    "name": "Mocambique",
    "country": "Mozambique",
    "region": "Mozambique -- 46860",
    "lat": -15.033333,
    "lon": 40.733333,
    "waterBody": "Mozambique Channel; Indian Ocean"
  },
  {
    "name": "Port Romblon",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 12.583333,
    "lon": 122.266667,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Tai-Chung Kang",
    "country": "Taiwan",
    "region": "Peng Hu Lifh Tao -- 57940",
    "lat": 24.3,
    "lon": 120.5,
    "waterBody": "Taiwan Strait; North Pacific Ocean"
  },
  {
    "name": "Teluk Beo",
    "country": "Indonesia",
    "region": "Kepulauan Talaud -- 52470",
    "lat": 4.233333,
    "lon": 126.783333,
    "waterBody": "Molucca Sea; North Pacific Ocean"
  },
  {
    "name": "Inhambane",
    "country": "Mozambique",
    "region": "Mozambique -- 46860",
    "lat": -23.916667,
    "lon": 35.4,
    "waterBody": "Mozambique Channel; Indian Ocean"
  },
  {
    "name": "Morondava",
    "country": "Madagascar",
    "region": "Madagascar -- 47350",
    "lat": -20.283333,
    "lon": 44.3,
    "waterBody": "Mozambique Channel; Indian Ocean"
  },
  {
    "name": "Stagen",
    "country": "Indonesia",
    "region": "Indonesia - Borneo -- 51760",
    "lat": -3.3,
    "lon": 116.15,
    "waterBody": "Makassar Strait; South Pacific Ocean"
  },
  {
    "name": "Surigao City",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 9.783333,
    "lon": 125.5,
    "waterBody": "Bohol Sea; Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Tacloban",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 11.25,
    "lon": 125,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Peng-Hu Kang",
    "country": "Taiwan",
    "region": "Peng Hu Lifh Tao -- 57940",
    "lat": 23.583333,
    "lon": 119.533333,
    "waterBody": "Taiwan Strait; North Pacific Ocean"
  },
  {
    "name": "Wahai",
    "country": "Indonesia",
    "region": "Seram -- 52650",
    "lat": -2.783333,
    "lon": 129.5,
    "waterBody": "Ceram Sea; Banda Sea; South Pacific Ocean"
  },
  {
    "name": "Porto Belo",
    "country": "Mozambique",
    "region": "Mozambique -- 46860",
    "lat": -17.7,
    "lon": 37.183333,
    "waterBody": "Mozambique Channel; Indian Ocean"
  },
  {
    "name": "Quelimane",
    "country": "Mozambique",
    "region": "Mozambique -- 46860",
    "lat": -17.883333,
    "lon": 36.883333,
    "waterBody": "Mozambique Channel; Indian Ocean"
  },
  {
    "name": "Beira",
    "country": "Mozambique",
    "region": "Mozambique -- 46860",
    "lat": -19.833333,
    "lon": 34.833333,
    "waterBody": "Mozambique Channel; Indian Ocean"
  },
  {
    "name": "Moroni",
    "country": "Comoros",
    "region": "Comoros -- 47295",
    "lat": -11.7,
    "lon": 43.25,
    "waterBody": "Mozambique Channel; Indian Ocean"
  },
  {
    "name": "Rembang",
    "country": "Indonesia",
    "region": "Jawa -- 50920",
    "lat": -6.7,
    "lon": 111.35,
    "waterBody": "Java Sea; South Pacific Ocean"
  },
  {
    "name": "Tuban",
    "country": "Indonesia",
    "region": "Jawa -- 50920",
    "lat": -6.733333,
    "lon": 112.15,
    "waterBody": "Java Sea; South Pacific Ocean"
  },
  {
    "name": "Tanauan",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 11.1,
    "lon": 125.016667,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Sibu",
    "country": "Malaysia",
    "region": "Sarawak -- 51550",
    "lat": 2.283333,
    "lon": 111.816667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Ibo",
    "country": "Mozambique",
    "region": "Mozambique -- 46860",
    "lat": -12.333333,
    "lon": 40.616667,
    "waterBody": "Mozambique Channel; Indian Ocean"
  },
  {
    "name": "Mahajanga",
    "country": "Madagascar",
    "region": "Madagascar -- 47350",
    "lat": -15.716667,
    "lon": 46.3,
    "waterBody": "Mozambique Channel; Indian Ocean"
  },
  {
    "name": "Port Capiz",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 11.6,
    "lon": 122.716667,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Fomboni",
    "country": "Comoros",
    "region": "Comoros -- 47295",
    "lat": -12.266667,
    "lon": 43.75,
    "waterBody": "Mozambique Channel; Indian Ocean"
  },
  {
    "name": "Dzaoudzi",
    "country": "Comoros",
    "region": "Comoros -- 47295",
    "lat": -12.783333,
    "lon": 45.25,
    "waterBody": "Mozambique Channel; Indian Ocean"
  },
  {
    "name": "Toliara",
    "country": "Madagascar",
    "region": "Madagascar -- 47350",
    "lat": -23.366667,
    "lon": 43.666667,
    "waterBody": "Mozambique Channel; Indian Ocean"
  },
  {
    "name": "Pemba",
    "country": "Mozambique",
    "region": "Mozambique -- 46860",
    "lat": -12.966667,
    "lon": 40.5,
    "waterBody": "Mozambique Channel; Indian Ocean"
  },
  {
    "name": "Tuticorin",
    "country": "India",
    "region": "India East Coast -- 49310",
    "lat": 8.8,
    "lon": 78.166667,
    "waterBody": "Palk Strait; Indian Ocean"
  },
  {
    "name": "Probolinggo",
    "country": "Indonesia",
    "region": "Jawa -- 50920",
    "lat": -7.716667,
    "lon": 113.216667,
    "waterBody": "Bali Sea; Java Sea; South Pacific Ocean"
  },
  {
    "name": "Kankesanturai",
    "country": "Sri Lanka",
    "region": "Sri Lanka -- 49210",
    "lat": 9.816667,
    "lon": 80.05,
    "waterBody": "Palk Strait; Indian Ocean"
  },
  {
    "name": "Port San Vicente",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 18.516667,
    "lon": 122.133333,
    "waterBody": "Luzon Strait; North Pacific Ocean"
  },
  {
    "name": "Pamban",
    "country": "India",
    "region": "India East Coast -- 49310",
    "lat": 9.283333333,
    "lon": 79.21666667,
    "waterBody": "Palk Strait; Indian Ocean"
  },
  {
    "name": "Barkan Oil-loading Terminal",
    "country": "Iran",
    "region": "Iran -- 48410",
    "lat": 29.733333,
    "lon": 50.166667,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Sharjah Offshore Terminal",
    "country": "United Arab Emirates",
    "region": "United Arab Emirates -- 48260",
    "lat": 25.583333,
    "lon": 55.4,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Si Racha",
    "country": "Thailand",
    "region": "Thailand -- 57431",
    "lat": 13.166667,
    "lon": 100.916667,
    "waterBody": "Gulf of Thailand; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Ras Al Ghar",
    "country": "Saudi Arabia",
    "region": "Saudi Arabia Continued -- 48330",
    "lat": 26.9,
    "lon": 49.866667,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Kharg Island Oil Terminal",
    "country": "Iran",
    "region": "Iran -- 48410",
    "lat": 29.233333,
    "lon": 50.333333,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Bandar-E Mahshahr",
    "country": "Iran",
    "region": "Iran -- 48410",
    "lat": 30.466667,
    "lon": 49.183333,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Poleng Oil Field",
    "country": "Indonesia",
    "region": "Indonesia -- 50915",
    "lat": -6.65,
    "lon": 112.916667,
    "waterBody": "Java Sea; South Pacific Ocean"
  },
  {
    "name": "Qinzhou",
    "country": "China",
    "region": "China -- 57815",
    "lat": 21.733333,
    "lon": 108.583333,
    "waterBody": "Gulf of Tonkin; South China Sea; North Pacific Ocean"
  },
  {
    "name": "Sampit",
    "country": "Indonesia",
    "region": "Indonesia - Borneo -- 51760",
    "lat": -2.516667,
    "lon": 113,
    "waterBody": "Java Sea; South Pacific Ocean"
  },
  {
    "name": "Bushehr",
    "country": "Iran",
    "region": "Iran -- 48410",
    "lat": 28.983333,
    "lon": 50.833333,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Mina Jabal Ali",
    "country": "United Arab Emirates",
    "region": "United Arab Emirates -- 48260",
    "lat": 25.016667,
    "lon": 55.05,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Dubayy",
    "country": "United Arab Emirates",
    "region": "United Arab Emirates -- 48260",
    "lat": 25.266667,
    "lon": 55.3,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Khorramshahr",
    "country": "Iran",
    "region": "Iran -- 48410",
    "lat": 30.433333,
    "lon": 48.183333,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Umm Qasr",
    "country": "Iraq",
    "region": "Iraq -- 48375",
    "lat": 30.016667,
    "lon": 47.95,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Zhen Hai",
    "country": "China",
    "region": "China Continued -- 59850",
    "lat": 29.95,
    "lon": 121.7,
    "waterBody": "East China Sea; North Pacific Ocean"
  },
  {
    "name": "Phu My",
    "country": "Vietnam",
    "region": "Vietnam -- 57510",
    "lat": 10.583333,
    "lon": 107.033333,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Sapangar Bay",
    "country": "Malaysia",
    "region": "Sabah -- 51650",
    "lat": 6.083333,
    "lon": 116.116667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Santa Cruz (Marinduque Isl)",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 13.5,
    "lon": 122.066667,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Ternate",
    "country": "Indonesia",
    "region": "Pulau Ternate -- 52500",
    "lat": 0.783333,
    "lon": 127.383333,
    "waterBody": "Molucca Sea; North Pacific Ocean"
  },
  {
    "name": "Zhoushan",
    "country": "China",
    "region": "China Continued -- 59850",
    "lat": 30,
    "lon": 122.1,
    "waterBody": "East China Sea; North Pacific Ocean"
  },
  {
    "name": "Serui",
    "country": "Indonesia",
    "region": "New Guinea West Coast - Irian Jaya -- 52900",
    "lat": -1.9,
    "lon": 136.25,
    "waterBody": "Teluk Cenderawasih; South Pacific Ocean"
  },
  {
    "name": "Poso",
    "country": "Indonesia",
    "region": "Sulawesi -- 51970",
    "lat": -1.366667,
    "lon": 120.75,
    "waterBody": "Teluk Tomini; Molucca Sea; South Pacific Ocean"
  },
  {
    "name": "Saumlaki",
    "country": "Indonesia",
    "region": "Kepulauan Tanimbar -- 52850",
    "lat": -7.983333,
    "lon": 131.3,
    "waterBody": "Arafura Sea; South Pacific Ocean"
  },
  {
    "name": "Bandar Khomeyni",
    "country": "Iran",
    "region": "Iran -- 48410",
    "lat": 30.433333,
    "lon": 49.083333,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Virac",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 13.583333,
    "lon": 124.25,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Thanh Ho Chi Minh",
    "country": "Vietnam",
    "region": "Vietnam -- 57510",
    "lat": 10.766667,
    "lon": 106.716667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Mina Ash Shuaybah",
    "country": "Kuwait",
    "region": "Kuwait -- 48350",
    "lat": 29.033333,
    "lon": 48.166667,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Patani",
    "country": "Indonesia",
    "region": "Halmahera -- 52540",
    "lat": 0.366667,
    "lon": 128.75,
    "waterBody": "North Pacific Ocean"
  },
  {
    "name": "Al Kuwayt",
    "country": "Kuwait",
    "region": "Kuwait -- 48350",
    "lat": 29.35,
    "lon": 47.933333,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Qui Nhon",
    "country": "Vietnam",
    "region": "Vietnam -- 57510",
    "lat": 13.766667,
    "lon": 109.233333,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Thanh Hoa",
    "country": "Vietnam",
    "region": "Vietnam -- 57510",
    "lat": 10.816667,
    "lon": 106.766667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Tanjung Santan",
    "country": "Indonesia",
    "region": "Indonesia - Borneo -- 51760",
    "lat": -0.1,
    "lon": 117.533333,
    "waterBody": "Makassar Strait; South Pacific Ocean"
  },
  {
    "name": "Toledo",
    "country": "Philippines",
    "region": "Philippine Islands -- 57960",
    "lat": 10.366667,
    "lon": 123.633333,
    "waterBody": "Philippine inland seas; North Pacific Ocean"
  },
  {
    "name": "Al Jubayl",
    "country": "Saudi Arabia",
    "region": "Saudi Arabia Continued -- 48330",
    "lat": 27.083333,
    "lon": 49.666667,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Mina Az Zawr",
    "country": "Kuwait",
    "region": "Kuwait -- 48350",
    "lat": 28.733333,
    "lon": 48.4,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Ras Laffan",
    "country": "Qatar",
    "region": "Qatar -- 48285",
    "lat": 25.916667,
    "lon": 51.583333,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Bur Sa'id",
    "country": "Egypt",
    "region": "Egypt Mediterranean -- 45120",
    "lat": 31.266667,
    "lon": 32.3,
    "waterBody": "Mediterranean Sea; North Atlantic Ocean"
  },
  {
    "name": "Ras Al Mishab",
    "country": "Saudi Arabia",
    "region": "Saudi Arabia Continued -- 48330",
    "lat": 28.116667,
    "lon": 48.633333,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Ras Al Khafji",
    "country": "Saudi Arabia",
    "region": "Saudi Arabia Continued -- 48330",
    "lat": 28.433333,
    "lon": 48.583333,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Ras  Tannurah",
    "country": "Saudi Arabia",
    "region": "Saudi Arabia Continued -- 48330",
    "lat": 26.633333,
    "lon": 50.166667,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Mina Salman",
    "country": "Bahrain",
    "region": "Bahrain -- 48305",
    "lat": 26.2,
    "lon": 50.633333,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Al-Basra Oil Terminal",
    "country": "Iraq",
    "region": "Iraq -- 48375",
    "lat": 29.683333,
    "lon": 48.816667,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Jazirat Das",
    "country": "United Arab Emirates",
    "region": "United Arab Emirates -- 48260",
    "lat": 25.15,
    "lon": 52.866667,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Al Rayyan Terminal",
    "country": "Qatar",
    "region": "Qatar -- 48285",
    "lat": 26.65,
    "lon": 51.55,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Doha",
    "country": "Qatar",
    "region": "Qatar -- 48285",
    "lat": 25.283333,
    "lon": 51.533333,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Fateh Oil Terminal",
    "country": "United Arab Emirates",
    "region": "United Arab Emirates -- 48260",
    "lat": 25.583333,
    "lon": 54.416667,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Khalifa Bin Salman",
    "country": "Bahrain",
    "region": "Bahrain -- 48305",
    "lat": 26.25,
    "lon": 50.75,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Al Basrah",
    "country": "Iraq",
    "region": "Iraq -- 48375",
    "lat": 30.516667,
    "lon": 47.833333,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Khawr Al Zubair",
    "country": "Iraq",
    "region": "Iraq -- 48375",
    "lat": 30.183333,
    "lon": 47.9,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Abadan",
    "country": "Iran",
    "region": "Iran -- 48410",
    "lat": 30.333333,
    "lon": 48.283333,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Khosrowabad",
    "country": "Iran",
    "region": "Iran -- 48410",
    "lat": 30.166667,
    "lon": 48.416667,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Al Shaheen Terminal",
    "country": "Qatar",
    "region": "Qatar -- 48285",
    "lat": 26.583333,
    "lon": 52,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Abu Zaby",
    "country": "United Arab Emirates",
    "region": "United Arab Emirates -- 48260",
    "lat": 24.5,
    "lon": 54.333333,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Ajman",
    "country": "United Arab Emirates",
    "region": "United Arab Emirates -- 48260",
    "lat": 25.416667,
    "lon": 55.433333,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Khawr Al Amaya",
    "country": "Iraq",
    "region": "Iraq -- 48375",
    "lat": 29.783333,
    "lon": 48.8,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Mina Abd Allah",
    "country": "Kuwait",
    "region": "Kuwait -- 48350",
    "lat": 29.016667,
    "lon": 48.166667,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Mina Al Ahmadi",
    "country": "Kuwait",
    "region": "Kuwait -- 48350",
    "lat": 29.066667,
    "lon": 48.166667,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Khawr Al Zubair Lng Terminal",
    "country": "Iraq",
    "region": "Iraq -- 48375",
    "lat": 30.133333,
    "lon": 47.916667,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Jazireh-Ye Sirri",
    "country": "Iran",
    "region": "Iran -- 48410",
    "lat": 25.9,
    "lon": 54.55,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Sirus Oil Terminal",
    "country": "Iran",
    "region": "Iran -- 48410",
    "lat": 29.016667,
    "lon": 49.483333,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Jazirat Halul",
    "country": "Qatar",
    "region": "Qatar -- 48285",
    "lat": 25.683333,
    "lon": 52.416667,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Jabal Az Zannah/ruways",
    "country": "United Arab Emirates",
    "region": "United Arab Emirates -- 48260",
    "lat": 24.2,
    "lon": 52.7,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Al Hamriyah Lpg Terminal",
    "country": "United Arab Emirates",
    "region": "United Arab Emirates -- 48260",
    "lat": 25.466667,
    "lon": 55.483333,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Ash Shariqah",
    "country": "United Arab Emirates",
    "region": "United Arab Emirates -- 48260",
    "lat": 25.416667,
    "lon": 55.366667,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Dammam",
    "country": "Saudi Arabia",
    "region": "Saudi Arabia Continued -- 48330",
    "lat": 26.5,
    "lon": 50.2,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Ju Aymah Oil Terminal",
    "country": "Saudi Arabia",
    "region": "Saudi Arabia Continued -- 48330",
    "lat": 26.933333,
    "lon": 50.033333,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Al Manamah",
    "country": "Bahrain",
    "region": "Bahrain -- 48305",
    "lat": 26.233333,
    "lon": 50.583333,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Ju Aymah Lpg Terminal",
    "country": "Saudi Arabia",
    "region": "Saudi Arabia Continued -- 48330",
    "lat": 26.866667,
    "lon": 50.05,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Doha Harbor",
    "country": "Kuwait",
    "region": "Kuwait -- 48350",
    "lat": 29.383333,
    "lon": 47.8,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Al Jazeera Port",
    "country": "United Arab Emirates",
    "region": "United Arab Emirates -- 48260",
    "lat": 25.716667,
    "lon": 55.783333,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Umm Al Qaywayn",
    "country": "United Arab Emirates",
    "region": "United Arab Emirates -- 48260",
    "lat": 25.583333,
    "lon": 55.583333,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Zirkuh Oil Field",
    "country": "United Arab Emirates",
    "region": "United Arab Emirates -- 48260",
    "lat": 24.866667,
    "lon": 53.05,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Sitrah",
    "country": "Bahrain",
    "region": "Bahrain -- 48305",
    "lat": 26.166667,
    "lon": 50.666667,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Umm An Nar",
    "country": "United Arab Emirates",
    "region": "United Arab Emirates -- 48260",
    "lat": 24.45,
    "lon": 54.483333,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Umm Said",
    "country": "Qatar",
    "region": "Qatar -- 48285",
    "lat": 24.916667,
    "lon": 51.566667,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Zirkuh",
    "country": "United Arab Emirates",
    "region": "United Arab Emirates -- 48260",
    "lat": 25.016667,
    "lon": 53,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Mubarraz Oil Terminal",
    "country": "United Arab Emirates",
    "region": "United Arab Emirates -- 48260",
    "lat": 24.433333,
    "lon": 53.516667,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Hulaylah Oil Terminal",
    "country": "United Arab Emirates",
    "region": "United Arab Emirates -- 48260",
    "lat": 25.983333,
    "lon": 55.933333,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Bandar Taheri Offshore Terminal",
    "country": "Iran",
    "region": "Iran -- 48410",
    "lat": 27.65,
    "lon": 52.35,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Bandar-E Pars Terminal",
    "country": "Iran",
    "region": "Iran -- 48410",
    "lat": 27.533333,
    "lon": 52.533333,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Mina Saqr",
    "country": "United Arab Emirates",
    "region": "United Arab Emirates -- 48260",
    "lat": 25.983333,
    "lon": 56.05,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Jazireh-Ye Lavan Oil Terminal",
    "country": "Iran",
    "region": "Iran -- 48410",
    "lat": 26.783333,
    "lon": 53.333333,
    "waterBody": "Persian Gulf; Indian Ocean"
  },
  {
    "name": "Sharmah",
    "country": "Saudi Arabia",
    "region": "Saudi Arabia -- 48100",
    "lat": 27.933333,
    "lon": 35.25,
    "waterBody": "Red Sea; Indian Ocean"
  },
  {
    "name": "Al Khair Oil Terminal",
    "country": "Sudan",
    "region": "Sudan -- 47910",
    "lat": 19.583333,
    "lon": 37.25,
    "waterBody": "Red Sea; Indian Ocean"
  },
  {
    "name": "Sharm El Sheikh",
    "country": "Egypt",
    "region": "Egypt Red Sea -- 47950",
    "lat": 27.85,
    "lon": 34.283333,
    "waterBody": "Red Sea; Indian Ocean"
  },
  {
    "name": "Al Qusayr",
    "country": "Egypt",
    "region": "Egypt Red Sea -- 47950",
    "lat": 26.1,
    "lon": 34.283333,
    "waterBody": "Red Sea; Indian Ocean"
  },
  {
    "name": "Duba Bulk Plant Tanker Terminal",
    "country": "Saudi Arabia",
    "region": "Saudi Arabia -- 48100",
    "lat": 27.316667,
    "lon": 35.9,
    "waterBody": "Red Sea; Indian Ocean"
  },
  {
    "name": "Hamrawein",
    "country": "Egypt",
    "region": "Egypt Red Sea -- 47950",
    "lat": 26.25,
    "lon": 34.2,
    "waterBody": "Red Sea; Indian Ocean"
  },
  {
    "name": "Beshayer Oil Terminal",
    "country": "Sudan",
    "region": "Sudan -- 47910",
    "lat": 19.4,
    "lon": 37.316667,
    "waterBody": "Red Sea; Indian Ocean"
  },
  {
    "name": "Salif",
    "country": "Yemen",
    "region": "Yemen Aden -- 48143",
    "lat": 15.3,
    "lon": 42.666667,
    "waterBody": "Red Sea; Indian Ocean"
  },
  {
    "name": "Al Mukha",
    "country": "Yemen",
    "region": "Yemen Aden -- 48143",
    "lat": 13.316667,
    "lon": 43.25,
    "waterBody": "Red Sea; Indian Ocean"
  },
  {
    "name": "Ras Isa Marine Terminal",
    "country": "Yemen",
    "region": "Yemen Aden -- 48143",
    "lat": 15.133333,
    "lon": 42.6,
    "waterBody": "Red Sea; Indian Ocean"
  },
  {
    "name": "Sawakin Harbor",
    "country": "Sudan",
    "region": "Sudan -- 47910",
    "lat": 19.133333,
    "lon": 37.35,
    "waterBody": "Red Sea; Indian Ocean"
  },
  {
    "name": "Mitsiwa Harbor",
    "country": "Eritrea",
    "region": "Eritrea -- 47870",
    "lat": 15.616667,
    "lon": 39.466667,
    "waterBody": "Red Sea; Indian Ocean"
  },
  {
    "name": "Assab",
    "country": "Eritrea",
    "region": "Eritrea -- 47870",
    "lat": 13,
    "lon": 42.75,
    "waterBody": "Red Sea; Indian Ocean"
  },
  {
    "name": "Safaja",
    "country": "Egypt",
    "region": "Egypt Red Sea -- 47950",
    "lat": 26.733333,
    "lon": 33.95,
    "waterBody": "Red Sea; Indian Ocean"
  },
  {
    "name": "Port Sudan",
    "country": "Sudan",
    "region": "Sudan -- 47910",
    "lat": 19.6,
    "lon": 37.233333,
    "waterBody": "Red Sea; Indian Ocean"
  },
  {
    "name": "Duba",
    "country": "Saudi Arabia",
    "region": "Saudi Arabia -- 48100",
    "lat": 27.566667,
    "lon": 35.533333,
    "waterBody": "Red Sea; Indian Ocean"
  },
  {
    "name": "Botany Bay",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -34,
    "lon": 151.233333,
    "waterBody": "Tasman Sea; South Pacific Ocean"
  },
  {
    "name": "Hay Point",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -21.283333,
    "lon": 149.3,
    "waterBody": "Coral Sea; South Pacific Ocean"
  },
  {
    "name": "Port Kembla",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -34.483333,
    "lon": 150.916667,
    "waterBody": "Tasman Sea; South Pacific Ocean"
  },
  {
    "name": "Melbourne",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -37.833333,
    "lon": 144.966667,
    "waterBody": "Bass Strait; South Pacific Ocean"
  },
  {
    "name": "Brisbane",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -27.466667,
    "lon": 153.033333,
    "waterBody": "South Pacific Ocean"
  },
  {
    "name": "King Fahd Port",
    "country": "Saudi Arabia",
    "region": "Saudi Arabia -- 48100",
    "lat": 23.95,
    "lon": 38.216667,
    "waterBody": "Red Sea; Indian Ocean"
  },
  {
    "name": "Geelong",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -38.15,
    "lon": 144.366667,
    "waterBody": "Bass Strait; South Pacific Ocean"
  },
  {
    "name": "Gladstone",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -23.85,
    "lon": 151.25,
    "waterBody": "Coral Sea; South Pacific Ocean"
  },
  {
    "name": "Mackay",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -21.116667,
    "lon": 149.216667,
    "waterBody": "Coral Sea; South Pacific Ocean"
  },
  {
    "name": "Sydney",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -33.866667,
    "lon": 151.2,
    "waterBody": "Tasman Sea; South Pacific Ocean"
  },
  {
    "name": "Port Alma",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -23.583333,
    "lon": 150.85,
    "waterBody": "Coral Sea; South Pacific Ocean"
  },
  {
    "name": "Newcastle",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -32.916667,
    "lon": 151.783333,
    "waterBody": "Tasman Sea; South Pacific Ocean"
  },
  {
    "name": "Jiddah",
    "country": "Saudi Arabia",
    "region": "Saudi Arabia -- 48100",
    "lat": 21.483333,
    "lon": 39.183333,
    "waterBody": "Red Sea; Indian Ocean"
  },
  {
    "name": "Jizan",
    "country": "Saudi Arabia",
    "region": "Saudi Arabia -- 48100",
    "lat": 16.9,
    "lon": 42.483333,
    "waterBody": "Red Sea; Indian Ocean"
  },
  {
    "name": "Yanbu",
    "country": "Saudi Arabia",
    "region": "Saudi Arabia -- 48100",
    "lat": 24.083333,
    "lon": 38.05,
    "waterBody": "Red Sea; Indian Ocean"
  },
  {
    "name": "Rabigh",
    "country": "Saudi Arabia",
    "region": "Saudi Arabia -- 48100",
    "lat": 22.733333,
    "lon": 38.983333,
    "waterBody": "Red Sea; Indian Ocean"
  },
  {
    "name": "Al Ahmadi",
    "country": "Yemen",
    "region": "Yemen Aden -- 48143",
    "lat": 14.833333,
    "lon": 42.966667,
    "waterBody": "Red Sea; Indian Ocean"
  },
  {
    "name": "Kupang",
    "country": "Indonesia",
    "region": "Lesser Sunda Islands -- 51250",
    "lat": -10.166667,
    "lon": 123.583333,
    "waterBody": "Savu Sea; Indian Ocean"
  },
  {
    "name": "Larantuka",
    "country": "Indonesia",
    "region": "Lesser Sunda Islands -- 51250",
    "lat": -8.35,
    "lon": 122.983333,
    "waterBody": "Savu Sea; Indian Ocean"
  },
  {
    "name": "Ende",
    "country": "Indonesia",
    "region": "Lesser Sunda Islands -- 51250",
    "lat": -8.833333,
    "lon": 121.65,
    "waterBody": "Savu Sea; Indian Ocean"
  },
  {
    "name": "Waingapu",
    "country": "Indonesia",
    "region": "Lesser Sunda Islands -- 51250",
    "lat": -9.633333,
    "lon": 120.216667,
    "waterBody": "Savu Sea; Indian Ocean"
  },
  {
    "name": "Port Huon",
    "country": "Australia",
    "region": "Tasmania -- 54700",
    "lat": -43.166667,
    "lon": 146.983333,
    "waterBody": "South Pacific Ocean"
  },
  {
    "name": "Thursday Island",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -10.583333,
    "lon": 142.216667,
    "waterBody": "Torres Strait; South Pacific Ocean"
  },
  {
    "name": "Stanley",
    "country": "Australia",
    "region": "Tasmania -- 54700",
    "lat": -40.766667,
    "lon": 145.283333,
    "waterBody": "Bass Strait; South Pacific Ocean"
  },
  {
    "name": "Burnie",
    "country": "Australia",
    "region": "Tasmania -- 54700",
    "lat": -41.05,
    "lon": 145.95,
    "waterBody": "Bass Strait; South Pacific Ocean"
  },
  {
    "name": "Bundaberg",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -24.866667,
    "lon": 152.35,
    "waterBody": "Coral Sea; South Pacific Ocean"
  },
  {
    "name": "Cairns",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -16.916667,
    "lon": 145.783333,
    "waterBody": "Coral Sea; South Pacific Ocean"
  },
  {
    "name": "Lucinda",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -18.516667,
    "lon": 146.333333,
    "waterBody": "Coral Sea; South Pacific Ocean"
  },
  {
    "name": "Dover",
    "country": "Australia",
    "region": "Tasmania -- 54700",
    "lat": -43.316667,
    "lon": 147.033333,
    "waterBody": "South Pacific Ocean"
  },
  {
    "name": "Port Latta",
    "country": "Australia",
    "region": "Tasmania -- 54700",
    "lat": -40.833333,
    "lon": 145.383333,
    "waterBody": "Bass Strait; South Pacific Ocean"
  },
  {
    "name": "Townsville",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -19.266667,
    "lon": 146.816667,
    "waterBody": "Coral Sea; South Pacific Ocean"
  },
  {
    "name": "Ballina",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -28.866667,
    "lon": 153.566667,
    "waterBody": "Tasman Sea; South Pacific Ocean"
  },
  {
    "name": "Devonport",
    "country": "Australia",
    "region": "Tasmania -- 54700",
    "lat": -41.183333,
    "lon": 146.366667,
    "waterBody": "Bass Strait; South Pacific Ocean"
  },
  {
    "name": "Port Bonython",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -33.016667,
    "lon": 137.766667,
    "waterBody": "Spencer Gulf; Indian Ocean"
  },
  {
    "name": "Port Pirie",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -33.183333,
    "lon": 138.016667,
    "waterBody": "Spencer Gulf; Indian Ocean"
  },
  {
    "name": "Wallaroo",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -33.933333,
    "lon": 137.616667,
    "waterBody": "Spencer Gulf; Indian Ocean"
  },
  {
    "name": "Whyalla",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -33.033333,
    "lon": 137.583333,
    "waterBody": "Spencer Gulf; Indian Ocean"
  },
  {
    "name": "Mourilyan Harbour",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -17.6,
    "lon": 146.133333,
    "waterBody": "Coral Sea; South Pacific Ocean"
  },
  {
    "name": "Cape Flattery Harbor",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -14.95,
    "lon": 145.35,
    "waterBody": "Coral Sea; South Pacific Ocean"
  },
  {
    "name": "Port Lincoln",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -34.716667,
    "lon": 135.85,
    "waterBody": "Spencer Gulf; Indian Ocean"
  },
  {
    "name": "Jazireh-Ye Hormoz",
    "country": "Iran",
    "region": "Iran -- 48410",
    "lat": 27.1,
    "lon": 56.45,
    "waterBody": "Strait of Hormuz; Indian Ocean"
  },
  {
    "name": "Khawr Khasab",
    "country": "Oman",
    "region": "Oman -- 48225",
    "lat": 26.216667,
    "lon": 56.233333,
    "waterBody": "Strait of Hormuz; Indian Ocean"
  },
  {
    "name": "Bandar Abbas",
    "country": "Iran",
    "region": "Iran -- 48410",
    "lat": 27.15,
    "lon": 56.2,
    "waterBody": "Strait of Hormuz; Indian Ocean"
  },
  {
    "name": "Bandar-E Shahid Reajie",
    "country": "Iran",
    "region": "Iran -- 48410",
    "lat": 27.1,
    "lon": 56.066667,
    "waterBody": "Strait of Hormuz; Indian Ocean"
  },
  {
    "name": "Pulau Bukom",
    "country": "Singapore",
    "region": "Singapore -- 49990",
    "lat": 1.233333,
    "lon": 103.766667,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Dumai",
    "country": "Indonesia",
    "region": "Sumatera -- 50515",
    "lat": 1.683333,
    "lon": 101.45,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Pulau Sambu",
    "country": "Indonesia",
    "region": "Indonesia -- 50020",
    "lat": 1.166667,
    "lon": 103.9,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Lalang Marine Terminal",
    "country": "Indonesia",
    "region": "Indonesia -- 50020",
    "lat": 1.183333,
    "lon": 102.216667,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Pangkalansusu",
    "country": "Indonesia",
    "region": "Sumatera -- 50515",
    "lat": 4.116667,
    "lon": 98.216667,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Muar",
    "country": "Malaysia",
    "region": "Malaysia -- 49820",
    "lat": 2.05,
    "lon": 102.566667,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Port Langkawi",
    "country": "Malaysia",
    "region": "Malaysia -- 49820",
    "lat": 6.433333,
    "lon": 99.766667,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Keppel - (East Singapore)",
    "country": "Singapore",
    "region": "Singapore -- 49990",
    "lat": 1.283333,
    "lon": 103.85,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Jurong Island",
    "country": "Singapore",
    "region": "Singapore -- 49990",
    "lat": 1.283333,
    "lon": 103.733333,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Belawan",
    "country": "Indonesia",
    "region": "Sumatera -- 50515",
    "lat": 3.783333,
    "lon": 98.683333,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Johor",
    "country": "Malaysia",
    "region": "Malaysia -- 49820",
    "lat": 1.433333,
    "lon": 103.9,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Lumut",
    "country": "Malaysia",
    "region": "Malaysia -- 49820",
    "lat": 4.233333,
    "lon": 100.633333,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Melaka",
    "country": "Malaysia",
    "region": "Malaysia -- 49820",
    "lat": 2.2,
    "lon": 102.25,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Bengkalis",
    "country": "Indonesia",
    "region": "Sumatera -- 50515",
    "lat": 1.466667,
    "lon": 102.1,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Kuala Tanjung",
    "country": "Indonesia",
    "region": "Sumatera -- 50515",
    "lat": 3.366667,
    "lon": 99.483333,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Sungaipakning",
    "country": "Indonesia",
    "region": "Sumatera -- 50515",
    "lat": 1.35,
    "lon": 102.166667,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Tanjunguban",
    "country": "Indonesia",
    "region": "Indonesia -- 50020",
    "lat": 1.066667,
    "lon": 104.216667,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Pulau Pinang",
    "country": "Malaysia",
    "region": "Malaysia -- 49820",
    "lat": 5.416667,
    "lon": 100.35,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Milner Bay",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -13.866667,
    "lon": 136.416667,
    "waterBody": "Gulf of Carpentaria; Arafura Sea; South Pacific Ocean"
  },
  {
    "name": "Weipa",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -12.666667,
    "lon": 141.866667,
    "waterBody": "Gulf of Carpentaria; Arafura Sea; South Pacific Ocean"
  },
  {
    "name": "Port Klang",
    "country": "Malaysia",
    "region": "Malaysia -- 49820",
    "lat": 3,
    "lon": 101.4,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Pulau Sebarok",
    "country": "Singapore",
    "region": "Singapore -- 49990",
    "lat": 1.2,
    "lon": 103.8,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Tanjung Pelepas",
    "country": "Malaysia",
    "region": "Malaysia -- 49820",
    "lat": 1.35,
    "lon": 103.55,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Serangoon Harbor",
    "country": "Singapore",
    "region": "Singapore -- 49990",
    "lat": 1.4,
    "lon": 103.95,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Gove",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -12.2,
    "lon": 136.7,
    "waterBody": "Arafura Sea; South Pacific Ocean"
  },
  {
    "name": "Karumba",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -17.483333,
    "lon": 140.833333,
    "waterBody": "Gulf of Carpentaria; Arafura Sea; South Pacific Ocean"
  },
  {
    "name": "Teluk Anson",
    "country": "Malaysia",
    "region": "Malaysia -- 49820",
    "lat": 4.016667,
    "lon": 101.016667,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Tanjung Balai Karimun",
    "country": "Indonesia",
    "region": "Sumatera -- 50515",
    "lat": 0.983333,
    "lon": 103.433333,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Pelabuhan Sungai Udang",
    "country": "Malaysia",
    "region": "Malaysia -- 49820",
    "lat": 2.25,
    "lon": 102.133333,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Kumai",
    "country": "Indonesia",
    "region": "Indonesia - Borneo -- 51760",
    "lat": -2.75,
    "lon": 111.716667,
    "waterBody": "Java Sea; South Pacific Ocean"
  },
  {
    "name": "Kuala Belait",
    "country": "Brunei",
    "region": "Malaysia -- 51548",
    "lat": 4.633333,
    "lon": 114.2,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Tegal",
    "country": "Indonesia",
    "region": "Jawa -- 50920",
    "lat": -6.85,
    "lon": 109.133333,
    "waterBody": "Java Sea; South Pacific Ocean"
  },
  {
    "name": "Sarikei",
    "country": "Malaysia",
    "region": "Sarawak -- 51550",
    "lat": 2.133333,
    "lon": 111.533333,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Panarukan",
    "country": "Indonesia",
    "region": "Jawa -- 50920",
    "lat": -7.7,
    "lon": 113.933333,
    "waterBody": "Bali Sea; Java Sea; South Pacific Ocean"
  },
  {
    "name": "Senipah Oil Terminal",
    "country": "Indonesia",
    "region": "Indonesia - Borneo -- 51760",
    "lat": -0.95,
    "lon": 117.166667,
    "waterBody": "Makassar Strait; South Pacific Ocean"
  },
  {
    "name": "Bintulu Port",
    "country": "Malaysia",
    "region": "Sarawak -- 51550",
    "lat": 3.266667,
    "lon": 113.066667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Cirebon",
    "country": "Indonesia",
    "region": "Jawa -- 50920",
    "lat": -6.716667,
    "lon": 108.566667,
    "waterBody": "Java Sea; South Pacific Ocean"
  },
  {
    "name": "Benoa",
    "country": "Indonesia",
    "region": "Indonesia - Borneo -- 51760",
    "lat": 0.983333,
    "lon": 117.966667,
    "waterBody": "Makassar Strait; South Pacific Ocean"
  },
  {
    "name": "Parepare",
    "country": "Indonesia",
    "region": "Sulawesi -- 51970",
    "lat": -4,
    "lon": 119.616667,
    "waterBody": "Makassar Strait; South Pacific Ocean"
  },
  {
    "name": "Tanah Merah",
    "country": "Indonesia",
    "region": "Indonesia - Borneo -- 51760",
    "lat": -1.816667,
    "lon": 116.166667,
    "waterBody": "Makassar Strait; South Pacific Ocean"
  },
  {
    "name": "Pelabuhan Bass",
    "country": "Malaysia",
    "region": "Malaysia -- 49820",
    "lat": 6.316667,
    "lon": 99.833333,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Sekupang",
    "country": "Indonesia",
    "region": "Indonesia -- 50020",
    "lat": 1.133333,
    "lon": 103.916667,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "Miri",
    "country": "Malaysia",
    "region": "Sarawak -- 51550",
    "lat": 4.383333,
    "lon": 113.966667,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Kuching",
    "country": "Malaysia",
    "region": "Sarawak -- 51550",
    "lat": 1.566667,
    "lon": 110.35,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Lumut",
    "country": "Brunei",
    "region": "Brunei -- 51610",
    "lat": 4.716667,
    "lon": 114.45,
    "waterBody": "South China Sea; North Pacific Ocean"
  },
  {
    "name": "Port Dickson",
    "country": "Malaysia",
    "region": "Malaysia -- 49820",
    "lat": 2.533333,
    "lon": 101.783333,
    "waterBody": "Strait of Malacca; Indian Ocean"
  },
  {
    "name": "El Ismailiya",
    "country": "Egypt",
    "region": "Egypt Red Sea -- 47950",
    "lat": 30.583333,
    "lon": 32.283333,
    "waterBody": "Suez Canal; Red Sea; Indian Ocean"
  },
  {
    "name": "Darwin",
    "country": "Australia",
    "region": "Australia -- 53290",
    "lat": -12.47138889,
    "lon": 130.8477778,
    "waterBody": "Timor Sea; Indian Ocean"
  }
];

// Helper functions
function getAllPorts() {
  return INDIAN_OCEAN_PORTS;
}

function getPortsByCountry(country) {
  return INDIAN_OCEAN_PORTS.filter(port => 
    port.country.toLowerCase() === country.toLowerCase()
  );
}

function getPortsByRegion(region) {
  return INDIAN_OCEAN_PORTS.filter(port => 
    port.region.toLowerCase().includes(region.toLowerCase()) ||
    port.waterBody.toLowerCase().includes(region.toLowerCase())
  );
}

function searchPorts(query) {
  const lowerQuery = query.toLowerCase();
  return INDIAN_OCEAN_PORTS.filter(port =>
    port.name.toLowerCase().includes(lowerQuery) ||
    port.country.toLowerCase().includes(lowerQuery) ||
    port.region.toLowerCase().includes(lowerQuery) ||
    port.waterBody.toLowerCase().includes(lowerQuery)
  );
}

function getCountries() {
  const countries = [...new Set(INDIAN_OCEAN_PORTS.map(p => p.country))];
  return countries.sort();
}

function getRegions() {
  const regions = [...new Set(INDIAN_OCEAN_PORTS.map(p => p.region))];
  return regions.filter(r => r).sort();
}

function findNearestPort(lat, lon, maxResults = 10) {
  // Calculate distance using Haversine formula
  const toRad = (deg) => (deg * Math.PI) / 180;
  
  const portsWithDistance = INDIAN_OCEAN_PORTS.map(port => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(port.lat - lat);
    const dLon = toRad(port.lon - lon);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat)) * Math.cos(toRad(port.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return { ...port, distance: distance.toFixed(2) };
  });

  return portsWithDistance
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
    .slice(0, maxResults);
}

function getPortByName(name) {
  return INDIAN_OCEAN_PORTS.find(port => 
    port.name.toLowerCase() === name.toLowerCase()
  );
}

module.exports = {
  INDIAN_OCEAN_PORTS,
  getAllPorts,
  getPortsByCountry,
  getPortsByRegion,
  searchPorts,
  getCountries,
  getRegions,
  findNearestPort,
  getPortByName
};
