"""Airport and country data for autocomplete."""

from __future__ import annotations

# List of major airports: (IATA code, airport name, city, country)
AIRPORTS: list[dict] = [
    # United Kingdom
    {"iata": "LHR", "name": "London Heathrow", "city": "London", "country": "United Kingdom"},
    {"iata": "LGW", "name": "London Gatwick", "city": "London", "country": "United Kingdom"},
    {"iata": "STN", "name": "London Stansted", "city": "London", "country": "United Kingdom"},
    {"iata": "LTN", "name": "London Luton", "city": "London", "country": "United Kingdom"},
    {"iata": "LCY", "name": "London City", "city": "London", "country": "United Kingdom"},
    {"iata": "MAN", "name": "Manchester Airport", "city": "Manchester", "country": "United Kingdom"},
    {"iata": "BHX", "name": "Birmingham Airport", "city": "Birmingham", "country": "United Kingdom"},
    {"iata": "EDI", "name": "Edinburgh Airport", "city": "Edinburgh", "country": "United Kingdom"},
    {"iata": "GLA", "name": "Glasgow Airport", "city": "Glasgow", "country": "United Kingdom"},
    {"iata": "BRS", "name": "Bristol Airport", "city": "Bristol", "country": "United Kingdom"},
    {"iata": "LPL", "name": "Liverpool John Lennon", "city": "Liverpool", "country": "United Kingdom"},
    {"iata": "NCL", "name": "Newcastle Airport", "city": "Newcastle", "country": "United Kingdom"},
    {"iata": "EMA", "name": "East Midlands Airport", "city": "Nottingham", "country": "United Kingdom"},
    {"iata": "BFS", "name": "Belfast International", "city": "Belfast", "country": "United Kingdom"},
    {"iata": "ABZ", "name": "Aberdeen Airport", "city": "Aberdeen", "country": "United Kingdom"},
    {"iata": "CWL", "name": "Cardiff Airport", "city": "Cardiff", "country": "United Kingdom"},
    {"iata": "SOU", "name": "Southampton Airport", "city": "Southampton", "country": "United Kingdom"},
    {"iata": "LBA", "name": "Leeds Bradford Airport", "city": "Leeds", "country": "United Kingdom"},
    # United States
    {"iata": "JFK", "name": "John F. Kennedy International", "city": "New York", "country": "United States"},
    {"iata": "LAX", "name": "Los Angeles International", "city": "Los Angeles", "country": "United States"},
    {"iata": "ORD", "name": "Chicago O'Hare International", "city": "Chicago", "country": "United States"},
    {"iata": "ATL", "name": "Hartsfield-Jackson Atlanta", "city": "Atlanta", "country": "United States"},
    {"iata": "DFW", "name": "Dallas/Fort Worth International", "city": "Dallas", "country": "United States"},
    {"iata": "DEN", "name": "Denver International", "city": "Denver", "country": "United States"},
    {"iata": "SFO", "name": "San Francisco International", "city": "San Francisco", "country": "United States"},
    {"iata": "SEA", "name": "Seattle-Tacoma International", "city": "Seattle", "country": "United States"},
    {"iata": "MIA", "name": "Miami International", "city": "Miami", "country": "United States"},
    {"iata": "MCO", "name": "Orlando International", "city": "Orlando", "country": "United States"},
    {"iata": "EWR", "name": "Newark Liberty International", "city": "Newark", "country": "United States"},
    {"iata": "LGA", "name": "LaGuardia Airport", "city": "New York", "country": "United States"},
    {"iata": "BOS", "name": "Boston Logan International", "city": "Boston", "country": "United States"},
    {"iata": "IAD", "name": "Washington Dulles International", "city": "Washington", "country": "United States"},
    {"iata": "DCA", "name": "Ronald Reagan Washington National", "city": "Washington", "country": "United States"},
    {"iata": "PHX", "name": "Phoenix Sky Harbor", "city": "Phoenix", "country": "United States"},
    {"iata": "IAH", "name": "George Bush Intercontinental", "city": "Houston", "country": "United States"},
    {"iata": "LAS", "name": "Harry Reid International", "city": "Las Vegas", "country": "United States"},
    {"iata": "MSP", "name": "Minneapolis-Saint Paul International", "city": "Minneapolis", "country": "United States"},
    {"iata": "DTW", "name": "Detroit Metropolitan", "city": "Detroit", "country": "United States"},
    {"iata": "PHL", "name": "Philadelphia International", "city": "Philadelphia", "country": "United States"},
    # France
    {"iata": "CDG", "name": "Paris Charles de Gaulle", "city": "Paris", "country": "France"},
    {"iata": "ORY", "name": "Paris Orly", "city": "Paris", "country": "France"},
    {"iata": "NCE", "name": "Nice Cote d'Azur", "city": "Nice", "country": "France"},
    {"iata": "LYS", "name": "Lyon-Saint Exupery", "city": "Lyon", "country": "France"},
    {"iata": "MRS", "name": "Marseille Provence", "city": "Marseille", "country": "France"},
    {"iata": "TLS", "name": "Toulouse-Blagnac", "city": "Toulouse", "country": "France"},
    {"iata": "BOD", "name": "Bordeaux-Merignac", "city": "Bordeaux", "country": "France"},
    # Germany
    {"iata": "FRA", "name": "Frankfurt Airport", "city": "Frankfurt", "country": "Germany"},
    {"iata": "MUC", "name": "Munich Airport", "city": "Munich", "country": "Germany"},
    {"iata": "BER", "name": "Berlin Brandenburg", "city": "Berlin", "country": "Germany"},
    {"iata": "DUS", "name": "Dusseldorf Airport", "city": "Dusseldorf", "country": "Germany"},
    {"iata": "HAM", "name": "Hamburg Airport", "city": "Hamburg", "country": "Germany"},
    {"iata": "CGN", "name": "Cologne Bonn Airport", "city": "Cologne", "country": "Germany"},
    {"iata": "STR", "name": "Stuttgart Airport", "city": "Stuttgart", "country": "Germany"},
    # Spain
    {"iata": "MAD", "name": "Madrid-Barajas", "city": "Madrid", "country": "Spain"},
    {"iata": "BCN", "name": "Barcelona-El Prat", "city": "Barcelona", "country": "Spain"},
    {"iata": "PMI", "name": "Palma de Mallorca", "city": "Palma", "country": "Spain"},
    {"iata": "AGP", "name": "Malaga-Costa del Sol", "city": "Malaga", "country": "Spain"},
    {"iata": "ALC", "name": "Alicante-Elche", "city": "Alicante", "country": "Spain"},
    {"iata": "TFS", "name": "Tenerife South", "city": "Tenerife", "country": "Spain"},
    {"iata": "LPA", "name": "Gran Canaria Airport", "city": "Las Palmas", "country": "Spain"},
    # Italy
    {"iata": "FCO", "name": "Rome Fiumicino", "city": "Rome", "country": "Italy"},
    {"iata": "MXP", "name": "Milan Malpensa", "city": "Milan", "country": "Italy"},
    {"iata": "LIN", "name": "Milan Linate", "city": "Milan", "country": "Italy"},
    {"iata": "VCE", "name": "Venice Marco Polo", "city": "Venice", "country": "Italy"},
    {"iata": "NAP", "name": "Naples International", "city": "Naples", "country": "Italy"},
    {"iata": "BLQ", "name": "Bologna Guglielmo Marconi", "city": "Bologna", "country": "Italy"},
    {"iata": "FLR", "name": "Florence Airport", "city": "Florence", "country": "Italy"},
    # Netherlands
    {"iata": "AMS", "name": "Amsterdam Schiphol", "city": "Amsterdam", "country": "Netherlands"},
    {"iata": "EIN", "name": "Eindhoven Airport", "city": "Eindhoven", "country": "Netherlands"},
    # Switzerland
    {"iata": "ZRH", "name": "Zurich Airport", "city": "Zurich", "country": "Switzerland"},
    {"iata": "GVA", "name": "Geneva Airport", "city": "Geneva", "country": "Switzerland"},
    {"iata": "BSL", "name": "Basel-Mulhouse-Freiburg", "city": "Basel", "country": "Switzerland"},
    # Portugal
    {"iata": "LIS", "name": "Lisbon Humberto Delgado", "city": "Lisbon", "country": "Portugal"},
    {"iata": "OPO", "name": "Porto Airport", "city": "Porto", "country": "Portugal"},
    {"iata": "FAO", "name": "Faro Airport", "city": "Faro", "country": "Portugal"},
    # Turkey
    {"iata": "IST", "name": "Istanbul Airport", "city": "Istanbul", "country": "Turkey"},
    {"iata": "SAW", "name": "Istanbul Sabiha Gokcen", "city": "Istanbul", "country": "Turkey"},
    {"iata": "AYT", "name": "Antalya Airport", "city": "Antalya", "country": "Turkey"},
    {"iata": "ESB", "name": "Ankara Esenboga", "city": "Ankara", "country": "Turkey"},
    {"iata": "ADB", "name": "Izmir Adnan Menderes", "city": "Izmir", "country": "Turkey"},
    # Greece
    {"iata": "ATH", "name": "Athens International", "city": "Athens", "country": "Greece"},
    {"iata": "SKG", "name": "Thessaloniki Airport", "city": "Thessaloniki", "country": "Greece"},
    {"iata": "HER", "name": "Heraklion International", "city": "Heraklion", "country": "Greece"},
    {"iata": "RHO", "name": "Rhodes International", "city": "Rhodes", "country": "Greece"},
    # Austria
    {"iata": "VIE", "name": "Vienna International", "city": "Vienna", "country": "Austria"},
    {"iata": "SZG", "name": "Salzburg Airport", "city": "Salzburg", "country": "Austria"},
    {"iata": "INN", "name": "Innsbruck Airport", "city": "Innsbruck", "country": "Austria"},
    # Belgium
    {"iata": "BRU", "name": "Brussels Airport", "city": "Brussels", "country": "Belgium"},
    {"iata": "CRL", "name": "Brussels South Charleroi", "city": "Charleroi", "country": "Belgium"},
    # Ireland
    {"iata": "DUB", "name": "Dublin Airport", "city": "Dublin", "country": "Ireland"},
    {"iata": "SNN", "name": "Shannon Airport", "city": "Shannon", "country": "Ireland"},
    {"iata": "ORK", "name": "Cork Airport", "city": "Cork", "country": "Ireland"},
    # Scandinavian countries
    {"iata": "CPH", "name": "Copenhagen Airport", "city": "Copenhagen", "country": "Denmark"},
    {"iata": "OSL", "name": "Oslo Gardermoen", "city": "Oslo", "country": "Norway"},
    {"iata": "BGO", "name": "Bergen Airport", "city": "Bergen", "country": "Norway"},
    {"iata": "ARN", "name": "Stockholm Arlanda", "city": "Stockholm", "country": "Sweden"},
    {"iata": "GOT", "name": "Gothenburg Landvetter", "city": "Gothenburg", "country": "Sweden"},
    {"iata": "HEL", "name": "Helsinki-Vantaa", "city": "Helsinki", "country": "Finland"},
    # Poland
    {"iata": "WAW", "name": "Warsaw Chopin", "city": "Warsaw", "country": "Poland"},
    {"iata": "KRK", "name": "Krakow John Paul II", "city": "Krakow", "country": "Poland"},
    {"iata": "GDN", "name": "Gdansk Lech Walesa", "city": "Gdansk", "country": "Poland"},
    {"iata": "WRO", "name": "Wroclaw Airport", "city": "Wroclaw", "country": "Poland"},
    # Czech Republic
    {"iata": "PRG", "name": "Prague Vaclav Havel", "city": "Prague", "country": "Czech Republic"},
    # Hungary
    {"iata": "BUD", "name": "Budapest Ferenc Liszt", "city": "Budapest", "country": "Hungary"},
    # Romania
    {"iata": "OTP", "name": "Bucharest Henri Coanda", "city": "Bucharest", "country": "Romania"},
    {"iata": "CLJ", "name": "Cluj-Napoca International", "city": "Cluj-Napoca", "country": "Romania"},
    # Croatia
    {"iata": "ZAG", "name": "Zagreb Airport", "city": "Zagreb", "country": "Croatia"},
    {"iata": "DBV", "name": "Dubrovnik Airport", "city": "Dubrovnik", "country": "Croatia"},
    {"iata": "SPU", "name": "Split Airport", "city": "Split", "country": "Croatia"},
    # Bulgaria
    {"iata": "SOF", "name": "Sofia Airport", "city": "Sofia", "country": "Bulgaria"},
    # UAE
    {"iata": "DXB", "name": "Dubai International", "city": "Dubai", "country": "United Arab Emirates"},
    {"iata": "AUH", "name": "Abu Dhabi International", "city": "Abu Dhabi", "country": "United Arab Emirates"},
    {"iata": "SHJ", "name": "Sharjah International", "city": "Sharjah", "country": "United Arab Emirates"},
    # Saudi Arabia
    {"iata": "RUH", "name": "King Khalid International", "city": "Riyadh", "country": "Saudi Arabia"},
    {"iata": "JED", "name": "King Abdulaziz International", "city": "Jeddah", "country": "Saudi Arabia"},
    {"iata": "DMM", "name": "King Fahd International", "city": "Dammam", "country": "Saudi Arabia"},
    # Qatar
    {"iata": "DOH", "name": "Hamad International", "city": "Doha", "country": "Qatar"},
    # Bahrain
    {"iata": "BAH", "name": "Bahrain International", "city": "Manama", "country": "Bahrain"},
    # Oman
    {"iata": "MCT", "name": "Muscat International", "city": "Muscat", "country": "Oman"},
    # Kuwait
    {"iata": "KWI", "name": "Kuwait International", "city": "Kuwait City", "country": "Kuwait"},
    # Egypt
    {"iata": "CAI", "name": "Cairo International", "city": "Cairo", "country": "Egypt"},
    {"iata": "HRG", "name": "Hurghada International", "city": "Hurghada", "country": "Egypt"},
    {"iata": "SSH", "name": "Sharm el-Sheikh International", "city": "Sharm el-Sheikh", "country": "Egypt"},
    # South Africa
    {"iata": "JNB", "name": "O.R. Tambo International", "city": "Johannesburg", "country": "South Africa"},
    {"iata": "CPT", "name": "Cape Town International", "city": "Cape Town", "country": "South Africa"},
    {"iata": "DUR", "name": "King Shaka International", "city": "Durban", "country": "South Africa"},
    # Morocco
    {"iata": "CMN", "name": "Mohammed V International", "city": "Casablanca", "country": "Morocco"},
    {"iata": "RAK", "name": "Marrakech Menara", "city": "Marrakech", "country": "Morocco"},
    # Kenya
    {"iata": "NBO", "name": "Jomo Kenyatta International", "city": "Nairobi", "country": "Kenya"},
    {"iata": "MBA", "name": "Moi International", "city": "Mombasa", "country": "Kenya"},
    # Nigeria
    {"iata": "LOS", "name": "Murtala Muhammed International", "city": "Lagos", "country": "Nigeria"},
    {"iata": "ABV", "name": "Nnamdi Azikiwe International", "city": "Abuja", "country": "Nigeria"},
    # Australia
    {"iata": "SYD", "name": "Sydney Kingsford Smith", "city": "Sydney", "country": "Australia"},
    {"iata": "MEL", "name": "Melbourne Tullamarine", "city": "Melbourne", "country": "Australia"},
    {"iata": "BNE", "name": "Brisbane Airport", "city": "Brisbane", "country": "Australia"},
    {"iata": "PER", "name": "Perth Airport", "city": "Perth", "country": "Australia"},
    {"iata": "ADL", "name": "Adelaide Airport", "city": "Adelaide", "country": "Australia"},
    {"iata": "OOL", "name": "Gold Coast Airport", "city": "Gold Coast", "country": "Australia"},
    # New Zealand
    {"iata": "AKL", "name": "Auckland Airport", "city": "Auckland", "country": "New Zealand"},
    {"iata": "WLG", "name": "Wellington Airport", "city": "Wellington", "country": "New Zealand"},
    {"iata": "CHC", "name": "Christchurch Airport", "city": "Christchurch", "country": "New Zealand"},
    # Canada
    {"iata": "YYZ", "name": "Toronto Pearson International", "city": "Toronto", "country": "Canada"},
    {"iata": "YVR", "name": "Vancouver International", "city": "Vancouver", "country": "Canada"},
    {"iata": "YUL", "name": "Montreal-Trudeau International", "city": "Montreal", "country": "Canada"},
    {"iata": "YYC", "name": "Calgary International", "city": "Calgary", "country": "Canada"},
    {"iata": "YOW", "name": "Ottawa Macdonald-Cartier", "city": "Ottawa", "country": "Canada"},
    {"iata": "YEG", "name": "Edmonton International", "city": "Edmonton", "country": "Canada"},
    # Mexico
    {"iata": "MEX", "name": "Mexico City International", "city": "Mexico City", "country": "Mexico"},
    {"iata": "CUN", "name": "Cancun International", "city": "Cancun", "country": "Mexico"},
    {"iata": "GDL", "name": "Guadalajara International", "city": "Guadalajara", "country": "Mexico"},
    # Brazil
    {"iata": "GRU", "name": "Sao Paulo-Guarulhos", "city": "Sao Paulo", "country": "Brazil"},
    {"iata": "GIG", "name": "Rio de Janeiro-Galeao", "city": "Rio de Janeiro", "country": "Brazil"},
    {"iata": "BSB", "name": "Brasilia International", "city": "Brasilia", "country": "Brazil"},
    # Argentina
    {"iata": "EZE", "name": "Buenos Aires Ezeiza", "city": "Buenos Aires", "country": "Argentina"},
    # Colombia
    {"iata": "BOG", "name": "El Dorado International", "city": "Bogota", "country": "Colombia"},
    # Chile
    {"iata": "SCL", "name": "Santiago International", "city": "Santiago", "country": "Chile"},
    # Peru
    {"iata": "LIM", "name": "Jorge Chavez International", "city": "Lima", "country": "Peru"},
    # Japan
    {"iata": "NRT", "name": "Narita International", "city": "Tokyo", "country": "Japan"},
    {"iata": "HND", "name": "Tokyo Haneda", "city": "Tokyo", "country": "Japan"},
    {"iata": "KIX", "name": "Kansai International", "city": "Osaka", "country": "Japan"},
    {"iata": "ITM", "name": "Osaka Itami", "city": "Osaka", "country": "Japan"},
    {"iata": "NGO", "name": "Chubu Centrair", "city": "Nagoya", "country": "Japan"},
    # China
    {"iata": "PEK", "name": "Beijing Capital International", "city": "Beijing", "country": "China"},
    {"iata": "PVG", "name": "Shanghai Pudong", "city": "Shanghai", "country": "China"},
    {"iata": "CAN", "name": "Guangzhou Baiyun", "city": "Guangzhou", "country": "China"},
    {"iata": "SZX", "name": "Shenzhen Bao'an", "city": "Shenzhen", "country": "China"},
    {"iata": "CTU", "name": "Chengdu Tianfu", "city": "Chengdu", "country": "China"},
    {"iata": "HKG", "name": "Hong Kong International", "city": "Hong Kong", "country": "China"},
    # South Korea
    {"iata": "ICN", "name": "Incheon International", "city": "Seoul", "country": "South Korea"},
    {"iata": "GMP", "name": "Gimpo International", "city": "Seoul", "country": "South Korea"},
    {"iata": "PUS", "name": "Gimhae International", "city": "Busan", "country": "South Korea"},
    # Singapore
    {"iata": "SIN", "name": "Singapore Changi", "city": "Singapore", "country": "Singapore"},
    # Thailand
    {"iata": "BKK", "name": "Suvarnabhumi Airport", "city": "Bangkok", "country": "Thailand"},
    {"iata": "DMK", "name": "Don Mueang International", "city": "Bangkok", "country": "Thailand"},
    {"iata": "HKT", "name": "Phuket International", "city": "Phuket", "country": "Thailand"},
    {"iata": "CNX", "name": "Chiang Mai International", "city": "Chiang Mai", "country": "Thailand"},
    # Malaysia
    {"iata": "KUL", "name": "Kuala Lumpur International", "city": "Kuala Lumpur", "country": "Malaysia"},
    {"iata": "PEN", "name": "Penang International", "city": "Penang", "country": "Malaysia"},
    # Indonesia
    {"iata": "CGK", "name": "Soekarno-Hatta International", "city": "Jakarta", "country": "Indonesia"},
    {"iata": "DPS", "name": "Ngurah Rai International", "city": "Bali", "country": "Indonesia"},
    # Philippines
    {"iata": "MNL", "name": "Ninoy Aquino International", "city": "Manila", "country": "Philippines"},
    {"iata": "CEB", "name": "Mactan-Cebu International", "city": "Cebu", "country": "Philippines"},
    # Vietnam
    {"iata": "SGN", "name": "Tan Son Nhat International", "city": "Ho Chi Minh City", "country": "Vietnam"},
    {"iata": "HAN", "name": "Noi Bai International", "city": "Hanoi", "country": "Vietnam"},
    # India
    {"iata": "DEL", "name": "Indira Gandhi International", "city": "New Delhi", "country": "India"},
    {"iata": "BOM", "name": "Chhatrapati Shivaji Maharaj", "city": "Mumbai", "country": "India"},
    {"iata": "BLR", "name": "Kempegowda International", "city": "Bangalore", "country": "India"},
    {"iata": "MAA", "name": "Chennai International", "city": "Chennai", "country": "India"},
    {"iata": "HYD", "name": "Rajiv Gandhi International", "city": "Hyderabad", "country": "India"},
    {"iata": "CCU", "name": "Netaji Subhas Chandra Bose", "city": "Kolkata", "country": "India"},
    {"iata": "GOI", "name": "Goa International", "city": "Goa", "country": "India"},
    # Israel
    {"iata": "TLV", "name": "Ben Gurion International", "city": "Tel Aviv", "country": "Israel"},
    # Jordan
    {"iata": "AMM", "name": "Queen Alia International", "city": "Amman", "country": "Jordan"},
    # Sri Lanka
    {"iata": "CMB", "name": "Bandaranaike International", "city": "Colombo", "country": "Sri Lanka"},
    # Maldives
    {"iata": "MLE", "name": "Velana International", "city": "Male", "country": "Maldives"},
    # Cyprus
    {"iata": "LCA", "name": "Larnaca International", "city": "Larnaca", "country": "Cyprus"},
    {"iata": "PFO", "name": "Paphos International", "city": "Paphos", "country": "Cyprus"},
    # Malta
    {"iata": "MLA", "name": "Malta International", "city": "Valletta", "country": "Malta"},
    # Iceland
    {"iata": "KEF", "name": "Keflavik International", "city": "Reykjavik", "country": "Iceland"},
    # Luxembourg
    {"iata": "LUX", "name": "Luxembourg Airport", "city": "Luxembourg City", "country": "Luxembourg"},
    # Jamaica
    {"iata": "MBJ", "name": "Sangster International", "city": "Montego Bay", "country": "Jamaica"},
    {"iata": "KIN", "name": "Norman Manley International", "city": "Kingston", "country": "Jamaica"},
    # Dominican Republic
    {"iata": "PUJ", "name": "Punta Cana International", "city": "Punta Cana", "country": "Dominican Republic"},
    # Costa Rica
    {"iata": "SJO", "name": "Juan Santamaria International", "city": "San Jose", "country": "Costa Rica"},
    # Panama
    {"iata": "PTY", "name": "Tocumen International", "city": "Panama City", "country": "Panama"},
    # Tanzania
    {"iata": "DAR", "name": "Julius Nyerere International", "city": "Dar es Salaam", "country": "Tanzania"},
    {"iata": "JRO", "name": "Kilimanjaro International", "city": "Kilimanjaro", "country": "Tanzania"},
    # Ethiopia
    {"iata": "ADD", "name": "Addis Ababa Bole International", "city": "Addis Ababa", "country": "Ethiopia"},
    # Ghana
    {"iata": "ACC", "name": "Kotoka International", "city": "Accra", "country": "Ghana"},
    # Tunisia
    {"iata": "TUN", "name": "Tunis-Carthage International", "city": "Tunis", "country": "Tunisia"},
    # Mauritius
    {"iata": "MRU", "name": "Sir Seewoosagur Ramgoolam", "city": "Port Louis", "country": "Mauritius"},
    # Serbia
    {"iata": "BEG", "name": "Belgrade Nikola Tesla", "city": "Belgrade", "country": "Serbia"},
    # Latvia
    {"iata": "RIX", "name": "Riga International", "city": "Riga", "country": "Latvia"},
    # Lithuania
    {"iata": "VNO", "name": "Vilnius Airport", "city": "Vilnius", "country": "Lithuania"},
    # Estonia
    {"iata": "TLL", "name": "Tallinn Airport", "city": "Tallinn", "country": "Estonia"},
    # Slovakia
    {"iata": "BTS", "name": "Bratislava Airport", "city": "Bratislava", "country": "Slovakia"},
    # Slovenia
    {"iata": "LJU", "name": "Ljubljana Joze Pucnik", "city": "Ljubljana", "country": "Slovenia"},
    # Georgia
    {"iata": "TBS", "name": "Tbilisi International", "city": "Tbilisi", "country": "Georgia"},
    # Ukraine
    {"iata": "KBP", "name": "Boryspil International", "city": "Kyiv", "country": "Ukraine"},
    # Russia
    {"iata": "SVO", "name": "Moscow Sheremetyevo", "city": "Moscow", "country": "Russia"},
    {"iata": "DME", "name": "Moscow Domodedovo", "city": "Moscow", "country": "Russia"},
    {"iata": "LED", "name": "Pulkovo Airport", "city": "Saint Petersburg", "country": "Russia"},
    # Taiwan
    {"iata": "TPE", "name": "Taiwan Taoyuan International", "city": "Taipei", "country": "Taiwan"},
    # Pakistan
    {"iata": "ISB", "name": "Islamabad International", "city": "Islamabad", "country": "Pakistan"},
    {"iata": "KHI", "name": "Jinnah International", "city": "Karachi", "country": "Pakistan"},
    {"iata": "LHE", "name": "Allama Iqbal International", "city": "Lahore", "country": "Pakistan"},
    # Bangladesh
    {"iata": "DAC", "name": "Hazrat Shahjalal International", "city": "Dhaka", "country": "Bangladesh"},
    # Nepal
    {"iata": "KTM", "name": "Tribhuvan International", "city": "Kathmandu", "country": "Nepal"},
]


