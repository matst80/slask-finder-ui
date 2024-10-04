import { useMemo } from "react"


export const stores = [
    {
        "name": "Kungsbacka",
        "displayName": "Elgiganten Kungsbacka",
        "id": "2273",
        "url": "/store/elgiganten-kungsbacka",
        "address": {
            "street": "Kungsparksvägen",
            "nr": "83",
            "zip": "434 39",
            "city": "Kungsbacka",
            "location": {
                "lat": 57.51454,
                "lng": 12.0729
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Mora (Phonehouse)",
        "displayName": "Elgiganten Mora (Phonehouse)",
        "id": "2259",
        "url": "/store/phonehouse-mora",
        "address": {
            "street": "Kyrkogatan",
            "nr": "19",
            "zip": "792 30",
            "city": "Mora",
            "location": {
                "lat": 61.004578,
                "lng": 14.538478
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Piteå (Phonehouse)",
        "displayName": "Elgiganten Piteå (Phonehouse)",
        "id": "2260",
        "url": "/store/phonehouse-pitea",
        "address": {
            "street": "Storgatan",
            "nr": "66B",
            "zip": "941 32",
            "city": "Piteå",
            "location": {
                "lat": 65.317833,
                "lng": 21.477639
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Hudiksvall (Phonehouse)",
        "displayName": "Elgiganten Hudiksvall (Phonehouse)",
        "id": "2262",
        "url": "/store/phonehouse-hudiksvall",
        "address": {
            "street": "Drottninggatan",
            "nr": "7",
            "zip": "824 30",
            "city": "Hudiksvall",
            "location": {
                "lat": 61.728292,
                "lng": 17.104809
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Nässjö (Phonehouse)",
        "displayName": "Elgiganten Nässjö (Phonehouse)",
        "id": "2271",
        "url": "/store/phonehouse-nassjo",
        "address": {
            "street": "Rådhusgatan",
            "nr": "34B",
            "zip": "571 31",
            "city": "Nässjö",
            "location": {
                "lat": 57.65423,
                "lng": 14.69629
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Bålsta (Phonehouse)",
        "displayName": "Elgiganten Bålsta (Phonehouse)",
        "id": "2274",
        "url": "/store/phonehouse-balsta",
        "address": {
            "street": "Centrumstråket",
            "nr": "2",
            "zip": "746 32",
            "city": "Bålsta",
            "location": {
                "lat": 59.5672,
                "lng": 17.529443
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Löddeköpinge (Phonehouse)",
        "displayName": "Elgiganten Löddeköpinge (Phonehouse)",
        "id": "2276",
        "url": "/store/phonehouse-loddekopinge",
        "address": {
            "street": "Marknadsvägen",
            "nr": "7",
            "zip": "246 42",
            "city": "Löddeköpinge",
            "location": {
                "lat": 55.76873584,
                "lng": 12.99078428
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Malmö Burlöv (Phonehouse)",
        "displayName": "Elgiganten Malmö Burlöv (Phonehouse)",
        "id": "2293",
        "url": "/store/phonehouse-malmo-burlov",
        "address": {
            "street": "Kronetorpsvägen",
            "nr": "2",
            "zip": "232 37",
            "city": "Arlöv",
            "location": {
                "lat": 55.639851,
                "lng": 13.08597
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Höganäs (Phonehouse)",
        "displayName": "Elgiganten Höganäs (Phonehouse)",
        "id": "2272",
        "url": "/store/phonehouse-hoganas",
        "address": {
            "street": "Köpmansgatan",
            "nr": "22",
            "zip": "263 38",
            "city": "Höganäs",
            "location": {
                "lat": 56.19974,
                "lng": 12.55517
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Höllviken (Phonehouse)",
        "displayName": "Elgiganten Höllviken (Phonehouse)",
        "id": "2277",
        "url": "/store/phonehouse-hollviken",
        "address": {
            "street": "Kungstorpsvägen",
            "nr": "8",
            "zip": "236 32",
            "city": "Höllviken",
            "location": {
                "lat": 55.426087,
                "lng": 12.96475
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Tanum (Phonehouse)",
        "displayName": "Elgiganten Tanum (Phonehouse)",
        "id": "2278",
        "url": "/store/phonehouse-tanum",
        "address": {
            "street": "Brehogsvägen",
            "nr": "5",
            "zip": "457 32",
            "city": "Tanumshede",
            "location": {
                "lat": 58.722148,
                "lng": 11.346235
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Avesta (Phonehouse)",
        "displayName": "Elgiganten Avesta (Phonehouse)",
        "id": "2294",
        "url": "/store/phonehouse-avesta",
        "address": {
            "street": "Markustorget",
            "nr": "1",
            "zip": "774 30",
            "city": "Avesta",
            "location": {
                "lat": 60.146038,
                "lng": 16.168442
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": false,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Åkersberga (Phonehouse)",
        "displayName": "Elgiganten Åkersberga (Phonehouse)",
        "id": "2296",
        "url": "/store/phonehouse-akersberga",
        "address": {
            "street": "Storängstorget",
            "nr": "4",
            "zip": "184 30",
            "city": "Åkersberga",
            "location": {
                "lat": 59.47984,
                "lng": 18.29904
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Trelleborg (Phonehouse)",
        "displayName": "Elgiganten Trelleborg (Phonehouse)",
        "id": "2297",
        "url": "/store/phonehouse-trelleborg",
        "address": {
            "street": "Nygatan",
            "nr": "38",
            "zip": "231 42",
            "city": "Trelleborg",
            "location": {
                "lat": 55.374348,
                "lng": 13.157966
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Kiruna",
        "displayName": "Elgiganten Kiruna",
        "id": "2203",
        "url": "/store/elgiganten-kiruna",
        "address": {
            "street": "Österleden",
            "nr": "12",
            "zip": "981 38",
            "city": "Kiruna",
            "location": {
                "lat": 67.845105,
                "lng": 20.25455
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": false,
            "leadTime": 0
        }
    },
    {
        "name": "Norrtälje",
        "displayName": "Elgiganten Norrtälje",
        "id": "2210",
        "url": "/store/elgiganten-norrtalje",
        "address": {
            "street": "August Strindbergs Gata",
            "nr": "3",
            "zip": "761 41",
            "city": "Norrtälje",
            "location": {
                "lat": 59.74633932,
                "lng": 18.67999428
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Alingsås",
        "displayName": "Elgiganten Alingsås",
        "id": "2212",
        "url": "/store/elgiganten-alingsas",
        "address": {
            "street": "Hemvägen",
            "nr": "15",
            "zip": "441 39",
            "city": "Alingsås",
            "location": {
                "lat": 57.923739,
                "lng": 12.544139
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Lidköping",
        "displayName": "Elgiganten Lidköping",
        "id": "2214",
        "url": "/store/elgiganten-lidkoping",
        "address": {
            "street": "Änghagsgatan",
            "nr": "1",
            "zip": "531 40",
            "city": "Lidköping",
            "location": {
                "lat": 58.496199,
                "lng": 13.18322
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Örnsköldsvik",
        "displayName": "Elgiganten Örnsköldsvik",
        "id": "2216",
        "url": "/store/elgiganten-ornskoldsvik",
        "address": {
            "street": "Tegelbruksvägen",
            "nr": "23",
            "zip": "891 55",
            "city": "Arnäsvall",
            "location": {
                "lat": 63.30809,
                "lng": 18.77938
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Piteå",
        "displayName": "Elgiganten Piteå",
        "id": "2218",
        "url": "/store/elgiganten-pitea",
        "address": {
            "street": "Fabriksgatan",
            "nr": "8",
            "zip": "941 47",
            "city": "Piteå",
            "location": {
                "lat": 65.32402,
                "lng": 21.44105
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Visby",
        "displayName": "Elgiganten Visby",
        "id": "2207",
        "url": "/store/elgiganten-visby",
        "address": {
            "street": "Stenhuggarvägen",
            "nr": "8",
            "zip": "621 53",
            "city": "Visby",
            "location": {
                "lat": 57.622094,
                "lng": 18.321345
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Gislaved",
        "displayName": "Elgiganten Gislaved",
        "id": "2219",
        "url": "/store/elgiganten-gislaved",
        "address": {
            "street": "Smålandiagatan",
            "nr": "15",
            "zip": "332 92",
            "city": "Gislaved",
            "location": {
                "lat": 57.32206,
                "lng": 13.54409
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Ludvika",
        "displayName": "Elgiganten Ludvika",
        "id": "2220",
        "url": "/store/elgiganten-ludvika",
        "address": {
            "street": "Granitvägen",
            "nr": "10",
            "zip": "771 41",
            "city": "Ludvika",
            "location": {
                "lat": 60.137156,
                "lng": 15.156928
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Nyköping",
        "displayName": "Elgiganten Nyköping",
        "id": "2221",
        "url": "/store/elgiganten-nykoping",
        "address": {
            "street": "Gumsbackevägen",
            "nr": "16",
            "zip": "611 38",
            "city": "Nyköping",
            "location": {
                "lat": 58.74737,
                "lng": 16.97162
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Karlskoga",
        "displayName": "Elgiganten Karlskoga",
        "id": "2227",
        "url": "/store/elgiganten-karlskoga",
        "address": {
            "street": "Skolgärdesvägen",
            "nr": "4C",
            "zip": "691 33",
            "city": "Karlskoga",
            "location": {
                "lat": 59.327005,
                "lng": 14.536093
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Motala",
        "displayName": "Elgiganten Motala",
        "id": "2233",
        "url": "/store/elgiganten-motala",
        "address": {
            "street": "Moränvägen",
            "nr": "1B",
            "zip": "591 53",
            "city": "Motala",
            "location": {
                "lat": 58.55658,
                "lng": 15.0381
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Enköping",
        "displayName": "Elgiganten Enköping",
        "id": "2234",
        "url": "/store/elgiganten-enkoping",
        "address": {
            "street": "Romgatan",
            "nr": "1B",
            "zip": "745 37",
            "city": "Enköping",
            "location": {
                "lat": 59.651974,
                "lng": 17.081505
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Mora",
        "displayName": "Elgiganten Mora",
        "id": "2240",
        "url": "/store/elgiganten-mora",
        "address": {
            "street": "Skålmyrsvägen",
            "nr": "48B",
            "zip": "792 50",
            "city": "Mora",
            "location": {
                "lat": 61.006109,
                "lng": 14.601342
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Falköping",
        "displayName": "Elgiganten Falköping",
        "id": "2241",
        "url": "/store/elgiganten-falkoping",
        "address": {
            "street": "Gunnestorpsgatan",
            "nr": "7",
            "zip": "521 40",
            "city": "Falköping",
            "location": {
                "lat": 58.147255,
                "lng": 13.560869
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Gällivare",
        "displayName": "Elgiganten Gällivare",
        "id": "2248",
        "url": "/store/elgiganten-gallivare",
        "address": {
            "street": "Västra Kyrkallén",
            "nr": "7",
            "zip": "982 31",
            "city": "Gällivare",
            "location": {
                "lat": 67.134774,
                "lng": 20.661458
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": false,
            "leadTime": 0
        }
    },
    {
        "name": "Avesta",
        "displayName": "Elgiganten Avesta",
        "id": "2211",
        "url": "/store/elgiganten-avesta",
        "address": {
            "street": "Get Johannas väg",
            "nr": "37",
            "zip": "774 63",
            "city": "Avesta",
            "location": {
                "lat": 60.15312,
                "lng": 16.19942
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Värnamo",
        "displayName": "Elgiganten Värnamo",
        "id": "2229",
        "url": "/store/elgiganten-varnamo",
        "address": {
            "street": "Bredastensvägen",
            "nr": "2",
            "zip": "331 44",
            "city": "Värnamo",
            "location": {
                "lat": 57.16183,
                "lng": 14.074507
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Strängnäs",
        "displayName": "Elgiganten Strängnäs",
        "id": "2230",
        "url": "/store/elgiganten-strangnas",
        "address": {
            "street": "Solberga Handelsväg",
            "nr": "15",
            "zip": "645 47",
            "city": "Strängnäs",
            "location": {
                "lat": 59.336548,
                "lng": 17.019507
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Hudiksvall",
        "displayName": "Elgiganten Hudiksvall",
        "id": "2236",
        "url": "/store/elgiganten-hudiksvall",
        "address": {
            "street": "Medskog norra",
            "nr": "1",
            "zip": "824 91",
            "city": "Hudiksvall",
            "location": {
                "lat": 61.71554,
                "lng": 17.043041
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Hässleholm",
        "displayName": "Elgiganten Hässleholm",
        "id": "2231",
        "url": "/store/elgiganten-hassleholm",
        "address": {
            "street": "Norra Kringelvägen",
            "nr": "42D",
            "zip": "281 41",
            "city": "Hässleholm",
            "location": {
                "lat": 56.165686,
                "lng": 13.788871
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Varberg",
        "displayName": "Elgiganten Varberg",
        "id": "2237",
        "url": "/store/elgiganten-varberg",
        "address": {
            "street": "Birger Svenssons väg",
            "nr": "13",
            "zip": "432 40",
            "city": "Varberg",
            "location": {
                "lat": 57.12397,
                "lng": 12.26115
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Ljungby",
        "displayName": "Elgiganten Ljungby",
        "id": "2247",
        "url": "/store/elgiganten-ljungby",
        "address": {
            "street": "Ringvägen",
            "nr": "3D",
            "zip": "341 32",
            "city": "Ljungby",
            "location": {
                "lat": 56.81478,
                "lng": 13.90492
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Värmdö",
        "displayName": "Elgiganten Värmdö",
        "id": "2249",
        "url": "/store/elgiganten-varmdo",
        "address": {
            "street": "Orions väg",
            "nr": "1C",
            "zip": "134 44",
            "city": "Gustavsberg",
            "location": {
                "lat": 59.310447,
                "lng": 18.421619
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Katrineholm",
        "displayName": "Elgiganten Katrineholm",
        "id": "2250",
        "url": "/store/elgiganten-katrineholm",
        "address": {
            "street": "Österleden",
            "nr": "6",
            "zip": "641 49",
            "city": "Katrineholm",
            "location": {
                "lat": 59.00432,
                "lng": 16.23034
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Karlshamn",
        "displayName": "Elgiganten Karlshamn",
        "id": "2251",
        "url": "/store/elgiganten-karlshamn",
        "address": {
            "street": "Nyemöllevägen",
            "nr": "3",
            "zip": "374 32",
            "city": "Karlshamn",
            "location": {
                "lat": 56.187184,
                "lng": 14.845994
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Hässleholm (Phonehouse)",
        "displayName": "Elgiganten Hässleholm (Phonehouse)",
        "id": "2264",
        "url": "/store/phonehouse-hassleholm",
        "address": {
            "street": "Första Avenyen",
            "nr": "2",
            "zip": "281 31",
            "city": "Hässleholm",
            "location": {
                "lat": 56.15771,
                "lng": 13.76405
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Bollnäs",
        "displayName": "Elgiganten Bollnäs",
        "id": "2235",
        "url": "/store/elgiganten-bollnas",
        "address": {
            "street": "Norrlandsvägen",
            "nr": "90",
            "zip": "821 36",
            "city": "Bollnäs",
            "location": {
                "lat": 61.36965,
                "lng": 16.390816
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Vetlanda",
        "displayName": "Elgiganten Vetlanda",
        "id": "2258",
        "url": "/store/elgiganten-vetlanda",
        "address": {
            "street": "Kolvägen",
            "nr": "7",
            "zip": "574 35",
            "city": "Vetlanda",
            "location": {
                "lat": 57.44271,
                "lng": 15.06759
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Landskrona",
        "displayName": "Elgiganten Landskrona",
        "id": "2266",
        "url": "/store/elgiganten-landskrona",
        "address": {
            "street": "Österleden",
            "nr": "185",
            "zip": "261 51",
            "city": "Landskrona",
            "location": {
                "lat": 55.871316,
                "lng": 12.858513
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Skene",
        "displayName": "Elgiganten Skene",
        "id": "2268",
        "url": "/store/elgiganten-skene",
        "address": {
            "street": "Industrigatan",
            "nr": "2",
            "zip": "511 62",
            "city": "Skene",
            "location": {
                "lat": 57.487381,
                "lng": 12.649306
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Kungälv",
        "displayName": "Elgiganten Kungälv",
        "id": "2269",
        "url": "/store/elgiganten-kungalv",
        "address": {
            "street": "Älvebacken",
            "nr": "21",
            "zip": "442 48",
            "city": "Kungälv",
            "location": {
                "lat": 57.8743265,
                "lng": 11.9669398
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Oskarshamn (Phonehouse)",
        "displayName": "Elgiganten Oskarshamn (Phonehouse)",
        "id": "2270",
        "url": "/store/phonehouse-oskarshamn",
        "address": {
            "street": "Västra torggatan",
            "nr": "3A",
            "zip": "572 30",
            "city": "Oskarshamn",
            "location": {
                "lat": 57.26522,
                "lng": 16.44713
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Nyköping (Phonehouse)",
        "displayName": "Elgiganten Nyköping (Phonehouse)",
        "id": "2280",
        "url": "/store/phonehouse-nykoping",
        "address": {
            "street": "Västra Storgatan",
            "nr": "24",
            "zip": "611 32",
            "city": "Nyköping",
            "location": {
                "lat": 58.752151,
                "lng": 17.005971
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Alingsås (Phonehouse)",
        "displayName": "Elgiganten Alingsås (Phonehouse)",
        "id": "2283",
        "url": "/store/phonehouse-alingsas",
        "address": {
            "street": "Hemvägen",
            "nr": "19",
            "zip": "441 39",
            "city": "Alingsås",
            "location": {
                "lat": 57.92371972,
                "lng": 12.54368079
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Mariestad",
        "displayName": "Elgiganten Mariestad",
        "id": "2263",
        "url": "/store/elgiganten-mariestad",
        "address": {
            "street": "Förrådsgatan",
            "nr": "42",
            "zip": "542 35",
            "city": "Mariestad",
            "location": {
                "lat": 58.68145182,
                "lng": 13.81886312
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Falkenberg (Phonehouse)",
        "displayName": "Elgiganten Falkenberg (Phonehouse)",
        "id": "2282",
        "url": "/store/phonehouse-falkenberg",
        "address": {
            "street": "Nygatan",
            "nr": "42",
            "zip": "311 31",
            "city": "Falkenberg",
            "location": {
                "lat": 56.903198,
                "lng": 12.491067
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Huddinge (Phonehouse)",
        "displayName": "Elgiganten Huddinge (Phonehouse)",
        "id": "2284",
        "url": "/store/phonehouse-huddinge",
        "address": {
            "street": "Sjödalstorget",
            "nr": "5",
            "zip": "141 47",
            "city": "Huddinge",
            "location": {
                "lat": 59.236211,
                "lng": 17.982397
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Nynäshamn (Phonehouse)",
        "displayName": "Elgiganten Nynäshamn (Phonehouse)",
        "id": "2285",
        "url": "/store/phonehouse-nynashamn",
        "address": {
            "street": "Fredsgatan",
            "nr": "5A",
            "zip": "149 30",
            "city": "Nynäshamn",
            "location": {
                "lat": 58.903177,
                "lng": 17.947224
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Ängelholm (Phonehouse)",
        "displayName": "Elgiganten Ängelholm (Phonehouse)",
        "id": "2288",
        "url": "/store/phonehouse-angelholm",
        "address": {
            "street": "Storgatan",
            "nr": "39",
            "zip": "262 32",
            "city": "Ängelholm",
            "location": {
                "lat": 56.244716,
                "lng": 12.86273
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Örnsköldsvik (Phonehouse)",
        "displayName": "Elgiganten Örnsköldsvik (Phonehouse)",
        "id": "2290",
        "url": "/store/phonehouse-ornskoldsvik",
        "address": {
            "street": "Köpmangatan",
            "nr": "9",
            "zip": "891 33",
            "city": "Örnsköldsvik",
            "location": {
                "lat": 63.2906352,
                "lng": 18.7142157
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Ängelholm",
        "displayName": "Elgiganten Ängelholm",
        "id": "2253",
        "url": "/store/elgiganten-angelholm",
        "address": {
            "street": "Emblagatan",
            "nr": "12",
            "zip": "262 71",
            "city": "Ängelholm",
            "location": {
                "lat": 56.254248,
                "lng": 12.886831
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Karlshamn (Phonehouse)",
        "displayName": "Elgiganten Karlshamn (Phonehouse)",
        "id": "2281",
        "url": "/store/phonehouse-karlshamn",
        "address": {
            "street": "Kungsgatan",
            "nr": "34",
            "zip": "374 36",
            "city": "Karlshamn",
            "location": {
                "lat": 56.170563,
                "lng": 14.863944
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Stenungsund (Phonehouse)",
        "displayName": "Elgiganten Stenungsund (Phonehouse)",
        "id": "2291",
        "url": "/store/phonehouse-stenungsund",
        "address": {
            "street": "Östra Köpmansgatan",
            "nr": "20",
            "zip": "444 30",
            "city": "Stenungsund",
            "location": {
                "lat": 58.068568,
                "lng": 11.817121
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Falkenberg",
        "displayName": "Elgiganten Falkenberg",
        "id": "2298",
        "url": "/store/elgiganten-falkenberg",
        "address": {
            "street": "Dalkullevägen",
            "nr": "10",
            "zip": "311 39",
            "city": "Falkenberg",
            "location": {
                "lat": 56.917977,
                "lng": 12.502778
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Västerås Erikslund (Phonehouse)",
        "displayName": "Elgiganten Västerås Erikslund (Phonehouse)",
        "id": "2314",
        "url": "/store/phonehouse-vasteras-erikslund",
        "address": {
            "street": "Krankroksgatan",
            "nr": "17",
            "zip": "721 38",
            "city": "Västerås",
            "location": {
                "lat": 59.60914651,
                "lng": 16.4551176
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 60
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Nova Lund (Phonehouse)",
        "displayName": "Elgiganten Nova Lund (Phonehouse)",
        "id": "2313",
        "url": "/store/phonehouse-nova-lund",
        "address": {
            "street": "Företagsvägen",
            "nr": "10",
            "zip": "227 61",
            "city": "Lund",
            "location": {
                "lat": 55.713653,
                "lng": 13.159459
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 60
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Jönköping Asecs Gallerian (Phonehouse)",
        "displayName": "Elgiganten Jönköping Asecs Gallerian (Phonehouse)",
        "id": "2317",
        "url": "/store/phonehouse-jonkoping-asecs",
        "address": {
            "street": "Kompanigatan",
            "nr": "16",
            "zip": "553 05",
            "city": "Jönköping",
            "location": {
                "lat": 57.77376,
                "lng": 14.20362
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Barkarby",
        "displayName": "Elgiganten Barkarby",
        "id": "2001",
        "url": "/store/elgiganten-barkarby",
        "address": {
            "street": "Enköpingsvägen",
            "nr": "39",
            "zip": "177 38",
            "city": "Järfälla",
            "location": {
                "lat": 59.42178,
                "lng": 17.85434
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Örebro",
        "displayName": "Elgiganten Örebro",
        "id": "2002",
        "url": "/store/elgiganten-orebro",
        "address": {
            "street": "Säljarevägen",
            "nr": "8A",
            "zip": "702 36",
            "city": "Örebro",
            "location": {
                "lat": 59.21751,
                "lng": 15.14226
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Helsingborg",
        "displayName": "Elgiganten Helsingborg",
        "id": "2003",
        "url": "/store/elgiganten-helsingborg",
        "address": {
            "street": "Björkavägen",
            "nr": "99",
            "zip": "254 69",
            "city": "Ödåkra",
            "location": {
                "lat": 56.09270347,
                "lng": 12.76584219
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Gävle Valbo",
        "displayName": "Elgiganten Gävle Valbo",
        "id": "2005",
        "url": "/store/elgiganten-gavle-valbo",
        "address": {
            "street": "Valbovägen",
            "nr": "321",
            "zip": "818 35",
            "city": "Valbo",
            "location": {
                "lat": 60.62992029,
                "lng": 16.99353582
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Norrköping",
        "displayName": "Elgiganten Norrköping",
        "id": "2004",
        "url": "/store/elgiganten-norrkoping",
        "address": {
            "street": "Koppargatan",
            "nr": "19",
            "zip": "602 23",
            "city": "Norrköping",
            "location": {
                "lat": 58.61895,
                "lng": 16.15281
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Kungens Kurva",
        "displayName": "Elgiganten Kungens Kurva",
        "id": "2006",
        "url": "/store/elgiganten-kungens-kurva",
        "address": {
            "street": "Tangentvägen",
            "nr": "10",
            "zip": "141 75",
            "city": "Kungens Kurva",
            "location": {
                "lat": 59.26972596,
                "lng": 17.91840877
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Linköping",
        "displayName": "Elgiganten Linköping",
        "id": "2007",
        "url": "/store/elgiganten-linkoping",
        "address": {
            "street": "Norra Svedengatan",
            "nr": "19",
            "zip": "582 73",
            "city": "Linköping",
            "location": {
                "lat": 58.43408,
                "lng": 15.60094
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Jönköping - Varuhuset",
        "displayName": "Elgiganten Jönköping - Varuhuset",
        "id": "2008",
        "url": "/store/elgiganten-jonkoping-varuhuset",
        "address": {
            "street": "Bataljonsgatan",
            "nr": "4",
            "zip": "553 05",
            "city": "Jönköping",
            "location": {
                "lat": 57.77054099,
                "lng": 14.20331749
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Uppsala",
        "displayName": "Elgiganten Uppsala",
        "id": "2011",
        "url": "/store/elgiganten-uppsala",
        "address": {
            "street": "Verkstadsgatan",
            "nr": "16",
            "zip": "753 23",
            "city": "Uppsala",
            "location": {
                "lat": 59.84824,
                "lng": 17.68721
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Sundsvall",
        "displayName": "Elgiganten Sundsvall",
        "id": "2013",
        "url": "/store/elgiganten-sundsvall",
        "address": {
            "street": "Förarvägen",
            "nr": "10",
            "zip": "863 37",
            "city": "Sundsvall",
            "location": {
                "lat": 62.4438824,
                "lng": 17.34406471
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Växjö",
        "displayName": "Elgiganten Växjö",
        "id": "2014",
        "url": "/store/elgiganten-vaxjo",
        "address": {
            "street": "Handelsvägen",
            "nr": "3",
            "zip": "352 46",
            "city": "Växjö",
            "location": {
                "lat": 56.8818,
                "lng": 14.76292
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Södertälje",
        "displayName": "Elgiganten Södertälje",
        "id": "2017",
        "url": "/store/elgiganten-sodertalje",
        "address": {
            "street": "Klastorpsvägen",
            "nr": "10",
            "zip": "152 42",
            "city": "Södertälje",
            "location": {
                "lat": 59.20187964,
                "lng": 17.6639009
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Borås",
        "displayName": "Elgiganten Borås",
        "id": "2018",
        "url": "/store/elgiganten-boras",
        "address": {
            "street": "Ålgårdsvägen",
            "nr": "4",
            "zip": "506 30",
            "city": "Borås",
            "location": {
                "lat": 57.73332,
                "lng": 12.93602
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Kristianstad",
        "displayName": "Elgiganten Kristianstad",
        "id": "2015",
        "url": "/store/elgiganten-kristianstad",
        "address": {
            "street": "Herr Ivars väg",
            "nr": "2",
            "zip": "291 59",
            "city": "Kristianstad",
            "location": {
                "lat": 56.02172,
                "lng": 14.11894
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Varberg (Phonehouse)",
        "displayName": "Elgiganten Varberg (Phonehouse)",
        "id": "2254",
        "url": "/store/phonehouse-varberg",
        "address": {
            "street": "Västra Vallgatan",
            "nr": "2",
            "zip": "432 41",
            "city": "Varberg",
            "location": {
                "lat": 57.10597,
                "lng": 12.2475
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Luleå",
        "displayName": "Elgiganten Luleå",
        "id": "2020",
        "url": "/store/elgiganten-lulea",
        "address": {
            "street": "Betongvägen",
            "nr": "2",
            "zip": "973 45",
            "city": "Luleå",
            "location": {
                "lat": 65.61789485,
                "lng": 22.05179354
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Karlstad",
        "displayName": "Elgiganten Karlstad",
        "id": "2021",
        "url": "/store/elgiganten-karlstad",
        "address": {
            "street": "Rävbergsvägen",
            "nr": "1",
            "zip": "656 39",
            "city": "Karlstad",
            "location": {
                "lat": 59.3953,
                "lng": 13.57858
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Uddevalla",
        "displayName": "Elgiganten Uddevalla",
        "id": "2022",
        "url": "/store/elgiganten-uddevalla",
        "address": {
            "street": "Östra Torpvägen",
            "nr": "20",
            "zip": "451 76",
            "city": "Uddevalla",
            "location": {
                "lat": 58.35505638,
                "lng": 11.82208378
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Bromma",
        "displayName": "Elgiganten Bromma",
        "id": "2023",
        "url": "/store/elgiganten-bromma",
        "address": {
            "street": "Ulvsundavägen",
            "nr": "189C",
            "zip": "168 67",
            "city": "Bromma",
            "location": {
                "lat": 59.35666,
                "lng": 17.95133
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Umeå",
        "displayName": "Elgiganten Umeå",
        "id": "2024",
        "url": "/store/elgiganten-umea",
        "address": {
            "street": "Sandbäcksgatan",
            "nr": "6",
            "zip": "906 21",
            "city": "Umeå",
            "location": {
                "lat": 63.853343,
                "lng": 20.294593
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Backaplan",
        "displayName": "Elgiganten Backaplan",
        "id": "2025",
        "url": "/store/elgiganten-backaplan",
        "address": {
            "street": "Backavägen",
            "nr": "2",
            "zip": "417 05",
            "city": "Göteborg",
            "location": {
                "lat": 57.72200836,
                "lng": 11.95497142
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Trollhättan",
        "displayName": "Elgiganten Trollhättan",
        "id": "2026",
        "url": "/store/elgiganten-trollhattan",
        "address": {
            "street": "Överbyvägen",
            "nr": "23C",
            "zip": "461 70",
            "city": "Trollhättan",
            "location": {
                "lat": 58.31561485,
                "lng": 12.30086803
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Halmstad",
        "displayName": "Elgiganten Halmstad",
        "id": "2030",
        "url": "/store/elgiganten-halmstad",
        "address": {
            "street": "Kundvägen",
            "nr": "13",
            "zip": "302 41",
            "city": "Halmstad",
            "location": {
                "lat": 56.68046534,
                "lng": 12.80862559
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Sickla",
        "displayName": "Elgiganten Sickla",
        "id": "2031",
        "url": "/store/elgiganten-sickla",
        "address": {
            "street": "Planiavägen",
            "nr": "4",
            "zip": "131 54",
            "city": "Nacka",
            "location": {
                "lat": 59.30549242,
                "lng": 18.13023964
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Länna",
        "displayName": "Elgiganten Länna",
        "id": "2019",
        "url": "/store/elgiganten-lanna",
        "address": {
            "street": "Truckvägen",
            "nr": "7",
            "zip": "142 53",
            "city": "Skogås",
            "location": {
                "lat": 59.19784,
                "lng": 18.12871
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Karlskrona",
        "displayName": "Elgiganten Karlskrona",
        "id": "2033",
        "url": "/store/elgiganten-karlskrona",
        "address": {
            "street": "Stationsvägen",
            "nr": "29",
            "zip": "371 62",
            "city": "Lyckeby",
            "location": {
                "lat": 56.19668,
                "lng": 15.64708
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Sisjön",
        "displayName": "Elgiganten Sisjön",
        "id": "2027",
        "url": "/store/elgiganten-sisjon",
        "address": {
            "street": "Hantverksvägen",
            "nr": "2A",
            "zip": "436 33",
            "city": "Askim",
            "location": {
                "lat": 57.64326087,
                "lng": 11.94905964
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Skövde",
        "displayName": "Elgiganten Skövde",
        "id": "2034",
        "url": "/store/elgiganten-skovde",
        "address": {
            "street": "Jonstorpsgatan",
            "nr": "5",
            "zip": "549 37",
            "city": "Skövde",
            "location": {
                "lat": 58.40925,
                "lng": 13.88244
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Ystad",
        "displayName": "Elgiganten Ystad",
        "id": "2035",
        "url": "/store/elgiganten-ystad",
        "address": {
            "street": "Militärvägen",
            "nr": "4",
            "zip": "271 39",
            "city": "Ystad",
            "location": {
                "lat": 55.43439,
                "lng": 13.84116
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Kungsgatan",
        "displayName": "Elgiganten Kungsgatan",
        "id": "2036",
        "url": "/store/elgiganten-kungsgatan",
        "address": {
            "street": "Kungsgatan",
            "nr": "12-14",
            "zip": "111 35",
            "city": "Stockholm",
            "location": {
                "lat": 59.336229,
                "lng": 18.068743
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": false,
            "leadTime": 0
        }
    },
    {
        "name": "Bäckebol",
        "displayName": "Elgiganten Bäckebol",
        "id": "2037",
        "url": "/store/elgiganten-backebol",
        "address": {
            "street": "Transportgatan",
            "nr": "21",
            "zip": "422 46",
            "city": "Hisings Backa",
            "location": {
                "lat": 57.77131663,
                "lng": 12.00122249
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Täby Arninge",
        "displayName": "Elgiganten Täby Arninge",
        "id": "2038",
        "url": "/store/elgiganten-taby-arninge",
        "address": {
            "street": "Saluvägen",
            "nr": "6",
            "zip": "187 66",
            "city": "Täby",
            "location": {
                "lat": 59.46089,
                "lng": 18.13375
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Borlänge",
        "displayName": "Elgiganten Borlänge",
        "id": "2039",
        "url": "/store/elgiganten-borlange",
        "address": {
            "street": "Norra Backagatan",
            "nr": "3A",
            "zip": "781 70",
            "city": "Borlänge",
            "location": {
                "lat": 60.48045,
                "lng": 15.42065
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Lund",
        "displayName": "Elgiganten Lund",
        "id": "2040",
        "url": "/store/elgiganten-lund",
        "address": {
            "street": "Avtalsvägen",
            "nr": "3",
            "zip": "227 61",
            "city": "Lund",
            "location": {
                "lat": 55.71328,
                "lng": 13.15325
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Östersund",
        "displayName": "Elgiganten Östersund",
        "id": "2041",
        "url": "/store/elgiganten-ostersund",
        "address": {
            "street": "Hagvägen",
            "nr": "1B",
            "zip": "831 48",
            "city": "Östersund",
            "location": {
                "lat": 63.17622,
                "lng": 14.69319
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Skellefteå",
        "displayName": "Elgiganten Skellefteå",
        "id": "2043",
        "url": "/store/elgiganten-skelleftea",
        "address": {
            "street": "Varugatan",
            "nr": "6",
            "zip": "931 76",
            "city": "Skellefteå",
            "location": {
                "lat": 64.76672,
                "lng": 21.01944
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Kalmar",
        "displayName": "Elgiganten Kalmar",
        "id": "2044",
        "url": "/store/elgiganten-kalmar",
        "address": {
            "street": "Bilbyggarvägen",
            "nr": "10",
            "zip": "393 56",
            "city": "Kalmar",
            "location": {
                "lat": 56.68681,
                "lng": 16.31859
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Västerås, Erikslund",
        "displayName": "Elgiganten Västerås, Erikslund",
        "id": "2050",
        "url": "/store/elgiganten-vasteras-erikslund",
        "address": {
            "street": "Hallsta Gårdsgata",
            "nr": "16",
            "zip": "721 38",
            "city": "Västerås",
            "location": {
                "lat": 59.6117386,
                "lng": 16.4623722
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Häggvik",
        "displayName": "Elgiganten Häggvik",
        "id": "2047",
        "url": "/store/elgiganten-haggvik",
        "address": {
            "street": "Bagarbyvägen",
            "nr": "61",
            "zip": "191 62",
            "city": "Sollentuna",
            "location": {
                "lat": 59.43675,
                "lng": 17.9274975
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Bernstorp",
        "displayName": "Elgiganten Bernstorp",
        "id": "2055",
        "url": "/store/elgiganten-bernstorp",
        "address": {
            "street": "Vassvägen",
            "nr": "23",
            "zip": "232 61",
            "city": "Arlöv",
            "location": {
                "lat": 55.61374,
                "lng": 13.10512
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Svågertorp",
        "displayName": "Elgiganten Svågertorp",
        "id": "2056",
        "url": "/store/elgiganten-svagertorp",
        "address": {
            "street": "Nornegatan",
            "nr": "12",
            "zip": "215 86",
            "city": "Malmö",
            "location": {
                "lat": 55.54889668,
                "lng": 12.99703802
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Partille",
        "displayName": "Elgiganten Partille",
        "id": "2057",
        "url": "/store/elgiganten-partille",
        "address": {
            "street": "Laxfiskevägen",
            "nr": "4",
            "zip": "433 38",
            "city": "Partille",
            "location": {
                "lat": 57.743544,
                "lng": 12.120757
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Malmö Triangeln (Phonehouse)",
        "displayName": "Elgiganten Malmö Triangeln (Phonehouse)",
        "id": "2301",
        "url": "/store/phonehouse-malmo-triangeln",
        "address": {
            "street": "Södra Förstadsgatan",
            "nr": "41",
            "zip": "211 43",
            "city": "Malmö",
            "location": {
                "lat": 55.59495,
                "lng": 13.002937
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 60
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Uppsala Gränby (Phonehouse)",
        "displayName": "Elgiganten Uppsala Gränby (Phonehouse)",
        "id": "2303",
        "url": "/store/phonehouse-uppsala-granby",
        "address": {
            "street": "Marknadsgatan",
            "nr": "1",
            "zip": "754 60",
            "city": "Uppsala",
            "location": {
                "lat": 59.878056,
                "lng": 17.673584
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Umeå Avion (Phonehouse)",
        "displayName": "Elgiganten Umeå Avion (Phonehouse)",
        "id": "2304",
        "url": "/store/phonehouse-umea-avion",
        "address": {
            "street": "Marknadsgatan",
            "nr": "3",
            "zip": "904 22",
            "city": "Umeå",
            "location": {
                "lat": 63.80748281,
                "lng": 20.25475074
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 60
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Mall of Scandinavia (Phonehouse)",
        "displayName": "Elgiganten Mall of Scandinavia (Phonehouse)",
        "id": "2306",
        "url": "/store/phonehouse-mall-of-scandinavia",
        "address": {
            "street": "Stjärntorget",
            "nr": "2",
            "zip": "169 79",
            "city": "Solna",
            "location": {
                "lat": 59.370241,
                "lng": 18.004323
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 60
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Sergelgatan (Phonehouse)",
        "displayName": "Elgiganten Sergelgatan (Phonehouse)",
        "id": "2307",
        "url": "/store/phonehouse-sergelgatan",
        "address": {
            "street": "Sergelgatan",
            "nr": "29",
            "zip": "111 57",
            "city": "Stockholm",
            "location": {
                "lat": 59.33425,
                "lng": 18.06302
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 60
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Fältöversten (Phonehouse)",
        "displayName": "Elgiganten Fältöversten (Phonehouse)",
        "id": "2501",
        "url": "/store/phonehouse-faltoversten",
        "address": {
            "street": "Valhallavägen",
            "nr": "144",
            "zip": "115 24",
            "city": "Stockholm",
            "location": {
                "lat": 59.33996898,
                "lng": 18.09164184
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Kista Galleria (Phonehouse)",
        "displayName": "Elgiganten Kista Galleria (Phonehouse)",
        "id": "2503",
        "url": "/store/phonehouse-kista-galleria",
        "address": {
            "street": "Kistagången Torsnäsgatan",
            "nr": "0",
            "zip": "164 40",
            "city": "Kista",
            "location": {
                "lat": 59.402646,
                "lng": 17.945488
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Solna Centrum (Phonehouse)",
        "displayName": "Elgiganten Solna Centrum (Phonehouse)",
        "id": "2507",
        "url": "/store/phonehouse-solna-centrum",
        "address": {
            "street": "Bibliotekstorget",
            "nr": "18",
            "zip": "171 45",
            "city": "Solna",
            "location": {
                "lat": 59.359986,
                "lng": 18.000698
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Upplands Väsby (Phonehouse)",
        "displayName": "Elgiganten Upplands Väsby (Phonehouse)",
        "id": "2509",
        "url": "/store/phonehouse-upplands-vasby",
        "address": {
            "street": "Dragonvägen",
            "nr": "86",
            "zip": "194 33",
            "city": "Upplands Väsby",
            "location": {
                "lat": 59.518358,
                "lng": 17.913486
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Uppsala Stora Torget (Phonehouse)",
        "displayName": "Elgiganten Uppsala Stora Torget (Phonehouse)",
        "id": "2511",
        "url": "/store/phonehouse-uppsala-stora-torget",
        "address": {
            "street": "Stora torget",
            "nr": "4",
            "zip": "753 20",
            "city": "Uppsala",
            "location": {
                "lat": 59.85863,
                "lng": 17.63819
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Vällingby (Phonehouse)",
        "displayName": "Elgiganten Vällingby (Phonehouse)",
        "id": "2512",
        "url": "/store/phonehouse-vallingby",
        "address": {
            "street": "Vällingbygången",
            "nr": "2",
            "zip": "162 65",
            "city": "Vällingby",
            "location": {
                "lat": 59.362321,
                "lng": 17.873507
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Västermalm (Phonehouse)",
        "displayName": "Elgiganten Västermalm (Phonehouse)",
        "id": "2513",
        "url": "/store/phonehouse-vastermalm",
        "address": {
            "street": "Sankt Eriksgatan",
            "nr": "45",
            "zip": "112 34",
            "city": "Stockholm",
            "location": {
                "lat": 59.33465,
                "lng": 18.03233
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Farsta (Phonehouse)",
        "displayName": "Elgiganten Farsta (Phonehouse)",
        "id": "2515",
        "url": "/store/phonehouse-farstaplan",
        "address": {
            "street": "Farstaplan",
            "nr": "25",
            "zip": "123 47",
            "city": "Farsta",
            "location": {
                "lat": 59.243101,
                "lng": 18.091161
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Helsingborg Väla (Phonehouse)",
        "displayName": "Elgiganten Helsingborg Väla (Phonehouse)",
        "id": "2516",
        "url": "/store/phonehouse-vala",
        "address": {
            "street": "Marknadsvägen",
            "nr": "9",
            "zip": "254 69",
            "city": "Ödåkra",
            "location": {
                "lat": 56.09155335,
                "lng": 12.75864269
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Globen (Phonehouse)",
        "displayName": "Elgiganten Globen (Phonehouse)",
        "id": "2517",
        "url": "/store/phonehouse-globen",
        "address": {
            "street": "Arenavägen",
            "nr": "61",
            "zip": "121 77",
            "city": "Johanneshov",
            "location": {
                "lat": 59.2927446,
                "lng": 18.08203981
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Liljeholmen (Phonehouse)",
        "displayName": "Elgiganten Liljeholmen (Phonehouse)",
        "id": "2520",
        "url": "/store/phonehouse-liljeholmen",
        "address": {
            "street": "Liljeholmstorget",
            "nr": "1",
            "zip": "117 63",
            "city": "Stockholm",
            "location": {
                "lat": 59.309592,
                "lng": 18.021856
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Ringen (Phonehouse)",
        "displayName": "Elgiganten Ringen (Phonehouse)",
        "id": "2522",
        "url": "/store/phonehouse-ringen",
        "address": {
            "street": "Ringvägen",
            "nr": "115",
            "zip": "118 60",
            "city": "Stockholm",
            "location": {
                "lat": 59.307955,
                "lng": 18.075251
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Sveavägen (Phonehouse)",
        "displayName": "Elgiganten Sveavägen (Phonehouse)",
        "id": "2527",
        "url": "/store/phonehouse-sveavagen",
        "address": {
            "street": "Sveavägen",
            "nr": "26",
            "zip": "111 57",
            "city": "Stockholm",
            "location": {
                "lat": 59.335343,
                "lng": 18.064198
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Kringlan (Phonehouse)",
        "displayName": "Elgiganten Kringlan (Phonehouse)",
        "id": "2528",
        "url": "/store/phonehouse-sodertalje-kringlan",
        "address": {
            "street": "Storgatan",
            "nr": "4",
            "zip": "151 71",
            "city": "Södertälje",
            "location": {
                "lat": 59.196027,
                "lng": 17.628038
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Sickla (Phonehouse)",
        "displayName": "Elgiganten Sickla (Phonehouse)",
        "id": "2524",
        "url": "/store/phonehouse-sickla",
        "address": {
            "street": "Simbagatan",
            "nr": "18",
            "zip": "131 54",
            "city": "Nacka",
            "location": {
                "lat": 59.30603,
                "lng": 18.12449
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Tyresö (Phonehouse)",
        "displayName": "Elgiganten Tyresö (Phonehouse)",
        "id": "2529",
        "url": "/store/phonehouse-tyreso",
        "address": {
            "street": "Marknadsgränd",
            "nr": "6",
            "zip": "135 40",
            "city": "Tyresö",
            "location": {
                "lat": 59.244833,
                "lng": 18.228686
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Eskilstuna Tuna Park (Phonehouse)",
        "displayName": "Elgiganten Eskilstuna Tuna Park (Phonehouse)",
        "id": "2531",
        "url": "/store/phonehouse-eskilstuna-tuna-park",
        "address": {
            "street": "Gunborg Nymans väg",
            "nr": "2",
            "zip": "632 22",
            "city": "Eskilstuna",
            "location": {
                "lat": 59.371309,
                "lng": 16.471043
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Karlstad Bergvik (Phonehouse)",
        "displayName": "Elgiganten Karlstad Bergvik (Phonehouse)",
        "id": "2533",
        "url": "/store/phonehouse-karlstad-bergvik",
        "address": {
            "street": "Frykmans väg",
            "nr": "1",
            "zip": "653 46",
            "city": "Karlstad",
            "location": {
                "lat": 59.37739479,
                "lng": 13.4257812
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Linköping City (Phonehouse)",
        "displayName": "Elgiganten Linköping City (Phonehouse)",
        "id": "2534",
        "url": "/store/phonehouse-linkoping-city",
        "address": {
            "street": "Stora torget",
            "nr": "3",
            "zip": "582 19",
            "city": "Linköping",
            "location": {
                "lat": 58.41043,
                "lng": 15.62115
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Linköping Ikanohuset (Phonehouse)",
        "displayName": "Elgiganten Linköping Ikanohuset (Phonehouse)",
        "id": "2535",
        "url": "/store/phonehouse-linkoping-ikanohuset",
        "address": {
            "street": "Västra Svedengatan",
            "nr": "7D",
            "zip": "581 28",
            "city": "Linköping",
            "location": {
                "lat": 58.43400179,
                "lng": 15.58543922
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Marieberg (Phonehouse)",
        "displayName": "Elgiganten Marieberg (Phonehouse)",
        "id": "2536",
        "url": "/store/phonehouse-marieberg",
        "address": {
            "street": "Säljarevägen",
            "nr": "1",
            "zip": "702 36",
            "city": "Örebro",
            "location": {
                "lat": 59.217681,
                "lng": 15.1373
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Norrköping Domino (Phonehouse)",
        "displayName": "Elgiganten Norrköping Domino (Phonehouse)",
        "id": "2538",
        "url": "/store/phonehouse-norrkoping-domino",
        "address": {
            "street": "Repslagaregatan",
            "nr": "12",
            "zip": "602 32",
            "city": "Norrköping",
            "location": {
                "lat": 58.588131,
                "lng": 16.18972
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Norrköping Mirum (Phonehouse)",
        "displayName": "Elgiganten Norrköping Mirum (Phonehouse)",
        "id": "2539",
        "url": "/store/phonehouse-norrkoping-mirum",
        "address": {
            "street": "Lidaleden",
            "nr": "12",
            "zip": "603 59",
            "city": "Norrköping",
            "location": {
                "lat": 58.573002,
                "lng": 16.211033
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Frölunda Torg (Phonehouse)",
        "displayName": "Elgiganten Frölunda Torg (Phonehouse)",
        "id": "2545",
        "url": "/store/phonehouse-frolunda-torg",
        "address": {
            "street": "Frölunda torg",
            "nr": "",
            "zip": "421 42",
            "city": "Västra Frölunda",
            "location": {
                "lat": 57.650989,
                "lng": 11.911804
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Kungsmässan (Phonehouse)",
        "displayName": "Elgiganten Kungsmässan (Phonehouse)",
        "id": "2547",
        "url": "/store/phonehouse-kungsmassan",
        "address": {
            "street": "Borgmästaregatan",
            "nr": "5",
            "zip": "434 32",
            "city": "Kungsbacka",
            "location": {
                "lat": 57.49177087,
                "lng": 12.07500609
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Partille (Phonehouse)",
        "displayName": "Elgiganten Partille (Phonehouse)",
        "id": "2549",
        "url": "/store/phonehouse-partille",
        "address": {
            "street": "Nils Henrikssons väg",
            "nr": "3",
            "zip": "433 35",
            "city": "Partille",
            "location": {
                "lat": 57.736908,
                "lng": 12.105533
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Nordstan (Phonehouse)",
        "displayName": "Elgiganten Nordstan (Phonehouse)",
        "id": "2550",
        "url": "/store/phonehouse-nordstan",
        "address": {
            "street": "Lilla Klädpressaregatan",
            "nr": "7",
            "zip": "411 05",
            "city": "Göteborg",
            "location": {
                "lat": 57.709847,
                "lng": 11.968216
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Grand Samarkand (Phonehouse)",
        "displayName": "Elgiganten Grand Samarkand (Phonehouse)",
        "id": "2557",
        "url": "/store/phonehouse-vaxjo-grand-samark",
        "address": {
            "street": "Hejaregatan",
            "nr": "32",
            "zip": "352 46",
            "city": "Växjö",
            "location": {
                "lat": 56.884721,
                "lng": 14.765751
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Malmö Emporia (Phonehouse)",
        "displayName": "Elgiganten Malmö Emporia (Phonehouse)",
        "id": "2561",
        "url": "/store/phonehouse-malmo-emporia",
        "address": {
            "street": "Hyllie Boulevard",
            "nr": "19",
            "zip": "215 32",
            "city": "Malmö",
            "location": {
                "lat": 55.565184,
                "lng": 12.973379
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Ystad (Phonehouse)",
        "displayName": "Elgiganten Ystad (Phonehouse)",
        "id": "2562",
        "url": "/store/phonehouse-ystad",
        "address": {
            "street": "Stora östergatan",
            "nr": "2",
            "zip": "271 34",
            "city": "Ystad",
            "location": {
                "lat": 55.42952,
                "lng": 13.82088
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Halmstad Hallarna (Phonehouse)",
        "displayName": "Elgiganten Halmstad Hallarna (Phonehouse)",
        "id": "2554",
        "url": "/store/phonehouse-halmstad-hallarna",
        "address": {
            "street": "Prästvägen",
            "nr": "1",
            "zip": "302 63",
            "city": "Halmstad",
            "location": {
                "lat": 56.655297,
                "lng": 12.909807
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Helsingborg Väla Centrum (Phonehouse)",
        "displayName": "Elgiganten Helsingborg Väla Centrum (Phonehouse)",
        "id": "2572",
        "url": "/store/phonehouse-vala-centrum",
        "address": {
            "street": "Marknadsvägen",
            "nr": "9",
            "zip": "254 69",
            "city": "Ödåkra",
            "location": {
                "lat": 56.091297,
                "lng": 12.75571
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Borlänge Kupolen (Phonehouse)",
        "displayName": "Elgiganten Borlänge Kupolen (Phonehouse)",
        "id": "2573",
        "url": "/store/phonehouse-borlange-kupolen",
        "address": {
            "street": "Kupolen",
            "nr": "92",
            "zip": "781 70",
            "city": "Borlänge",
            "location": {
                "lat": 60.48425529,
                "lng": 15.41851803
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Gävle Galleria Nian (Phonehouse)",
        "displayName": "Elgiganten Gävle Galleria Nian (Phonehouse)",
        "id": "2575",
        "url": "/store/phonehouse-gavle-galleria-nian",
        "address": {
            "street": "Drottninggatan",
            "nr": "9",
            "zip": "803 20",
            "city": "Gävle",
            "location": {
                "lat": 60.67432094,
                "lng": 17.13963114
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Gävle Valbo (Phonehouse)",
        "displayName": "Elgiganten Gävle Valbo (Phonehouse)",
        "id": "2576",
        "url": "/store/phonehouse-gavle-valbo",
        "address": {
            "street": "Valbovägen",
            "nr": "307",
            "zip": "818 32",
            "city": "Valbo",
            "location": {
                "lat": 60.6330582,
                "lng": 16.99288
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Birsta City (Phonehouse)",
        "displayName": "Elgiganten Birsta City (Phonehouse)",
        "id": "2578",
        "url": "/store/phonehouse-sundsvall-birsta-city",
        "address": {
            "street": "Gesällvägen",
            "nr": "1",
            "zip": "863 41",
            "city": "Sundsvall",
            "location": {
                "lat": 62.44691,
                "lng": 17.336942
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Skellefteå Gallerian (Phonehouse)",
        "displayName": "Elgiganten Skellefteå Gallerian (Phonehouse)",
        "id": "2586",
        "url": "/store/phonehouse-skelleftea-gallerian",
        "address": {
            "street": "Nygatan",
            "nr": "50",
            "zip": "931 31",
            "city": "Skellefteå",
            "location": {
                "lat": 64.75008,
                "lng": 20.95439
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Luleå Smedjan (Phonehouse)",
        "displayName": "Elgiganten Luleå Smedjan (Phonehouse)",
        "id": "2583",
        "url": "/store/phonehouse-lulea-smedjan",
        "address": {
            "street": "Storgatan",
            "nr": "36",
            "zip": "972 31",
            "city": "Luleå",
            "location": {
                "lat": 65.584043,
                "lng": 22.153078
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Umeå Utopia (Phonehouse)",
        "displayName": "Elgiganten Umeå Utopia (Phonehouse)",
        "id": "2588",
        "url": "/store/phonehouse-umea-utopia",
        "address": {
            "street": "Rådhusesplanaden",
            "nr": "2A",
            "zip": "903 28",
            "city": "Umeå",
            "location": {
                "lat": 63.82588,
                "lng": 20.26372
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Kristianstad C4 (Phonehouse)",
        "displayName": "Elgiganten Kristianstad C4 (Phonehouse)",
        "id": "2309",
        "url": "/store/phonehouse-kristianstad-c4",
        "address": {
            "street": "Fundationsvägen",
            "nr": "17",
            "zip": "291 28",
            "city": "Kristianstad",
            "location": {
                "lat": 56.0259106,
                "lng": 14.2058101
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 60
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Mölndal (Phonehouse)",
        "displayName": "Elgiganten Mölndal (Phonehouse)",
        "id": "2310",
        "url": "/store/phonehouse-molndal-galleria",
        "address": {
            "street": "Brogatan",
            "nr": "22",
            "zip": "431 30",
            "city": "Mölndal",
            "location": {
                "lat": 57.655166,
                "lng": 12.013625
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 60
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Täby Centrum",
        "displayName": "Elgiganten Täby Centrum",
        "id": "2589",
        "url": "/store/phonehouse-taby-centrum",
        "address": {
            "street": "Stora Marknadsvägen",
            "nr": "15",
            "zip": "183 34",
            "city": "Täby",
            "location": {
                "lat": 59.444319,
                "lng": 18.07233
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Östersund (Phonehouse)",
        "displayName": "Elgiganten Östersund (Phonehouse)",
        "id": "2580",
        "url": "/store/phonehouse-ostersund-mittpunkten",
        "address": {
            "street": "Prästgatan",
            "nr": "47",
            "zip": "831 34",
            "city": "Östersund",
            "location": {
                "lat": 63.175827,
                "lng": 14.63805
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Boden (Phonehouse)",
        "displayName": "Elgiganten Boden (Phonehouse)",
        "id": "2581",
        "url": "/store/phonehouse-boden",
        "address": {
            "street": "Drottninggatan",
            "nr": "4",
            "zip": "961 35",
            "city": "Boden",
            "location": {
                "lat": 65.824376,
                "lng": 21.686749
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Vänersborg (Phonehouse)",
        "displayName": "Elgiganten Vänersborg (Phonehouse)",
        "id": "2242",
        "url": "/store/phonehouse-vanersborg",
        "address": {
            "street": "Regementsgatan",
            "nr": "4F",
            "zip": "462 32",
            "city": "Vänersborg",
            "location": {
                "lat": 58.37763197,
                "lng": 12.33228818
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Ulricehamn",
        "displayName": "Elgiganten Ulricehamn",
        "id": "2225",
        "url": "/store/elgiganten-ulricehamn",
        "address": {
            "street": "Ubbarpsvägen",
            "nr": "2A",
            "zip": "523 37",
            "city": "Ulricehamn",
            "location": {
                "lat": 57.813056,
                "lng": 13.422272
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Falun",
        "displayName": "Elgiganten Falun",
        "id": "2299",
        "url": "/store/elgiganten-falun",
        "address": {
            "street": "Trossvägen",
            "nr": "16",
            "zip": "791 40",
            "city": "Falun",
            "location": {
                "lat": 60.605034,
                "lng": 15.665223
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Falun (Phonehouse)",
        "displayName": "Elgiganten Falun (Phonehouse)",
        "id": "2226",
        "url": "/store/phonehouse-falun",
        "address": {
            "street": "Holmgatan",
            "nr": "32",
            "zip": "791 71",
            "city": "Falun",
            "location": {
                "lat": 60.60669,
                "lng": 15.6305
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Tumba (Phonehouse)",
        "displayName": "Elgiganten Tumba (Phonehouse)",
        "id": "2243",
        "url": "/store/phonehouse-tumba",
        "address": {
            "street": "Tumba torg",
            "nr": "115",
            "zip": "147 30",
            "city": "Tumba",
            "location": {
                "lat": 59.19873,
                "lng": 17.83317
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Eksjö (Phonehouse)",
        "displayName": "Elgiganten Eksjö (Phonehouse)",
        "id": "2244",
        "url": "/store/phonehouse-eksjo",
        "address": {
            "street": "Södra Storgatan",
            "nr": "6A",
            "zip": "575 31",
            "city": "Eksjö",
            "location": {
                "lat": 57.66531,
                "lng": 14.97296
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Eslöv",
        "displayName": "Elgiganten Eslöv",
        "id": "2245",
        "url": "/store/elgiganten-eslov",
        "address": {
            "street": "Fallskärmsgatan",
            "nr": "7B",
            "zip": "241 40",
            "city": "Eslöv",
            "location": {
                "lat": 55.844278,
                "lng": 13.326806
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Phonehouse Älmhult",
        "displayName": "Elgiganten Phonehouse Älmhult",
        "id": "2279",
        "url": "/store/phonehouse-almhult",
        "address": {
            "street": "Norra Esplanaden",
            "nr": "3",
            "zip": "343 30",
            "city": "Älmhult",
            "location": {
                "lat": 56.55214,
                "lng": 14.14037
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Gallerian",
        "displayName": "Elgiganten Gallerian",
        "id": "2058",
        "url": "/store/elgiganten-gallerian",
        "address": {
            "street": "Hamngatan",
            "nr": "37",
            "zip": "111 53",
            "city": "Stockholm",
            "location": {
                "lat": 59.33244,
                "lng": 18.06718
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Phonehouse Mellby",
        "displayName": "Elgiganten Phonehouse Mellby",
        "id": "2213",
        "url": "/store/phonehouse-mellby",
        "address": {
            "street": "Söderleden",
            "nr": "1",
            "zip": "312 61",
            "city": "Mellbystrand",
            "location": {
                "lat": 56.503048,
                "lng": 12.956917
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Jägersro (Phonehouse)",
        "displayName": "Elgiganten Jägersro (Phonehouse)",
        "id": "2204",
        "url": "/store/phonehouse-jagersro",
        "address": {
            "street": "Jägersrovägen",
            "nr": "151",
            "zip": "213 75",
            "city": "Malmö",
            "location": {
                "lat": 55.57017,
                "lng": 13.05794
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Lerum (Phonehouse)",
        "displayName": "Elgiganten Lerum (Phonehouse)",
        "id": "2205",
        "url": "/store/phonehouse-lerum",
        "address": {
            "street": "Adelstorpsvägen",
            "nr": "6-8",
            "zip": "443 30",
            "city": "Lerum",
            "location": {
                "lat": 57.769653,
                "lng": 12.268797
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Köping (Phonehouse)",
        "displayName": "Elgiganten Köping (Phonehouse)",
        "id": "2201",
        "url": "/store/phonehouse-koping",
        "address": {
            "street": "Stora gatan",
            "nr": "13",
            "zip": "731 31",
            "city": "Köping",
            "location": {
                "lat": 59.51328,
                "lng": 15.99666
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Västervik",
        "displayName": "Elgiganten Västervik",
        "id": "2198",
        "url": "/store/elgiganten-vastervik",
        "address": {
            "street": "Ljunghedsvägen",
            "nr": "7",
            "zip": "593 62",
            "city": "Västervik",
            "location": {
                "lat": 57.76956,
                "lng": 16.594906
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 60
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Tranås (Phonehouse)",
        "displayName": "Elgiganten Tranås (Phonehouse)",
        "id": "2197",
        "url": "/store/phonehouse-tranas",
        "address": {
            "street": "Storgatan",
            "nr": "25",
            "zip": "573 32",
            "city": "Tranås",
            "location": {
                "lat": 58.034272,
                "lng": 14.974683
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Höör (Phonehouse)",
        "displayName": "Elgiganten Höör (Phonehouse)",
        "id": "2196",
        "url": "/store/phonehouse-hoor",
        "address": {
            "street": "Marknadsvägen",
            "nr": "2",
            "zip": "243 93",
            "city": "Höör",
            "location": {
                "lat": 55.95112,
                "lng": 13.56371
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Nybro (Phonehouse)",
        "displayName": "Elgiganten Nybro (Phonehouse)",
        "id": "2195",
        "url": "/store/phonehouse-nybro",
        "address": {
            "street": "Storgatan",
            "nr": "6A",
            "zip": "382 30",
            "city": "Nybro",
            "location": {
                "lat": 56.74397,
                "lng": 15.90745
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": null
    },
    {
        "name": "Strömstad (Phonehouse)",
        "displayName": "Elgiganten Strömstad (Phonehouse)",
        "id": "2194",
        "url": "/store/phonehouse-stromstad",
        "address": {
            "street": "Oslovägen",
            "nr": "50",
            "zip": "452 35",
            "city": "Strömstad",
            "location": {
                "lat": 58.94684,
                "lng": 11.18971
            }
        },
        "shipToStore": false,
        "collectAtStore": {
            "prePaid": true,
            "leadTime": 30
        },
        "onlineId": "2092",
        "shipFromStore": {
            "post": true,
            "home": true,
            "leadTime": 0
        }
    },
    {
        "name": "Trelleborg",
        "displayName": "Elgiganten Trelleborg",
        "id": "2193",
        "url": "/store/elgiganten-trelleborg",
        "address": {
            "street": "Strandridaregatan",
            "nr": "10",
            "zip": "231 61",
            "city": "Trelleborg",
            "location": {
                "lat": 55.374056,
                "lng": 13.130088
            }
        },
        "shipToStore": false,
        "collectAtStore": null,
        "onlineId": "2092",
        "shipFromStore": null
    }
]

export const useStoreWithId = (id:string) => {
  return useMemo(() => {
    return stores.find(d=>d.id === id)
  }, [id])
}