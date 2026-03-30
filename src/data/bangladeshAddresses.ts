// Bangladesh 4-level address hierarchy: Division -> District -> Upazila -> Union
// Comprehensive data: 8 Divisions, 64 Districts, 492 Upazilas, 769 Unions

export interface AddressData {
  divisions: Division[];
}

export interface Division {
  name: string;
  nameEn: string;
  districts: District[];
}

export interface District {
  name: string;
  nameEn: string;
  upazilas: Upazila[];
}

export interface Upazila {
  name: string;
  nameEn: string;
  unions: Union[];
}

export interface Union {
  name: string;
  nameEn: string;
}

export const bangladeshAddresses: Division[] = [
  {
    "name": "খুলনা",
    "nameEn": "Khulna",
    "districts": [
      {
        "name": "বাগেরহাট",
        "nameEn": "Bagerhat",
        "upazilas": [
          {
            "name": "বাগেরহাট সদর উপজেলা",
            "nameEn": "Bagerhat Sadar",
            "unions": []
          },
          {
            "name": "কচুয়া উপজেলা",
            "nameEn": "Chitalmari",
            "unions": []
          },
          {
            "name": "চিতলমারী উপজেলা",
            "nameEn": "Fakirhat",
            "unions": []
          },
          {
            "name": "ফকিরহাট উপজেলা",
            "nameEn": "Kachua",
            "unions": []
          },
          {
            "name": "মোংলা উপজেলা",
            "nameEn": "Mollahat",
            "unions": []
          },
          {
            "name": "মোড়েলগঞ্জ উপজেলা",
            "nameEn": "Mongla",
            "unions": []
          },
          {
            "name": "মোল্লাহাট উপজেলা",
            "nameEn": "Morrelganj",
            "unions": []
          },
          {
            "name": "রামপাল উপজেলা",
            "nameEn": "Rampal",
            "unions": []
          },
          {
            "name": "শরণখোলা উপজেলা",
            "nameEn": "Sharankhola",
            "unions": []
          }
        ]
      },
      {
        "name": "চুয়াডাঙ্গা",
        "nameEn": "Chuadanga",
        "upazilas": [
          {
            "name": "চুয়াডাঙ্গা সদর উপজেলা",
            "nameEn": "Alamdanga",
            "unions": []
          },
          {
            "name": "আলমডাঙ্গা উপজেলা",
            "nameEn": "Chuadanga Sadar",
            "unions": []
          },
          {
            "name": "জীবননগর উপজেলা",
            "nameEn": "Damurhuda",
            "unions": []
          },
          {
            "name": "দামুড়হুদা উপজেলা",
            "nameEn": "Jibannagar",
            "unions": []
          }
        ]
      },
      {
        "name": "যশোর",
        "nameEn": "Jashore",
        "upazilas": [
          {
            "name": "যশোর সদর উপজেলা",
            "nameEn": "Abhoynagar",
            "unions": []
          },
          {
            "name": "অভয়নগর উপজেলা",
            "nameEn": "Bagherpara",
            "unions": []
          },
          {
            "name": "কেশবপুর উপজেলা",
            "nameEn": "Chowgacha",
            "unions": []
          },
          {
            "name": "চৌগাছা উপজেলা",
            "nameEn": "Jashore Sadar",
            "unions": []
          },
          {
            "name": "ঝিকরগাছা উপজেলা",
            "nameEn": "Jhikargacha",
            "unions": []
          },
          {
            "name": "বাঘারপাড়া উপজেলা",
            "nameEn": "Keshabpur",
            "unions": []
          },
          {
            "name": "মনিরামপুর উপজেলা",
            "nameEn": "Monirampur",
            "unions": []
          },
          {
            "name": "শার্শা উপজেলা",
            "nameEn": "Sarsha",
            "unions": []
          }
        ]
      },
      {
        "name": "ঝিনাইদহ",
        "nameEn": "Jhenaidah",
        "upazilas": [
          {
            "name": "ঝিনাইদহ সদর উপজেলা",
            "nameEn": "Harinakunda",
            "unions": []
          },
          {
            "name": "কালীগঞ্জ উপজেলা",
            "nameEn": "Jhenaidah Sadar",
            "unions": []
          },
          {
            "name": "কোটচাঁদপুর উপজেলা",
            "nameEn": "Kaliganj",
            "unions": []
          },
          {
            "name": "মহেশপুর উপজেলা",
            "nameEn": "Kotchandpur",
            "unions": []
          },
          {
            "name": "শৈলকুপা উপজেলা",
            "nameEn": "Moheshpur",
            "unions": []
          },
          {
            "name": "হরিণাকুন্ডু উপজেলা",
            "nameEn": "Shailkupa",
            "unions": []
          }
        ]
      },
      {
        "name": "খুলনা",
        "nameEn": "Khulna",
        "upazilas": [
          {
            "name": "কয়রা উপজেলা",
            "nameEn": "Batiaghata",
            "unions": []
          },
          {
            "name": "ডুমুরিয়া উপজেলা",
            "nameEn": "Dacope",
            "unions": []
          },
          {
            "name": "তেরখাদা উপজেলা",
            "nameEn": "Dighalia",
            "unions": []
          },
          {
            "name": "দাকোপ উপজেলা",
            "nameEn": "Dumuria",
            "unions": []
          },
          {
            "name": "দিঘলিয়া উপজেলা",
            "nameEn": "Koira",
            "unions": []
          },
          {
            "name": "পাইকগাছা উপজেলা",
            "nameEn": "Paikgacha",
            "unions": []
          },
          {
            "name": "ফুলতলা উপজেলা",
            "nameEn": "Phultala",
            "unions": []
          },
          {
            "name": "বটিয়াঘাটা উপজেলা",
            "nameEn": "Rupsa",
            "unions": []
          },
          {
            "name": "রূপসা উপজেলা",
            "nameEn": "Terokhada",
            "unions": []
          }
        ]
      },
      {
        "name": "কুষ্টিয়া",
        "nameEn": "Kushtia",
        "upazilas": [
          {
            "name": "কুষ্টিয়া সদর উপজেলা",
            "nameEn": "Bheramara",
            "unions": []
          },
          {
            "name": "কুমারখালী উপজেলা",
            "nameEn": "Daulatpur",
            "unions": []
          },
          {
            "name": "খোকসা উপজেলা",
            "nameEn": "Khoksha",
            "unions": []
          },
          {
            "name": "দৌলতপুর উপজেলা",
            "nameEn": "Kumarkhali",
            "unions": []
          },
          {
            "name": "ভেড়ামারা উপজেলা",
            "nameEn": "Kushtia Sadar",
            "unions": []
          },
          {
            "name": "মিরপুর উপজেলা",
            "nameEn": "Mirpur",
            "unions": []
          }
        ]
      },
      {
        "name": "মাগুরা",
        "nameEn": "Magura",
        "upazilas": [
          {
            "name": "মাগুরা সদর উপজেলা",
            "nameEn": "Magura Sadar",
            "unions": []
          },
          {
            "name": "মোহাম্মদপুর উপজেলা",
            "nameEn": "Mohammadpur",
            "unions": []
          },
          {
            "name": "শালিখা উপজেলা",
            "nameEn": "Salikha",
            "unions": []
          },
          {
            "name": "শ্রীপুর উপজেলা",
            "nameEn": "Sreepur",
            "unions": []
          }
        ]
      },
      {
        "name": "মেহেরপুর",
        "nameEn": "Meherpur",
        "upazilas": [
          {
            "name": "মেহেরপুর সদর উপজেলা",
            "nameEn": "Gangni",
            "unions": []
          },
          {
            "name": "গাংনী উপজেলা",
            "nameEn": "Meherpur Sadar",
            "unions": []
          },
          {
            "name": "মুজিবনগর উপজেলা",
            "nameEn": "Mujib Nagar",
            "unions": []
          }
        ]
      },
      {
        "name": "নড়াইল",
        "nameEn": "Narail",
        "upazilas": [
          {
            "name": "নড়াইল সদর উপজেলা",
            "nameEn": "Kalia",
            "unions": []
          },
          {
            "name": "কালিয়া উপজেলা",
            "nameEn": "Lohagara",
            "unions": []
          },
          {
            "name": "লোহাগড়া উপজেলা",
            "nameEn": "Narail Sadar",
            "unions": []
          }
        ]
      },
      {
        "name": "সাতক্ষীরা",
        "nameEn": "Satkhira",
        "upazilas": [
          {
            "name": "সাতক্ষীরা সদর উপজেলা",
            "nameEn": "Assasuni",
            "unions": []
          },
          {
            "name": "আশাশুনি উপজেলা",
            "nameEn": "Debhata",
            "unions": []
          },
          {
            "name": "কলারোয়া উপজেলা",
            "nameEn": "Kalaroa",
            "unions": []
          },
          {
            "name": "কালীগঞ্জ উপজেলা",
            "nameEn": "Kaliganj",
            "unions": []
          },
          {
            "name": "তালা উপজেলা",
            "nameEn": "Satkhira Sadar",
            "unions": []
          },
          {
            "name": "দেবহাটা উপজেলা",
            "nameEn": "Shyamnagar",
            "unions": []
          },
          {
            "name": "শ্যামনগর উপজেলা",
            "nameEn": "Tala",
            "unions": []
          }
        ]
      }
    ]
  },
  {
    "name": "চট্টগ্রাম",
    "nameEn": "Chattogram",
    "districts": [
      {
        "name": "বি.বাড়িয়া",
        "nameEn": "B.baria",
        "upazilas": [
          {
            "name": "ব্রাহ্মণবাড়িয়া সদর উপজেলা",
            "nameEn": "Akhaura",
            "unions": []
          },
          {
            "name": "নবীনগর উপজেলা",
            "nameEn": "Ashuganj",
            "unions": []
          },
          {
            "name": "আশুগঞ্জ উপজেলা",
            "nameEn": "B.Baria Sadar",
            "unions": []
          },
          {
            "name": "আখাউড়া উপজেলা",
            "nameEn": "Bancharampur",
            "unions": []
          },
          {
            "name": "কসবা উপজেলা",
            "nameEn": "Bijoynagar",
            "unions": []
          },
          {
            "name": "বিজয়নগর উপজেলা",
            "nameEn": "Kasba",
            "unions": []
          },
          {
            "name": "সরাইল উপজেলা",
            "nameEn": "Nabinagar",
            "unions": []
          },
          {
            "name": "নাসিরনগর উপজেলা",
            "nameEn": "Nasirnagar",
            "unions": []
          },
          {
            "name": "বাঞ্ছারামপুর উপজেলা",
            "nameEn": "Sarail",
            "unions": []
          }
        ]
      },
      {
        "name": "বান্দরবান",
        "nameEn": "Bandarban",
        "upazilas": [
          {
            "name": "বান্দরবন সদর",
            "nameEn": "Alikadam",
            "unions": []
          },
          {
            "name": "আলীকদম",
            "nameEn": "Bandarban Sadar",
            "unions": []
          },
          {
            "name": "থানচি",
            "nameEn": "Lama",
            "unions": []
          },
          {
            "name": "নাইক্ষ্যংছড়ি",
            "nameEn": "Naikhyongchari",
            "unions": []
          },
          {
            "name": "রুমা",
            "nameEn": "Rowangchari",
            "unions": []
          },
          {
            "name": "রোয়াংছড়ি",
            "nameEn": "Ruma",
            "unions": []
          },
          {
            "name": "লামা",
            "nameEn": "Thanchi",
            "unions": []
          }
        ]
      },
      {
        "name": "চাঁদপুর",
        "nameEn": "Chandpur",
        "upazilas": [
          {
            "name": "চাঁদপুর সদর",
            "nameEn": "Chandpur Sadar",
            "unions": []
          },
          {
            "name": "ফরিদগঞ্জ",
            "nameEn": "Faridganj",
            "unions": []
          },
          {
            "name": "হাজীগঞ্জ",
            "nameEn": "Haimchar",
            "unions": []
          },
          {
            "name": "হাইমচর",
            "nameEn": "Haziganj",
            "unions": []
          },
          {
            "name": "শাহরাস্তি",
            "nameEn": "Kachua",
            "unions": []
          },
          {
            "name": "শাহরাস্তি",
            "nameEn": "Dakshin",
            "unions": []
          }
        ]
      },
      {
        "name": "চট্টগ্রাম",
        "nameEn": "Chattogram",
        "upazilas": [
          {
            "name": "আনোয়ারা উপজেলা",
            "nameEn": "Anwara",
            "unions": []
          },
          {
            "name": "কর্ণফুলি উপজেলা",
            "nameEn": "Banskhali",
            "unions": []
          },
          {
            "name": "চন্দনাইশ উপজেলা",
            "nameEn": "Boalkhali",
            "unions": []
          },
          {
            "name": "পটিয়া উপজেলা",
            "nameEn": "Chandanish",
            "unions": []
          },
          {
            "name": "ফটিকছড়ি উপজেলা",
            "nameEn": "Fatikchari",
            "unions": []
          },
          {
            "name": "বাঁশখালী উপজেলা",
            "nameEn": "Hathazari",
            "unions": []
          },
          {
            "name": "বোয়ালখালী উপজেলা",
            "nameEn": "Karnaphuli",
            "unions": []
          },
          {
            "name": "মীরসরাই উপজেলা",
            "nameEn": "Lohagara",
            "unions": []
          },
          {
            "name": "রাউজান উপজেলা",
            "nameEn": "Mirsharai",
            "unions": []
          },
          {
            "name": "রাঙ্গুনিয়া উপজেলা",
            "nameEn": "Patiya",
            "unions": []
          },
          {
            "name": "লোহাগাড়া উপজেলা",
            "nameEn": "Rangunia",
            "unions": []
          },
          {
            "name": "সন্দ্বীপ উপজেলা",
            "nameEn": "Raojan",
            "unions": []
          },
          {
            "name": "সাতকানিয়া উপজেলা",
            "nameEn": "Sandwip",
            "unions": []
          },
          {
            "name": "সীতাকুণ্ড উপজেলা",
            "nameEn": "Satkania",
            "unions": []
          },
          {
            "name": "হাটহাজারী উপজেলা",
            "nameEn": "Sitakunda",
            "unions": []
          }
        ]
      },
      {
        "name": "কক্সবাজার",
        "nameEn": "Cox's bazar",
        "upazilas": [
          {
            "name": "কক্সবাজার সদর",
            "nameEn": "Chakoria",
            "unions": []
          },
          {
            "name": "উখিয়া",
            "nameEn": "Cox'S Bazar Sadar",
            "unions": []
          },
          {
            "name": "কুতুবদিয়া",
            "nameEn": "Kutubdia",
            "unions": []
          },
          {
            "name": "চকরিয়া",
            "nameEn": "Moheskhali",
            "unions": []
          },
          {
            "name": "টেকনাফ",
            "nameEn": "Pekua",
            "unions": []
          },
          {
            "name": "পেকুয়া",
            "nameEn": "Ramu",
            "unions": []
          },
          {
            "name": "মহেশখালী",
            "nameEn": "Teknaf",
            "unions": []
          },
          {
            "name": "রামু",
            "nameEn": "Ukhiya",
            "unions": []
          }
        ]
      },
      {
        "name": "কুমিল্লা",
        "nameEn": "Cumilla",
        "upazilas": [
          {
            "name": "বরুড়া উপজেলা",
            "nameEn": "Barura",
            "unions": []
          },
          {
            "name": "ব্রাহ্মনপাড়া উপজেলা",
            "nameEn": "Brahmanpara",
            "unions": []
          },
          {
            "name": "বুড়িচং উপজেলা",
            "nameEn": "Burichong",
            "unions": []
          },
          {
            "name": "চান্দিনা উপজেলা",
            "nameEn": "Chandina",
            "unions": []
          },
          {
            "name": "চৌদ্দগ্রাম উপজেলা",
            "nameEn": "Chouddagram",
            "unions": []
          },
          {
            "name": "কুমিল্লা- সদর",
            "nameEn": "Cumilla Sadar",
            "unions": []
          },
          {
            "name": "সদর দক্ষিন উপজেলা",
            "nameEn": "Cumilla Sadar Daksin",
            "unions": []
          },
          {
            "name": "দাউদকান্দি উপজেলা",
            "nameEn": "Daudkandi",
            "unions": []
          },
          {
            "name": "দেবিদ্বার উপজেলা",
            "nameEn": "Debidwar",
            "unions": []
          },
          {
            "name": "হোমনা উপজেলা",
            "nameEn": "Homna",
            "unions": []
          },
          {
            "name": "লাকসাম উপজেলা",
            "nameEn": "Laksham",
            "unions": []
          },
          {
            "name": "লালমাই উপজেলা",
            "nameEn": "Lalmai",
            "unions": []
          },
          {
            "name": "মেঘনা উপজেলা",
            "nameEn": "Meghna",
            "unions": []
          },
          {
            "name": "মনোহরগঞ্জ উপজেলা",
            "nameEn": "Monohorganj",
            "unions": []
          },
          {
            "name": "মুরাদনগর উপজেলা",
            "nameEn": "Muradnagar",
            "unions": []
          },
          {
            "name": "নাঙ্গলকোট উপজেলা",
            "nameEn": "Nangalkot",
            "unions": []
          },
          {
            "name": "তিতাস উপজেলা",
            "nameEn": "Titas",
            "unions": []
          }
        ]
      },
      {
        "name": "ফেনী",
        "nameEn": "Feni",
        "upazilas": [
          {
            "name": "ফেনী সদর",
            "nameEn": "Chhagalniya",
            "unions": []
          },
          {
            "name": "দাগনভূঁইয়া",
            "nameEn": "Daganbhuiyan",
            "unions": []
          },
          {
            "name": "সোনাগাজী",
            "nameEn": "Feni Sadar",
            "unions": []
          },
          {
            "name": "ছাগলনাইয়া",
            "nameEn": "Fulgazi",
            "unions": []
          },
          {
            "name": "পরশুরাম",
            "nameEn": "Porshuram",
            "unions": []
          },
          {
            "name": "ফুলগাজী",
            "nameEn": "Sonagazi",
            "unions": []
          }
        ]
      },
      {
        "name": "খাগড়াছড়ি",
        "nameEn": "Khagrachari",
        "upazilas": [
          {
            "name": "খাগড়াছড়ি সদর উপজেলা",
            "nameEn": "Dighinala",
            "unions": []
          },
          {
            "name": "পানছড়ি উপজেলা",
            "nameEn": "Guimara",
            "unions": []
          },
          {
            "name": "পানছড়ি উপজেলা",
            "nameEn": "Khagrachari Sadar",
            "unions": []
          },
          {
            "name": "মহালছড়ি উপজেলা",
            "nameEn": "Laxmichari",
            "unions": []
          },
          {
            "name": "মাটিরাঙ্গা উপজেলা",
            "nameEn": "Mahalchari",
            "unions": []
          },
          {
            "name": "মানিকছড়ি উপজেলা",
            "nameEn": "Manikchari",
            "unions": []
          },
          {
            "name": "রামগড় উপজেলা",
            "nameEn": "Matiranga",
            "unions": []
          },
          {
            "name": "লক্ষীছড়ি উপজেলা",
            "nameEn": "Panchari",
            "unions": []
          },
          {
            "name": "গুইমারা উপজেলা",
            "nameEn": "Ramgarh",
            "unions": []
          }
        ]
      },
      {
        "name": "লক্ষ্মীপুর",
        "nameEn": "Laxmipur",
        "upazilas": [
          {
            "name": "লক্ষ্মীপুর",
            "nameEn": "Komol Nagar",
            "unions": []
          },
          {
            "name": "রায়পুর",
            "nameEn": "Laxmipur Sadar",
            "unions": []
          },
          {
            "name": "রামগঞ্জ",
            "nameEn": "Raipur",
            "unions": []
          },
          {
            "name": "রামগতি",
            "nameEn": "Ramganj",
            "unions": []
          },
          {
            "name": "কমলনগর",
            "nameEn": "Ramgati",
            "unions": []
          }
        ]
      },
      {
        "name": "নোয়াখালী",
        "nameEn": "Noakhali",
        "upazilas": [
          {
            "name": "বেগমগঞ্জ",
            "nameEn": "Begumganj",
            "unions": []
          },
          {
            "name": "চাটখিল",
            "nameEn": "Chatkhil",
            "unions": []
          },
          {
            "name": "কোম্পানীগঞ্জ",
            "nameEn": "Companiganj",
            "unions": []
          },
          {
            "name": "হাতিয়া",
            "nameEn": "Hatiya",
            "unions": []
          },
          {
            "name": "কবিরহাট",
            "nameEn": "Kabir Hat",
            "unions": []
          },
          {
            "name": "নোয়াখালী সদর",
            "nameEn": "Noakhali Sadar",
            "unions": []
          },
          {
            "name": "সেনবাগ",
            "nameEn": "Senbag",
            "unions": []
          },
          {
            "name": "সোনাইমুড়ী",
            "nameEn": "Sonaimuri",
            "unions": []
          },
          {
            "name": "সুবর্ণচর",
            "nameEn": "Subarna Char",
            "unions": []
          }
        ]
      },
      {
        "name": "রাঙ্গামাটি",
        "nameEn": "Rangamati",
        "upazilas": [
          {
            "name": "রাঙ্গামাটি সদর",
            "nameEn": "Baghaichari",
            "unions": []
          },
          {
            "name": "নানিয়ারচর",
            "nameEn": "Barkal",
            "unions": []
          },
          {
            "name": "লংগদু",
            "nameEn": "Belaichari",
            "unions": []
          },
          {
            "name": "বাঘাইছড়ি",
            "nameEn": "Juraichari",
            "unions": []
          },
          {
            "name": "বরকল",
            "nameEn": "Kaptai",
            "unions": []
          },
          {
            "name": "জুরাছড়ি",
            "nameEn": "Kaukhali",
            "unions": []
          },
          {
            "name": "বিলাইছড়ি",
            "nameEn": "Langadu",
            "unions": []
          },
          {
            "name": "রাজস্থলী",
            "nameEn": "Nanniarchar",
            "unions": []
          },
          {
            "name": "কাপ্তাই",
            "nameEn": "Rajosthali",
            "unions": []
          },
          {
            "name": "কাউখালী",
            "nameEn": "Rangamati Sadar",
            "unions": []
          }
        ]
      }
    ]
  },
  {
    "name": "ঢাকা",
    "nameEn": "Dhaka",
    "districts": [
      {
        "name": "ঢাকা",
        "nameEn": "Dhaka",
        "upazilas": [
          {
            "name": "সাভার উপজেলা",
            "nameEn": "Dhamrai",
            "unions": []
          },
          {
            "name": "ধামরাই উপজেলা",
            "nameEn": "Dohar",
            "unions": []
          },
          {
            "name": "দোহার উপজেলা",
            "nameEn": "Keraniganj",
            "unions": []
          },
          {
            "name": "কেরানীগঞ্জ উপজেলা",
            "nameEn": "Nawabganj",
            "unions": []
          },
          {
            "name": "নবাবগঞ্জ উপজেলা",
            "nameEn": "Savar",
            "unions": []
          }
        ]
      },
      {
        "name": "ফরিদপুর",
        "nameEn": "Faridpur",
        "upazilas": [
          {
            "name": "ফরিদপুর সদর উপজেলা",
            "nameEn": "Alfadanga",
            "unions": []
          },
          {
            "name": "বোয়ালমারী উপজেলা",
            "nameEn": "Bhanga",
            "unions": []
          },
          {
            "name": "আলফাডাঙ্গা উপজেলা",
            "nameEn": "Boalmari",
            "unions": []
          },
          {
            "name": "মধুখালী উপজেলা",
            "nameEn": "Charbhadrasan",
            "unions": []
          },
          {
            "name": "ভাঙ্গা উপজেলা",
            "nameEn": "Faridpur Sadar",
            "unions": []
          },
          {
            "name": "নগরকান্দা উপজেলা",
            "nameEn": "Madhukhali",
            "unions": []
          },
          {
            "name": "চরভদ্রাসন উপজেলা",
            "nameEn": "Nagarkanda",
            "unions": []
          },
          {
            "name": "সদরপুর উপজেলা",
            "nameEn": "Sadarpur",
            "unions": []
          },
          {
            "name": "সালথা উপজেলা",
            "nameEn": "Saltha",
            "unions": []
          }
        ]
      },
      {
        "name": "গাজীপুর",
        "nameEn": "Gazipur",
        "upazilas": [
          {
            "name": "গাজীপুর সদর উপজেলা",
            "nameEn": "Gazipur Sadar",
            "unions": []
          },
          {
            "name": "কালিয়াকৈর উপজেলা",
            "nameEn": "Kaliakoir",
            "unions": []
          },
          {
            "name": "কালীগঞ্জ উপজেলা",
            "nameEn": "Kaliganj",
            "unions": []
          },
          {
            "name": "কাপাসিয়া উপজেলা",
            "nameEn": "Kapasia",
            "unions": []
          },
          {
            "name": "শ্রীপুর উপজেলা",
            "nameEn": "Sreepur",
            "unions": []
          }
        ]
      },
      {
        "name": "গোপালগঞ্জ",
        "nameEn": "Gopalganj",
        "upazilas": [
          {
            "name": "গোপালগঞ্জ সদর উপজেলা",
            "nameEn": "Gopalganj Sadar",
            "unions": []
          },
          {
            "name": "মুকসুদপুর উপজেলা",
            "nameEn": "Kasiani",
            "unions": []
          },
          {
            "name": "কাশিয়ানী উপজেলা",
            "nameEn": "Kotwalipara",
            "unions": []
          },
          {
            "name": "কোটালীপাড়া উপজেলা",
            "nameEn": "Muksudpur",
            "unions": []
          },
          {
            "name": "টুঙ্গিপাড়া উপজেলা",
            "nameEn": "Tungipara",
            "unions": []
          }
        ]
      },
      {
        "name": "কিশোরগঞ্জ",
        "nameEn": "Kishoreganj",
        "upazilas": [
          {
            "name": "কিশোরগঞ্জ সদর উপজেলা",
            "nameEn": "Austagram",
            "unions": []
          },
          {
            "name": "অষ্টগ্রাম উপজেলা",
            "nameEn": "Bajitpur",
            "unions": []
          },
          {
            "name": "ইটনা উপজেলা",
            "nameEn": "Bhairab",
            "unions": []
          },
          {
            "name": "করিমগঞ্জ উপজেলা",
            "nameEn": "Hossainpur",
            "unions": []
          },
          {
            "name": "কটিয়াদি উপজেলা",
            "nameEn": "Itna",
            "unions": []
          },
          {
            "name": "কুলিয়ারচর উপজেলা",
            "nameEn": "Karimganj",
            "unions": []
          },
          {
            "name": "তাড়াইল উপজেলা",
            "nameEn": "Katiadi",
            "unions": []
          },
          {
            "name": "নিকলী উপজেলা",
            "nameEn": "Kishoreganj Sadar",
            "unions": []
          },
          {
            "name": "পাকুন্দিয়া উপজেলা",
            "nameEn": "Kuliarchar",
            "unions": []
          },
          {
            "name": "বাজিতপুর উপজেলা",
            "nameEn": "Mithamoin",
            "unions": []
          },
          {
            "name": "ভৈরব উপজেলা",
            "nameEn": "Nikli",
            "unions": []
          },
          {
            "name": "মিঠামইন উপজেলা",
            "nameEn": "Pakundia",
            "unions": []
          },
          {
            "name": "হোসেনপুর উপজেলা",
            "nameEn": "Tarail",
            "unions": []
          }
        ]
      },
      {
        "name": "মাদারীপুর",
        "nameEn": "Madaripur",
        "upazilas": [
          {
            "name": "মাদারীপুর সদর উপজেলা",
            "nameEn": "Kalkini",
            "unions": []
          },
          {
            "name": "শিবচর উপজেলা",
            "nameEn": "Madaripur Sadar",
            "unions": []
          },
          {
            "name": "কালকিনী উপজেলা",
            "nameEn": "Rajoir",
            "unions": []
          },
          {
            "name": "রাজৈর উপজেলা",
            "nameEn": "Shibchar",
            "unions": []
          }
        ]
      },
      {
        "name": "মানিকগঞ্জ",
        "nameEn": "Manikganj",
        "upazilas": [
          {
            "name": "মাদারীপুর সদর উপজেলা",
            "nameEn": "Daulatpur",
            "unions": []
          },
          {
            "name": "মানিকগঞ্জ সদর উপজেলা",
            "nameEn": "Ghior",
            "unions": []
          },
          {
            "name": "ঘিওর উপজেলা",
            "nameEn": "Harirampur",
            "unions": []
          },
          {
            "name": "দৌলতপুর উপজেলা",
            "nameEn": "Manikganj Sadar",
            "unions": []
          },
          {
            "name": "শিবালয় উপজেলা",
            "nameEn": "Saturia",
            "unions": []
          },
          {
            "name": "সাটুরিয়া উপজেলা",
            "nameEn": "Shivalaya",
            "unions": []
          },
          {
            "name": "সিঙ্গাইর উপজেলা",
            "nameEn": "Singair",
            "unions": []
          },
          {
            "name": "হরিরামপুর উপজেলা",
            "nameEn": "হরিরামপুর",
            "unions": []
          }
        ]
      },
      {
        "name": "মুন্সিগঞ্জ",
        "nameEn": "Munshiganj",
        "upazilas": [
          {
            "name": "মুন্সিগঞ্জ সদর উপজেলা",
            "nameEn": "Gazaria",
            "unions": []
          },
          {
            "name": "শ্রীনগর সদর উপজেলা",
            "nameEn": "Lauhajong",
            "unions": []
          },
          {
            "name": "সিরাজদীখান উপজেলা",
            "nameEn": "Munshiganj Sadar",
            "unions": []
          },
          {
            "name": "লৌহজং উপজেলা",
            "nameEn": "Sirajdikhan",
            "unions": []
          },
          {
            "name": "টঙ্গীবাড়ী উপজেলা",
            "nameEn": "Sreenagar",
            "unions": []
          },
          {
            "name": "গজারিয়া উপজেলা",
            "nameEn": "Tongibari",
            "unions": []
          }
        ]
      },
      {
        "name": "নারায়ণগঞ্জ",
        "nameEn": "Narayanganj",
        "upazilas": [
          {
            "name": "নারায়ণগঞ্জ সদর উপজেলা",
            "nameEn": "Araihazar",
            "unions": []
          },
          {
            "name": "বন্দর উপজেলা",
            "nameEn": "Bandar",
            "unions": []
          },
          {
            "name": "আড়াইহাজার উপজেলা",
            "nameEn": "Narayanganj Sadar",
            "unions": []
          },
          {
            "name": "রূপগঞ্জ উপজেলা",
            "nameEn": "Rupganj",
            "unions": []
          },
          {
            "name": "সোনারগাঁও উপজেলা",
            "nameEn": "Sonargaon",
            "unions": []
          }
        ]
      },
      {
        "name": "নরসিংদী",
        "nameEn": "Narshingdi",
        "upazilas": [
          {
            "name": "নরসিংদী সদর উপজেলা",
            "nameEn": "Belabo",
            "unions": []
          },
          {
            "name": "বেলাবো উপজেলা",
            "nameEn": "Monohardi",
            "unions": []
          },
          {
            "name": "শিবপুর উপজেলা",
            "nameEn": "Narshingdi Sadar",
            "unions": []
          },
          {
            "name": "মনোহরদী উপজেলা",
            "nameEn": "Palash",
            "unions": []
          },
          {
            "name": "রায়পুরা উপজেলা",
            "nameEn": "Raipura",
            "unions": []
          },
          {
            "name": "পলাশ উপজেলা",
            "nameEn": "Shibpur",
            "unions": []
          }
        ]
      },
      {
        "name": "রাজবাড়ী",
        "nameEn": "Rajbari",
        "upazilas": [
          {
            "name": "রাজবাড়ি সদর উপজেলা",
            "nameEn": "Baliakandi",
            "unions": []
          },
          {
            "name": "গোয়ালন্দ উপজেলা",
            "nameEn": "Goalanda",
            "unions": []
          },
          {
            "name": "পাংশা উপজেলা",
            "nameEn": "Kalukhali",
            "unions": []
          },
          {
            "name": "বালিয়াকান্দি উপজেলা",
            "nameEn": "Pangsha",
            "unions": []
          },
          {
            "name": "কালুখালী উপজেলা",
            "nameEn": "Rajbari Sadar",
            "unions": []
          }
        ]
      },
      {
        "name": "শরীয়তপুর",
        "nameEn": "Shariatpur",
        "upazilas": [
          {
            "name": "শরিয়তপুর সদর উপজেলা",
            "nameEn": "Bhedarganj",
            "unions": []
          },
          {
            "name": "ডামুড্যা উপজেলা",
            "nameEn": "Damuddya",
            "unions": []
          },
          {
            "name": "নড়িয়া উপজেলা",
            "nameEn": "Goshairhat",
            "unions": []
          },
          {
            "name": "ভেদরগঞ্জ উপজেলা",
            "nameEn": "Janjira",
            "unions": []
          },
          {
            "name": "জাজিরা উপজেলা",
            "nameEn": "Naria",
            "unions": []
          },
          {
            "name": "গোসাইরহাট উপজেলা",
            "nameEn": "Shariatpur Sadar",
            "unions": []
          }
        ]
      },
      {
        "name": "টাঙ্গাইল",
        "nameEn": "Tangail",
        "upazilas": [
          {
            "name": "টাঙ্গাইল সদর উপজেলা",
            "nameEn": "Basail",
            "unions": []
          },
          {
            "name": "কালিহাতি উপজেলা",
            "nameEn": "Bhuapur",
            "unions": []
          },
          {
            "name": "ঘাটাইল উপজেলা",
            "nameEn": "Delduar",
            "unions": []
          },
          {
            "name": "বাসাইল উপজেলা",
            "nameEn": "Dhanbari",
            "unions": []
          },
          {
            "name": "গোপালপুর উপজেলা",
            "nameEn": "Ghatail",
            "unions": []
          },
          {
            "name": "মির্জাপুর উপজেলা",
            "nameEn": "Gopalpur",
            "unions": []
          },
          {
            "name": "ভূঞাপুর উপজেলা",
            "nameEn": "Kalihati",
            "unions": []
          },
          {
            "name": "নাগরপুর উপজেলা",
            "nameEn": "Madhupur",
            "unions": []
          },
          {
            "name": "মধুপুর উপজেলা",
            "nameEn": "Mirzapur",
            "unions": []
          },
          {
            "name": "সখিপুর উপজেলা",
            "nameEn": "Nagarpur",
            "unions": []
          },
          {
            "name": "দেলদুয়ার উপজেলা",
            "nameEn": "Shakhipur",
            "unions": []
          },
          {
            "name": "ধনবাড়ী উপজেলা",
            "nameEn": "Tangail Sadar",
            "unions": []
          }
        ]
      }
    ]
  },
  {
    "name": "বরিশাল",
    "nameEn": "Barishal",
    "districts": [
      {
        "name": "বরগুনা",
        "nameEn": "Barguna",
        "upazilas": [
          {
            "name": "বরগুনা সদর",
            "nameEn": "Amtali",
            "unions": []
          },
          {
            "name": "আমতলী",
            "nameEn": "Bamna",
            "unions": []
          },
          {
            "name": "বেতাগী",
            "nameEn": "Barguna Sadar",
            "unions": []
          },
          {
            "name": "বামনা",
            "nameEn": "Betagi",
            "unions": []
          },
          {
            "name": "পাথরঘাটা",
            "nameEn": "Patharghata",
            "unions": []
          },
          {
            "name": "তালতলী",
            "nameEn": "Taltali",
            "unions": []
          }
        ]
      },
      {
        "name": "বরিশাল",
        "nameEn": "Barisal",
        "upazilas": [
          {
            "name": "বরিশাল সদর",
            "nameEn": "Barisal Sadar",
            "unions": []
          },
          {
            "name": "গৌরনদী",
            "nameEn": "Gournadi",
            "unions": []
          },
          {
            "name": "মুলাদী",
            "nameEn": "Muladi",
            "unions": []
          },
          {
            "name": "মেহেন্দিগঞ্জ",
            "nameEn": "Mehendiganj",
            "unions": []
          },
          {
            "name": "বাবুগঞ্জ",
            "nameEn": "Babuganj",
            "unions": []
          },
          {
            "name": "হিজলা",
            "nameEn": "Hizla",
            "unions": []
          },
          {
            "name": "উজিরপুর",
            "nameEn": "Uzirpur",
            "unions": []
          },
          {
            "name": "বাকেরগঞ্জ",
            "nameEn": "Bakerganj",
            "unions": []
          },
          {
            "name": "আগৈলঝাড়া",
            "nameEn": "Agailjhara",
            "unions": []
          },
          {
            "name": "বানারীপাড়া",
            "nameEn": "Banaripara",
            "unions": []
          }
        ]
      },
      {
        "name": "ভোলা",
        "nameEn": "Bhola",
        "upazilas": [
          {
            "name": "ভোলা সদর",
            "nameEn": "Borhanuddin",
            "unions": []
          },
          {
            "name": "বোরহান উদ্দিন",
            "nameEn": "Charfassion",
            "unions": []
          },
          {
            "name": "দৌলতখান",
            "nameEn": "Daulatkhan",
            "unions": []
          },
          {
            "name": "লালমোহন",
            "nameEn": "Lalmohan",
            "unions": []
          },
          {
            "name": "তজুমদ্দিন",
            "nameEn": "Monpura",
            "unions": []
          },
          {
            "name": "চরফ্যাশন",
            "nameEn": "Tazumuddin",
            "unions": []
          },
          {
            "name": "মনপুরা",
            "nameEn": "মনপুরা",
            "unions": []
          }
        ]
      },
      {
        "name": "ঝালকাঠি",
        "nameEn": "Jhalokathi",
        "upazilas": [
          {
            "name": "ঝালকাঠি সদর উপজেলা",
            "nameEn": "Tazumuddin",
            "unions": []
          },
          {
            "name": "কাঁঠালিয়া উপজেলা",
            "nameEn": "Jhalokathi Sadar",
            "unions": []
          },
          {
            "name": "নলছিটি উপজেলা",
            "nameEn": "Kathalia",
            "unions": []
          },
          {
            "name": "রাজাপুর উপজেলা",
            "nameEn": "Nalchity",
            "unions": []
          }
        ]
      },
      {
        "name": "পটুয়াখালী",
        "nameEn": "Patuakhali",
        "upazilas": [
          {
            "name": "পটুয়াখালী সদর উপজেলা",
            "nameEn": "Bauphal",
            "unions": []
          },
          {
            "name": "বাউফল উপজেলা",
            "nameEn": "Dashmina",
            "unions": []
          },
          {
            "name": "দশমিনা উপজেলা",
            "nameEn": "Dumki",
            "unions": []
          },
          {
            "name": "গলাচিপা উপজেলা",
            "nameEn": "Galachipa",
            "unions": []
          },
          {
            "name": "কলাপাড়া উপজেলা",
            "nameEn": "Kalapara",
            "unions": []
          },
          {
            "name": "মির্জাগঞ্জ উপজেলা",
            "nameEn": "Mirjaganj",
            "unions": []
          },
          {
            "name": "দুমকি উপজেলা",
            "nameEn": "Patuakhali Sadar",
            "unions": []
          },
          {
            "name": "রাঙ্গাবালী উপজেলা",
            "nameEn": "Rangabali",
            "unions": []
          }
        ]
      },
      {
        "name": "পিরোজপুর",
        "nameEn": "Pirojpur",
        "upazilas": [
          {
            "name": "ভান্ডারিয়া উপজেলা",
            "nameEn": "Bhandaria",
            "unions": []
          },
          {
            "name": "কাউখালী উপজেলা",
            "nameEn": "Kawkhali",
            "unions": []
          },
          {
            "name": "মঠবাড়িয়া উপজেলা",
            "nameEn": "Mothbaria",
            "unions": []
          },
          {
            "name": "নাজিরপুর উপজেলা",
            "nameEn": "Nazirpur",
            "unions": []
          },
          {
            "name": "পিরোজপুর সদর উপজেলা",
            "nameEn": "Nesarabad",
            "unions": []
          },
          {
            "name": "নেছারাবাদ উপজেলা",
            "nameEn": "Pirojpur Sadar",
            "unions": []
          },
          {
            "name": "ইন্দুরকানী উপজেলা",
            "nameEn": "Zianagar",
            "unions": []
          }
        ]
      }
    ]
  },
  {
    "name": "ময়মনসিংহ",
    "nameEn": "Mymensingh",
    "districts": [
      {
        "name": "জামালপুর",
        "nameEn": "জামালপুর",
        "upazilas": [
          {
            "name": "জামালপুর সদর উপজেলা",
            "nameEn": "জামালপুর সদর",
            "unions": []
          },
          {
            "name": "বকশীগঞ্জ উপজেলা",
            "nameEn": "বকশীগঞ্জ",
            "unions": []
          },
          {
            "name": "দেওয়ানগঞ্জ উপজেলা",
            "nameEn": "দেওয়ানগঞ্জ",
            "unions": []
          },
          {
            "name": "ইসলামপুর উপজেলা",
            "nameEn": "ইসলামপুর",
            "unions": []
          },
          {
            "name": "মাদারগঞ্জ উপজেলা",
            "nameEn": "মাদারগঞ্জ",
            "unions": []
          },
          {
            "name": "মেলান্দহ উপজেলা",
            "nameEn": "মেলান্দহ",
            "unions": []
          },
          {
            "name": "সরিষাবাড়ি উপজেলা",
            "nameEn": "সরিষাবাড়ি",
            "unions": []
          }
        ]
      },
      {
        "name": "ময়মনসিংহ",
        "nameEn": "ময়মনসিংহ",
        "upazilas": [
          {
            "name": "ময়মনসিংহ সদর",
            "nameEn": "ময়মনসিংহ সদর",
            "unions": []
          },
          {
            "name": "ফুলবাড়িয়া",
            "nameEn": "ফুলবাড়িয়া",
            "unions": []
          },
          {
            "name": "ত্রিশাল",
            "nameEn": "ত্রিশাল",
            "unions": []
          },
          {
            "name": "ভালুকা",
            "nameEn": "ভালুকা",
            "unions": []
          },
          {
            "name": "মুক্তাগাছা",
            "nameEn": "মুক্তাগাছা",
            "unions": []
          },
          {
            "name": "ধোবাউড়া",
            "nameEn": "ধোবাউড়া",
            "unions": []
          },
          {
            "name": "ফুলপুর",
            "nameEn": "ফুলপুর",
            "unions": []
          },
          {
            "name": "হালুয়াঘাট",
            "nameEn": "হালুয়াঘাট",
            "unions": []
          },
          {
            "name": "গৌরীপুর",
            "nameEn": "গৌরীপুর",
            "unions": []
          },
          {
            "name": "গফরগাঁও",
            "nameEn": "গফরগাঁও",
            "unions": []
          },
          {
            "name": "ঈশ্বরগঞ্জ",
            "nameEn": "ঈশ্বরগঞ্জ",
            "unions": []
          },
          {
            "name": "নান্দাইল",
            "nameEn": "নান্দাইল",
            "unions": []
          },
          {
            "name": "তারাকান্দা",
            "nameEn": "তারাকান্দা",
            "unions": []
          }
        ]
      },
      {
        "name": "নেত্রকোনা",
        "nameEn": "নেত্রকোনা",
        "upazilas": [
          {
            "name": "নেত্রকোনা সদর",
            "nameEn": "নেত্রকোনা সদর",
            "unions": []
          },
          {
            "name": "আটপাড়া",
            "nameEn": "আটপাড়া",
            "unions": []
          },
          {
            "name": "বারহাট্টা",
            "nameEn": "বারহাট্টা",
            "unions": []
          },
          {
            "name": "দুর্গাপুর",
            "nameEn": "দুর্গাপুর",
            "unions": []
          },
          {
            "name": "খালিয়াজুড়ি",
            "nameEn": "খালিয়াজুড়ি",
            "unions": []
          },
          {
            "name": "কলমাকান্দা",
            "nameEn": "কলমাকান্দা",
            "unions": []
          },
          {
            "name": "কেন্দুয়া",
            "nameEn": "কেন্দুয়া",
            "unions": []
          },
          {
            "name": "মদন",
            "nameEn": "মদন",
            "unions": []
          },
          {
            "name": "মোহনগঞ্জ",
            "nameEn": "মোহনগঞ্জ",
            "unions": []
          },
          {
            "name": "পূর্বধলা",
            "nameEn": "পূর্বধলা",
            "unions": []
          }
        ]
      },
      {
        "name": "শেরপুর",
        "nameEn": "শেরপুর",
        "upazilas": [
          {
            "name": "শেরপুর সদর",
            "nameEn": "শেরপুর সদর",
            "unions": []
          },
          {
            "name": "ঝিনাইগাতী",
            "nameEn": "ঝিনাইগাতী",
            "unions": []
          },
          {
            "name": "নকলা",
            "nameEn": "নকলা",
            "unions": []
          },
          {
            "name": "নালিতাবাড়ী",
            "nameEn": "নালিতাবাড়ী",
            "unions": []
          },
          {
            "name": "শ্রীবরদী",
            "nameEn": "শ্রীবরদী",
            "unions": []
          }
        ]
      }
    ]
  },
  {
    "name": "রংপুর",
    "nameEn": "Rangpur",
    "districts": [
      {
        "name": "দিনাজপুর",
        "nameEn": "Dinajpur",
        "upazilas": [
          {
            "name": "দিনাজপুর সদর",
            "nameEn": "Birampur",
            "unions": []
          },
          {
            "name": "বিরামপুর",
            "nameEn": "Birganj",
            "unions": []
          },
          {
            "name": "বীরগঞ্জ",
            "nameEn": "Birol",
            "unions": []
          },
          {
            "name": "বোচাগঞ্জ",
            "nameEn": "Bochaganj",
            "unions": []
          },
          {
            "name": "ফুলবাড়ী",
            "nameEn": "Chirirbandar",
            "unions": []
          },
          {
            "name": "চিরিরবন্দর",
            "nameEn": "Dinajpur Sadar",
            "unions": []
          },
          {
            "name": "ঘোড়াঘাট",
            "nameEn": "Fulbari",
            "unions": []
          },
          {
            "name": "হাকিমপুর",
            "nameEn": "Ghoraghat",
            "unions": []
          },
          {
            "name": "কাহারোল",
            "nameEn": "Hakimpur",
            "unions": []
          },
          {
            "name": "খানসামা",
            "nameEn": "Kaharol",
            "unions": []
          },
          {
            "name": "নবাবগঞ্জ",
            "nameEn": "Khanshama",
            "unions": []
          },
          {
            "name": "পার্বতীপুর",
            "nameEn": "Nawabganj",
            "unions": []
          },
          {
            "name": "বিরল",
            "nameEn": "Parbatipur",
            "unions": []
          }
        ]
      },
      {
        "name": "গাইবান্ধা",
        "nameEn": "Gaibandha",
        "upazilas": [
          {
            "name": "লক্ষ্মীপুর উপজেলা",
            "nameEn": "Fulchari",
            "unions": [
              {
                "name": "লক্ষ্মীপুর",
                "nameEn": "লক্ষ্মীপুর"
              },
              {
                "name": "মালিবাড়ী",
                "nameEn": "মালিবাড়ী"
              },
              {
                "name": "কুপতলা",
                "nameEn": "কুপতলা"
              },
              {
                "name": "সাহাপাড়া",
                "nameEn": "সাহাপাড়া"
              },
              {
                "name": "বল্লমঝাড়",
                "nameEn": "বল্লমঝাড়"
              },
              {
                "name": "রামচন্দ্রপুর",
                "nameEn": "রামচন্দ্রপুর"
              },
              {
                "name": "বাদিয়াখালী",
                "nameEn": "বাদিয়াখালী"
              },
              {
                "name": "বোয়ালী",
                "nameEn": "বোয়ালী"
              },
              {
                "name": "খোলাহাটী",
                "nameEn": "খোলাহাটী"
              },
              {
                "name": "ঘাগোয়া",
                "nameEn": "ঘাগোয়া"
              },
              {
                "name": "গিদারী",
                "nameEn": "গিদারী"
              },
              {
                "name": "কামারজানি",
                "nameEn": "কামারজানি"
              },
              {
                "name": "মোল্লারচর",
                "nameEn": "মোল্লারচর"
              }
            ]
          },
          {
            "name": "ফুলছড়ি উপজেলা",
            "nameEn": "Gaibandha Sadar",
            "unions": [
              {
                "name": "কঞ্চিপাড়া",
                "nameEn": "কঞ্চিপাড়া"
              },
              {
                "name": "উড়িয়া",
                "nameEn": "উড়িয়া"
              },
              {
                "name": "উদাখালী",
                "nameEn": "উদাখালী"
              },
              {
                "name": "গজারিয়া",
                "nameEn": "গজারিয়া"
              },
              {
                "name": "ফুলছড়ি",
                "nameEn": "ফুলছড়ি"
              },
              {
                "name": "এরেন্ডাবাড়ী",
                "nameEn": "এরেন্ডাবাড়ী"
              },
              {
                "name": "ফজলুপুর",
                "nameEn": "ফজলুপুর"
              }
            ]
          },
          {
            "name": "গোবিন্দগঞ্জ উপজেলা",
            "nameEn": "Gobindaganj",
            "unions": [
              {
                "name": "মহিমাগঞ্জ",
                "nameEn": "মহিমাগঞ্জ"
              },
              {
                "name": "কামদিয়া",
                "nameEn": "কামদিয়া"
              },
              {
                "name": "শাখাহার",
                "nameEn": "শাখাহার"
              },
              {
                "name": "কাটাবাড়ী",
                "nameEn": "কাটাবাড়ী"
              },
              {
                "name": "রাজাহার",
                "nameEn": "রাজাহার"
              },
              {
                "name": "সাপমারা",
                "nameEn": "সাপমারা"
              },
              {
                "name": "দরবস্ত",
                "nameEn": "দরবস্ত"
              },
              {
                "name": "তালুককানুপুর",
                "nameEn": "তালুককানুপুর"
              },
              {
                "name": "নাকাই",
                "nameEn": "নাকাই"
              },
              {
                "name": "হরিরামপুর",
                "nameEn": "হরিরামপুর"
              },
              {
                "name": "রাখালবুরুজ",
                "nameEn": "রাখালবুরুজ"
              },
              {
                "name": "ফুলবাড়ী",
                "nameEn": "ফুলবাড়ী"
              },
              {
                "name": "গুমানীগঞ্জ",
                "nameEn": "গুমানীগঞ্জ"
              },
              {
                "name": "কামারদহ",
                "nameEn": "কামারদহ"
              },
              {
                "name": "কোচাশহর",
                "nameEn": "কোচাশহর"
              },
              {
                "name": "শিবপুর",
                "nameEn": "শিবপুর"
              },
              {
                "name": "শালমারা",
                "nameEn": "শালমারা"
              }
            ]
          },
          {
            "name": "পলাশবাড়ী উপজেলা",
            "nameEn": "Palashbari",
            "unions": [
              {
                "name": "কিশোরগাড়ী",
                "nameEn": "কিশোরগাড়ী"
              },
              {
                "name": "হোসেনপুর",
                "nameEn": "হোসেনপুর"
              },
              {
                "name": "পলাশবাড়ী",
                "nameEn": "পলাশবাড়ী"
              },
              {
                "name": "বরিশাল",
                "nameEn": "বরিশাল"
              },
              {
                "name": "মহদীপুর",
                "nameEn": "মহদীপুর"
              },
              {
                "name": "বেতকাপা",
                "nameEn": "বেতকাপা"
              },
              {
                "name": "পবনাপুর",
                "nameEn": "পবনাপুর"
              },
              {
                "name": "মনোহরপুর",
                "nameEn": "মনোহরপুর"
              },
              {
                "name": "হরিনাথপুর",
                "nameEn": "হরিনাথপুর"
              }
            ]
          },
          {
            "name": "সাদুল্লাপুর উপজেলা",
            "nameEn": "Sadullapur",
            "unions": [
              {
                "name": "রসুলপুর",
                "nameEn": "রসুলপুর"
              },
              {
                "name": "নলডাঙ্গা",
                "nameEn": "নলডাঙ্গা"
              },
              {
                "name": "দামোদরপুর",
                "nameEn": "দামোদরপুর"
              },
              {
                "name": "জামালপুর",
                "nameEn": "জামালপুর"
              },
              {
                "name": "ফরিদপুর",
                "nameEn": "ফরিদপুর"
              },
              {
                "name": "ধাপেরহাট",
                "nameEn": "ধাপেরহাট"
              },
              {
                "name": "ইদিলপুর",
                "nameEn": "ইদিলপুর"
              },
              {
                "name": "ভাতগ্রাম",
                "nameEn": "ভাতগ্রাম"
              },
              {
                "name": "বনগ্রাম",
                "nameEn": "বনগ্রাম"
              },
              {
                "name": "কামারপাড়া",
                "nameEn": "কামারপাড়া"
              },
              {
                "name": "খোর্দ্দকোমরপুর",
                "nameEn": "খোর্দ্দকোমরপুর"
              }
            ]
          },
          {
            "name": "সাঘাটা উপজেলা",
            "nameEn": "Saghata",
            "unions": [
              {
                "name": "পদুমশহর",
                "nameEn": "পদুমশহর"
              },
              {
                "name": "ভরতখালী",
                "nameEn": "ভরতখালী"
              },
              {
                "name": "সাঘাটা",
                "nameEn": "সাঘাটা"
              },
              {
                "name": "মুক্তিনগর",
                "nameEn": "মুক্তিনগর"
              },
              {
                "name": "কচুয়া",
                "nameEn": "কচুয়া"
              },
              {
                "name": "ঘুড়িদহ",
                "nameEn": "ঘুড়িদহ"
              },
              {
                "name": "হলদিয়া",
                "nameEn": "হলদিয়া"
              },
              {
                "name": "জুমারবাড়ী",
                "nameEn": "জুমারবাড়ী"
              },
              {
                "name": "কামালেরপাড়া",
                "nameEn": "কামালেরপাড়া"
              },
              {
                "name": "বোনারপাড়া",
                "nameEn": "বোনারপাড়া"
              }
            ]
          },
          {
            "name": "সুন্দরগঞ্জ উপজেলা",
            "nameEn": "Sundarganj",
            "unions": [
              {
                "name": "বামনডাঙ্গা",
                "nameEn": "বামনডাঙ্গা"
              },
              {
                "name": "সোনারায়",
                "nameEn": "সোনারায়"
              },
              {
                "name": "তারাপুর",
                "nameEn": "তারাপুর"
              },
              {
                "name": "বেলকা",
                "nameEn": "বেলকা"
              },
              {
                "name": "দহবন্দ",
                "nameEn": "দহবন্দ"
              },
              {
                "name": "সর্বানন্দ",
                "nameEn": "সর্বানন্দ"
              },
              {
                "name": "রামজীবন",
                "nameEn": "রামজীবন"
              },
              {
                "name": "ধোপাডাঙ্গা",
                "nameEn": "ধোপাডাঙ্গা"
              },
              {
                "name": "ছাপরহাটী",
                "nameEn": "ছাপরহাটী"
              },
              {
                "name": "শান্তিরাম",
                "nameEn": "শান্তিরাম"
              },
              {
                "name": "কঞ্চিবাড়ী",
                "nameEn": "কঞ্চিবাড়ী"
              },
              {
                "name": "শ্রীপুর",
                "nameEn": "শ্রীপুর"
              },
              {
                "name": "চন্ডিপুর",
                "nameEn": "চন্ডিপুর"
              },
              {
                "name": "কাপাসিয়া",
                "nameEn": "কাপাসিয়া"
              },
              {
                "name": "হরিপুর",
                "nameEn": "হরিপুর"
              }
            ]
          }
        ]
      },
      {
        "name": "কুড়িগ্রাম",
        "nameEn": "Kurigram",
        "upazilas": [
          {
            "name": "কুড়িগ্রাম সদর উপজেলা",
            "nameEn": "Bhurungamari",
            "unions": [
              {
                "name": "কাঁঠালবাড়ী",
                "nameEn": "কাঁঠালবাড়ী"
              },
              {
                "name": "ঘোগাদহ",
                "nameEn": "ঘোগাদহ"
              },
              {
                "name": "পাঁচগাছি",
                "nameEn": "পাঁচগাছি"
              },
              {
                "name": "বেলগাছা",
                "nameEn": "বেলগাছা"
              },
              {
                "name": "ভোগডাঙ্গা",
                "nameEn": "ভোগডাঙ্গা"
              },
              {
                "name": "মোগলবাছা",
                "nameEn": "মোগলবাছা"
              },
              {
                "name": "যাত্রাপুর",
                "nameEn": "যাত্রাপুর"
              },
              {
                "name": "হোলাখানা",
                "nameEn": "হোলাখানা"
              }
            ]
          },
          {
            "name": "উলিপুর উপজেলা",
            "nameEn": "Chilmari",
            "unions": [
              {
                "name": "দূর্গাপুর ইউনিয়ন",
                "nameEn": "দূর্গাপুর"
              },
              {
                "name": "বেগমগঞ্জ ইউনিয়ন",
                "nameEn": "বেগমগঞ্জ"
              },
              {
                "name": "বুড়াবুড়ি ইউনিয়ন",
                "nameEn": "বুড়াবুড়ি"
              },
              {
                "name": "বজরা ইউনিয়ন",
                "nameEn": "বজরা"
              },
              {
                "name": "দলদলিয়া ইউনিয়ন",
                "nameEn": "দলদলিয়া"
              },
              {
                "name": "ধামশ্রেণী ইউনিয়ন",
                "nameEn": "ধামশ্রেণী"
              },
              {
                "name": "ধড়নিবাড়ি ইউনিয়ন",
                "nameEn": "ধড়নিবাড়ি"
              },
              {
                "name": "গুনাইগাছ ইউনিয়ন",
                "nameEn": "গুনাইগাছ"
              },
              {
                "name": "হাতিয়া ইউনিয়ন",
                "nameEn": "হাতিয়া"
              },
              {
                "name": "পান্ডুল ইউনিয়ন",
                "nameEn": "পান্ডুল"
              },
              {
                "name": "সাহেবের আলগা ইউনিয়ন",
                "nameEn": "সাহেবের আলগা"
              },
              {
                "name": "তবকপুর ইউনিয়ন",
                "nameEn": "তবকপুর"
              },
              {
                "name": "থেতরাই ইউনিয়ন",
                "nameEn": "থেতরাই"
              }
            ]
          },
          {
            "name": "চর রাজিবপুর",
            "nameEn": "Fulbari",
            "unions": [
              {
                "name": "রাজিবপুর ইউনিয়ন",
                "nameEn": "রাজিবপুর"
              },
              {
                "name": "কোদালকাটি ইউনিয়ন",
                "nameEn": "কোদালকাটি"
              },
              {
                "name": "মোহনগঞ্জ ইউনিয়ন",
                "nameEn": "মোহনগঞ্জ"
              }
            ]
          },
          {
            "name": "চিলমারী উপজেলা",
            "nameEn": "Kurigram Sadar",
            "unions": [
              {
                "name": "অষ্টমির চর ইউনিয়ন",
                "nameEn": "অষ্টমির চর"
              },
              {
                "name": "নয়ার হাট ইউনিয়ন",
                "nameEn": "নয়ার হাট"
              },
              {
                "name": "চিলমারী ইউনিয়ন",
                "nameEn": "চিলমারী"
              },
              {
                "name": "রমনা ইউনিয়ন",
                "nameEn": "রমনা"
              },
              {
                "name": "থানাহাট ইউনিয়ন",
                "nameEn": "থানাহাট"
              },
              {
                "name": "রাণীগঞ্জ ইউনিয়ন",
                "nameEn": "রাণীগঞ্জ"
              }
            ]
          },
          {
            "name": "নাগেশ্বরী উপজেলা",
            "nameEn": "Nageswari",
            "unions": [
              {
                "name": "রামখানা ইউনিয়ন",
                "nameEn": "রামখানা"
              },
              {
                "name": "রায়গঞ্জ ইউনিয়ন",
                "nameEn": "রায়গঞ্জ"
              },
              {
                "name": "সন্তোষপুর ইউনিয়ন",
                "nameEn": "সন্তোষপুর"
              },
              {
                "name": "বামনডাঙ্গা ইউনিয়ন",
                "nameEn": "বামনডাঙ্গা"
              },
              {
                "name": "নেওয়াশী ইউনিয়ন",
                "nameEn": "নেওয়াশী"
              },
              {
                "name": "হাসনাবাদ ইউনিয়ন",
                "nameEn": "হাসনাবাদ"
              },
              {
                "name": "ভিতরবন্দ ইউনিয়ন",
                "nameEn": "ভিতরবন্দ"
              },
              {
                "name": "নুনখাওয়া ইউনিয়ন",
                "nameEn": "নুনখাওয়া"
              },
              {
                "name": "কালীগঞ্জ ইউনিয়ন",
                "nameEn": "কালীগঞ্জ"
              },
              {
                "name": "বেরুবাড়ী ইউনিয়ন",
                "nameEn": "বেরুবাড়ী"
              },
              {
                "name": "কেদার ইউনিয়ন",
                "nameEn": "কেদার"
              },
              {
                "name": "কচাকাটা ইউনিয়ন",
                "nameEn": "কচাকাটা"
              },
              {
                "name": "বল্লভেরখাস ইউনিয়ন",
                "nameEn": "বল্লভেরখাস"
              },
              {
                "name": "নারায়ণপুর ইউনিয়ন",
                "nameEn": "নারায়ণপুর"
              }
            ]
          },
          {
            "name": "ফুলবাড়ী উপজেলা",
            "nameEn": "Rajarhat",
            "unions": [
              {
                "name": "কাশীপুর ইউনিয়ন",
                "nameEn": "কাশীপুর"
              },
              {
                "name": "নাওডাঙ্গা ইউনিয়ন",
                "nameEn": "নাওডাঙ্গা"
              },
              {
                "name": "ফুলবাড়ী ইউনিয়ন",
                "nameEn": "ফুলবাড়ী"
              },
              {
                "name": "বড়ভিটা ইউনিয়ন",
                "nameEn": "বড়ভিটা"
              },
              {
                "name": "ভাঙ্গামোড় ইউনিয়ন",
                "nameEn": "ভাঙ্গামোড়"
              },
              {
                "name": "শিমুলবাড়ী ইউনিয়ন",
                "nameEn": "শিমুলবাড়ী"
              }
            ]
          },
          {
            "name": "ভুরুঙ্গামারী উপজেলা",
            "nameEn": "Rajibpur",
            "unions": [
              {
                "name": "পাথরডুবী ইউনিয়ন",
                "nameEn": "পাথরডুবী"
              },
              {
                "name": "শিলখুড়ি ইউনিয়ন",
                "nameEn": "শিলখুড়ি"
              },
              {
                "name": "তিলাই ইউনিয়ন",
                "nameEn": "তিলাই"
              },
              {
                "name": "পাইকেরছড়া ইউনিয়ন",
                "nameEn": "পাইকেরছড়া"
              },
              {
                "name": "ভূরুঙ্গামারী ইউনিয়ন",
                "nameEn": "ভূরুঙ্গামারী"
              },
              {
                "name": "জয়মনিরহাট ইউনিয়ন",
                "nameEn": "জয়মনিরহাট"
              },
              {
                "name": "আন্ধারীঝাড় ইউনিয়ন",
                "nameEn": "আন্ধারীঝাড়"
              },
              {
                "name": "বলদিয়া ইউনিয়ন",
                "nameEn": "বলদিয়া"
              },
              {
                "name": "চরভূরুঙ্গামারী ইউনিয়ন",
                "nameEn": "চরভূরুঙ্গামারী"
              },
              {
                "name": "বঙ্গসোনাহাট ইউনিয়ন",
                "nameEn": "বঙ্গসোনাহাট"
              }
            ]
          },
          {
            "name": "রাজারহাট উপজেলা",
            "nameEn": "Rowmari",
            "unions": [
              {
                "name": "ঘড়িয়ালডাঙ্গা ইউনিয়ন",
                "nameEn": "ঘড়িয়ালডাঙ্গা"
              },
              {
                "name": "ছিনাই ইউনিয়ন",
                "nameEn": "ছিনাই"
              },
              {
                "name": "রাজারহাট ইউনিয়ন",
                "nameEn": "রাজারহাট"
              },
              {
                "name": "চাকিরপশার ইউনিয়ন",
                "nameEn": "চাকিরপশার"
              },
              {
                "name": "বিদ্যানন্দ ইউনিয়ন",
                "nameEn": "বিদ্যানন্দ"
              },
              {
                "name": "উমরমজিদ ইউনিয়ন",
                "nameEn": "উমরমজিদ"
              },
              {
                "name": "নজিমখাঁন ইউনিয়ন",
                "nameEn": "নজিমখাঁন"
              }
            ]
          },
          {
            "name": "রৌমারী উপজেলা",
            "nameEn": "Ulipur",
            "unions": [
              {
                "name": "রৌমারী ইউনিয়ন",
                "nameEn": "রৌমারী"
              },
              {
                "name": "যাদুর চর ইউনিয়ন",
                "nameEn": "যাদুর চর"
              },
              {
                "name": "শৌলমারী ইউনিয়ন",
                "nameEn": "শৌলমারী"
              },
              {
                "name": "দাতভাঙ্গা ইউনিয়ন",
                "nameEn": "দাতভাঙ্গা"
              },
              {
                "name": "বন্দবেড় ইউনিয়ন",
                "nameEn": "বন্দবেড়"
              },
              {
                "name": "চর শৌলমারী ইউনিয়ন",
                "nameEn": "চর শৌলমারী"
              }
            ]
          }
        ]
      },
      {
        "name": "লালমনিরহাট",
        "nameEn": "Lalmonirhat",
        "upazilas": [
          {
            "name": "লালমনিরহাট সদর উপজেলা",
            "nameEn": "Aditmari",
            "unions": [
              {
                "name": "মোগলহাট",
                "nameEn": "মোগলহাট"
              },
              {
                "name": "কুলাঘাট",
                "nameEn": "কুলাঘাট"
              },
              {
                "name": "মহেন্দ্রনগর",
                "nameEn": "মহেন্দ্রনগর"
              },
              {
                "name": "হারাটী",
                "nameEn": "হারাটী"
              },
              {
                "name": "খুনিয়াগাছ",
                "nameEn": "খুনিয়াগাছ"
              },
              {
                "name": "রাজপুর",
                "nameEn": "রাজপুর"
              },
              {
                "name": "গোকুন্ডা",
                "nameEn": "গোকুন্ডা"
              },
              {
                "name": "পঞ্চগ্রাম",
                "nameEn": "পঞ্চগ্রাম"
              },
              {
                "name": "বড়বাড়ি",
                "nameEn": "বড়বাড়ি"
              }
            ]
          },
          {
            "name": "আদিতমারী উপজেলা",
            "nameEn": "Hatibandha",
            "unions": [
              {
                "name": "কমলাবাড়ী",
                "nameEn": "কমলাবাড়ী"
              },
              {
                "name": "দুর্গাপুর",
                "nameEn": "দুর্গাপুর"
              },
              {
                "name": "পলাশী",
                "nameEn": "পলাশী"
              },
              {
                "name": "ভাদাই",
                "nameEn": "ভাদাই"
              },
              {
                "name": "ভেলাবাড়ী",
                "nameEn": "ভেলাবাড়ী"
              },
              {
                "name": "মহিষখোচা",
                "nameEn": "মহিষখোচা"
              },
              {
                "name": "সাপটিবাড়ী",
                "nameEn": "সাপটিবাড়ী"
              },
              {
                "name": "শরপুকুর",
                "nameEn": "শরপুকুর"
              }
            ]
          },
          {
            "name": "কালীগঞ্জ উপজেলা",
            "nameEn": "Kaliganj",
            "unions": [
              {
                "name": "কাকিনা",
                "nameEn": "কাকিনা"
              },
              {
                "name": "গোড়ল",
                "nameEn": "গোড়ল"
              },
              {
                "name": "চন্দ্রপুর",
                "nameEn": "চন্দ্রপুর"
              },
              {
                "name": "চলবলা",
                "nameEn": "চলবলা"
              },
              {
                "name": "তুষভান্ডার",
                "nameEn": "তুষভান্ডার"
              },
              {
                "name": "দলগ্রাম",
                "nameEn": "দলগ্রাম"
              },
              {
                "name": "ভোটমারী",
                "nameEn": "ভোটমারী"
              },
              {
                "name": "মদাতি",
                "nameEn": "মদাতি"
              }
            ]
          },
          {
            "name": "পাটগ্রাম উপজেলা",
            "nameEn": "Lalmonirhat Sadar",
            "unions": [
              {
                "name": "শ্রীরামপুর",
                "nameEn": "শ্রীরামপুর"
              },
              {
                "name": "জগতবেড়",
                "nameEn": "জগতবেড়"
              },
              {
                "name": "পাটগ্রাম",
                "nameEn": "পাটগ্রাম"
              },
              {
                "name": "বাউরা",
                "nameEn": "বাউরা"
              },
              {
                "name": "কুচলীবাড়ী",
                "nameEn": "কুচলীবাড়ী"
              },
              {
                "name": "জোংড়া",
                "nameEn": "জোংড়া"
              },
              {
                "name": "দহগ্রাম",
                "nameEn": "দহগ্রাম"
              },
              {
                "name": "বুড়িমারী",
                "nameEn": "বুড়িমারী"
              }
            ]
          },
          {
            "name": "হাতীবান্ধা উপজেলা",
            "nameEn": "Patgram",
            "unions": [
              {
                "name": "বড়খাতা",
                "nameEn": "বড়খাতা"
              },
              {
                "name": "গড্ডিমারী",
                "nameEn": "গড্ডিমারী"
              },
              {
                "name": "সিংগীমারী",
                "nameEn": "সিংগীমারী"
              },
              {
                "name": "টংভাঙ্গা",
                "nameEn": "টংভাঙ্গা"
              },
              {
                "name": "সিন্দুর্ণা",
                "nameEn": "সিন্দুর্ণা"
              },
              {
                "name": "পাটিকাপাড়া",
                "nameEn": "পাটিকাপাড়া"
              },
              {
                "name": "ডাউয়াবাড়ী",
                "nameEn": "ডাউয়াবাড়ী"
              },
              {
                "name": "নওদাবাস",
                "nameEn": "নওদাবাস"
              },
              {
                "name": "গোতামারী",
                "nameEn": "গোতামারী"
              },
              {
                "name": "ভেলাগুড়ি",
                "nameEn": "ভেলাগুড়ি"
              },
              {
                "name": "সানিয়াজানও",
                "nameEn": "সানিয়াজানও"
              },
              {
                "name": "ফকিরপাড়া",
                "nameEn": "ফকিরপাড়া"
              }
            ]
          }
        ]
      },
      {
        "name": "নীলফামারী",
        "nameEn": "Nilphamari",
        "upazilas": [
          {
            "name": "নীলফামারী সদর উপজেলা",
            "nameEn": "Dimla",
            "unions": [
              {
                "name": "চওড়া বড়গাছা",
                "nameEn": "চওড়া বড়গাছা"
              },
              {
                "name": "গোড়গাম",
                "nameEn": "গোড়গাম"
              },
              {
                "name": "খোকশাবাড়ী",
                "nameEn": "খোকশাবাড়ী"
              },
              {
                "name": "পলাশবাড়ী",
                "nameEn": "পলাশবাড়ী"
              },
              {
                "name": "রামনগর",
                "nameEn": "রামনগর"
              },
              {
                "name": "কচুকাটা",
                "nameEn": "কচুকাটা"
              },
              {
                "name": "পঞ্চপুকুর",
                "nameEn": "পঞ্চপুকুর"
              },
              {
                "name": "ইটাখোলা",
                "nameEn": "ইটাখোলা"
              },
              {
                "name": "কুন্দুপুকুর",
                "nameEn": "কুন্দুপুকুর"
              },
              {
                "name": "সোনারায়",
                "nameEn": "সোনারায়"
              },
              {
                "name": "সংগলশী",
                "nameEn": "সংগলশী"
              },
              {
                "name": "চড়াইখোলা",
                "nameEn": "চড়াইখোলা"
              },
              {
                "name": "চাপড়া সরমজানী",
                "nameEn": "চাপড়া সরমজানী"
              },
              {
                "name": "টুপামারী",
                "nameEn": "টুপামারী"
              },
              {
                "name": "লক্ষীচাপ",
                "nameEn": "লক্ষীচাপ"
              }
            ]
          },
          {
            "name": "ডোমার উপজেলা",
            "nameEn": "Domar",
            "unions": [
              {
                "name": "ডোমার সদর",
                "nameEn": "ডোমার সদর"
              },
              {
                "name": "বোড়াগাড়ী",
                "nameEn": "বোড়াগাড়ী"
              },
              {
                "name": "জোড়াবাড়ী",
                "nameEn": "জোড়াবাড়ী"
              },
              {
                "name": "বামুনিয়া",
                "nameEn": "বামুনিয়া"
              },
              {
                "name": "পাংগা মটকপুর",
                "nameEn": "পাংগা মটকপুর"
              },
              {
                "name": "সোনারায়",
                "nameEn": "সোনারায়"
              },
              {
                "name": "হরিণচড়া",
                "nameEn": "হরিণচড়া"
              },
              {
                "name": "ভোগডাবুড়ী",
                "nameEn": "ভোগডাবুড়ী"
              },
              {
                "name": "কেতকীবাড়ী",
                "nameEn": "কেতকীবাড়ী"
              },
              {
                "name": "গোমনাতি",
                "nameEn": "গোমনাতি"
              }
            ]
          },
          {
            "name": "ডিমলা উপজেলা",
            "nameEn": "Jaldhaka",
            "unions": [
              {
                "name": "পশ্চিম ছাতনাই",
                "nameEn": "পশ্চিম ছাতনাই"
              },
              {
                "name": "বালাপাড়া",
                "nameEn": "বালাপাড়া"
              },
              {
                "name": "ডিমলা",
                "nameEn": "ডিমলা"
              },
              {
                "name": "খগাখড়িবাড়ী",
                "nameEn": "খগাখড়িবাড়ী"
              },
              {
                "name": "গয়াবাড়ী",
                "nameEn": "গয়াবাড়ী"
              },
              {
                "name": "নাউতারা",
                "nameEn": "নাউতারা"
              },
              {
                "name": "খালিশা চাপানী",
                "nameEn": "খালিশা চাপানী"
              },
              {
                "name": "ঝুনাগাছ চাপানী",
                "nameEn": "ঝুনাগাছ চাপানী"
              },
              {
                "name": "টেপাখড়িবাড়ী",
                "nameEn": "টেপাখড়িবাড়ী"
              },
              {
                "name": "পূর্ব ছাতনাই",
                "nameEn": "পূর্ব ছাতনাই"
              }
            ]
          },
          {
            "name": "জলঢাকা উপজেলা",
            "nameEn": "Kishoreganj",
            "unions": [
              {
                "name": "গোলমুন্ডা",
                "nameEn": "গোলমুন্ডা"
              },
              {
                "name": "মীরগঞ্জ",
                "nameEn": "মীরগঞ্জ"
              },
              {
                "name": "ডাউয়াবাড়ী",
                "nameEn": "ডাউয়াবাড়ী"
              },
              {
                "name": "বালাগ্রাম",
                "nameEn": "বালাগ্রাম"
              },
              {
                "name": "গোলনা",
                "nameEn": "গোলনা"
              },
              {
                "name": "ধর্মপাল",
                "nameEn": "ধর্মপাল"
              },
              {
                "name": "শিমুলবাড়ী",
                "nameEn": "শিমুলবাড়ী"
              },
              {
                "name": "কাঁঠালী",
                "nameEn": "কাঁঠালী"
              },
              {
                "name": "খুটামারা",
                "nameEn": "খুটামারা"
              },
              {
                "name": "শৌলমারী",
                "nameEn": "শৌলমারী"
              },
              {
                "name": "কৈমারী",
                "nameEn": "কৈমারী"
              }
            ]
          },
          {
            "name": "কিশোরগঞ্জ উপজেলা",
            "nameEn": "Nilphamari Sadar",
            "unions": [
              {
                "name": "কিশোরগঞ্জ",
                "nameEn": "কিশোরগঞ্জ"
              },
              {
                "name": "বড়ভিটা",
                "nameEn": "বড়ভিটা"
              },
              {
                "name": "বাহাগিলি",
                "nameEn": "বাহাগিলি"
              },
              {
                "name": "পুঁটিমারী",
                "nameEn": "পুঁটিমারী"
              },
              {
                "name": "নিতাই",
                "nameEn": "নিতাই"
              },
              {
                "name": "চাঁদখানা",
                "nameEn": "চাঁদখানা"
              },
              {
                "name": "রনচন্ডী",
                "nameEn": "রনচন্ডী"
              },
              {
                "name": "গরগ্রাম",
                "nameEn": "গরগ্রাম"
              },
              {
                "name": "মাগুরা",
                "nameEn": "মাগুরা"
              }
            ]
          },
          {
            "name": "সৈয়দপুর উপজেলা",
            "nameEn": "Sayedpur",
            "unions": [
              {
                "name": "কামারপুকুর",
                "nameEn": "কামারপুকুর"
              },
              {
                "name": "কাশিরাম বেলপুকুর",
                "nameEn": "কাশিরাম বেলপুকুর"
              },
              {
                "name": "বাঙ্গালীপুর",
                "nameEn": "বাঙ্গালীপুর"
              },
              {
                "name": "বোতলাগাড়ী",
                "nameEn": "বোতলাগাড়ী"
              },
              {
                "name": "খাতামধুপুর",
                "nameEn": "খাতামধুপুর"
              }
            ]
          }
        ]
      },
      {
        "name": "পঞ্চগড়",
        "nameEn": "Panchagarh",
        "upazilas": [
          {
            "name": "পঞ্চগড় সদর উপজেলা",
            "nameEn": "Atwari",
            "unions": [
              {
                "name": "অমরখানা",
                "nameEn": "অমরখানা"
              },
              {
                "name": "হাফিজাবাদ",
                "nameEn": "হাফিজাবাদ"
              },
              {
                "name": "পঞ্চগড় সদর",
                "nameEn": "পঞ্চগড় সদর"
              },
              {
                "name": "কামাত কাজলদিঘী",
                "nameEn": "কামাত কাজলদিঘী"
              },
              {
                "name": "চাকলাহাট",
                "nameEn": "চাকলাহাট"
              },
              {
                "name": "সাতমেরা",
                "nameEn": "সাতমেরা"
              },
              {
                "name": "হাড়িভাসা",
                "nameEn": "হাড়িভাসা"
              },
              {
                "name": "ধাক্কামারা",
                "nameEn": "ধাক্কামারা"
              },
              {
                "name": "মাগুরা",
                "nameEn": "মাগুরা"
              },
              {
                "name": "গরিনাবাড়ী",
                "nameEn": "গরিনাবাড়ী"
              }
            ]
          },
          {
            "name": "দেবীগঞ্জ উপজেলা",
            "nameEn": "Boda",
            "unions": [
              {
                "name": "চিলাহাটি",
                "nameEn": "চিলাহাটি"
              },
              {
                "name": "শালডাঙ্গা",
                "nameEn": "শালডাঙ্গা"
              },
              {
                "name": "দেবীগঞ্জ",
                "nameEn": "দেবীগঞ্জ"
              },
              {
                "name": "পামুলী",
                "nameEn": "পামুলী"
              },
              {
                "name": "সুন্দরদিঘী",
                "nameEn": "সুন্দরদিঘী"
              },
              {
                "name": "সোনাহার",
                "nameEn": "সোনাহার"
              },
              {
                "name": "টেপ্রীগঞ্জ",
                "nameEn": "টেপ্রীগঞ্জ"
              },
              {
                "name": "দন্ডপাল",
                "nameEn": "দন্ডপাল"
              },
              {
                "name": "দেবীডুবা",
                "nameEn": "দেবীডুবা"
              },
              {
                "name": "চেংঠী হাজরাডাঙ্গা",
                "nameEn": "চেংঠী হাজরাডাঙ্গা"
              }
            ]
          },
          {
            "name": "তেতুলিয়া উপজেলা",
            "nameEn": "Debiganj",
            "unions": [
              {
                "name": "বাংলাবান্ধা",
                "nameEn": "বাংলাবান্ধা"
              },
              {
                "name": "তিরনইহাট",
                "nameEn": "তিরনইহাট"
              },
              {
                "name": "তেতুলিয়া",
                "nameEn": "তেতুলিয়া"
              },
              {
                "name": "শালবাহান",
                "nameEn": "শালবাহান"
              },
              {
                "name": "বুড়াবুড়ি",
                "nameEn": "বুড়াবুড়ি"
              },
              {
                "name": "ভজনপুর",
                "nameEn": "ভজনপুর"
              },
              {
                "name": "দেবনগর",
                "nameEn": "দেবনগর"
              }
            ]
          },
          {
            "name": "আটোয়ারী উপজেলা",
            "nameEn": "Panchagarh Sadar",
            "unions": [
              {
                "name": "মিরজাপুর",
                "nameEn": "মিরজাপুর"
              },
              {
                "name": "তোড়িয়া",
                "nameEn": "তোড়িয়া"
              },
              {
                "name": "আলোয়াখোয়া",
                "nameEn": "আলোয়াখোয়া"
              },
              {
                "name": "রাধানগর",
                "nameEn": "রাধানগর"
              },
              {
                "name": "বলরামপুর",
                "nameEn": "বলরামপুর"
              },
              {
                "name": "ধামোর",
                "nameEn": "ধামোর"
              }
            ]
          },
          {
            "name": "বোদা উপজেলা",
            "nameEn": "Tetulia",
            "unions": [
              {
                "name": "ঝলইশালশিরি",
                "nameEn": "ঝলইশালশিরি"
              },
              {
                "name": "ময়দানদিঘি",
                "nameEn": "ময়দানদিঘি"
              },
              {
                "name": "বেংহারি",
                "nameEn": "বেংহারি"
              },
              {
                "name": "কাজলদিঘী কালিয়াগঞ্জ",
                "nameEn": "কাজলদিঘী কালিয়াগঞ্জ"
              },
              {
                "name": "বড়শশী",
                "nameEn": "বড়শশী"
              },
              {
                "name": "মাড়েয়া",
                "nameEn": "মাড়েয়া"
              },
              {
                "name": "চন্দনবাড়ী",
                "nameEn": "চন্দনবাড়ী"
              },
              {
                "name": "বোদা",
                "nameEn": "বোদা"
              },
              {
                "name": "সাকোয়া",
                "nameEn": "সাকোয়া"
              },
              {
                "name": "পাঁচপীর",
                "nameEn": "পাঁচপীর"
              }
            ]
          }
        ]
      },
      {
        "name": "রংপুর",
        "nameEn": "Rangpur",
        "upazilas": [
          {
            "name": "রংপুর সদর উপজেলা",
            "nameEn": "Badarganj",
            "unions": [
              {
                "name": "মমিনপুর",
                "nameEn": "মমিনপুর"
              },
              {
                "name": "হরিদেবপুর",
                "nameEn": "হরিদেবপুর"
              },
              {
                "name": "চন্দনপাট",
                "nameEn": "চন্দনপাট"
              },
              {
                "name": "সদ্যপুস্করনী",
                "nameEn": "সদ্যপুস্করনী"
              },
              {
                "name": "খলেয়া",
                "nameEn": "খলেয়া"
              }
            ]
          },
          {
            "name": "বদরগঞ্জ উপজেলা",
            "nameEn": "Gangachara",
            "unions": [
              {
                "name": "কুতুবপুর",
                "nameEn": "কুতুবপুর"
              },
              {
                "name": "গোপালপুর",
                "nameEn": "গোপালপুর"
              },
              {
                "name": "গোপীনাথপুর",
                "nameEn": "গোপীনাথপুর"
              },
              {
                "name": "দামোদরপুর",
                "nameEn": "দামোদরপুর"
              },
              {
                "name": "বদরগঞ্জ",
                "nameEn": "বদরগঞ্জ"
              },
              {
                "name": "বিষ্ণুপুর",
                "nameEn": "বিষ্ণুপুর"
              },
              {
                "name": "মধুপুর",
                "nameEn": "মধুপুর"
              },
              {
                "name": "রাধানগর",
                "nameEn": "রাধানগর"
              },
              {
                "name": "রামনাথপুর",
                "nameEn": "রামনাথপুর"
              },
              {
                "name": "লোহানীপাড়া",
                "nameEn": "লোহানীপাড়া"
              }
            ]
          },
          {
            "name": "গংগাচড়া উপজেলা",
            "nameEn": "Kaunia",
            "unions": [
              {
                "name": "বেতগাড়ী",
                "nameEn": "বেতগাড়ী"
              },
              {
                "name": "খলেয়া",
                "nameEn": "খলেয়া"
              },
              {
                "name": "বড়বিল",
                "nameEn": "বড়বিল"
              },
              {
                "name": "কোলকোন্দ",
                "nameEn": "কোলকোন্দ"
              },
              {
                "name": "লক্ষীটারী",
                "nameEn": "লক্ষীটারী"
              },
              {
                "name": "গংগাচড়া",
                "nameEn": "গংগাচড়া"
              },
              {
                "name": "গজঘন্টা",
                "nameEn": "গজঘন্টা"
              },
              {
                "name": "মর্নেয়া",
                "nameEn": "মর্নেয়া"
              },
              {
                "name": "আলমবিদিতর",
                "nameEn": "আলমবিদিতর"
              },
              {
                "name": "নোহালী",
                "nameEn": "নোহালী"
              }
            ]
          },
          {
            "name": "কাউনিয়া উপজেলা",
            "nameEn": "Mithapukur",
            "unions": [
              {
                "name": "সারাই",
                "nameEn": "সারাই"
              },
              {
                "name": "হারাগাছ",
                "nameEn": "হারাগাছ"
              },
              {
                "name": "কুর্শা",
                "nameEn": "কুর্শা"
              },
              {
                "name": "শহীদবাগ",
                "nameEn": "শহীদবাগ"
              },
              {
                "name": "বালাপারা",
                "nameEn": "বালাপারা"
              },
              {
                "name": "টেপামধুপুর",
                "nameEn": "টেপামধুপুর"
              }
            ]
          },
          {
            "name": "মিঠাপুকুর উপজেলা",
            "nameEn": "Pirgacha",
            "unions": [
              {
                "name": "ইমাদপুর",
                "nameEn": "ইমাদপুর"
              },
              {
                "name": "কাফ্রিখাল",
                "nameEn": "কাফ্রিখাল"
              },
              {
                "name": "খোড়াগাছ",
                "nameEn": "খোড়াগাছ"
              },
              {
                "name": "গোপালপুর",
                "nameEn": "গোপালপুর"
              },
              {
                "name": "চেংমারী",
                "nameEn": "চেংমারী"
              },
              {
                "name": "দুর্গাপুর",
                "nameEn": "দুর্গাপুর"
              },
              {
                "name": "পায়রাবন্দ",
                "nameEn": "পায়রাবন্দ"
              },
              {
                "name": "বড় হযরতপুর",
                "nameEn": "বড় হযরতপুর"
              },
              {
                "name": "বড়বালা",
                "nameEn": "বড়বালা"
              },
              {
                "name": "বালারহাট",
                "nameEn": "বালারহাট"
              },
              {
                "name": "বালুয়া মাসিমপুর",
                "nameEn": "বালুয়া মাসিমপুর"
              },
              {
                "name": "ভাঙ্গনী",
                "nameEn": "ভাঙ্গনী"
              },
              {
                "name": "ময়েনপুর",
                "nameEn": "ময়েনপুর"
              },
              {
                "name": "মিলনপুর",
                "nameEn": "মিলনপুর"
              },
              {
                "name": "মিরজাপুর",
                "nameEn": "মিরজাপুর"
              },
              {
                "name": "রাণীপুকুর",
                "nameEn": "রাণীপুকুর"
              },
              {
                "name": "লতিফপুর",
                "nameEn": "লতিফপুর"
              }
            ]
          },
          {
            "name": "পীরগাছা উপজেলা",
            "nameEn": "Pirganj",
            "unions": [
              {
                "name": "কল্যাণী",
                "nameEn": "কল্যাণী"
              },
              {
                "name": "পারুল",
                "nameEn": "পারুল"
              },
              {
                "name": "ইটাকুমারী",
                "nameEn": "ইটাকুমারী"
              },
              {
                "name": "অন্নাদানগর",
                "nameEn": "অন্নাদানগর"
              },
              {
                "name": "ছাওলা",
                "nameEn": "ছাওলা"
              },
              {
                "name": "তাম্বুলপুর",
                "nameEn": "তাম্বুলপুর"
              },
              {
                "name": "পীরগাছা",
                "nameEn": "পীরগাছা"
              },
              {
                "name": "কৈকুড়ি",
                "nameEn": "কৈকুড়ি"
              },
              {
                "name": "কান্দি ইউনিয়ন",
                "nameEn": "কান্দি"
              }
            ]
          },
          {
            "name": "পীরগাছা উপজেলা",
            "nameEn": "Rangpur Sadar",
            "unions": [
              {
                "name": "চৈত্রকোল ইউনিয়ন",
                "nameEn": "চৈত্রকোল"
              },
              {
                "name": "ভেন্ডাবাড়ী ইউনিয়ন",
                "nameEn": "ভেন্ডাবাড়ী"
              },
              {
                "name": "বড়দরগাহ্ ইউনিয়ন",
                "nameEn": "বড়দরগাহ্"
              },
              {
                "name": "কুমেদপুর ইউনিয়ন",
                "nameEn": "কুমেদপুর"
              },
              {
                "name": "মদনখালী ইউনিয়ন",
                "nameEn": "মদনখালী"
              },
              {
                "name": "টুকুরিয়া ইউনিয়ন",
                "nameEn": "টুকুরিয়া"
              },
              {
                "name": "বড়আলমপুর ইউনিয়ন",
                "nameEn": "বড়আলমপুর"
              },
              {
                "name": "রায়পুর ইউনিয়ন",
                "nameEn": "রায়পুর"
              },
              {
                "name": "পীরগঞ্জ ইউনিয়ন",
                "nameEn": "পীরগঞ্জ"
              },
              {
                "name": "শানেরহাট ইউনিয়ন",
                "nameEn": "শানেরহাট"
              },
              {
                "name": "পাঁচগাছী ইউনিয়ন",
                "nameEn": "পাঁচগাছী"
              },
              {
                "name": "মিঠিপুর ইউনিয়ন",
                "nameEn": "মিঠিপুর"
              },
              {
                "name": "রামনাথপুর ইউনিয়ন",
                "nameEn": "রামনাথপুর"
              },
              {
                "name": "চতরা ইউনিয়ন",
                "nameEn": "চতরা"
              },
              {
                "name": "কাবিলপুর ইউনিয়ন",
                "nameEn": "কাবিলপুর"
              }
            ]
          },
          {
            "name": "তারাগঞ্জ উপজেলা",
            "nameEn": "Taraganj",
            "unions": [
              {
                "name": "আলমপুর",
                "nameEn": "আলমপুর"
              },
              {
                "name": "কুর্শা",
                "nameEn": "কুর্শা"
              },
              {
                "name": "ইকরচালী",
                "nameEn": "ইকরচালী"
              },
              {
                "name": "হাড়িয়ারকুঠি",
                "nameEn": "হাড়িয়ারকুঠি"
              },
              {
                "name": "সয়ার",
                "nameEn": "সয়ার"
              }
            ]
          }
        ]
      },
      {
        "name": "ঠাকুরগাঁও",
        "nameEn": "Thakurgaon",
        "upazilas": [
          {
            "name": "ঠাকুরগাঁও সদর উপজেলা",
            "nameEn": "Baliadangi",
            "unions": [
              {
                "name": "রুহিয়া",
                "nameEn": "রুহিয়া"
              },
              {
                "name": "আখানগর",
                "nameEn": "আখানগর"
              },
              {
                "name": "আকচ",
                "nameEn": "আকচ"
              },
              {
                "name": "বড়গাঁও",
                "nameEn": "বড়গাঁও"
              },
              {
                "name": "বালিয়া",
                "nameEn": "বালিয়া"
              },
              {
                "name": "আউলিয়াপুর",
                "nameEn": "আউলিয়াপুর"
              },
              {
                "name": "চিলারং",
                "nameEn": "চিলারং"
              },
              {
                "name": "রহিমানপুর",
                "nameEn": "রহিমানপুর"
              },
              {
                "name": "রায়পুর",
                "nameEn": "রায়পুর"
              },
              {
                "name": "জামালপুর",
                "nameEn": "জামালপুর"
              },
              {
                "name": "মোহম্মাদপুর",
                "nameEn": "মোহম্মাদপুর"
              },
              {
                "name": "সালন্দর",
                "nameEn": "সালন্দর"
              },
              {
                "name": "গড়েয়া",
                "nameEn": "গড়েয়া"
              },
              {
                "name": "রাজাগাঁও",
                "nameEn": "রাজাগাঁও"
              },
              {
                "name": "দেবীপুর",
                "nameEn": "দেবীপুর"
              },
              {
                "name": "নারগুন",
                "nameEn": "নারগুন"
              },
              {
                "name": "জগন্নাথপুর",
                "nameEn": "জগন্নাথপুর"
              },
              {
                "name": "শুখানপুকুরী",
                "nameEn": "শুখানপুকুরী"
              },
              {
                "name": "বেগুনবাড়ি",
                "nameEn": "বেগুনবাড়ি"
              },
              {
                "name": "রুহিয়া পশ্চিম",
                "nameEn": "রুহিয়া পশ্চিম"
              },
              {
                "name": "ঢোলার হাট",
                "nameEn": "ঢোলার হাট"
              }
            ]
          },
          {
            "name": "পীরগঞ্জ উপজেলা",
            "nameEn": "Haripur",
            "unions": [
              {
                "name": "ভোমরাদহ",
                "nameEn": "ভোমরাদহ"
              },
              {
                "name": "কোষারাণীগঞ্জ",
                "nameEn": "কোষারাণীগঞ্জ"
              },
              {
                "name": "খনগাঁও",
                "nameEn": "খনগাঁও"
              },
              {
                "name": "সৈয়দপুর",
                "nameEn": "সৈয়দপুর"
              },
              {
                "name": "পীরগঞ্জ",
                "nameEn": "পীরগঞ্জ"
              },
              {
                "name": "হাজীপুর",
                "nameEn": "হাজীপুর"
              },
              {
                "name": "দৌলতপুর",
                "nameEn": "দৌলতপুর"
              },
              {
                "name": "সেনগাাঁও",
                "nameEn": "সেনগাাঁও"
              },
              {
                "name": "জাবরহাট",
                "nameEn": "জাবরহাট"
              },
              {
                "name": "বৈরচুনা",
                "nameEn": "বৈরচুনা"
              }
            ]
          },
          {
            "name": "বালিয়াডাঙ্গী উপজেলা",
            "nameEn": "Pirganj",
            "unions": [
              {
                "name": "পাড়িয়া ইউনিয়ন",
                "nameEn": "পাড়িয়া ইউনিয়ন"
              },
              {
                "name": "চাড়োল ইউনিয়ন",
                "nameEn": "চাড়োল ইউনিয়ন"
              },
              {
                "name": "ধনতলা ইউনিয়ন",
                "nameEn": "ধনতলা ইউনিয়ন"
              },
              {
                "name": "বড় পলাশবাড়ী ইউনিয়ন",
                "nameEn": "বড় পলাশবাড়ী ইউনিয়ন"
              },
              {
                "name": "দুওসুও ইউনিয়ন",
                "nameEn": "দুওসুও ইউনিয়ন"
              },
              {
                "name": "ভানোর ইউনিয়ন",
                "nameEn": "ভানোর ইউনিয়ন"
              },
              {
                "name": "আমজানখোর ইউনিয়ন",
                "nameEn": "আমজানখোর ইউনিয়ন"
              },
              {
                "name": "বড়বাড়ি ইউনিয়ন",
                "nameEn": "বড়বাড়ি"
              }
            ]
          },
          {
            "name": "রানীশংকৈল উপজেলা",
            "nameEn": "Ranisankail",
            "unions": [
              {
                "name": "ধর্মগড় ইউনিয়ন",
                "nameEn": "ধর্মগড়"
              },
              {
                "name": "নেকমরদ ইউনিয়ন",
                "nameEn": "নেকমরদ"
              },
              {
                "name": "হোসেনগাঁও ইউনিয়ন",
                "nameEn": "হোসেনগাঁও"
              },
              {
                "name": "লেহেম্বা ইউনিয়ন",
                "nameEn": "লেহেম্বা"
              },
              {
                "name": "বাচোর ইউনিয়ন",
                "nameEn": "বাচোর"
              },
              {
                "name": "কাশিপুর ইউনিয়ন",
                "nameEn": "কাশিপুর"
              },
              {
                "name": "রাতোর ইউনিয়ন",
                "nameEn": "রাতোর"
              },
              {
                "name": "নন্দুয়ার ইউনিয়ন",
                "nameEn": "নন্দুয়ার"
              }
            ]
          },
          {
            "name": "হরিপুর উপজেলা",
            "nameEn": "Thakurgaon Sadar",
            "unions": [
              {
                "name": "গেদুড়া ইউনিয়ন",
                "nameEn": "গেদুড়া ইউনিয়ন"
              },
              {
                "name": "আমগাঁও ইউনিয়ন",
                "nameEn": "আমগাঁও ইউনিয়ন"
              },
              {
                "name": "বকুয়া ইউনিয়ন",
                "nameEn": "বকুয়া ইউনিয়ন"
              },
              {
                "name": "ডাঙ্গীপাড়া ইউনিয়ন",
                "nameEn": "ডাঙ্গীপাড়া ইউনিয়ন"
              },
              {
                "name": "হরিপুর ইউনিয়ন",
                "nameEn": "হরিপুর ইউনিয়ন"
              },
              {
                "name": "ভাতুরিয়া ইউনিয়ন",
                "nameEn": "ভাতুরিয়া ইউনিয়ন"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "name": "রাজশাহী",
    "nameEn": "Rajshahi",
    "districts": [
      {
        "name": "বগুড়া",
        "nameEn": "Bogura",
        "upazilas": [
          {
            "name": "বগুড়া সদর",
            "nameEn": "Adamdighi",
            "unions": []
          },
          {
            "name": "আদমদিঘী",
            "nameEn": "Bogura Sadar",
            "unions": []
          },
          {
            "name": "ধুনট",
            "nameEn": "Dhunot",
            "unions": []
          },
          {
            "name": "ধুপচাঁচিয়া",
            "nameEn": "Dhupchancia",
            "unions": []
          },
          {
            "name": "গাবতলী",
            "nameEn": "Gabtali",
            "unions": []
          },
          {
            "name": "কাহালু",
            "nameEn": "Kahaloo",
            "unions": []
          },
          {
            "name": "নন্দীগ্রাম",
            "nameEn": "Nandigram",
            "unions": []
          },
          {
            "name": "সারিয়াকান্দি",
            "nameEn": "Sariakandi",
            "unions": []
          },
          {
            "name": "শেরপুর",
            "nameEn": "Shajahanpur",
            "unions": []
          },
          {
            "name": "শিবগঞ্জ",
            "nameEn": "Sherpur",
            "unions": []
          },
          {
            "name": "সোনাতলা",
            "nameEn": "Shibganj",
            "unions": []
          },
          {
            "name": "শাজাহানপুর",
            "nameEn": "Sonatala",
            "unions": []
          }
        ]
      },
      {
        "name": "চাঁপাইনবাবগঞ্জ",
        "nameEn": "C. nawabganj",
        "upazilas": [
          {
            "name": "চাঁপাইনবাবগঞ্জ সদর",
            "nameEn": "Bholahat",
            "unions": []
          },
          {
            "name": "গোমস্তাপুর",
            "nameEn": "Gomostapur",
            "unions": []
          },
          {
            "name": "শিবগঞ্জ",
            "nameEn": "Nachol",
            "unions": []
          },
          {
            "name": "নাচোল",
            "nameEn": "Nawabganj Sadar",
            "unions": []
          },
          {
            "name": "ভোলাহাট",
            "nameEn": "Shibganj",
            "unions": []
          }
        ]
      },
      {
        "name": "জয়পুরহাট",
        "nameEn": "Joypurhat",
        "upazilas": [
          {
            "name": "জয়পুরহাট সদর",
            "nameEn": "Akkelpur",
            "unions": []
          },
          {
            "name": "পাঁচবিবি",
            "nameEn": "Joypurhat Sadar",
            "unions": []
          },
          {
            "name": "কালাই",
            "nameEn": "Kalai",
            "unions": []
          },
          {
            "name": "ক্ষেতলাল",
            "nameEn": "Khetlal",
            "unions": []
          },
          {
            "name": "আক্কেলপুর",
            "nameEn": "Panchbibi",
            "unions": []
          }
        ]
      },
      {
        "name": "নওগাঁ",
        "nameEn": "Naogaon",
        "upazilas": [
          {
            "name": "নওগাঁ সদর",
            "nameEn": "Atrai",
            "unions": []
          },
          {
            "name": "পত্নীতলা",
            "nameEn": "Badalgachi",
            "unions": []
          },
          {
            "name": "ধামইরহাট",
            "nameEn": "Dhamoirhat",
            "unions": []
          },
          {
            "name": "মহাদেবপুর",
            "nameEn": "Manda",
            "unions": []
          },
          {
            "name": "পরশা",
            "nameEn": "Mohadevpur",
            "unions": []
          },
          {
            "name": "সাপাহার",
            "nameEn": "Naogaon Sadar",
            "unions": []
          },
          {
            "name": "বদলগাছী",
            "nameEn": "Niamatpur",
            "unions": []
          },
          {
            "name": "মান্দা",
            "nameEn": "Patnitala",
            "unions": []
          },
          {
            "name": "নিয়ামতপুর",
            "nameEn": "Porsha",
            "unions": []
          },
          {
            "name": "আত্রাই",
            "nameEn": "Raninagar",
            "unions": []
          },
          {
            "name": "রাণীনগর",
            "nameEn": "Shapahar",
            "unions": []
          }
        ]
      },
      {
        "name": "নাটোর",
        "nameEn": "Natore",
        "upazilas": [
          {
            "name": "নাটোর সদর",
            "nameEn": "Bagatipara",
            "unions": []
          },
          {
            "name": "বাগাতিপাড়া",
            "nameEn": "Baraigram",
            "unions": []
          },
          {
            "name": "বড়াইগ্রাম",
            "nameEn": "Gurudaspur",
            "unions": []
          },
          {
            "name": "গুরুদাসপুর",
            "nameEn": "Lalpur",
            "unions": []
          },
          {
            "name": "লালপুর",
            "nameEn": "Naldanga",
            "unions": []
          },
          {
            "name": "সিংড়া",
            "nameEn": "Natore Sadar",
            "unions": []
          },
          {
            "name": "নলডাঙ্গা",
            "nameEn": "Singra",
            "unions": []
          }
        ]
      },
      {
        "name": "পাবনা",
        "nameEn": "Pabna",
        "upazilas": [
          {
            "name": "পাবনা সদর",
            "nameEn": "Atghoria",
            "unions": []
          },
          {
            "name": "আটঘরিয়া",
            "nameEn": "Bera",
            "unions": []
          },
          {
            "name": "ঈশ্বরদী",
            "nameEn": "Bhangura",
            "unions": []
          },
          {
            "name": "চাটমোহর",
            "nameEn": "Chatmohar",
            "unions": []
          },
          {
            "name": "ফরিদপুর",
            "nameEn": "Faridpur",
            "unions": []
          },
          {
            "name": "বেড়া",
            "nameEn": "Ishwardi",
            "unions": []
          },
          {
            "name": "ভাঙ্গুড়া",
            "nameEn": "Pabna Sadar",
            "unions": []
          },
          {
            "name": "সাঁথিয়া",
            "nameEn": "Santhia",
            "unions": []
          },
          {
            "name": "সুজানগর",
            "nameEn": "Sujanagar",
            "unions": []
          }
        ]
      },
      {
        "name": "রাজশাহী",
        "nameEn": "Rajshahi",
        "upazilas": [
          {
            "name": "বাঘা",
            "nameEn": "Bagha",
            "unions": []
          },
          {
            "name": "পুঠিয়া",
            "nameEn": "Bagmara",
            "unions": []
          },
          {
            "name": "পবা",
            "nameEn": "Charghat",
            "unions": []
          },
          {
            "name": "বাগমারা",
            "nameEn": "Durgapur",
            "unions": []
          },
          {
            "name": "তানোর",
            "nameEn": "Godagari",
            "unions": []
          },
          {
            "name": "মোহনপুর",
            "nameEn": "Mohanpur",
            "unions": []
          },
          {
            "name": "চারঘাট",
            "nameEn": "Paba",
            "unions": []
          },
          {
            "name": "গোদাগাড়ী",
            "nameEn": "Puthia",
            "unions": []
          },
          {
            "name": "দূর্গাপুর",
            "nameEn": "Tanore",
            "unions": []
          }
        ]
      },
      {
        "name": "সিরাজগঞ্জ",
        "nameEn": "Sirajganj",
        "upazilas": [
          {
            "name": "সিরাজগঞ্জ সদর",
            "nameEn": "Belkuchi",
            "unions": []
          },
          {
            "name": "উল্লাপাড়া",
            "nameEn": "Chowhali",
            "unions": []
          },
          {
            "name": "কাজীপুর",
            "nameEn": "Kamarkhand",
            "unions": []
          },
          {
            "name": "কামারখন্দ",
            "nameEn": "Kazipur",
            "unions": []
          },
          {
            "name": "চৌহালি",
            "nameEn": "Raiganj",
            "unions": []
          },
          {
            "name": "তাড়াশ",
            "nameEn": "Shahzadpur",
            "unions": []
          },
          {
            "name": "বেলকুচি",
            "nameEn": "Sirajganj Sadar",
            "unions": []
          },
          {
            "name": "রায়গঞ্জ",
            "nameEn": "Tarash",
            "unions": []
          },
          {
            "name": "শাহজাদপুর",
            "nameEn": "Ullapara",
            "unions": []
          }
        ]
      }
    ]
  },
  {
    "name": "সিলেট",
    "nameEn": "Sylhet",
    "districts": [
      {
        "name": "হবিগঞ্জ",
        "nameEn": "Habiganj",
        "upazilas": [
          {
            "name": "হবিগঞ্জ সদর উপজেলা",
            "nameEn": "Azmiriganj",
            "unions": [
              {
                "name": "লোকরা ইউনিয়ন",
                "nameEn": "লোকরা"
              },
              {
                "name": "রিচি ইউনিয়ন",
                "nameEn": "রিচি"
              },
              {
                "name": "তেঘরিয়া ইউনিয়ন",
                "nameEn": "তেঘরিয়া"
              },
              {
                "name": "পৈল ইউনিয়ন",
                "nameEn": "পৈল"
              },
              {
                "name": "গোপায়া ইউনিয়ন",
                "nameEn": "গোপায়া"
              },
              {
                "name": "রাজিউরা ইউনিয়ন",
                "nameEn": "রাজিউরা"
              },
              {
                "name": "নিজামপুর ইউনিয়ন",
                "nameEn": "নিজামপুর"
              },
              {
                "name": "লস্করপুর ইউনিয়ন",
                "nameEn": "লস্করপুর"
              }
            ]
          },
          {
            "name": "আজমিরীগঞ্জ উপজেলা",
            "nameEn": "Bahubal",
            "unions": [
              {
                "name": "আজমিরীগঞ্জ সদর ইউনিয়ন",
                "nameEn": "আজমিরীগঞ্জ সদর"
              },
              {
                "name": "বদলপুর ইউনিয়ন",
                "nameEn": "বদলপুর"
              },
              {
                "name": "জলসুখা ইউনিয়ন",
                "nameEn": "জলসুখা"
              },
              {
                "name": "শিবপাশা ইউনিয়ন",
                "nameEn": "শিবপাশা"
              },
              {
                "name": "কাকাইলছেও ইউনিয়ন",
                "nameEn": "কাকাইলছেও"
              }
            ]
          },
          {
            "name": "চুনারুঘাট উপজেলা",
            "nameEn": "Baniachong",
            "unions": [
              {
                "name": "গাজীপুর ইউনিয়ন",
                "nameEn": "গাজীপুর"
              },
              {
                "name": "আহম্মদাবাদ ইউনিয়ন",
                "nameEn": "আহম্মদাবাদ"
              },
              {
                "name": "দেওরগাছ ইউনিয়ন",
                "nameEn": "দেওরগাছ"
              },
              {
                "name": "পাইকপাড়া ইউনিয়ন",
                "nameEn": "পাইকপাড়া"
              },
              {
                "name": "শানখলা ইউনিয়ন",
                "nameEn": "শানখলা"
              },
              {
                "name": "চুনারুঘাট ইউনিয়ন",
                "nameEn": "চুনারুঘাট"
              },
              {
                "name": "উবাহাটা ইউনিয়ন",
                "nameEn": "উবাহাটা"
              },
              {
                "name": "সাটিয়াজুরী ইউনিয়ন",
                "nameEn": "সাটিয়াজুরী"
              },
              {
                "name": "রাণীগাঁও ইউনিয়ন",
                "nameEn": "রাণীগাঁও"
              },
              {
                "name": "মিরাশী ইউনিয়ন",
                "nameEn": "মিরাশী"
              }
            ]
          },
          {
            "name": "নবীগঞ্জ উপজেলা",
            "nameEn": "Chunarughat",
            "unions": [
              {
                "name": "বড়ভাকৈর পশ্চিম ইউনিয়ন",
                "nameEn": "বড়ভাকৈর পশ্চিম"
              },
              {
                "name": "বড়ভাকৈর পূর্ব ইউনিয়ন",
                "nameEn": "বড়ভাকৈর পূর্ব"
              },
              {
                "name": "ইনাতগঞ্জ ইউনিয়ন",
                "nameEn": "ইনাতগঞ্জ"
              },
              {
                "name": "দীঘলবাক ইউনিয়ন",
                "nameEn": "দীঘলবাক"
              },
              {
                "name": "আউশকান্দি ইউনিয়ন",
                "nameEn": "আউশকান্দি"
              },
              {
                "name": "কুর্শি ইউনিয়ন",
                "nameEn": "কুর্শি"
              },
              {
                "name": "করগাঁও ইউনিয়ন",
                "nameEn": "করগাঁও"
              },
              {
                "name": "নবীগঞ্জ সদর ইউনিয়ন",
                "nameEn": "নবীগঞ্জ সদর"
              },
              {
                "name": "বাউসা ইউনিয়ন",
                "nameEn": "বাউসা"
              },
              {
                "name": "দেবপাড়া ইউনিয়ন",
                "nameEn": "দেবপাড়া"
              },
              {
                "name": "গজনাইপুর ইউনিয়ন",
                "nameEn": "গজনাইপুর"
              },
              {
                "name": "কালিয়ারভাঙ্গা ইউনিয়ন",
                "nameEn": "কালিয়ারভাঙ্গা"
              },
              {
                "name": "পানিউমদা ইউনিয়ন",
                "nameEn": "পানিউমদা"
              }
            ]
          },
          {
            "name": "বানিয়াচং উপজেলা",
            "nameEn": "Habiganj Sadar",
            "unions": [
              {
                "name": "বানিয়াচং উত্তর পূর্ব ইউনিয়ন",
                "nameEn": "বানিয়াচং উত্তর পূর্ব"
              },
              {
                "name": "বানিয়াচং উত্তর পশ্চিম ইউনিয়ন",
                "nameEn": "বানিয়াচং উত্তর পশ্চিম"
              },
              {
                "name": "বানিয়াচং দক্ষিণ পূর্ব ইউনিয়ন",
                "nameEn": "বানিয়াচং দক্ষিণ পূর্ব"
              },
              {
                "name": "বানিয়াচং দক্ষিণ পশ্চিম ইউনিয়ন",
                "nameEn": "বানিয়াচং দক্ষিণ পশ্চিম"
              },
              {
                "name": "দৌলতপুর ইউনিয়ন",
                "nameEn": "দৌলতপুর"
              },
              {
                "name": "কাগাপাশা ইউনিয়ন",
                "nameEn": "কাগাপাশা"
              },
              {
                "name": "বড়ইউড়ি ইউনিয়ন",
                "nameEn": "বড়ইউড়ি"
              },
              {
                "name": "খাগাউড়া ইউনিয়ন",
                "nameEn": "খাগাউড়া"
              },
              {
                "name": "পুকড়া ইউনিয়ন",
                "nameEn": "পুকড়া"
              },
              {
                "name": "সুবিদপুর ইউনিয়ন",
                "nameEn": "সুবিদপুর"
              },
              {
                "name": "মক্রমপুর ইউনিয়ন",
                "nameEn": "মক্রমপুর"
              },
              {
                "name": "সুজাতপুর ইউনিয়ন",
                "nameEn": "সুজাতপুর"
              },
              {
                "name": "মন্দরী ইউনিয়ন",
                "nameEn": "মন্দরী"
              },
              {
                "name": "মুরাদপুর ইউনিয়ন",
                "nameEn": "মুরাদপুর"
              },
              {
                "name": "পৈলারকান্দি ইউনিয়ন",
                "nameEn": "পৈলারকান্দি"
              }
            ]
          },
          {
            "name": "বাহুবল উপজেলা",
            "nameEn": "Lakhai",
            "unions": [
              {
                "name": "স্নানঘাট ইউনিয়ন",
                "nameEn": "স্নানঘাট"
              },
              {
                "name": "পুটিজুরী ইউনিয়ন",
                "nameEn": "পুটিজুরী"
              },
              {
                "name": "সাতকাপন ইউনিয়ন",
                "nameEn": "সাতকাপন"
              },
              {
                "name": "বাহুবল সদর ইউনিয়ন",
                "nameEn": "বাহুবল সদর"
              },
              {
                "name": "লামাতাশী ইউনিয়ন",
                "nameEn": "লামাতাশী"
              },
              {
                "name": "মীরপুর ইউনিয়ন",
                "nameEn": "মীরপুর"
              },
              {
                "name": "ভাদেশ্বর ইউনিয়ন",
                "nameEn": "ভাদেশ্বর"
              }
            ]
          },
          {
            "name": "মাধবপুর উপজেলা",
            "nameEn": "Madhabpur",
            "unions": [
              {
                "name": "আদাঐর ইউনিয়ন",
                "nameEn": "আদাঐর"
              },
              {
                "name": "আন্দিউরা ইউনিয়ন",
                "nameEn": "আন্দিউরা"
              },
              {
                "name": "চৌমুহনী ইউনিয়ন",
                "nameEn": "চৌমুহনী"
              },
              {
                "name": "ছাতিয়াইন ইউনিয়ন",
                "nameEn": "ছাতিয়াইন"
              },
              {
                "name": "জগদীশপুর ইউনিয়ন",
                "nameEn": "জগদীশপুর"
              },
              {
                "name": "ধর্মঘর ইউনিয়ন",
                "nameEn": "ধর্মঘর"
              },
              {
                "name": "নোয়াপাড়া ইউনিয়ন",
                "nameEn": "নোয়াপাড়া"
              },
              {
                "name": "বাঘাসুরা ইউনিয়ন",
                "nameEn": "বাঘাসুরা"
              },
              {
                "name": "বহরা ইউনিয়ন",
                "nameEn": "বহরা"
              },
              {
                "name": "শাহজাহানপুর ইউনিয়ন",
                "nameEn": "শাহজাহানপুর"
              },
              {
                "name": "বুল্লা ইউনিয়ন",
                "nameEn": "বুল্লা"
              }
            ]
          },
          {
            "name": "লাখাই উপজেলা",
            "nameEn": "Nabiganj",
            "unions": [
              {
                "name": "লাখাই ইউনিয়ন",
                "nameEn": "লাখাই"
              },
              {
                "name": "মোড়াকরি ইউনিয়ন",
                "nameEn": "মোড়াকরি"
              },
              {
                "name": "মুড়িয়াউক ইউনিয়ন",
                "nameEn": "মুড়িয়াউক"
              },
              {
                "name": "বামৈ ইউনিয়ন",
                "nameEn": "বামৈ"
              },
              {
                "name": "করাব ইউনিয়ন",
                "nameEn": "করাব"
              },
              {
                "name": "বুল্লা ইউনিয়ন",
                "nameEn": "বুল্লা"
              }
            ]
          },
          {
            "name": "শায়েস্তাগঞ্জ উপজেলা",
            "nameEn": "Sayestaganj",
            "unions": [
              {
                "name": "নূরপুর ইউনিয়ন",
                "nameEn": "নূরপুর"
              },
              {
                "name": "শায়েস্তাগঞ্জ ইউনিয়ন",
                "nameEn": "শায়েস্তাগঞ্জ"
              },
              {
                "name": "ব্রাহ্মনডোরা ইউনিয়ন",
                "nameEn": "ব্রাহ্মনডোরা"
              }
            ]
          }
        ]
      },
      {
        "name": "মৌলভীবাজার",
        "nameEn": "Moulvibazar",
        "upazilas": [
          {
            "name": "কমলগঞ্জ উপজেলা",
            "nameEn": "Barlekha",
            "unions": [
              {
                "name": "রহিমপুর",
                "nameEn": "রহিমপুর"
              },
              {
                "name": "পতনঊষার",
                "nameEn": "পতনঊষার"
              },
              {
                "name": "মুন্সিবাজার",
                "nameEn": "মুন্সিবাজার"
              },
              {
                "name": "শমসেরনগর",
                "nameEn": "শমসেরনগর"
              },
              {
                "name": "কমলগঞ্জ",
                "nameEn": "কমলগঞ্জ"
              },
              {
                "name": "আলীনগর",
                "nameEn": "আলীনগর"
              },
              {
                "name": "আদমপুর",
                "nameEn": "আদমপুর"
              },
              {
                "name": "মাধবপুর",
                "nameEn": "মাধবপুর"
              },
              {
                "name": "ইসলামপুর",
                "nameEn": "ইসলামপুর"
              }
            ]
          },
          {
            "name": "কুলাউড়া উপজেলা",
            "nameEn": "Juri",
            "unions": [
              {
                "name": "বরমচাল",
                "nameEn": "বরমচাল"
              },
              {
                "name": "ভূকশিমইল",
                "nameEn": "ভূকশিমইল"
              },
              {
                "name": "ভাটেরা",
                "nameEn": "ভাটেরা"
              },
              {
                "name": "জয়চণ্ডী",
                "nameEn": "জয়চণ্ডী"
              },
              {
                "name": "ব্রাহ্মণবাজার",
                "nameEn": "ব্রাহ্মণবাজার"
              },
              {
                "name": "কাদিপুর",
                "nameEn": "কাদিপুর"
              },
              {
                "name": "কুলাউড়া",
                "nameEn": "কুলাউড়া"
              },
              {
                "name": "রাউৎগাঁও",
                "nameEn": "রাউৎগাঁও"
              },
              {
                "name": "টিলাগাঁও",
                "nameEn": "টিলাগাঁও"
              },
              {
                "name": "হাজীপুর",
                "nameEn": "হাজীপুর"
              },
              {
                "name": "শরীফপুর",
                "nameEn": "শরীফপুর"
              },
              {
                "name": "পৃথিমপাশা",
                "nameEn": "পৃথিমপাশা"
              },
              {
                "name": "কর্মধা",
                "nameEn": "কর্মধা"
              }
            ]
          },
          {
            "name": "জুড়ী উপজেলা",
            "nameEn": "Kamalganj",
            "unions": [
              {
                "name": "পূর্ব জুড়ী",
                "nameEn": "পূর্ব জুড়ী"
              },
              {
                "name": "পশ্চিম জুড়ী",
                "nameEn": "পশ্চিম জুড়ী"
              },
              {
                "name": "জায়ফরনগর",
                "nameEn": "জায়ফরনগর"
              },
              {
                "name": "সাগরনাল",
                "nameEn": "সাগরনাল"
              },
              {
                "name": "ফুলতলা ",
                "nameEn": "ফুলতলা"
              },
              {
                "name": "গোয়ালবাড়ী",
                "nameEn": "গোয়ালবাড়ী"
              }
            ]
          },
          {
            "name": "বড়লেখা উপজেলা",
            "nameEn": "Kulaura",
            "unions": [
              {
                "name": "বর্ণি",
                "nameEn": "বর্ণি"
              },
              {
                "name": "দাসের বাজার",
                "nameEn": "দাসের বাজার"
              },
              {
                "name": "নিজ বাহাদুরপুর",
                "nameEn": "নিজ বাহাদুরপুর"
              },
              {
                "name": "উত্তর শাহবাজপুর",
                "nameEn": "উত্তর শাহবাজপুর"
              },
              {
                "name": "দক্ষিণ শাহবাজপুর",
                "nameEn": "দক্ষিণ শাহবাজপুর"
              },
              {
                "name": "বড়লেখা",
                "nameEn": "বড়লেখা"
              },
              {
                "name": "তালিমপুর",
                "nameEn": "তালিমপুর"
              },
              {
                "name": "দক্ষিণভাগ উত্তর",
                "nameEn": "দক্ষিণভাগ উত্তর"
              },
              {
                "name": "সুজানগর",
                "nameEn": "সুজানগর"
              },
              {
                "name": "দক্ষিণভাগ দক্ষিণ",
                "nameEn": "দক্ষিণভাগ দক্ষিণ"
              }
            ]
          },
          {
            "name": "মৌলভীবাজার সদর",
            "nameEn": "Moulvibazar Sadar",
            "unions": [
              {
                "name": "খলিলপুর",
                "nameEn": "খলিলপুর"
              },
              {
                "name": "মনুমুখ",
                "nameEn": "মনুমুখ"
              },
              {
                "name": "কামালপুর",
                "nameEn": "কামালপুর"
              },
              {
                "name": "আপার কাগাবলা",
                "nameEn": "আপার কাগাবলা"
              },
              {
                "name": "আখাইলকুড়া",
                "nameEn": "আখাইলকুড়া"
              },
              {
                "name": "একাটুনা",
                "nameEn": "একাটুনা"
              },
              {
                "name": "চাঁদনীঘাট",
                "nameEn": "চাঁদনীঘাট"
              },
              {
                "name": "কনকপুর",
                "nameEn": "কনকপুর"
              },
              {
                "name": "আমতৈল",
                "nameEn": "আমতৈল"
              },
              {
                "name": "নাজিরাবাদ",
                "nameEn": "নাজিরাবাদ"
              },
              {
                "name": "মোস্তফাপুর  ",
                "nameEn": "মোস্তফাপুর"
              },
              {
                "name": "গিয়াসনগর",
                "nameEn": "গিয়াসনগর"
              }
            ]
          },
          {
            "name": "রাজনগর উপজেলা",
            "nameEn": "Rajnagar",
            "unions": [
              {
                "name": "ফতেপুর",
                "nameEn": "ফতেপুর"
              },
              {
                "name": "উত্তরভাগ",
                "nameEn": "উত্তরভাগ"
              },
              {
                "name": "মুন্সিবাজার",
                "nameEn": "মুন্সিবাজার"
              },
              {
                "name": "পাঁচগাঁও",
                "nameEn": "পাঁচগাঁও"
              },
              {
                "name": "রাজনগর",
                "nameEn": "রাজনগর"
              },
              {
                "name": "টেংরা",
                "nameEn": "টেংরা"
              },
              {
                "name": "কামারচাক  ",
                "nameEn": "কামারচাক"
              },
              {
                "name": "মনসুরনগর",
                "nameEn": "মনসুরনগর"
              }
            ]
          },
          {
            "name": "শ্রীমঙ্গল উপজেলা",
            "nameEn": "Sreemangal",
            "unions": [
              {
                "name": "মির্জাপুর",
                "nameEn": "মির্জাপুর"
              },
              {
                "name": "ভূনবীর",
                "nameEn": "ভূনবীর"
              },
              {
                "name": "শ্রীমঙ্গল",
                "nameEn": "শ্রীমঙ্গল"
              },
              {
                "name": "সিন্দুরখান",
                "nameEn": "সিন্দুরখান"
              },
              {
                "name": "কালাপুর",
                "nameEn": "কালাপুর"
              },
              {
                "name": "আশিদ্রোন",
                "nameEn": "আশিদ্রোন"
              },
              {
                "name": "রাজঘাট",
                "nameEn": "রাজঘাট"
              },
              {
                "name": "কালীঘাট ",
                "nameEn": "কালীঘাট"
              },
              {
                "name": "সাতগাঁও",
                "nameEn": "সাতগাঁও"
              }
            ]
          }
        ]
      },
      {
        "name": "সুনামগঞ্জ",
        "nameEn": "Sunamganj",
        "upazilas": [
          {
            "name": "জামালগঞ্জ",
            "nameEn": "Biswamvarpur",
            "unions": [
              {
                "name": "জামালগঞ্জ",
                "nameEn": "জামালগঞ্জ"
              },
              {
                "name": "সাচনা বাচার",
                "nameEn": "সাচনা বাচার"
              },
              {
                "name": "বেহেলী",
                "nameEn": "বেহেলী"
              },
              {
                "name": "ভীমখালী",
                "nameEn": "ভীমখালী"
              },
              {
                "name": "ফেনারবাক",
                "nameEn": "ফেনারবাক"
              }
            ]
          },
          {
            "name": "ধর্মপাশা",
            "nameEn": "Chatak",
            "unions": [
              {
                "name": "ধর্মপাশা",
                "nameEn": "ধর্মপাশা"
              },
              {
                "name": "সেলবরষ",
                "nameEn": "সেলবরষ"
              },
              {
                "name": "পাইকুরাটি",
                "nameEn": "পাইকুরাটি"
              },
              {
                "name": "জয়শ্রী",
                "nameEn": "জয়শ্রী"
              },
              {
                "name": "উঃ",
                "nameEn": "উঃ"
              },
              {
                "name": "দঃ",
                "nameEn": "দঃ"
              }
            ]
          },
          {
            "name": "মধ্যনগর",
            "nameEn": "Dakhin Sunamganj",
            "unions": [
              {
                "name": "মধ্যনগর",
                "nameEn": "মধ্যনগর"
              },
              {
                "name": "চামারদানী",
                "nameEn": "চামারদানী"
              },
              {
                "name": "বংশীকুন্ডা(দঃ)",
                "nameEn": "বংশীকুন্ডা(দঃ)"
              },
              {
                "name": "বংশীকুন্ডা(উঃ)",
                "nameEn": "বংশীকুন্ডা(উঃ)"
              }
            ]
          },
          {
            "name": "তাহিরপুর",
            "nameEn": "Derai",
            "unions": [
              {
                "name": "শ্রীপুর উত্তর",
                "nameEn": "শ্রীপুর উত্তর"
              },
              {
                "name": "শ্রীপুর দক্ষিণ",
                "nameEn": "শ্রীপুর দক্ষিণ"
              },
              {
                "name": "বড়দল দক্ষিণ",
                "nameEn": "বড়দল দক্ষিণ"
              },
              {
                "name": "বড়দল উত্তর",
                "nameEn": "বড়দল উত্তর"
              },
              {
                "name": "বাদাঘাট",
                "nameEn": "বাদাঘাট"
              },
              {
                "name": "তাহিরপুর",
                "nameEn": "তাহিরপুর"
              },
              {
                "name": "বালিজুরী",
                "nameEn": "বালিজুরী"
              }
            ]
          },
          {
            "name": "শাল্লা",
            "nameEn": "Dharmapasha",
            "unions": [
              {
                "name": "আটগাঁও",
                "nameEn": "আটগাঁও"
              },
              {
                "name": "হবিবপুর",
                "nameEn": "হবিবপুর"
              },
              {
                "name": "বাহাড়া",
                "nameEn": "বাহাড়া"
              },
              {
                "name": "শাল্লা",
                "nameEn": "শাল্লা"
              }
            ]
          },
          {
            "name": "শান্তিগঞ্জ",
            "nameEn": "Doarabazar",
            "unions": [
              {
                "name": "জয়কলস",
                "nameEn": "জয়কলস"
              },
              {
                "name": "শিমুলবাক",
                "nameEn": "শিমুলবাক"
              },
              {
                "name": "পাথারিয়া",
                "nameEn": "পাথারিয়া"
              },
              {
                "name": "পশ্চিম বীরগাঁও",
                "nameEn": "পশ্চিম বীরগাঁও"
              },
              {
                "name": "পূর্ববীরগাঁও",
                "nameEn": "পূর্ববীরগাঁও"
              },
              {
                "name": "পশি্চম পাগলা",
                "nameEn": "পশি্চম পাগলা"
              },
              {
                "name": "পূর্ব পাগলা",
                "nameEn": "পূর্ব পাগলা"
              },
              {
                "name": "দরগাপাশা",
                "nameEn": "দরগাপাশা"
              }
            ]
          },
          {
            "name": "দিরাই",
            "nameEn": "Jagannathpur",
            "unions": [
              {
                "name": "রফিনগর",
                "nameEn": "রফিনগর"
              },
              {
                "name": "ভাটিপাড়া",
                "nameEn": "ভাটিপাড়া"
              },
              {
                "name": "রাজানগর",
                "nameEn": "রাজানগর"
              },
              {
                "name": "চরনারচর",
                "nameEn": "চরনারচর"
              },
              {
                "name": "দিরাই সরমঙ্গল",
                "nameEn": "দিরাই সরমঙ্গল"
              },
              {
                "name": "করিমপুর",
                "nameEn": "করিমপুর"
              },
              {
                "name": "জগদল",
                "nameEn": "জগদল"
              },
              {
                "name": "তাড়ল",
                "nameEn": "তাড়ল"
              },
              {
                "name": "কুলঞ্জ",
                "nameEn": "কুলঞ্জ"
              }
            ]
          },
          {
            "name": "জগন্নাথপুর",
            "nameEn": "Jamalganj",
            "unions": [
              {
                "name": "কলকলিয়া ইউপি",
                "nameEn": "কলকলিয়া ইউপি"
              },
              {
                "name": "পাটলী ইউপি",
                "nameEn": "পাটলী ইউপি"
              },
              {
                "name": "মীরপুর ইউপি",
                "nameEn": "মীরপুর ইউপি"
              },
              {
                "name": "চিলাউড়া হলদিপুর ইউপি",
                "nameEn": "চিলাউড়া হলদিপুর ইউপি"
              },
              {
                "name": "রাণীগঞ্জ ইউপি",
                "nameEn": "রাণীগঞ্জ ইউপি"
              },
              {
                "name": "সৈয়দপুর শাহারপাড়া ইউপি",
                "nameEn": "সৈয়দপুর শাহারপাড়া ইউপি"
              },
              {
                "name": "আশারকান্দি ইউপি",
                "nameEn": "আশারকান্দি ইউপি"
              },
              {
                "name": "পাইলগাঁও ইউপি",
                "nameEn": "পাইলগাঁও ইউপি"
              }
            ]
          },
          {
            "name": "সুনামগঞ্জ",
            "nameEn": "Sulla",
            "unions": [
              {
                "name": "আপ্তাবনগর",
                "nameEn": "আপ্তাবনগর"
              },
              {
                "name": "মোল্লাপাড়া",
                "nameEn": "মোল্লাপাড়া"
              },
              {
                "name": "রঙ্গারচর",
                "nameEn": "রঙ্গারচর"
              },
              {
                "name": "জাহাঙ্গীরনগর",
                "nameEn": "জাহাঙ্গীরনগর"
              },
              {
                "name": "সুরমা",
                "nameEn": "সুরমা"
              },
              {
                "name": "গৌরারং",
                "nameEn": "গৌরারং"
              },
              {
                "name": "মোহনপুর",
                "nameEn": "মোহনপুর"
              },
              {
                "name": "কাঠইর",
                "nameEn": "কাঠইর"
              },
              {
                "name": "লক্ষণশ্রী",
                "nameEn": "লক্ষণশ্রী"
              }
            ]
          },
          {
            "name": "দোয়ারাবাজার",
            "nameEn": "Sunamganj Sadar",
            "unions": [
              {
                "name": "লক্ষীপুর",
                "nameEn": "লক্ষীপুর"
              },
              {
                "name": "বাংলাবাজার",
                "nameEn": "বাংলাবাজার"
              },
              {
                "name": "নরসিংপুর",
                "nameEn": "নরসিংপুর"
              },
              {
                "name": "মান্নারগাঁও",
                "nameEn": "মান্নারগাঁও"
              },
              {
                "name": "পান্ডারগাঁও",
                "nameEn": "পান্ডারগাঁও"
              },
              {
                "name": "দোহালিয়া",
                "nameEn": "দোহালিয়া"
              },
              {
                "name": "দোয়ারাবাজার",
                "nameEn": "দোয়ারাবাজার"
              },
              {
                "name": "বোগলাবাজার",
                "nameEn": "বোগলাবাজার"
              },
              {
                "name": "সুরমা",
                "nameEn": "সুরমা"
              }
            ]
          },
          {
            "name": "বিশ্বম্ভরপুর",
            "nameEn": "Tahirpur",
            "unions": [
              {
                "name": "সলুকাবাদ",
                "nameEn": "সলুকাবাদ"
              },
              {
                "name": "ধনপুর",
                "nameEn": "ধনপুর"
              },
              {
                "name": "পলাশ",
                "nameEn": "পলাশ"
              },
              {
                "name": "বাদাঘাট(দঃ)",
                "nameEn": "বাদাঘাট(দঃ)"
              },
              {
                "name": "ফতেপুর",
                "nameEn": "ফতেপুর"
              }
            ]
          },
          {
            "name": "ছাতক",
            "nameEn": "ছাতক",
            "unions": [
              {
                "name": "ছাতক ইউনিয়ন পরিষদ",
                "nameEn": "ছাতক ইউনিয়ন পরিষদ"
              },
              {
                "name": "ছৈলা-আফজলাবাদ ইউপি",
                "nameEn": "ছৈলা-আফজলাবাদ ইউপি"
              },
              {
                "name": "নোয়ারাই ইউপি",
                "nameEn": "নোয়ারাই ইউপি"
              },
              {
                "name": "কালারুকা ইউপি।",
                "nameEn": "কালারুকা ইউপি।"
              },
              {
                "name": "গোবিন্দগঞ্জ-সৈদেরগাও",
                "nameEn": "গোবিন্দগঞ্জ-সৈদেরগাও"
              },
              {
                "name": "খুরমা উত্তর",
                "nameEn": "খুরমা উত্তর"
              },
              {
                "name": "দক্ষিণ খুরমা",
                "nameEn": "দক্ষিণ খুরমা"
              },
              {
                "name": "চরমহল্লা",
                "nameEn": "চরমহল্লা"
              },
              {
                "name": "ইসলামপুর",
                "nameEn": "ইসলামপুর"
              },
              {
                "name": "জাউয়া বাজার",
                "nameEn": "জাউয়া বাজার"
              },
              {
                "name": "সিংচাপইড়",
                "nameEn": "সিংচাপইড়"
              },
              {
                "name": "দোলার বাজার",
                "nameEn": "দোলার বাজার"
              },
              {
                "name": "ভাতগাও",
                "nameEn": "ভাতগাও"
              }
            ]
          }
        ]
      },
      {
        "name": "সিলেট",
        "nameEn": "Sylhet",
        "upazilas": [
          {
            "name": "সিলেট সদর উপজেলা",
            "nameEn": "Balaganj",
            "unions": [
              {
                "name": "কান্দিগাঁও ইউনিয়ন",
                "nameEn": "কান্দিগাঁও"
              },
              {
                "name": "খাদিমনগর ইউনিয়ন",
                "nameEn": "খাদিমনগর"
              },
              {
                "name": "খাদিমপাড়া ইউনিয়ন",
                "nameEn": "খাদিমপাড়া"
              },
              {
                "name": "জালালাবাদ ইউনিয়ন",
                "nameEn": "জালালাবাদ"
              },
              {
                "name": "টুকের বাজার ইউনিয়ন",
                "nameEn": "টুকের বাজার"
              },
              {
                "name": "টুলটিকর ইউনিয়ন",
                "nameEn": "টুলটিকর"
              },
              {
                "name": "মোগলগাঁও ইউনিয়ন",
                "nameEn": "মোগলগাঁও"
              },
              {
                "name": "হাটখোলা ইউনিয়ন",
                "nameEn": "হাটখোলা"
              }
            ]
          },
          {
            "name": "বালাগঞ্জ উপজেলা",
            "nameEn": "Beanibazar",
            "unions": [
              {
                "name": "পূর্ব পৈলনপুর ইউনিয়ন",
                "nameEn": "পূর্ব পৈলনপুর"
              },
              {
                "name": "বোয়ালজুড় ইউনিয়ন",
                "nameEn": "বোয়ালজুড়"
              },
              {
                "name": "দেওয়ানবাজার ইউনিয়ন",
                "nameEn": "দেওয়ানবাজার"
              },
              {
                "name": "পশ্চিম গৌরীপুর ইউনিয়ন",
                "nameEn": "পশ্চিম গৌরীপুর"
              },
              {
                "name": "বালাগঞ্জ ইউনিয়ন",
                "nameEn": "বালাগঞ্জ"
              },
              {
                "name": "পূর্ব গৌরীপুর ইউনিয়ন",
                "nameEn": "পূর্ব গৌরীপুর"
              }
            ]
          },
          {
            "name": "বিয়ানীবাজার উপজেলা",
            "nameEn": "Biswanath",
            "unions": [
              {
                "name": "আলীনগর ইউনিয়ন",
                "nameEn": "আলীনগর"
              },
              {
                "name": "কুড়ারবাজার ইউনিয়ন",
                "nameEn": "কুড়ারবাজার"
              },
              {
                "name": "চরখাই ইউনিয়ন",
                "nameEn": "চরখাই"
              },
              {
                "name": "দুবাগ ইউনিয়ন",
                "nameEn": "দুবাগ"
              },
              {
                "name": "মাথিউরা ইউনিয়ন",
                "nameEn": "মাথিউরা"
              },
              {
                "name": "তিলপাড়া ইউনিয়ন",
                "nameEn": "তিলপাড়া"
              },
              {
                "name": "মুড়িয়া ইউনিয়ন",
                "nameEn": "মুড়িয়া"
              },
              {
                "name": "মোল্লাপুর ইউনিয়ন",
                "nameEn": "মোল্লাপুর"
              },
              {
                "name": "লাউতা ইউনিয়ন",
                "nameEn": "লাউতা"
              },
              {
                "name": "শেওলা ইউনিয়ন",
                "nameEn": "শেওলা"
              }
            ]
          },
          {
            "name": "বিশ্বনাথ উপজেলা",
            "nameEn": "Companiganj",
            "unions": [
              {
                "name": "লামাকাজী ইউনিয়ন",
                "nameEn": "লামাকাজী"
              },
              {
                "name": "খাজাঞ্চী ইউনিয়ন",
                "nameEn": "খাজাঞ্চী"
              },
              {
                "name": "অলংকারী ইউনিয়ন",
                "nameEn": "অলংকারী"
              },
              {
                "name": "রামপাশা ইউনিয়ন",
                "nameEn": "রামপাশা"
              },
              {
                "name": "দৌলতপুর ইউনিয়ন",
                "nameEn": "দৌলতপুর"
              },
              {
                "name": "বিশ্বনাথ ইউনিয়ন",
                "nameEn": "বিশ্বনাথ"
              },
              {
                "name": "দেওকলস ইউনিয়ন",
                "nameEn": "দেওকলস"
              },
              {
                "name": "দশঘর ইউনিয়ন",
                "nameEn": "দশঘর"
              }
            ]
          },
          {
            "name": "কোম্পানীগঞ্জ উপজেলা",
            "nameEn": "Dakshin Surma",
            "unions": [
              {
                "name": "ইসলামপুর পশ্চিম ইউনিয়ন",
                "nameEn": "ইসলামপুর পশ্চিম"
              },
              {
                "name": "ইসলামপুর পূর্ব ইউনিয়ন",
                "nameEn": "ইসলামপুর পূর্ব"
              },
              {
                "name": "তেলিখাল ইউনিয়ন",
                "nameEn": "তেলিখাল"
              },
              {
                "name": "ইছাকলস ইউনিয়ন",
                "nameEn": "ইছাকলস"
              },
              {
                "name": "উত্তর রণিখাই ইউনিয়ন",
                "nameEn": "উত্তর রণিখাই"
              },
              {
                "name": "দক্ষিণ রণিখাই ইউনিয়ন",
                "nameEn": "দক্ষিণ রণিখাই"
              }
            ]
          },
          {
            "name": "ফেঞ্চুগঞ্জ উপজেলা",
            "nameEn": "Fenchuganj",
            "unions": [
              {
                "name": "ফেঞ্চুগঞ্জ ইউনিয়ন",
                "nameEn": "ফেঞ্চুগঞ্জ"
              },
              {
                "name": "মাইজগাঁও ইউনিয়ন",
                "nameEn": "মাইজগাঁও"
              },
              {
                "name": "ঘিলাছড়া ইউনিয়ন",
                "nameEn": "ঘিলাছড়া"
              },
              {
                "name": "উত্তর কুশিয়ারা ইউনিয়ন",
                "nameEn": "উত্তর কুশিয়ারা"
              },
              {
                "name": "উত্তর ফেঞ্চুগঞ্জ ইউনিয়ন",
                "nameEn": "উত্তর ফেঞ্চুগঞ্জ"
              }
            ]
          },
          {
            "name": "গোলাপগঞ্জ উপজেলা",
            "nameEn": "Golapganj",
            "unions": [
              {
                "name": "বাঘা ইউনিয়ন",
                "nameEn": "বাঘা"
              },
              {
                "name": "গোলাপগঞ্জ ইউনিয়ন",
                "nameEn": "গোলাপগঞ্জ"
              },
              {
                "name": "ফুলবাড়ী ইউনিয়ন",
                "nameEn": "ফুলবাড়ী"
              },
              {
                "name": "লক্ষ্মীপাশা ইউনিয়ন",
                "nameEn": "লক্ষ্মীপাশা"
              },
              {
                "name": "ঢাকাদক্ষিণ ইউনিয়ন",
                "nameEn": "ঢাকাদক্ষিণ"
              },
              {
                "name": "লক্ষণাবন্দ ইউনিয়ন",
                "nameEn": "লক্ষণাবন্দ"
              },
              {
                "name": "ভাদেশ্বর ইউনিয়ন",
                "nameEn": "ভাদেশ্বর"
              },
              {
                "name": "পশ্চিম আমুড়া ইউনিয়ন",
                "nameEn": "পশ্চিম আমুড়া"
              },
              {
                "name": "উত্তর বাদেপাশা ইউনিয়ন",
                "nameEn": "উত্তর বাদেপাশা"
              },
              {
                "name": "শরীফগঞ্জ ইউনিয়ন",
                "nameEn": "শরীফগঞ্জ"
              }
            ]
          },
          {
            "name": "গোয়াইনঘাট উপজেলা",
            "nameEn": "Gowainghat",
            "unions": [
              {
                "name": "রুস্তমপুর ইউনিয়ন",
                "nameEn": "রুস্তমপুর"
              },
              {
                "name": "পশ্চিম জাফলং ইউনিয়ন",
                "nameEn": "পশ্চিম জাফলং"
              },
              {
                "name": "পুর্ব জাফলং ইউনিয়ন",
                "nameEn": "পুর্ব জাফলং"
              },
              {
                "name": "লেঙ্গুঁড়া ইউনিয়ন",
                "nameEn": "লেঙ্গুঁড়া"
              },
              {
                "name": "আলীরগাঁও ইউনিয়ন",
                "nameEn": "আলীরগাঁও"
              },
              {
                "name": "ফতেপুর ইউনিয়ন",
                "nameEn": "ফতেপুর"
              },
              {
                "name": "নন্দিরগাঁও ইউনিয়ন",
                "nameEn": "নন্দিরগাঁও"
              },
              {
                "name": "তোয়াকুল ইউনিয়ন",
                "nameEn": "তোয়াকুল"
              },
              {
                "name": "ডৌবাড়ী ইউনিয়ন",
                "nameEn": "ডৌবাড়ী"
              }
            ]
          },
          {
            "name": "জৈন্তাপুর উপজেলা",
            "nameEn": "Jointiapur",
            "unions": [
              {
                "name": "নিজপাট ইউনিয়ন",
                "nameEn": "নিজপাট"
              },
              {
                "name": "জৈন্তাপুর ইউনিয়ন",
                "nameEn": "জৈন্তাপুর"
              },
              {
                "name": "চারিকাটা ইউনিয়ন",
                "nameEn": "চারিকাটা"
              },
              {
                "name": "দরবস্ত ইউনিয়ন",
                "nameEn": "দরবস্ত"
              },
              {
                "name": "ফতেহপুর ইউনিয়ন",
                "nameEn": "ফতেহপুর"
              },
              {
                "name": "চিকনাগুল ইউনিয়ন",
                "nameEn": "চিকনাগুল"
              }
            ]
          },
          {
            "name": "কানাইঘাট উপজেলা",
            "nameEn": "Kanaighat",
            "unions": [
              {
                "name": "পূর্ব লক্ষ্মীপ্রাসাদ ইউনিয়ন",
                "nameEn": "পূর্ব লক্ষ্মীপ্রাসাদ"
              },
              {
                "name": "পশ্চিম লক্ষ্মীপ্রাসাদ ইউনিয়ন",
                "nameEn": "পশ্চিম লক্ষ্মীপ্রাসাদ"
              },
              {
                "name": "পূর্ব দিঘীরপার ইউনিয়ন",
                "nameEn": "পূর্ব দিঘীরপার"
              },
              {
                "name": "সাতবাঁক ইউনিয়ন",
                "nameEn": "সাতবাঁক"
              },
              {
                "name": "বড়চতুল ইউনিয়ন",
                "nameEn": "বড়চতুল"
              },
              {
                "name": "কানাইঘাট ইউনিয়ন",
                "nameEn": "কানাইঘাট"
              },
              {
                "name": "দক্ষিণ বাণীগ্রাম ইউনিয়ন",
                "nameEn": "দক্ষিণ বাণীগ্রাম"
              },
              {
                "name": "ঝিঙ্গাবাড়ী ইউনিয়ন",
                "nameEn": "ঝিঙ্গাবাড়ী"
              },
              {
                "name": "রাজাগঞ্জ ইউনিয়ন",
                "nameEn": "রাজাগঞ্জ"
              }
            ]
          },
          {
            "name": "জকিগঞ্জ উপজেলা",
            "nameEn": "Osmaninagar",
            "unions": [
              {
                "name": "বারহাল ইউনিয়ন",
                "nameEn": "বারহাল"
              },
              {
                "name": "বীরশ্রী ইউনিয়ন",
                "nameEn": "বীরশ্রী"
              },
              {
                "name": "কাজলসার ইউনিয়ন",
                "nameEn": "কাজলসার"
              },
              {
                "name": "খলাছড়া ইউনিয়ন",
                "nameEn": "খলাছড়া"
              },
              {
                "name": "জকিগঞ্জ সদর ইউনিয়ন",
                "nameEn": "জকিগঞ্জ সদর"
              },
              {
                "name": "সুলতানপুর ইউনিয়ন",
                "nameEn": "সুলতানপুর"
              },
              {
                "name": "বারঠাকুরী ইউনিয়ন",
                "nameEn": "বারঠাকুরী"
              },
              {
                "name": "কসকনকপুর ইউনিয়ন",
                "nameEn": "কসকনকপুর"
              },
              {
                "name": "মানিকপুর ইউনিয়ন",
                "nameEn": "মানিকপুর"
              }
            ]
          },
          {
            "name": "দক্ষিণ সুরমা উপজেলা",
            "nameEn": "Sylhet Sadar",
            "unions": [
              {
                "name": "মোল্লারগাঁও ইউনিয়ন",
                "nameEn": "মোল্লারগাঁও"
              },
              {
                "name": "বরইকান্দি ইউনিয়ন",
                "nameEn": "বরইকান্দি"
              },
              {
                "name": "তেতলী ইউনিয়ন",
                "nameEn": "তেতলী"
              },
              {
                "name": "কুচাই ইউনিয়ন",
                "nameEn": "কুচাই"
              },
              {
                "name": "সিলাম ইউনিয়ন",
                "nameEn": "সিলাম"
              },
              {
                "name": "লালাবাজার ইউনিয়ন",
                "nameEn": "লালাবাজার"
              },
              {
                "name": "জালালপুর ইউনিয়ন",
                "nameEn": "জালালপুর"
              },
              {
                "name": "মোগলাবাজার ইউনিয়ন",
                "nameEn": "মোগলাবাজার"
              },
              {
                "name": "দাউদপুর ইউনিয়ন",
                "nameEn": "দাউদপুর"
              },
              {
                "name": "কামালবাজার ইউনিয়ন",
                "nameEn": "কামালবাজার"
              }
            ]
          },
          {
            "name": "ওসমানীনগর উপজেলা",
            "nameEn": "Zakiganj",
            "unions": [
              {
                "name": "উমরপুর ইউনিয়ন",
                "nameEn": "উমরপুর"
              },
              {
                "name": "তাজপুর ইউনিয়ন",
                "nameEn": "তাজপুর"
              },
              {
                "name": "পশ্চিম পৈলনপুর ইউনিয়ন",
                "nameEn": "পশ্চিম পৈলনপুর"
              },
              {
                "name": "বুরুঙ্গাবাজার ইউনিয়ন",
                "nameEn": "বুরুঙ্গাবাজার"
              },
              {
                "name": "গোয়ালাবাজার ইউনিয়ন",
                "nameEn": "গোয়ালাবাজার"
              },
              {
                "name": "সাদীপুর ইউনিয়ন",
                "nameEn": "সাদীপুর"
              },
              {
                "name": "উসমানপুর ইউনিয়ন",
                "nameEn": "উসমানপুর"
              },
              {
                "name": "দয়ামীর ইউনিয়ন",
                "nameEn": "দয়ামীর"
              }
            ]
          }
        ]
      }
    ]
  }
];