def get_countries() -> list[str]:
    """Return sorted list of unique countries."""
    countries = sorted(set(a["country"] for a in AIRPORTS))
    return countries


def search_airports(query: str, country: str = "") -> list[dict]:
    """Search airports by query string, optionally filtered by country.

    Matches against airport name, city, IATA code, and country.
    """
    q = query.lower().strip()
    results = []

    for airport in AIRPORTS:
        # Filter by country if specified
        if country and airport["country"].lower() != country.lower():
            continue

        # Match against name, city, IATA code
        searchable = f"{airport['iata']} {airport['name']} {airport['city']} {airport['country']}".lower()
        if not q or q in searchable:
            label = f"{airport['name']} ({airport['iata']})"
            results.append({
                "iata": airport["iata"],
                "name": airport["name"],
                "city": airport["city"],
                "country": airport["country"],
                "label": label,
            })

    return results[:20]  # Limit to 20 results


def search_countries(query: str) -> list[str]:
    """Search countries by query string."""
    q = query.lower().strip()
    countries = get_countries()
    if not q:
        return countries
    return [c for c in countries if q in c.lower()][:15]


def get_airport_info(iata: str) -> dict | None:
    """Get airport info by IATA code."""
    for airport in AIRPORTS:
        if airport["iata"].upper() == iata.upper():
            return airport
    return None
