import { addDays, todayIST, templateData } from '../../public/js/shared.js';

// Sample page at /demo. Fictional family; dates move with today so the sample never looks stale.
export function demo(lang = 'hi', today = todayIST()) {
  const day = n => addDays(today, n);
  const en = lang === 'en';
  const t = templateData('male', lang);
  return {
    ...t,
    name: en ? 'Ramprasad Sharma' : 'रामप्रसाद जी शर्मा',
    died_on: day(-3),
    relations: en
      ? [
          { person: 'Late Shri Govind Prasad Sharma', rel: 'beloved son' },
          { person: 'Shri Mahesh Sharma', rel: 'brother' },
          { person: 'Amit Sharma', rel: 'beloved father' },
        ]
      : [
          { person: 'स्व. श्री गोविंद प्रसाद जी शर्मा', rel: 'सुपुत्र' },
          { person: 'श्री महेश जी शर्मा', rel: 'भ्राता' },
          { person: 'अमित शर्मा', rel: 'पूज्य पिताजी' },
        ],
    events: [
      { name: t.events[0].name, date: day(0), time: en ? '4 pm' : 'शाम 4 बजे' },
      { name: t.events[1].name, date: day(7), tithi: en ? 'Kartik Krishna Dashami' : 'कार्तिक बदी दशमी' },
      { name: t.events[2].name, date: day(10), note: en ? 'No clothes custom' : 'कपड़ा प्रथा बंद है' },
      { name: t.events[3].name, date: day(10), time: en ? 'from 1 pm' : 'दोपहर 1 बजे से' },
    ],
    venue: en
      ? { name: 'Shri Ram Mandir Parisar', address: 'Gandhi Nagar, Main Road,\nIndore', map: 'https://maps.google.com/?q=Indore' }
      : { name: 'श्री राम मंदिर परिसर', address: 'गांधी नगर, मुख्य मार्ग,\nइंदौर', map: 'https://maps.google.com/?q=Indore' },
    family: en ? 'The Sharma Family' : 'समस्त शर्मा परिवार',
    contacts: [
      { name: en ? 'Mahesh Sharma' : 'महेश शर्मा', phone: '9876543210' },
      { name: en ? 'Amit Sharma' : 'अमित शर्मा', phone: '9123456780' },
    ],
  };
}
