/**
 * DigiDB - IndexedDB wrapper for Digis Digital Agency CMS
 */
const DigiDB = (() => {
  const DB_NAME = 'DigisAgencyDB';
  const DB_VERSION = 1;
  let db = null;

  const STORES = {
    USERS: 'users',
    CONTENT: 'content',
    SETTINGS: 'settings',
    MESSAGES: 'messages',
  };

  function openDB() {
    return new Promise((resolve, reject) => {
      if (db) return resolve(db);
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains(STORES.USERS)) {
          const us = d.createObjectStore(STORES.USERS, { keyPath: 'username' });
          us.createIndex('role', 'role', { unique: false });
        }
        if (!d.objectStoreNames.contains(STORES.CONTENT)) {
          d.createObjectStore(STORES.CONTENT, { keyPath: 'key' });
        }
        if (!d.objectStoreNames.contains(STORES.SETTINGS)) {
          d.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }
        if (!d.objectStoreNames.contains(STORES.MESSAGES)) {
          const ms = d.createObjectStore(STORES.MESSAGES, { keyPath: 'id', autoIncrement: true });
          ms.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
      req.onsuccess = (e) => { db = e.target.result; resolve(db); };
      req.onerror = (e) => reject(e.target.error);
    });
  }

  function tx(storeName, mode = 'readonly') {
    return db.transaction(storeName, mode).objectStore(storeName);
  }

  function getAll(storeName) {
    return openDB().then(() => new Promise((resolve, reject) => {
      const req = tx(storeName).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    }));
  }

  function get(storeName, key) {
    return openDB().then(() => new Promise((resolve, reject) => {
      const req = tx(storeName).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    }));
  }

  function put(storeName, value) {
    return openDB().then(() => new Promise((resolve, reject) => {
      const req = tx(storeName, 'readwrite').put(value);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    }));
  }

  function remove(storeName, key) {
    return openDB().then(() => new Promise((resolve, reject) => {
      const req = tx(storeName, 'readwrite').delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    }));
  }

  // Seed default content
  async function seedDefaultContent() {
    const defaults = [
      // Hero
      { key: 'hero_title', value: 'We Grow Your Brand Digitally' },
      { key: 'hero_subtitle', value: 'Digis Digital is a full-service digital marketing agency helping businesses grow through data-driven strategies.' },
      { key: 'hero_cta', value: 'Get a Free Consultation' },
      // About
      { key: 'about_title', value: 'About Digis Digital' },
      { key: 'about_body', value: 'We are a passionate team of digital marketers, designers, and strategists dedicated to delivering measurable results. Founded with a vision to transform businesses through innovative digital solutions, we partner with brands to craft compelling stories that engage, convert, and retain customers.' },
      { key: 'about_mission', value: 'To empower every business with the digital tools and strategies needed to compete and win in the modern marketplace.' },
      { key: 'about_vision', value: 'To be the most trusted digital growth partner for ambitious businesses across Sri Lanka and beyond.' },
      // Services
      { key: 'services_title', value: 'Our Services' },
      { key: 'services_subtitle', value: 'From strategy to execution, we offer a full suite of digital marketing services tailored to your growth goals.' },
      { key: 'service_1_title', value: 'Social Media Marketing' },
      { key: 'service_1_desc', value: 'Grow your brand presence across all major social platforms with expertly crafted content and paid campaigns.' },
      { key: 'service_2_title', value: 'Search Engine Optimization' },
      { key: 'service_2_desc', value: 'Dominate search rankings with our proven SEO strategies that drive organic traffic and qualified leads.' },
      { key: 'service_3_title', value: 'Pay-Per-Click Advertising' },
      { key: 'service_3_desc', value: 'Maximize ROI with targeted PPC campaigns on Google, Meta, and other major advertising platforms.' },
      { key: 'service_4_title', value: 'Content Marketing' },
      { key: 'service_4_desc', value: 'Engage your audience with high-quality, strategic content that builds authority and drives conversions.' },
      { key: 'service_5_title', value: 'Web Design & Development' },
      { key: 'service_5_desc', value: 'Create stunning, conversion-optimized websites that make your brand stand out and perform.' },
      { key: 'service_6_title', value: 'Email Marketing' },
      { key: 'service_6_desc', value: 'Build lasting customer relationships with personalized email campaigns that nurture and convert.' },
      // Contact
      { key: 'contact_title', value: 'Let\'s Talk' },
      { key: 'contact_subtitle', value: 'Ready to grow your business? Get in touch with us today.' },
      { key: 'contact_phone', value: '+94 76 216 7260' },
      { key: 'contact_email', value: 'digisdigital@gmail.com' },
      { key: 'contact_address', value: 'Colombo, Sri Lanka' },
      // Footer
      { key: 'footer_tagline', value: 'Empowering brands with smart digital strategies.' },
      // Team
      { key: 'team_title', value: 'Meet Our Team' },
      { key: 'team_subtitle', value: 'Passionate.  Creative.  Data-driven.  Results-oriented.' },
    ];

    for (const item of defaults) {
      const existing = await get(STORES.CONTENT, item.key);
      if (!existing) await put(STORES.CONTENT, item);
    }
  }

  async function seedDefaultAdmin() {
    const users = await getAll(STORES.USERS);
    if (users.length === 0) {
      await put(STORES.USERS, {
        username: 'admin',
        password: 'admin',
        name: 'Administrator',
        role: 'admin',
        createdAt: new Date().toISOString(),
      });
    }
  }

  async function init() {
    await openDB();
    await seedDefaultAdmin();
    await seedDefaultContent();
  }

  return { init, get, getAll, put, remove, STORES };
})();
