
export function initEmailBuilder() {
  const canvas = document.getElementById('email-canvas');
  if (!canvas) return;
  if (canvas.__initialized) return;
  canvas.__initialized = true;

  /**
 * Email Builder Core Engine
 */

// Global State
const state = {
  canvasWidth: 600,
  canvasAlign: 'center',
  bgPage: '#f4f4f7',
  bgEmail: '#ffffff',
  fontFamily: 'Arial, sans-serif',
  selectedElement: null,
  history: [],
  historyIndex: -1
};

// SVG icons registry
const icons = {
  trash: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`,
  duplicate: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/></svg>`,
  up: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg>`,
  down: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>`,
  photo: `<svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
  alignLeft: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h10M4 18h16"/></svg>`,
  alignCenter: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M7 12h10M4 18h16"/></svg>`,
  alignRight: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M10 12h10M4 18h16"/></svg>`,
  alignJustify: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>`,
  alignTop: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16M12 8v12M9 11l3-3 3 3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  alignMiddle: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 12h16M12 4v6M15 7l-3 3-3-3M12 20v-6M9 17l3-3 3 3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  alignBottom: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 20h16M12 16V4M9 13l3 3 3-3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
};

// Social icon templates mapping
const socialIcons = {
  facebook: {
    label: 'Facebook',
    url: 'https://facebook.com',
    svg: `<svg width="24" height="24" fill="#635bff" viewBox="0 0 24 24" style="margin: 0 8px; display:inline-block;"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/></svg>`
  },
  instagram: {
    label: 'Instagram',
    url: 'https://instagram.com',
    svg: `<svg width="24" height="24" fill="#635bff" viewBox="0 0 24 24" style="margin: 0 8px; display:inline-block;"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`
  },
  youtube: {
    label: 'YouTube',
    url: 'https://youtube.com',
    svg: `<svg width="24" height="24" fill="#635bff" viewBox="0 0 24 24" style="margin: 0 8px; display:inline-block;"><path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11C4.483 20.455 12 20.455 12 20.455s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`
  },
  linkedin: {
    label: 'LinkedIn',
    url: 'https://linkedin.com',
    svg: `<svg width="24" height="24" fill="#635bff" viewBox="0 0 24 24" style="margin: 0 8px; display:inline-block;"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`
  }
};

// Comprehensive Icon Library Registry
const iconLibrary = {
  social: {
    facebook: `<svg viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204 0.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11C4.483 20.455 12 20.455 12 20.455s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    linkedin: `<svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`,
    twitter: `<svg viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>`
  },
  navigation: {
    home: `<svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
    arrowRight: `<svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>`,
    arrowLeft: `<svg viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>`,
    menu: `<svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>`,
    search: `<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`
  },
  communication: {
    mail: `<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
    phone: `<svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>`,
    chat: `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>`
  },
  business: {
    briefcase: `<svg viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>`,
    trendingUp: `<svg viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>`,
    dollar: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7.9c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>`
  },
  ecommerce: {
    cart: `<svg viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.9 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>`,
    tag: `<svg viewBox="0 0 24 24"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>`,
    star: `<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`
  },
  interface: {
    edit: `<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`,
    trash: `<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
    settings: `<svg viewBox="0 0 24 24"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>`
  }
};

// Initial template configurations
const blockTemplates = {
  title: {
    tag: 'h1',
    content: 'Encontre a sua melhor versão hoje!',
    style: {
      color: '#1e1e24',
      fontSize: '28px',
      textAlign: 'center',
      paddingTop: '20px',
      paddingBottom: '10px',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      lineHeight: '1.2'
    }
  },
  paragraph: {
    tag: 'p',
    content: 'Trabalhe no seu próprio ritmo com templates responsivos criados para engajar sua base de leads. Personalize cores, textos e imagens com cliques rápidos.',
    style: {
      color: '#62627a',
      fontSize: '16px',
      textAlign: 'center',
      lineHeight: '1.6',
      paddingTop: '10px',
      paddingBottom: '20px',
      paddingLeft: '15px',
      paddingRight: '15px',
      fontFamily: 'Arial, sans-serif'
    }
  },
  list: {
    tag: 'ul',
    content: '<li>🚀 Recursos completos de automação</li><li>🎨 Design moderno e responsivo</li><li>⚙️ Editor de propriedades intuitivo</li>',
    style: {
      color: '#1e1e24',
      fontSize: '15px',
      paddingTop: '10px',
      paddingBottom: '10px',
      paddingLeft: '30px',
      lineHeight: '1.7',
      fontFamily: 'Arial, sans-serif'
    }
  },
  image: {
    tag: 'div',
    content: `
      <div class="image-placeholder" data-active-layout="1">
        ${icons.photo}
        <span>Clique para escolher o layout da foto</span>
      </div>
    `,
    style: {
      paddingTop: '10px',
      paddingBottom: '10px'
    }
  },
  button: {
    tag: 'a',
    content: 'Começar Agora',
    href: '#',
    style: {
      display: 'inline-block',
      backgroundColor: '#635bff',
      color: '#ffffff',
      paddingTop: '12px',
      paddingBottom: '12px',
      paddingLeft: '32px',
      paddingRight: '32px',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: 'bold',
      textDecoration: 'none',
      textAlign: 'center',
      marginTop: '10px',
      marginBottom: '10px'
    }
  },
  divider: {
    tag: 'hr',
    style: {
      border: 'none',
      borderTop: '2px solid #e2e2ec',
      marginTop: '15px',
      marginBottom: '15px',
      width: '100%'
    }
  },
  spacer: {
    tag: 'div',
    style: {
      height: '30px',
      width: '100%'
    }
  },
  social: {
    tag: 'div',
    content: `
      <div class="social-wrapper" data-active-networks="facebook,instagram,linkedin">
        <a href="https://facebook.com" target="_blank" data-network="facebook" style="text-decoration:none; margin: 0 4px; display:inline-block;">${socialIcons.facebook.svg}</a>
        <a href="https://instagram.com" target="_blank" data-network="instagram" style="text-decoration:none; margin: 0 4px; display:inline-block;">${socialIcons.instagram.svg}</a>
        <a href="https://linkedin.com" target="_blank" data-network="linkedin" style="text-decoration:none; margin: 0 4px; display:inline-block;">${socialIcons.linkedin.svg}</a>
      </div>
    `,
    style: {
      textAlign: 'center',
      paddingTop: '15px',
      paddingBottom: '15px'
    }
  },
  html: {
    tag: 'div',
    content: '<div style="background:#f0f0ff; border:1px solid #635bff; border-radius:6px; padding:15px; text-align:center; color:#5048e5; font-weight:bold;">Custom HTML Block</div>',
    style: {
      paddingTop: '10px',
      paddingBottom: '10px'
    }
  },
  video: {
    tag: 'div',
    content: `
      <div class="video-container" data-video-url="https://youtube.com" style="position:relative; background:#000; border-radius:6px; overflow:hidden; max-width:100%; height:200px; display:flex; align-items:center; justify-content:center;">
        <span style="color:#fff; font-size:24px; position:absolute; z-index:2; background:rgba(0,0,0,0.6); width:60px; height:60px; border-radius:50%; display:flex; align-items:center; justify-content:center;">▶</span>
        <img class="video-thumb" src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format" style="width:100%; height:100%; object-fit:cover; opacity:0.7;" alt="Video">
      </div>
    `,
    style: {
      paddingTop: '10px',
      paddingBottom: '10px'
    }
  },
  icons: {
    tag: 'div',
    content: `
      <div class="icons-wrapper" style="text-align: center;">
        <span style="font-size:24px; color:#635bff; margin:0 5px; display:inline-block; vertical-align:middle;">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" style="display:inline-block;"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
        </span>
      </div>
    `,
    style: {
      textAlign: 'center',
      paddingTop: '8px',
      paddingBottom: '8px'
    }
  },
  menu: {
    tag: 'div',
    content: `
      <div class="menu-wrapper" style="text-align: center;">
        <a href="#" target="_self" data-item-id="0" style="margin: 0 12px; text-decoration:none; color:#1e1e24; font-size:14px; display: inline-flex; align-items: center; vertical-align: middle; gap: 4px;">Início</a>
      </div>
    `,
    style: {
      textAlign: 'center',
      paddingTop: '10px',
      paddingBottom: '10px'
    }
  },
  sticker: {
    tag: 'div',
    content: '<span style="font-size:48px; display:inline-block;">🎉</span>',
    style: {
      textAlign: 'center',
      paddingTop: '10px',
      paddingBottom: '10px'
    }
  },
  gif: {
    tag: 'img',
    src: 'https://media.giphy.com/media/l0Exd3vG29vR0C31S/giphy.gif',
    alt: 'Exemplo de GIF',
    style: {
      maxWidth: '200px',
      height: 'auto',
      display: 'block',
      marginLeft: 'auto',
      marginRight: 'auto',
      paddingTop: '10px',
      paddingBottom: '10px'
    }
  },
  table: {
    tag: 'table',
    content: `
      <thead>
        <tr style="background:#f0efff; color:#635bff;">
          <th style="padding:10px; border:1px solid #e2e2ec; font-family:Arial, sans-serif; font-size:14px;">Plano</th>
          <th style="padding:10px; border:1px solid #e2e2ec; font-family:Arial, sans-serif; font-size:14px;">Valor</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="table-cell-edit" contenteditable="true" style="padding:10px; border:1px solid #e2e2ec; color:#1e1e24; font-family:Arial, sans-serif; font-size:14px;">Básico</td>
          <td class="table-cell-edit" contenteditable="true" style="padding:10px; border:1px solid #e2e2ec; color:#1e1e24; font-family:Arial, sans-serif; font-size:14px;">R$ 50</td>
        </tr>
        <tr>
          <td class="table-cell-edit" contenteditable="true" style="padding:10px; border:1px solid #e2e2ec; color:#1e1e24; font-family:Arial, sans-serif; font-size:14px;">Premium</td>
          <td class="table-cell-edit" contenteditable="true" style="padding:10px; border:1px solid #e2e2ec; color:#1e1e24; font-family:Arial, sans-serif; font-size:14px;">R$ 100</td>
        </tr>
      </tbody>
    `,
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '10px',
      marginBottom: '10px'
    }
  }
};

// Initialize Application DOM Events (called directly since DOM is already ready in React)
setupTabs();
setupDragAndDrop();
setupSettingsListeners();
setupActionButtons();
setupModalEvents();
setupImageModalEvents();
setupIconLibraryModalEvents();
setupKeyboardShortcuts();

const backBtn = document.getElementById('btn-back-to-tabs');
if (backBtn) {
  backBtn.addEventListener('click', () => {
    deselectAll();
  });
}

saveState();

/* ==========================================================================
   TAB NAVIGATION SYSTEM
   ========================================================================== */
function setupTabs() {
  document.querySelectorAll('#sidebar-tabs-nav .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      if (!tabId) return;
      
      btn.parentElement.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('#sidebar-tabs-content .tab-panel').forEach(panel => {
        panel.classList.remove('active');
      });
      document.getElementById(tabId).classList.add('active');
    });
  });
}

/* ==========================================================================
   DRAG & DROP MODULE
   ========================================================================== */
let draggedData = null;
let draggedElement = null;

function setupDragAndDrop() {
  document.querySelectorAll('.block-item, .row-item').forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedElement = null;
      const type = item.getAttribute('data-type');
      const cols = item.getAttribute('data-cols');
      
      if (type) {
        draggedData = { kind: 'block', type };
      } else if (cols) {
        draggedData = { kind: 'row', cols };
      }
      e.dataTransfer.effectAllowed = 'copy';
    });
  });

  const canvas = document.getElementById('email-canvas');

  canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
    showDropIndicator(e);
  });

  canvas.addEventListener('dragleave', () => {
    removeDropIndicator();
  });

  canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    const indicator = document.querySelector('.dropzone-indicator');
    if (!indicator) {
      removeDropIndicator();
      return;
    }

    const targetCol = indicator.closest('.email-col');

    if (draggedElement) {
      draggedElement.classList.remove('dragging');
      if (draggedElement.contains(indicator)) {
        removeDropIndicator();
        return;
      }
      
      if (draggedElement.classList.contains('email-row')) {
        indicator.parentNode.insertBefore(draggedElement, indicator);
      } else if (draggedElement.classList.contains('email-element')) {
        if (targetCol) {
          indicator.parentNode.insertBefore(draggedElement, indicator);
        } else {
          showToast('Mova o elemento para dentro de uma coluna vazia ou existente.');
        }
      }
      draggedElement = null;
      removeDropIndicator();
      checkEmptyState();
      saveState();
      return;
    }

    if (draggedData) {
      if (draggedData.kind === 'row') {
        const newRow = createRowNode(draggedData.cols);
        indicator.parentNode.insertBefore(newRow, indicator);
      } else if (draggedData.kind === 'block') {
        if (targetCol) {
          const newBlock = createBlockNode(draggedData.type);
          indicator.parentNode.insertBefore(newBlock, indicator);
          if (draggedData.type === 'image') {
            openImageLayoutModal(newBlock);
          } else if (draggedData.type === 'icons') {
            openIconLibraryForBlock(newBlock);
          }
        } else {
          showToast('Arraste o bloco de conteúdo dentro de uma Coluna existente.');
        }
      }
    }

    removeDropIndicator();
    checkEmptyState();
    saveState();
  });
}

function showDropIndicator(e) {
  removeDropIndicator();
  const canvas = document.getElementById('email-canvas');
  const target = e.target;

  const indicator = document.createElement('div');
  indicator.className = 'dropzone-indicator';

  const element = target.closest('.email-element');
  const col = target.closest('.email-col');
  const row = target.closest('.email-row');

  const isRowDrag = draggedElement ? draggedElement.classList.contains('email-row') : (draggedData && draggedData.kind === 'row');

  if (isRowDrag) {
    if (row) {
      const rect = row.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      if (relativeY < rect.height / 2) {
        indicator.setAttribute('data-position', 'before');
        row.parentNode.insertBefore(indicator, row);
      } else {
        indicator.setAttribute('data-position', 'after');
        row.parentNode.insertBefore(indicator, row.nextSibling);
      }
    } else {
      indicator.setAttribute('data-position', 'append');
      canvas.appendChild(indicator);
    }
  } else {
    if (element) {
      const rect = element.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const colParent = element.parentElement;
      if (relativeY < rect.height / 2) {
        indicator.setAttribute('data-position', 'before');
        colParent.insertBefore(indicator, element);
      } else {
        indicator.setAttribute('data-position', 'after');
        colParent.insertBefore(indicator, element.nextSibling);
      }
    } else if (col) {
      indicator.setAttribute('data-position', 'append');
      col.appendChild(indicator);
    }
  }
}

function removeDropIndicator() {
  document.querySelectorAll('.dropzone-indicator').forEach(el => el.remove());
}

function insertNode(newNode, targetNode, position, fallbackParent) {
  if (!targetNode) {
    fallbackParent.appendChild(newNode);
    return;
  }
  if (position === 'before') {
    targetNode.parentNode.insertBefore(newNode, targetNode);
  } else if (position === 'after') {
    targetNode.parentNode.insertBefore(newNode, targetNode.nextSibling);
  } else {
    fallbackParent.appendChild(newNode);
  }
}

/* ==========================================================================
   NODE CREATION SYSTEM
   ========================================================================== */
function createRowNode(colPattern) {
  const row = document.createElement('div');
  row.className = 'email-row';
  row.setAttribute('data-col-pattern', colPattern);
  row.setAttribute('draggable', 'true');

  const toolbar = document.createElement('div');
  toolbar.className = 'row-toolbar';
  toolbar.innerHTML = `
    <button class="toolbar-btn row-move-up" title="Mover para cima">${icons.up}</button>
    <button class="toolbar-btn row-move-down" title="Mover para baixo">${icons.down}</button>
    <button class="toolbar-btn row-duplicate" title="Duplicar Row">${icons.duplicate}</button>
    <button class="toolbar-btn row-delete" style="background:var(--accent-danger);" title="Excluir Row">${icons.trash}</button>
  `;
  row.appendChild(toolbar);

  if (colPattern === 'header') {
    row.style.backgroundColor = '#1e1e24';
    
    const colLogo = document.createElement('div');
    colLogo.className = 'email-col';
    colLogo.style.flex = '0.4';
    
    const logoBlock = createBlockNode('image');
    getBlockRoot(logoBlock).innerHTML = `
      <img src="https://images.unsplash.com/photo-1599305445671-ec2c6c64a6d8?w=150&auto=format" style="max-height:40px; width:auto; display:block; text-align:left;" alt="Logo">
    `;
    colLogo.appendChild(logoBlock);

    const colMenu = document.createElement('div');
    colMenu.className = 'email-col';
    colMenu.style.flex = '0.6';
    
    const menuBlock = createBlockNode('menu');
    const menuLinks = menuBlock.querySelectorAll('a');
    menuLinks.forEach(lnk => lnk.style.color = '#ffffff');
    getBlockRoot(menuBlock).style.textAlign = 'right';
    colMenu.appendChild(menuBlock);

    row.appendChild(colLogo);
    row.appendChild(colMenu);
  } 
  else if (colPattern === 'hero') {
    row.style.backgroundColor = '#f0f0f2';
    
    const col = document.createElement('div');
    col.className = 'email-col';
    col.style.flex = '1';

    const imgBlock = createBlockNode('image');
    getBlockRoot(imgBlock).innerHTML = `<img src="https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=600&auto=format" style="width:100%; display:block;" alt="Hero Banner">`;
    col.appendChild(imgBlock);

    const titleBlock = createBlockNode('title');
    titleBlock.querySelector('h1').innerText = 'NOVA COLEÇÃO DE VERÃO';
    titleBlock.querySelector('h1').style.fontSize = '32px';
    col.appendChild(titleBlock);

    const textBlock = createBlockNode('paragraph');
    textBlock.querySelector('p').innerText = 'Explore as melhores tendências da estação com 20% de desconto usando o cupom VERÃO20.';
    col.appendChild(textBlock);

    const btnBlock = createBlockNode('button');
    col.appendChild(btnBlock);

    row.appendChild(col);
  }
  else if (colPattern === 'footer') {
    row.style.backgroundColor = '#0f0f13';
    
    const col = document.createElement('div');
    col.className = 'email-col';
    col.style.flex = '1';

    const socialBlock = createBlockNode('social');
    col.appendChild(socialBlock);

    const divBlock = createBlockNode('divider');
    divBlock.querySelector('hr').style.borderTopColor = '#272733';
    col.appendChild(divBlock);

    const textBlock = createBlockNode('paragraph');
    textBlock.querySelector('p').innerText = '© 2026 EmailBuilder Pro. Todos os direitos reservados.';
    textBlock.querySelector('p').style.color = '#6b6b7f';
    textBlock.querySelector('p').style.fontSize = '12px';
    col.appendChild(textBlock);

    row.appendChild(col);
  }
  else {
    row.style.backgroundColor = '#f0f0f2';
    let colFractions = [1];
    if (colPattern === '2') colFractions = [0.5, 0.5];
    else if (colPattern === '3') colFractions = [0.33, 0.33, 0.33];
    else if (colPattern === '4') colFractions = [0.25, 0.25, 0.25, 0.25];
    else if (colPattern === '30-70') colFractions = [0.3, 0.7];
    else if (colPattern === '70-30') colFractions = [0.7, 0.3];

    colFractions.forEach(frac => {
      const col = document.createElement('div');
      col.className = 'email-col';
      col.style.flex = frac;
      row.appendChild(col);
    });
  }

  // drag events
  row.addEventListener('dragstart', (e) => {
    draggedElement = row;
    row.classList.add('dragging');
    draggedData = null;
    e.stopPropagation();
  });
  row.addEventListener('dragend', () => {
    row.classList.remove('dragging');
  });

  setupRowToolbarEvents(row);
  row.addEventListener('click', (e) => {
    e.stopPropagation();
    selectElement(row);
  });

  return row;
}

function getBlockRoot(element) {
  return Array.from(element.children).find(child => !child.classList.contains('element-toolbar'));
}

function getBlockStyle(element, property) {
  const root = getBlockRoot(element);
  if (!root) return '';
  const type = element.getAttribute('data-block-type');

  if (property === 'fontFamily' || property === 'fontSize' || property === 'fontWeight' || property === 'color' || property === 'lineHeight') {
    if (type === 'menu') {
      const a = root.querySelector('a');
      if (a) return a.style[property] || window.getComputedStyle(a)[property];
    } else if (type === 'icons') {
      const span = root.querySelector('span');
      if (span) return span.style[property] || window.getComputedStyle(span)[property];
    } else if (type === 'list') {
      const li = root.querySelector('li');
      if (li) return li.style[property] || window.getComputedStyle(li)[property];
    } else if (type === 'table') {
      const cell = root.querySelector('th, td');
      if (cell) return cell.style[property] || window.getComputedStyle(cell)[property];
    } else if (type === 'sticker') {
      const span = root.querySelector('span');
      if (span) return span.style[property] || window.getComputedStyle(span)[property];
    }
  }

  switch (property) {
    case 'lineHeight': return root.style.lineHeight || '';
    case 'textAlign': return root.style.textAlign || 'left';
    case 'verticalAlign':
      return root.style.justifyContent === 'center' ? 'middle' :
             root.style.justifyContent === 'flex-end' ? 'bottom' :
             root.style.verticalAlign === 'middle' ? 'middle' :
             root.style.verticalAlign === 'bottom' ? 'bottom' : 'top';
    case 'width':
    case 'height':
      if (type === 'image') {
        const img = root.querySelector('img');
        if (img) return img.style[property] || '';
        const placeholder = root.querySelector('.image-placeholder');
        if (placeholder) return placeholder.style[property] || '';
      } else if (type === 'video') {
        const container = root.querySelector('.video-container') || root;
        return container.style[property] || '';
      } else if (type === 'sticker') {
        const span = root.querySelector('span') || root;
        return span.style[property] || '';
      }
      return root.style[property] || window.getComputedStyle(root)[property] || '';
  }

  return root.style[property] || window.getComputedStyle(root)[property] || '';
}

function getTableStyle(root, target) {
  if (target === 'border') {
    const td = root.querySelector('td') || root.querySelector('th');
    return td ? td.style.borderColor || '#e2e2ec' : '#e2e2ec';
  }
  if (target === 'header-bg') {
    const tr = root.querySelector('thead tr') || root.querySelector('tr');
    return tr ? tr.style.backgroundColor || '#f0efff' : '#f0efff';
  }
  if (target === 'row-bg') {
    const tr = root.querySelector('tbody tr');
    return tr ? tr.style.backgroundColor || '#ffffff' : '#ffffff';
  }
  return '';
}

function applyTableStyle(root, target, value) {
  if (target === 'border') {
    root.querySelectorAll('th, td, table').forEach(el => {
      el.style.borderColor = value;
      el.style.border = `1px solid ${value}`;
    });
  }
  if (target === 'header-bg') {
    root.querySelectorAll('thead tr, th').forEach(el => {
      el.style.backgroundColor = value;
    });
  }
  if (target === 'row-bg') {
    root.querySelectorAll('tbody tr, tbody td').forEach(el => {
      el.style.backgroundColor = value;
    });
  }
}

function applyBlockStyle(element, property, value) {
  const root = getBlockRoot(element);
  if (!root) return;

  const type = element.getAttribute('data-block-type');

  function applyTo(selector, prop, val) {
    root.style[prop] = val;
    root.querySelectorAll(selector).forEach(el => {
      el.style[prop] = val;
    });
  }

  if (property === 'fontFamily' || property === 'fontSize' || property === 'fontWeight' || property === 'color' || property === 'lineHeight') {
    if (type === 'menu') {
      applyTo('a', property, value);
    } else if (type === 'icons') {
      applyTo('span', property, value);
    } else if (type === 'list') {
      applyTo('li', property, value);
    } else if (type === 'table') {
      applyTo('th, td, span, a, p', property, value);
    } else if (type === 'sticker') {
      applyTo('span', property, value);
    } else {
      root.style[property] = value;
    }
  } else if (property === 'textAlign') {
    root.style.textAlign = value;
    if (type === 'button') {
      if (value === 'center') {
        root.style.display = 'inline-block';
        element.style.textAlign = 'center';
      } else if (value === 'left') {
        root.style.display = 'inline-block';
        element.style.textAlign = 'left';
      } else if (value === 'right') {
        root.style.display = 'inline-block';
        element.style.textAlign = 'right';
      } else if (value === 'justify') {
        root.style.display = 'block';
        root.style.width = '100%';
        root.style.textAlign = 'center';
        root.style.boxSizing = 'border-box';
      }
    } else if (type === 'image' || type === 'gif' || type === 'video') {
      element.style.textAlign = value;
      const grid = root.querySelector('.multi-img-grid');
      if (grid) {
        grid.style.justifyContent = value === 'left' ? 'flex-start' : value === 'right' ? 'flex-end' : 'center';
      }
      const img = root.querySelector('img') || root;
      if (img && img.tagName === 'IMG') {
        if (value === 'center') {
          img.style.marginLeft = 'auto';
          img.style.marginRight = 'auto';
          img.style.display = 'block';
        } else if (value === 'left') {
          img.style.marginLeft = '0';
          img.style.marginRight = 'auto';
          img.style.display = 'block';
        } else if (value === 'right') {
          img.style.marginLeft = 'auto';
          img.style.marginRight = '0';
          img.style.display = 'block';
        }
      }
    } else {
      root.style.textAlign = value;
    }
  } else if (property === 'width' || property === 'height') {
    if (type === 'image') {
      root.querySelectorAll('img').forEach(img => {
        img.style[property] = value;
        if (property === 'height' && value !== 'auto') {
          img.style.objectFit = 'cover';
        }
      });
      const placeholder = root.querySelector('.image-placeholder');
      if (placeholder) placeholder.style[property] = value;
    } else if (type === 'gif') {
      root.style[property] = value;
    } else if (type === 'video') {
      const container = root.querySelector('.video-container') || root;
      container.style[property] = value;
    } else if (type === 'button') {
      root.style[property] = value;
    } else if (type === 'table') {
      root.style[property] = value;
    } else if (type === 'spacer' && property === 'height') {
      root.style.height = value;
    } else if (type === 'sticker') {
      const span = root.querySelector('span') || root;
      if (property === 'width') {
        span.style.width = value;
      } else {
        span.style.height = value;
      }
    } else {
      root.style[property] = value;
    }
  } else if (property === 'verticalAlign') {
    if (type === 'table') {
      root.querySelectorAll('td').forEach(td => td.style.verticalAlign = value);
    } else {
      root.style.display = 'flex';
      root.style.flexDirection = 'column';
      if (value === 'top') {
        root.style.justifyContent = 'flex-start';
        root.style.verticalAlign = 'top';
      } else if (value === 'middle') {
        root.style.justifyContent = 'center';
        root.style.verticalAlign = 'middle';
      } else if (value === 'bottom') {
        root.style.justifyContent = 'flex-end';
        root.style.verticalAlign = 'bottom';
      }
    }
  } else {
    root.style[property] = value;
  }
}

function createBlockNode(type) {
  const wrapper = document.createElement('div');
  wrapper.className = 'email-element';
  wrapper.setAttribute('data-block-type', type);
  wrapper.setAttribute('draggable', 'true');

  const toolbar = document.createElement('div');
  toolbar.className = 'element-toolbar';
  toolbar.innerHTML = `
    <button class="toolbar-btn block-move-up" title="Mover">${icons.up}</button>
    <button class="toolbar-btn block-move-down" title="Mover">${icons.down}</button>
    <button class="toolbar-btn block-duplicate" title="Duplicar">${icons.duplicate}</button>
    <button class="toolbar-btn block-delete" style="background:var(--accent-danger);" title="Excluir">${icons.trash}</button>
  `;
  wrapper.appendChild(toolbar);

  const tpl = blockTemplates[type];
  const blockEl = document.createElement(tpl.tag);
  
  if (tpl.content) blockEl.innerHTML = tpl.content;
  if (tpl.src) blockEl.setAttribute('src', tpl.src);
  if (tpl.alt) blockEl.setAttribute('alt', tpl.alt);
  if (tpl.href) {
    blockEl.setAttribute('href', tpl.href);
    blockEl.setAttribute('target', '_blank');
  }

  if (tpl.style) {
    Object.keys(tpl.style).forEach(prop => {
      blockEl.style[prop] = tpl.style[prop];
    });
  }

  if (['h1', 'p', 'a', 'ul'].includes(tpl.tag)) {
    blockEl.classList.add('inline-edit');
    blockEl.setAttribute('contenteditable', 'true');
    blockEl.addEventListener('blur', () => {
      saveState();
    });
  }

  wrapper.appendChild(blockEl);
  
  // Drag elements
  wrapper.addEventListener('dragstart', (e) => {
    draggedElement = wrapper;
    wrapper.classList.add('dragging');
    draggedData = null;
    e.stopPropagation();
  });
  wrapper.addEventListener('dragend', () => {
    wrapper.classList.remove('dragging');
  });

  setupBlockToolbarEvents(wrapper);

  wrapper.addEventListener('click', (e) => {
    e.stopPropagation();
    selectElement(wrapper);
  });

  return wrapper;
}

/* ==========================================================================
   TOOLBAR EVENT BINDING
   ========================================================================== */
function setupRowToolbarEvents(row) {
  row.querySelector('.row-move-up').addEventListener('click', (e) => {
    e.stopPropagation();
    if (row.previousElementSibling && !row.previousElementSibling.classList.contains('canvas-empty-state')) {
      row.parentNode.insertBefore(row, row.previousElementSibling);
      saveState();
    }
  });

  row.querySelector('.row-move-down').addEventListener('click', (e) => {
    e.stopPropagation();
    if (row.nextElementSibling) {
      row.parentNode.insertBefore(row.nextElementSibling, row);
      saveState();
    }
  });

  row.querySelector('.row-duplicate').addEventListener('click', (e) => {
    e.stopPropagation();
    const clone = row.cloneNode(true);
    setupRowToolbarEvents(clone);
    clone.addEventListener('click', (e) => {
      e.stopPropagation();
      selectElement(clone);
    });
    
    clone.addEventListener('dragstart', (e) => {
      draggedElement = clone;
      clone.classList.add('dragging');
      draggedData = null;
      e.stopPropagation();
    });
    clone.addEventListener('dragend', () => {
      clone.classList.remove('dragging');
    });

    clone.querySelectorAll('.email-element').forEach(el => {
      setupBlockToolbarEvents(el);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        selectElement(el);
      });
      el.addEventListener('dragstart', (e) => {
        draggedElement = el;
        el.classList.add('dragging');
        draggedData = null;
        e.stopPropagation();
      });
      el.addEventListener('dragend', () => {
        el.classList.remove('dragging');
      });
      const editable = el.querySelector('.inline-edit');
      if (editable) {
        editable.addEventListener('blur', () => saveState());
      }
    });
    row.parentNode.insertBefore(clone, row.nextSibling);
    saveState();
  });

  row.querySelector('.row-delete').addEventListener('click', (e) => {
    e.stopPropagation();
    row.remove();
    deselectAll();
    checkEmptyState();
    saveState();
  });
}

function setupBlockToolbarEvents(block) {
  block.querySelector('.block-move-up').addEventListener('click', (e) => {
    e.stopPropagation();
    if (block.previousElementSibling && !block.previousElementSibling.classList.contains('element-toolbar')) {
      block.parentNode.insertBefore(block, block.previousElementSibling);
      saveState();
    }
  });

  block.querySelector('.block-move-down').addEventListener('click', (e) => {
    e.stopPropagation();
    if (block.nextElementSibling) {
      block.parentNode.insertBefore(block.nextElementSibling, block);
      saveState();
    }
  });

  block.querySelector('.block-duplicate').addEventListener('click', (e) => {
    e.stopPropagation();
    const clone = block.cloneNode(true);
    setupBlockToolbarEvents(clone);
    clone.addEventListener('click', (e) => {
      e.stopPropagation();
      selectElement(clone);
    });
    clone.addEventListener('dragstart', (e) => {
      draggedElement = clone;
      clone.classList.add('dragging');
      draggedData = null;
      e.stopPropagation();
    });
    clone.addEventListener('dragend', () => {
      clone.classList.remove('dragging');
    });
    const editable = clone.querySelector('.inline-edit');
    if (editable) {
      editable.addEventListener('blur', () => saveState());
    }
    block.parentNode.insertBefore(clone, block.nextSibling);
    saveState();
  });

  block.querySelector('.block-delete').addEventListener('click', (e) => {
    e.stopPropagation();
    block.remove();
    deselectAll();
    saveState();
  });
}

/* ==========================================================================
   SELECTION & PROPERTIES CONTROLS
   ========================================================================== */
function selectElement(element) {
  deselectAll();
  state.selectedElement = element;
  element.classList.add('selected');
  renderPropertiesPanel(element);
  document.getElementById('properties-panel').classList.add('active');
}

function deselectAll() {
  state.selectedElement = null;
  document.querySelectorAll('.email-row, .email-element').forEach(el => {
    el.classList.remove('selected');
  });
  document.getElementById('properties-panel').classList.remove('active');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('#email-canvas') && !e.target.closest('#main-sidebar') && !e.target.closest('.header-actions')) {
    deselectAll();
  }
});

function renderPropertiesPanel(element) {
  const panel = document.getElementById('properties-content');
  panel.innerHTML = '';

  const isRow = element.classList.contains('email-row');
  const type = element.getAttribute('data-block-type');

  if (isRow) {
    renderRowProperties(element, panel);
  } else {
    renderBlockProperties(element, type, panel);
  }
}

function renderRowProperties(row, container) {
  const layout = row.getAttribute('data-col-pattern');
  const rowBg = row.style.backgroundColor || 'transparent';
  const vAlign = row.style.alignItems || 'flex-start';

  container.innerHTML = `
    <div class="properties-panel">
      <div class="panel-header">Propriedades da Linha</div>
      
      <div class="settings-group-title">Cor de Fundo da Linha</div>
      <div class="form-group" style="flex-direction:row; gap:10px;">
        <input type="color" id="prop-row-bg" value="${rowBg !== 'transparent' ? rgbToHex(rowBg) : '#ffffff'}">
        <input type="text" id="prop-row-bg-text" value="${rowBg}" style="flex:1;">
        <button class="btn btn-outline" id="btn-clear-row-bg" style="padding:0 10px;">X</button>
      </div>

      <div class="settings-group-title">Alinhamento Vertical das Colunas</div>
      <div class="align-group">
        <button class="align-btn ${vAlign === 'flex-start' ? 'active' : ''}" id="row-align-top" title="Topo">${icons.alignTop}</button>
        <button class="align-btn ${vAlign === 'center' ? 'active' : ''}" id="row-align-middle" title="Meio">${icons.alignMiddle}</button>
        <button class="align-btn ${vAlign === 'flex-end' ? 'active' : ''}" id="row-align-bottom" title="Base">${icons.alignBottom}</button>
      </div>

      <div class="form-group" style="margin-top: 15px;">
        <label>Layout original: <strong>${layout} Coluna(s)</strong></label>
      </div>
      <div class="form-group">
        <label>Espaçamento Superior (Padding Top)</label>
        <div class="slider-container">
          <input type="range" id="prop-row-pad-top" min="0" max="80" value="${parseInt(row.style.paddingTop) || 0}">
          <span class="slider-val">${parseInt(row.style.paddingTop) || 0}px</span>
        </div>
      </div>
      <div class="form-group">
        <label>Espaçamento Inferior (Padding Bottom)</label>
        <div class="slider-container">
          <input type="range" id="prop-row-pad-bot" min="0" max="80" value="${parseInt(row.style.paddingBottom) || 0}">
          <span class="slider-val">${parseInt(row.style.paddingBottom) || 0}px</span>
        </div>
      </div>
    </div>
  `;

  const bgPicker = document.getElementById('prop-row-bg');
  const bgText = document.getElementById('prop-row-bg-text');
  
  bgPicker.addEventListener('input', (e) => {
    row.style.backgroundColor = e.target.value;
    bgText.value = e.target.value;
  });
  bgPicker.addEventListener('change', () => saveState());
  bgText.addEventListener('change', (e) => {
    row.style.backgroundColor = e.target.value;
    bgPicker.value = rgbToHex(e.target.value);
    saveState();
  });

  document.getElementById('btn-clear-row-bg').addEventListener('click', () => {
    row.style.backgroundColor = 'transparent';
    bgText.value = 'transparent';
    bgPicker.value = '#ffffff';
    saveState();
  });

  document.getElementById('row-align-top').addEventListener('click', () => { row.style.alignItems = 'flex-start'; saveState(); renderRowProperties(row, container); });
  document.getElementById('row-align-middle').addEventListener('click', () => { row.style.alignItems = 'center'; saveState(); renderRowProperties(row, container); });
  document.getElementById('row-align-bottom').addEventListener('click', () => { row.style.alignItems = 'flex-end'; saveState(); renderRowProperties(row, container); });

  const pTop = document.getElementById('prop-row-pad-top');
  pTop.addEventListener('input', (e) => {
    row.style.paddingTop = e.target.value + 'px';
    pTop.nextElementSibling.textContent = e.target.value + 'px';
  });
  pTop.addEventListener('change', () => saveState());

  const pBot = document.getElementById('prop-row-pad-bot');
  pBot.addEventListener('input', (e) => {
    row.style.paddingBottom = e.target.value + 'px';
    pBot.nextElementSibling.textContent = e.target.value + 'px';
  });
  pBot.addEventListener('change', () => saveState());
}

function renderBlockProperties(element, type, container) {
  const root = getBlockRoot(element);
  if (!root) return;

  const color = getBlockStyle(element, 'color');
  const fontFamily = getBlockStyle(element, 'fontFamily') || 'Arial, sans-serif';
  const fontSize = getBlockStyle(element, 'fontSize') || '16px';
  const fontWeight = getBlockStyle(element, 'fontWeight') || 'normal';
  const lineHeight = getBlockStyle(element, 'lineHeight') || '1.5';
  const textAlign = getBlockStyle(element, 'textAlign') || 'left';
  const verticalAlign = getBlockStyle(element, 'verticalAlign') || 'top';
  const width = getBlockStyle(element, 'width') || '100%';
  const height = getBlockStyle(element, 'height') || 'auto';
  const paddingTop = root.style.paddingTop || '0px';
  const paddingBottom = root.style.paddingBottom || '0px';

  let fieldsHTML = `
    <div class="settings-group">
      <div class="settings-group-title">Tipo: ${type.toUpperCase()}</div>
  `;

  if (['title', 'paragraph', 'list', 'button'].includes(type)) {
    fieldsHTML += `
      <div class="form-group">
        <label>Texto Interno</label>
        <input type="text" id="prop-text-content" class="form-input" value="${root.innerText || root.textContent}">
      </div>
    `;
  }

  if (['title', 'paragraph', 'list', 'button', 'menu', 'icons', 'sticker', 'table'].includes(type)) {
    fieldsHTML += `
      <div class="settings-group-title" style="margin-top:15px; border-top:1px solid var(--border-color); padding-top:10px;">Tipografia</div>
      <div class="form-group">
        <label>Família da Fonte</label>
        <select id="prop-font-family" class="form-input">
          <option value="Arial, sans-serif" ${fontFamily.includes('Arial') ? 'selected' : ''}>Arial</option>
          <option value="'Helvetica Neue', Helvetica, sans-serif" ${fontFamily.includes('Helvetica') ? 'selected' : ''}>Helvetica</option>
          <option value="'Trebuchet MS', sans-serif" ${fontFamily.includes('Trebuchet') ? 'selected' : ''}>Trebuchet MS</option>
          <option value="Georgia, serif" ${fontFamily.includes('Georgia') ? 'selected' : ''}>Georgia</option>
          <option value="'Courier New', Courier, monospace" ${fontFamily.includes('Courier') ? 'selected' : ''}>Courier New</option>
        </select>
      </div>
      <div class="form-group">
        <label>Cor do Texto</label>
        <div class="color-input-wrapper">
          <input type="color" id="prop-text-color" class="color-picker" value="${rgbToHex(color) || '#000000'}">
          <input type="text" id="prop-text-color-text" class="form-input" value="${color || '#000000'}">
        </div>
      </div>
      <div class="form-group">
        <label>Tamanho da Fonte</label>
        <div class="slider-container">
          <input type="range" id="prop-font-size" min="10" max="72" value="${parseInt(fontSize) || 16}">
          <span class="slider-val">${parseInt(fontSize) || 16}px</span>
        </div>
      </div>
      <div class="form-group">
        <label>Altura da Linha</label>
        <div class="slider-container">
          <input type="range" id="prop-line-height" min="1" max="3" step="0.1" value="${parseFloat(lineHeight) || 1.5}">
          <span class="slider-val">${parseFloat(lineHeight) || 1.5}</span>
        </div>
      </div>
      <div class="form-group">
        <label>Espessura da Fonte</label>
        <select id="prop-font-weight" class="form-input">
          <option value="normal" ${fontWeight === 'normal' ? 'selected' : ''}>Normal</option>
          <option value="bold" ${fontWeight === 'bold' ? 'selected' : ''}>Bold</option>
          <option value="300" ${fontWeight === '300' ? 'selected' : ''}>Light (300)</option>
          <option value="500" ${fontWeight === '500' ? 'selected' : ''}>Medium (500)</option>
          <option value="600" ${fontWeight === '600' ? 'selected' : ''}>Semi-Bold (600)</option>
          <option value="700" ${fontWeight === '700' ? 'selected' : ''}>Bold (700)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Alinhamento de Texto</label>
        <div class="align-toggle-group">
          <button class="align-btn ${textAlign === 'left' ? 'active' : ''}" id="align-left">${icons.alignLeft}</button>
          <button class="align-btn ${textAlign === 'center' ? 'active' : ''}" id="align-center">${icons.alignCenter}</button>
          <button class="align-btn ${textAlign === 'right' ? 'active' : ''}" id="align-right">${icons.alignRight}</button>
          <button class="align-btn ${textAlign === 'justify' ? 'active' : ''}" id="align-justify" title="Justificado">${icons.alignJustify}</button>
        </div>
      </div>
      <div class="settings-group-title" style="margin-top: 10px;">Alinhamento Vertical</div>
      <div class="align-group">
        <button class="align-btn ${verticalAlign === 'top' ? 'active' : ''}" id="align-top" title="Topo">${icons.alignTop}</button>
        <button class="align-btn ${verticalAlign === 'middle' ? 'active' : ''}" id="align-middle" title="Meio">${icons.alignMiddle}</button>
        <button class="align-btn ${verticalAlign === 'bottom' ? 'active' : ''}" id="align-bottom" title="Base">${icons.alignBottom}</button>
      </div>
    `;
  }

  if (['image', 'gif', 'video', 'button', 'table', 'spacer', 'sticker', 'icons'].includes(type)) {
    fieldsHTML += `
      <div class="settings-group-title" style="margin-top:15px; border-top:1px solid var(--border-color); padding-top:10px;">Dimensões & Alinhamento</div>
      <div class="form-group">
        <label>Largura</label>
        <div class="slider-container">
          <input type="range" id="prop-width" min="10" max="100" value="${parseInt(width) || 100}">
          <span class="slider-val">${parseInt(width) || 100}%</span>
        </div>
      </div>
      <div class="form-group">
        <label>Altura (0 para Auto)</label>
        <div class="slider-container">
          <input type="range" id="prop-height" min="0" max="500" step="1" value="${height === 'auto' || !height ? 0 : parseInt(height)}">
          <span class="slider-val">${height === 'auto' || !height ? 'auto' : height}</span>
        </div>
      </div>
    `;
    if (!['title', 'paragraph', 'list', 'button', 'menu', 'icons', 'sticker', 'table'].includes(type)) {
      fieldsHTML += `
        <div class="form-group">
          <label>Alinhamento</label>
          <div class="align-toggle-group">
            <button class="align-btn ${textAlign === 'left' ? 'active' : ''}" id="align-left">Esq</button>
            <button class="align-btn ${textAlign === 'center' ? 'active' : ''}" id="align-center">Center</button>
            <button class="align-btn ${textAlign === 'right' ? 'active' : ''}" id="align-right" title="Direita">${icons.alignRight}</button>
          </div>
        </div>
      `;
    }
    fieldsHTML += `
      <div class="settings-group-title" style="margin-top: 10px;">Alinhamento Vertical</div>
      <div class="align-group">
        <button class="align-btn ${verticalAlign === 'top' ? 'active' : ''}" id="align-top" title="Topo">${icons.alignTop}</button>
        <button class="align-btn ${verticalAlign === 'middle' ? 'active' : ''}" id="align-middle" title="Meio">${icons.alignMiddle}</button>
        <button class="align-btn ${verticalAlign === 'bottom' ? 'active' : ''}" id="align-bottom" title="Base">${icons.alignBottom}</button>
      </div>
    `;
  }

  if (type === 'menu') {
    fieldsHTML += `
      <div class="settings-group-title" style="margin-top:15px; border-top:1px solid var(--border-color); padding-top:10px;">Itens do Menu</div>
      <div id="menu-items-editor-list" style="display:flex; flex-direction:column; gap:10px;">
    `;
    root.querySelectorAll('a').forEach((a, idx) => {
      const label = a.innerText || 'Link';
      const url = a.getAttribute('href') || '#';
      const isBlank = a.getAttribute('target') === '_blank';
      fieldsHTML += `
        <div class="menu-item-card" data-idx="${idx}" style="border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:10px; background:var(--bg-app); margin-bottom:5px; position:relative;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <strong>Item #${idx + 1}</strong>
            <button class="btn btn-icon btn-remove-menu-item" data-idx="${idx}" style="padding:2px 6px; font-size:11px; background:var(--accent-danger); color:#fff; border:none;">X</button>
          </div>
          <div class="form-group" style="margin-bottom:6px;">
            <label style="font-size:11px; margin-bottom:2px;">Texto</label>
            <input type="text" class="form-input prop-menu-item-text" data-idx="${idx}" value="${label}" style="padding:4px 8px; font-size:12px;">
          </div>
          <div class="form-group" style="margin-bottom:6px;">
            <label style="font-size:11px; margin-bottom:2px;">Link (URL)</label>
            <input type="text" class="form-input prop-menu-item-url" data-idx="${idx}" value="${url}" style="padding:4px 8px; font-size:12px;">
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <label style="font-size:11px; cursor:pointer;"><input type="checkbox" class="prop-menu-item-target" data-idx="${idx}" ${isBlank ? 'checked' : ''}> Nova Aba</label>
            <button class="btn prop-menu-item-icon" data-idx="${idx}" style="padding:3px 6px; font-size:11px;">Escolher Ícone</button>
          </div>
        </div>
      `;
    });
    fieldsHTML += `
      </div>
      <button class="btn btn-primary" id="btn-add-menu-item" style="width:100%; margin-top:10px; font-size:12px;">Adicionar Novo Item</button>
    `;
  }

  if (type === 'button') {
    fieldsHTML += `
      <div class="settings-group-title" style="margin-top:15px; border-top:1px solid var(--border-color); padding-top:10px;">Configuração Botão</div>
      <div class="form-group">
        <label>URL do Link</label>
        <input type="text" id="prop-btn-href" class="form-input" value="${root.getAttribute('href') || ''}">
      </div>
      <div class="form-group">
        <label>Cor de Fundo do Botão</label>
        <div class="color-input-wrapper">
          <input type="color" id="prop-btn-bg" class="color-picker" value="${rgbToHex(root.style.backgroundColor) || '#635bff'}">
          <input type="text" id="prop-btn-bg-text" class="form-input" value="${root.style.backgroundColor || '#635bff'}">
        </div>
      </div>
      <div class="form-group">
        <label>Arredondamento Borda</label>
        <div class="slider-container">
          <input type="range" id="prop-btn-radius" min="0" max="30" value="${parseInt(root.style.borderRadius) || 0}">
          <span class="slider-val">${parseInt(root.style.borderRadius) || 0}px</span>
        </div>
      </div>
    `;
  }

  if (type === 'image') {
    const hasGrid = !!root.querySelector('.multi-img-grid');
    const activeLayout = hasGrid ? root.querySelector('.multi-img-grid').classList.contains('grid-3') ? '3' : '6' : '1';

    fieldsHTML += `
      <div class="settings-group-title" style="margin-top:15px; border-top:1px solid var(--border-color); padding-top:10px;">Opções de Galeria</div>
      <div class="form-group">
        <label>Layout da Imagem</label>
        <div class="layout-picker-grid">
          <button class="layout-choice-btn ${activeLayout === '1' ? 'active' : ''}" data-layout="1">1 Foto</button>
          <button class="layout-choice-btn ${activeLayout === '3' ? 'active' : ''}" data-layout="3">3 Fotos</button>
          <button class="layout-choice-btn ${activeLayout === '6' ? 'active' : ''}" data-layout="6">6 Fotos</button>
        </div>
      </div>
    `;

    const images = root.querySelectorAll('img');
    if (images.length > 0) {
      fieldsHTML += `<div class="form-group" style="margin-top:15px;"><label>Fotos Atuais</label></div>`;
      images.forEach((img, index) => {
        fieldsHTML += `
          <div class="form-group" style="border-left:2px solid var(--primary); padding-left:10px; margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <label>Foto #${index + 1}</label>
              <button class="btn btn-remove-grid-image" data-index="${index}" style="padding:2px 6px; font-size:10px; background:var(--accent-danger); color:#fff; border:none;">Remover</button>
            </div>
            <input type="file" class="form-input prop-grid-upload" data-index="${index}" accept="image/*" style="margin-top:5px;">
            <input type="text" class="form-input prop-grid-src" data-index="${index}" value="${img.getAttribute('src') || ''}" style="margin-top:5px; font-size:11px;">
          </div>
        `;
      });
    }
  }

  if (type === 'social') {
    const wrapper = root.querySelector('.social-wrapper') || root;
    const firstPath = wrapper.querySelector('svg path');
    const socialColor = firstPath ? firstPath.getAttribute('fill') || '#635bff' : '#635bff';
    const firstLink = wrapper.querySelector('a');
    const socialBg = firstLink ? firstLink.style.backgroundColor || 'transparent' : 'transparent';
    const socialRadius = firstLink ? parseInt(firstLink.style.borderRadius) || 0 : 0;
    const socialSize = wrapper.querySelector('svg') ? parseInt(wrapper.querySelector('svg').getAttribute('width')) || 24 : 24;

    fieldsHTML += `
      <div class="settings-group-title" style="margin-top:15px; border-top:1px solid var(--border-color); padding-top:10px;">Estilos Sociais</div>
      <div class="form-group">
        <label>Cor dos Ícones</label>
        <div class="color-input-wrapper">
          <input type="color" id="prop-social-color" class="color-picker" value="${rgbToHex(socialColor) || '#635bff'}">
          <input type="text" id="prop-social-color-text" class="form-input" value="${socialColor || '#635bff'}">
        </div>
      </div>
      <div class="form-group">
        <label>Cor de Fundo do Container</label>
        <div class="color-input-wrapper">
          <input type="color" id="prop-social-bg" class="color-picker" value="${rgbToHex(socialBg) || '#ffffff'}">
          <input type="text" id="prop-social-bg-text" class="form-input" value="${socialBg || 'transparent'}">
        </div>
      </div>
      <div class="form-group">
        <label>Tamanho do Ícone</label>
        <div class="slider-container">
          <input type="range" id="prop-social-size" min="16" max="48" value="${socialSize}">
          <span class="slider-val">${socialSize}px</span>
        </div>
      </div>
      <div class="form-group">
        <label>Arredondamento Fundo (Radius)</label>
        <div class="slider-container">
          <input type="range" id="prop-social-radius" min="0" max="50" value="${socialRadius}">
          <span class="slider-val">${socialRadius}px</span>
        </div>
      </div>
      <div class="form-group"><label>Canais Disponíveis</label></div>
    `;
    
    Object.keys(socialIcons).forEach(key => {
      const activeLink = wrapper.querySelector(`a[data-network="${key}"]`);
      const isChecked = !!activeLink;
      const currentUrl = activeLink ? activeLink.getAttribute('href') : socialIcons[key].url;

      fieldsHTML += `
        <div class="form-group" style="border-left:2px solid var(--primary); padding-left:10px; margin-bottom:15px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-weight:600; font-size:13px;">${socialIcons[key].label}</span>
            <input type="checkbox" class="prop-social-toggle" data-network="${key}" ${isChecked ? 'checked' : ''}>
          </div>
          <input type="text" class="form-input prop-social-url" data-network="${key}" value="${currentUrl}" style="margin-top:5px; font-size:11px;" ${!isChecked ? 'disabled' : ''}>
        </div>
      `;
    });
  }

  if (type === 'video') {
    const isEmbed = !!root.querySelector('iframe');
    const isLocal = !!root.querySelector('video') && root.querySelector('video').src.startsWith('data:');
    const currentMode = isEmbed ? 'embed' : (isLocal ? 'local' : 'url');
    
    fieldsHTML += `
      <div class="settings-group-title" style="margin-top:15px; border-top:1px solid var(--border-color); padding-top:10px;">Opções de Vídeo</div>
      <div class="form-group">
        <label>Tipo de Origem</label>
        <select id="prop-video-mode" class="form-input">
          <option value="url" ${currentMode === 'url' ? 'selected' : ''}>Link do Vídeo</option>
          <option value="local" ${currentMode === 'local' ? 'selected' : ''}>Upload de Vídeo Local</option>
          <option value="embed" ${currentMode === 'embed' ? 'selected' : ''}>Código Embed (Iframe)</option>
        </select>
      </div>
    `;

    if (currentMode === 'embed') {
      const iframeCode = root.querySelector('iframe') ? root.querySelector('iframe').outerHTML : '';
      fieldsHTML += `
        <div class="form-group">
          <label>Código Iframe Embed</label>
          <textarea id="prop-video-embed" class="form-input" style="height:100px; font-family:monospace;">${iframeCode}</textarea>
        </div>
      `;
    } else if (currentMode === 'local') {
      fieldsHTML += `
        <div class="form-group">
          <label>Upload de Vídeo (.mp4)</label>
          <input type="file" id="prop-video-file-upload" class="form-input" accept="video/*">
        </div>
      `;
    } else {
      const videoSrc = root.querySelector('video') ? root.querySelector('video').getAttribute('src') : '';
      fieldsHTML += `
        <div class="form-group">
          <label>URL do Vídeo (.mp4 ou streaming)</label>
          <input type="text" id="prop-video-url-src" class="form-input" value="${videoSrc}">
        </div>
      `;
    }

    const videoEl = root.querySelector('video');
    const isAutoplay = videoEl ? videoEl.hasAttribute('autoplay') : false;
    const isLoop = videoEl ? videoEl.hasAttribute('loop') : false;
    const isMuted = videoEl ? videoEl.hasAttribute('muted') : false;
    const isControls = videoEl ? videoEl.hasAttribute('controls') : true;

    if (currentMode !== 'embed') {
      fieldsHTML += `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top:10px;">
          <label style="font-size:12px; cursor:pointer;"><input type="checkbox" id="prop-video-autoplay" ${isAutoplay ? 'checked' : ''}> Autoplay</label>
          <label style="font-size:12px; cursor:pointer;"><input type="checkbox" id="prop-video-loop" ${isLoop ? 'checked' : ''}> Loop</label>
          <label style="font-size:12px; cursor:pointer;"><input type="checkbox" id="prop-video-muted" ${isMuted ? 'checked' : ''}> Muted</label>
          <label style="font-size:12px; cursor:pointer;"><input type="checkbox" id="prop-video-controls" ${isControls ? 'checked' : ''}> Controles</label>
        </div>
      `;
    }
  }

  if (type === 'gif') {
    fieldsHTML += `
      <div class="settings-group-title" style="margin-top:15px; border-top:1px solid var(--border-color); padding-top:10px;">Opções de GIF</div>
      <div class="form-group">
        <label>URL do GIF</label>
        <input type="text" id="prop-gif-src" class="form-input" value="${root.getAttribute('src') || ''}">
      </div>
    `;
  }

  if (type === 'sticker') {
    const stickerSpan = root.querySelector('span') || root;
    fieldsHTML += `
      <div class="settings-group-title" style="margin-top:15px; border-top:1px solid var(--border-color); padding-top:10px;">Sticker Emoji</div>
      <div class="form-group">
        <label>Emoji / Sticker</label>
        <input type="text" id="prop-sticker-emoji" class="form-input" value="${stickerSpan ? stickerSpan.innerText : '🎉'}">
      </div>
    `;
  }

  if (type === 'spacer') {
    const spacerBg = root.style.backgroundColor || 'transparent';
    const spacerOpacity = root.style.opacity || '1';
    const spacerMarginTop = root.style.marginTop || '0px';
    const spacerMarginBottom = root.style.marginBottom || '0px';
    fieldsHTML += `
      <div class="settings-group-title" style="margin-top:15px; border-top:1px solid var(--border-color); padding-top:10px;">Separador Visual</div>
      <div class="form-group">
        <label>Cor de Fundo</label>
        <div class="color-input-wrapper">
          <input type="color" id="prop-spacer-bg" class="color-picker" value="${rgbToHex(spacerBg) || '#ffffff'}">
          <input type="text" id="prop-spacer-bg-text" class="form-input" value="${spacerBg}">
        </div>
      </div>
      <div class="form-group">
        <label>Opacidade (Transparência)</label>
        <div class="slider-container">
          <input type="range" id="prop-spacer-opacity" min="0" max="1" step="0.1" value="${parseFloat(spacerOpacity)}">
          <span class="slider-val">${spacerOpacity}</span>
        </div>
      </div>
      <div class="form-group">
        <label>Margem Superior</label>
        <div class="slider-container">
          <input type="range" id="prop-spacer-margin-top" min="0" max="80" value="${parseInt(spacerMarginTop) || 0}">
          <span class="slider-val">${parseInt(spacerMarginTop) || 0}px</span>
        </div>
      </div>
      <div class="form-group">
        <label>Margem Inferior</label>
        <div class="slider-container">
          <input type="range" id="prop-spacer-margin-bottom" min="0" max="80" value="${parseInt(spacerMarginBottom) || 0}">
          <span class="slider-val">${parseInt(spacerMarginBottom) || 0}px</span>
        </div>
      </div>
    `;
  }

  if (type === 'icons') {
    fieldsHTML += `
      <div class="settings-group-title" style="margin-top:15px; border-top:1px solid var(--border-color); padding-top:10px;">Configuração Ícone</div>
      <div class="form-group">
        <button class="btn btn-primary" id="btn-change-icon-library" style="width:100%;">Escolher Outro Ícone</button>
      </div>
      <div class="form-group">
        <label>Link (URL do Ícone)</label>
        <input type="text" id="prop-icon-link" class="form-input" value="${root.querySelector('a')?.getAttribute('href') || ''}" placeholder="Ex: http://...">
      </div>
      <div class="form-group">
        <label>Cor de Fundo do Círculo</label>
        <div class="color-input-wrapper">
          <input type="color" id="prop-icon-circle-bg" class="color-picker" value="${rgbToHex(root.style.backgroundColor) || '#ffffff'}">
          <input type="text" id="prop-icon-circle-bg-text" class="form-input" value="${root.style.backgroundColor || 'transparent'}">
        </div>
      </div>
      <div class="form-group">
        <label>Arredondamento Borda Círculo</label>
        <div class="slider-container">
          <input type="range" id="prop-icon-radius" min="0" max="50" value="${parseInt(root.style.borderRadius) || 0}">
          <span class="slider-val">${parseInt(root.style.borderRadius) || 0}px</span>
        </div>
      </div>
    `;
  }

  if (type === 'table') {
    const tableBorder = getTableStyle(root, 'border');
    const tableHeaderBg = getTableStyle(root, 'header-bg');
    const tableRowBg = getTableStyle(root, 'row-bg');
    const borderWidth = root.querySelector('td')?.style.borderWidth || '1px';

    fieldsHTML += `
      <div class="settings-group-title" style="margin-top:15px; border-top:1px solid var(--border-color); padding-top:10px;">Estrutura da Tabela</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:15px;">
        <button class="btn" id="btn-table-add-row" style="font-size:11px;">Nova Linha</button>
        <button class="btn" id="btn-table-add-col" style="font-size:11px;">Nova Coluna</button>
        <button class="btn" id="btn-table-remove-row" style="font-size:11px; background:var(--accent-danger); color:#fff; border:none;">Remover Linha</button>
        <button class="btn" id="btn-table-remove-col" style="font-size:11px; background:var(--accent-danger); color:#fff; border:none;">Remover Coluna</button>
      </div>

      <div class="settings-group-title">Estilo da Tabela</div>
      <div class="form-group">
        <label>Cor da Borda</label>
        <div class="color-input-wrapper">
          <input type="color" id="prop-table-border-color" class="color-picker" value="${rgbToHex(tableBorder) || '#e2e2ec'}">
          <input type="text" id="prop-table-border-text" class="form-input" value="${tableBorder || '#e2e2ec'}">
        </div>
      </div>
      <div class="form-group">
        <label>Espessura Borda</label>
        <div class="slider-container">
          <input type="range" id="prop-table-border-width" min="1" max="10" value="${parseInt(borderWidth) || 1}">
          <span class="slider-val">${parseInt(borderWidth) || 1}px</span>
        </div>
      </div>
      <div class="form-group">
        <label>Cor de Fundo do Header</label>
        <div class="color-input-wrapper">
          <input type="color" id="prop-table-header-bg" class="color-picker" value="${rgbToHex(tableHeaderBg) || '#f0efff'}">
          <input type="text" id="prop-table-header-bg-text" class="form-input" value="${tableHeaderBg || '#f0efff'}">
        </div>
      </div>
      <div class="form-group">
        <label>Cor de Fundo das Linhas</label>
        <div class="color-input-wrapper">
          <input type="color" id="prop-table-row-bg" class="color-picker" value="${rgbToHex(tableRowBg) || '#ffffff'}">
          <input type="text" id="prop-table-row-bg-text" class="form-input" value="${tableRowBg || '#ffffff'}">
        </div>
      </div>
    `;
  }

  fieldsHTML += `
      <div class="form-group" style="margin-top:20px; border-top:1px solid var(--border-color); padding-top:15px;">
        <label>Padding Superior</label>
        <div class="slider-container">
          <input type="range" id="prop-pad-top" min="0" max="80" value="${parseInt(paddingTop) || 0}">
          <span class="slider-val">${parseInt(paddingTop) || 0}px</span>
        </div>
      </div>
      <div class="form-group">
        <label>Padding Inferior</label>
        <div class="slider-container">
          <input type="range" id="prop-pad-bot" min="0" max="80" value="${parseInt(paddingBottom) || 0}">
          <span class="slider-val">${parseInt(paddingBottom) || 0}px</span>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = fieldsHTML;

  if (type === 'menu') {
    container.querySelectorAll('.prop-menu-item-text').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(input.getAttribute('data-idx'));
        const aElements = root.querySelectorAll('a');
        if (aElements[idx]) aElements[idx].innerText = e.target.value;
      });
      input.addEventListener('change', () => saveState());
    });
    container.querySelectorAll('.prop-menu-item-url').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(input.getAttribute('data-idx'));
        const aElements = root.querySelectorAll('a');
        if (aElements[idx]) aElements[idx].setAttribute('href', e.target.value);
      });
      input.addEventListener('change', () => saveState());
    });
    container.querySelectorAll('.prop-menu-item-target').forEach(chk => {
      chk.addEventListener('change', () => {
        const idx = parseInt(chk.getAttribute('data-idx'));
        const aElements = root.querySelectorAll('a');
        if (aElements[idx]) aElements[idx].setAttribute('target', chk.checked ? '_blank' : '_self');
        saveState();
      });
    });
    container.querySelectorAll('.prop-menu-item-icon').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'));
        openIconLibraryModal((svgString) => {
          const aElements = root.querySelectorAll('a');
          if (aElements[idx]) {
            const currentText = aElements[idx].innerText;
            aElements[idx].innerHTML = `${svgString} <span>${currentText}</span>`;
            saveState();
            renderPropertiesPanel(element);
          }
        });
      });
    });
    document.getElementById('btn-add-menu-item').addEventListener('click', () => {
      const wrapper = root.querySelector('.menu-wrapper') || root;
      const newA = document.createElement('a');
      newA.setAttribute('href', '#'); newA.setAttribute('target', '_self');
      newA.style.cssText = "margin: 0 12px; text-decoration:none; color:#1e1e24; font-size:14px; display: inline-flex; align-items: center; vertical-align: middle; gap: 4px;";
      newA.innerText = "Novo Link";
      wrapper.appendChild(newA);
      saveState();
      renderPropertiesPanel(element);
    });
    container.querySelectorAll('.btn-remove-menu-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'));
        const aElements = root.querySelectorAll('a');
        if (aElements[idx]) {
          aElements[idx].remove();
          saveState();
          renderPropertiesPanel(element);
        }
      });
    });
  }

  if (document.getElementById('prop-text-content')) {
    document.getElementById('prop-text-content').addEventListener('input', (e) => { root.innerText = e.target.value; });
    document.getElementById('prop-text-content').addEventListener('change', () => saveState());
  }

  if (document.getElementById('prop-font-family')) {
    document.getElementById('prop-font-family').addEventListener('change', (e) => { applyBlockStyle(element, 'fontFamily', e.target.value); saveState(); });
  }

  if (document.getElementById('prop-text-color')) {
    const textCol = document.getElementById('prop-text-color');
    const textColText = document.getElementById('prop-text-color-text');
    textCol.addEventListener('input', (e) => { applyBlockStyle(element, 'color', e.target.value); textColText.value = e.target.value; });
    textColText.addEventListener('input', (e) => { applyBlockStyle(element, 'color', e.target.value); textCol.value = rgbToHex(e.target.value); });
    textCol.addEventListener('change', () => saveState());
    textColText.addEventListener('change', () => saveState());
  }

  if (document.getElementById('prop-font-size')) setupPropSlider(element, 'prop-font-size', 'fontSize', 'px');
  if (document.getElementById('prop-line-height')) setupPropSlider(element, 'prop-line-height', 'lineHeight', '');
  if (document.getElementById('prop-font-weight')) {
    document.getElementById('prop-font-weight').addEventListener('change', (e) => { applyBlockStyle(element, 'fontWeight', e.target.value); saveState(); });
  }

  if (document.getElementById('align-left')) {
    document.getElementById('align-left').addEventListener('click', () => { applyBlockStyle(element, 'textAlign', 'left'); selectElement(element); saveState(); });
    document.getElementById('align-center').addEventListener('click', () => { applyBlockStyle(element, 'textAlign', 'center'); selectElement(element); saveState(); });
    document.getElementById('align-right').addEventListener('click', () => { applyBlockStyle(element, 'textAlign', 'right'); selectElement(element); saveState(); });
    if (document.getElementById('align-justify')) document.getElementById('align-justify').addEventListener('click', () => { applyBlockStyle(element, 'textAlign', 'justify'); selectElement(element); saveState(); });
  }

  if (document.getElementById('align-top')) {
    document.getElementById('align-top').addEventListener('click', () => { applyBlockStyle(element, 'verticalAlign', 'top'); selectElement(element); saveState(); });
    document.getElementById('align-middle').addEventListener('click', () => { applyBlockStyle(element, 'verticalAlign', 'middle'); selectElement(element); saveState(); });
    document.getElementById('align-bottom').addEventListener('click', () => { applyBlockStyle(element, 'verticalAlign', 'bottom'); selectElement(element); saveState(); });
  }

  if (document.getElementById('prop-row-pad-top')) {
    const pTop = document.getElementById('prop-row-pad-top');
    pTop.addEventListener('input', (e) => {
      row.style.paddingTop = e.target.value + 'px';
      pTop.nextElementSibling.textContent = e.target.value + 'px';
    });
    pTop.addEventListener('change', () => saveState());
  }

  if (document.getElementById('prop-row-pad-bot')) {
    const pBot = document.getElementById('prop-row-pad-bot');
    pBot.addEventListener('input', (e) => {
      row.style.paddingBottom = e.target.value + 'px';
      pBot.nextElementSibling.textContent = e.target.value + 'px';
    });
    pBot.addEventListener('change', () => saveState());
  }

  if (document.getElementById('prop-width')) setupPropSlider(element, 'prop-width', 'width', '%');
  if (document.getElementById('prop-height')) {
    const hSlider = document.getElementById('prop-height');
    hSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      const strVal = val === 0 ? 'auto' : val + 'px';
      applyBlockStyle(element, 'height', strVal);
      applyBlockStyle(element, 'objectFit', 'cover');
      hSlider.nextElementSibling.textContent = strVal;
    });
    hSlider.addEventListener('change', () => saveState());
  }

  if (type === 'button') {
    const btnHref = document.getElementById('prop-btn-href');
    const btnBg = document.getElementById('prop-btn-bg');
    const btnBgText = document.getElementById('prop-btn-bg-text');
    btnHref.addEventListener('input', (e) => { root.setAttribute('href', e.target.value); });
    btnHref.addEventListener('change', () => saveState());
    btnBg.addEventListener('input', (e) => { root.style.backgroundColor = e.target.value; btnBgText.value = e.target.value; });
    btnBgText.addEventListener('input', (e) => { root.style.backgroundColor = e.target.value; btnBg.value = rgbToHex(e.target.value); });
    btnBg.addEventListener('change', () => saveState());
    btnBgText.addEventListener('change', () => saveState());
    const bRadiusSlider = document.getElementById('prop-btn-radius');
    bRadiusSlider.addEventListener('input', (e) => { root.style.borderRadius = e.target.value + 'px'; bRadiusSlider.nextElementSibling.textContent = e.target.value + 'px'; });
    bRadiusSlider.addEventListener('change', () => saveState());
  }

  if (type === 'image') {
    container.querySelectorAll('.layout-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const layout = btn.getAttribute('data-layout');
        let newContent = '';
        if (layout === '1') newContent = `<img src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format" style="width:100%; display:block; margin:0 auto;" alt="Foto 1">`;
        else if (layout === '3') newContent = `<div class="multi-img-grid grid-3"><img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format" alt="1"><img src="https://images.unsplash.com/photo-1519046904884-53103b34b206?w=200&auto=format" alt="2"><img src="https://images.unsplash.com/photo-1473116763269-255ea7604668?w=200&auto=format" alt="3"></div>`;
        else if (layout === '6') newContent = `<div class="multi-img-grid grid-6"><img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format" alt="1"><img src="https://images.unsplash.com/photo-1519046904884-53103b34b206?w=200&auto=format" alt="2"><img src="https://images.unsplash.com/photo-1473116763269-255ea7604668?w=200&auto=format" alt="3"><img src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=200&auto=format" alt="4"><img src="https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=200&auto=format" alt="5"><img src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&auto=format" alt="6"></div>`;
        root.innerHTML = newContent; root.classList.remove('image-placeholder'); saveState(); renderPropertiesPanel(element);
      });
    });
    const images = root.querySelectorAll('img');
    container.querySelectorAll('.prop-grid-upload').forEach(input => {
      input.addEventListener('change', (e) => {
        const index = parseInt(input.getAttribute('data-index'));
        const file = e.target.files[0];
        if (file && images[index]) {
          const reader = new FileReader();
          reader.onload = (event) => { images[index].setAttribute('src', event.target.result); container.querySelector(`.prop-grid-src[data-index="${index}"]`).value = event.target.result; saveState(); };
          reader.readAsDataURL(file);
        }
      });
    });
    container.querySelectorAll('.prop-grid-src').forEach(input => {
      input.addEventListener('input', (e) => { const index = parseInt(input.getAttribute('data-index')); if (images[index]) images[index].setAttribute('src', e.target.value); });
      input.addEventListener('change', () => saveState());
    });
    container.querySelectorAll('.btn-remove-grid-image').forEach(btn => {
      btn.addEventListener('click', () => { const index = parseInt(btn.getAttribute('data-index')); if (images[index]) { images[index].remove(); saveState(); renderPropertiesPanel(element); } });
    });
  }

  if (type === 'social') {
    const wrapper = root.querySelector('.social-wrapper') || root;
    const sCol = document.getElementById('prop-social-color');
    const sColText = document.getElementById('prop-social-color-text');
    const sBg = document.getElementById('prop-social-bg');
    const sBgText = document.getElementById('prop-social-bg-text');

    sCol.addEventListener('input', (e) => { applyBlockStyle(element, 'color', e.target.value); sColText.value = e.target.value; });
    sColText.addEventListener('input', (e) => { applyBlockStyle(element, 'color', e.target.value); sCol.value = rgbToHex(e.target.value); });
    sCol.addEventListener('change', () => saveState());
    sColText.addEventListener('change', () => saveState());

    sBg.addEventListener('input', (e) => { wrapper.querySelectorAll('a').forEach(a => { a.style.backgroundColor = e.target.value; a.style.display = 'inline-flex'; a.style.alignItems = 'center'; a.style.justifyContent = 'center'; a.style.padding = '8px'; }); sBgText.value = e.target.value; });
    sBgText.addEventListener('input', (e) => { wrapper.querySelectorAll('a').forEach(a => { a.style.backgroundColor = e.target.value; a.style.display = 'inline-flex'; a.style.alignItems = 'center'; a.style.justifyContent = 'center'; a.style.padding = '8px'; }); sBg.value = rgbToHex(e.target.value); });
    sBg.addEventListener('change', () => saveState());
    sBgText.addEventListener('change', () => saveState());

    const sizeSlider = document.getElementById('prop-social-size');
    sizeSlider.addEventListener('input', (e) => { wrapper.querySelectorAll('svg').forEach(svg => { svg.setAttribute('width', e.target.value); svg.setAttribute('height', e.target.value); }); sizeSlider.nextElementSibling.textContent = e.target.value + 'px'; });
    sizeSlider.addEventListener('change', () => saveState());

    const radiusSlider = document.getElementById('prop-social-radius');
    radiusSlider.addEventListener('input', (e) => { wrapper.querySelectorAll('a').forEach(a => { a.style.borderRadius = e.target.value + 'px'; }); radiusSlider.nextElementSibling.textContent = e.target.value + 'px'; });
    radiusSlider.addEventListener('change', () => saveState());

    container.querySelectorAll('.prop-social-toggle').forEach(chk => {
      chk.addEventListener('change', () => {
        const net = chk.getAttribute('data-network');
        const urlInput = container.querySelector(`.prop-social-url[data-network="${net}"]`);
        urlInput.disabled = !chk.checked;
        rebuildSocialGrid(wrapper, container);
      });
    });
    container.querySelectorAll('.prop-social-url').forEach(input => {
      input.addEventListener('input', (e) => { const net = input.getAttribute('data-network'); const linkEl = wrapper.querySelector(`a[data-network="${net}"]`); if (linkEl) linkEl.setAttribute('href', e.target.value); });
      input.addEventListener('change', () => saveState());
    });
  }

  if (type === 'video') {
    const modeSelect = document.getElementById('prop-video-mode');
    modeSelect.addEventListener('change', (e) => {
      const mode = e.target.value;
      if (mode === 'embed') root.innerHTML = `<div class="video-container" style="max-width:100%; height:auto;"><iframe width="100%" height="250" src="https://www.youtube.com/embed/tgbNymZ7vqY" frameborder="0" allowfullscreen></iframe></div>`;
      else if (mode === 'local') root.innerHTML = `<div class="video-container" style="max-width:100%; height:auto;"><video width="100%" height="auto" controls style="display:block;"><source src="" type="video/mp4">Seu navegador não suporta vídeos.</video></div>`;
      else root.innerHTML = `<div class="video-container" style="max-width:100%; height:auto;"><video width="100%" height="auto" controls style="display:block;"><source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4">Seu navegador não suporta vídeos.</video></div>`;
      saveState(); renderPropertiesPanel(element);
    });
    if (document.getElementById('prop-video-embed')) document.getElementById('prop-video-embed').addEventListener('change', (e) => { root.innerHTML = `<div class="video-container" style="max-width:100%; height:auto;">${e.target.value}</div>`; saveState(); });
    if (document.getElementById('prop-video-file-upload')) document.getElementById('prop-video-file-upload').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => { const videoEl = root.querySelector('video'); if (videoEl) { videoEl.src = event.target.result; saveState(); } };
        reader.readAsDataURL(file);
      }
    });
    if (document.getElementById('prop-video-url-src')) {
      document.getElementById('prop-video-url-src').addEventListener('input', (e) => { const videoEl = root.querySelector('video'); if (videoEl) videoEl.src = e.target.value; });
      document.getElementById('prop-video-url-src').addEventListener('change', () => saveState());
    }
    ['prop-video-autoplay', 'prop-video-loop', 'prop-video-muted', 'prop-video-controls'].forEach(id => {
      const chk = document.getElementById(id);
      if (chk) chk.addEventListener('change', () => { const videoEl = root.querySelector('video'); if (videoEl) { const attr = id.replace('prop-video-', ''); chk.checked ? videoEl.setAttribute(attr, attr) : videoEl.removeAttribute(attr); saveState(); } });
    });
  }

  if (type === 'gif') {
    document.getElementById('prop-gif-src').addEventListener('input', (e) => { root.setAttribute('src', e.target.value); });
    document.getElementById('prop-gif-src').addEventListener('change', () => saveState());
  }

  if (type === 'sticker') {
    const stickerSpan = root.querySelector('span') || root;
    const stickerEmoji = document.getElementById('prop-sticker-emoji');
    stickerEmoji.addEventListener('input', (e) => { if (stickerSpan) stickerSpan.innerText = e.target.value; });
    stickerEmoji.addEventListener('change', () => saveState());
  }

  if (type === 'spacer') {
    const sBg = document.getElementById('prop-spacer-bg');
    const sBgText = document.getElementById('prop-spacer-bg-text');
    sBg.addEventListener('input', (e) => { root.style.backgroundColor = e.target.value; sBgText.value = e.target.value; });
    sBgText.addEventListener('input', (e) => { root.style.backgroundColor = e.target.value; sBg.value = rgbToHex(e.target.value); });
    sBg.addEventListener('change', () => saveState()); sBgText.addEventListener('change', () => saveState());
    const opacitySlider = document.getElementById('prop-spacer-opacity');
    opacitySlider.addEventListener('input', (e) => { root.style.opacity = e.target.value; opacitySlider.nextElementSibling.textContent = e.target.value; });
    opacitySlider.addEventListener('change', () => saveState());
    const mTopSlider = document.getElementById('prop-spacer-margin-top');
    mTopSlider.addEventListener('input', (e) => { root.style.marginTop = e.target.value + 'px'; mTopSlider.nextElementSibling.textContent = e.target.value + 'px'; });
    mTopSlider.addEventListener('change', () => saveState());
    const mBotSlider = document.getElementById('prop-spacer-margin-bottom');
    mBotSlider.addEventListener('input', (e) => { root.style.marginBottom = e.target.value + 'px'; mBotSlider.nextElementSibling.textContent = e.target.value + 'px'; });
    mBotSlider.addEventListener('change', () => saveState());
  }

  if (type === 'icons') {
    document.getElementById('btn-change-icon-library').addEventListener('click', () => {
      openIconLibraryModal((svgString) => { const span = root.querySelector('span'); if (span) { span.innerHTML = svgString; saveState(); } });
    });
    const iconLink = document.getElementById('prop-icon-link');
    iconLink.addEventListener('input', (e) => { let a = root.querySelector('a'); if (!a) { a = document.createElement('a'); a.style.textDecoration = 'none'; a.appendChild(root.querySelector('span')); root.appendChild(a); } a.setAttribute('href', e.target.value); a.setAttribute('target', '_blank'); });
    iconLink.addEventListener('change', () => saveState());
    const cBg = document.getElementById('prop-icon-circle-bg');
    const cBgText = document.getElementById('prop-icon-circle-bg-text');
    cBg.addEventListener('input', (e) => { root.style.backgroundColor = e.target.value; root.style.padding = '10px'; root.style.display = 'inline-block'; cBgText.value = e.target.value; });
    cBgText.addEventListener('input', (e) => { root.style.backgroundColor = e.target.value; root.style.padding = '10px'; root.style.display = 'inline-block'; cBg.value = rgbToHex(e.target.value); });
    cBg.addEventListener('change', () => saveState()); cBgText.addEventListener('change', () => saveState());
    const radiusSlider = document.getElementById('prop-icon-radius');
    radiusSlider.addEventListener('input', (e) => { root.style.borderRadius = e.target.value + 'px'; radiusSlider.nextElementSibling.textContent = e.target.value + 'px'; });
    radiusSlider.addEventListener('change', () => saveState());
  }

  if (type === 'table') {
    document.getElementById('btn-table-add-row').addEventListener('click', () => {
      const tbody = root.querySelector('tbody') || root;
      const firstRow = root.querySelector('tr');
      const colCount = firstRow ? firstRow.querySelectorAll('th, td').length : 2;
      const newTr = document.createElement('tr');
      for (let i = 0; i < colCount; i++) {
        const newTd = document.createElement('td');
        newTd.className = "table-cell-edit"; newTd.setAttribute('contenteditable', 'true'); newTd.innerText = "Texto"; newTd.style.cssText = "padding:10px; border:1px solid #e2e2ec; color:#1e1e24; font-family:Arial, sans-serif; font-size:14px;";
        newTr.appendChild(newTd);
      }
      tbody.appendChild(newTr); saveState(); renderPropertiesPanel(element);
    });
    document.getElementById('btn-table-add-col').addEventListener('click', () => {
      root.querySelectorAll('tr').forEach((tr, idx) => {
        const cell = document.createElement(idx === 0 ? 'th' : 'td');
        cell.className = "table-cell-edit"; if (idx > 0) cell.setAttribute('contenteditable', 'true');
        cell.innerText = idx === 0 ? "Coluna" : "Valor"; cell.style.cssText = "padding:10px; border:1px solid #e2e2ec; color:#1e1e24; font-family:Arial, sans-serif; font-size:14px;";
        tr.appendChild(cell);
      });
      saveState(); renderPropertiesPanel(element);
    });
    document.getElementById('btn-table-remove-row').addEventListener('click', () => {
      const rows = root.querySelectorAll('tbody tr');
      if (rows.length > 1) { rows[rows.length - 1].remove(); saveState(); renderPropertiesPanel(element); }
    });
    document.getElementById('btn-table-remove-col').addEventListener('click', () => {
      let canRemove = true;
      root.querySelectorAll('tr').forEach(tr => { if (tr.querySelectorAll('th, td').length <= 1) canRemove = false; });
      if (canRemove) { root.querySelectorAll('tr').forEach(tr => { const cells = tr.querySelectorAll('th, td'); cells[cells.length - 1].remove(); }); saveState(); renderPropertiesPanel(element); }
    });
    const tCol = document.getElementById('prop-table-border-color');
    const tColText = document.getElementById('prop-table-border-text');
    const tHeader = document.getElementById('prop-table-header-bg');
    const tHeaderText = document.getElementById('prop-table-header-bg-text');
    const tRow = document.getElementById('prop-table-row-bg');
    const tRowText = document.getElementById('prop-table-row-bg-text');
    tCol.addEventListener('input', (e) => { tColText.value = e.target.value; applyTableStyle(root, 'border', e.target.value); });
    tColText.addEventListener('input', (e) => { tCol.value = rgbToHex(e.target.value); applyTableStyle(root, 'border', e.target.value); });
    tCol.addEventListener('change', () => saveState()); tColText.addEventListener('change', () => saveState());
    const borderThickness = document.getElementById('prop-table-border-width');
    borderThickness.addEventListener('input', (e) => { root.querySelectorAll('th, td').forEach(cell => { cell.style.borderWidth = e.target.value + 'px'; }); borderThickness.nextElementSibling.textContent = e.target.value + 'px'; });
    borderThickness.addEventListener('change', () => saveState());
    tHeader.addEventListener('input', (e) => { tHeaderText.value = e.target.value; applyTableStyle(root, 'header-bg', e.target.value); });
    tHeaderText.addEventListener('input', (e) => { tHeader.value = rgbToHex(e.target.value); applyTableStyle(root, 'header-bg', e.target.value); });
    tHeader.addEventListener('change', () => saveState()); tHeaderText.addEventListener('change', () => saveState());
    tRow.addEventListener('input', (e) => { tRowText.value = e.target.value; applyTableStyle(root, 'row-bg', e.target.value); });
    tRowText.addEventListener('input', (e) => { tRow.value = rgbToHex(e.target.value); applyTableStyle(root, 'row-bg', e.target.value); });
    tRow.addEventListener('change', () => saveState()); tRowText.addEventListener('change', () => saveState());
  }

  const pTopSlider = document.getElementById('prop-pad-top');
  pTopSlider.addEventListener('input', (e) => { root.style.paddingTop = e.target.value + 'px'; pTopSlider.nextElementSibling.textContent = e.target.value + 'px'; });
  pTopSlider.addEventListener('change', () => saveState());
  const pBotSlider = document.getElementById('prop-pad-bot');
  pBotSlider.addEventListener('input', (e) => { root.style.paddingBottom = e.target.value + 'px'; pBotSlider.nextElementSibling.textContent = e.target.value + 'px'; });
  pBotSlider.addEventListener('change', () => saveState());
}

function setupPropSlider(element, sliderId, cssProperty, unit = 'px') {
  const slider = document.getElementById(sliderId);
  if (!slider) return;

  slider.addEventListener('input', (e) => {
    applyBlockStyle(element, cssProperty, e.target.value + unit);
    slider.nextElementSibling.textContent = e.target.value + unit;
  });

  slider.addEventListener('change', () => {
    saveState();
  });
}

function rebuildSocialGrid(wrapper, container) {
  let activeNets = [];
  let html = '';
  const firstLink = wrapper.querySelector('a');
  const styleStr = firstLink ? firstLink.style.cssText : "text-decoration:none; margin: 0 4px; display:inline-block;";
  const iconColor = firstLink ? (firstLink.style.color || '#635bff') : '#635bff';

  container.querySelectorAll('.prop-social-toggle').forEach(chk => {
    if (chk.checked) {
      const net = chk.getAttribute('data-network');
      const url = container.querySelector(`.prop-social-url[data-network="${net}"]`).value;
      activeNets.push(net);
      
      let svgStr = icons.social[net] || '';
      svgStr = svgStr.replace(/<path /g, `<path fill="${iconColor}" `);
      
      html += `<a href="${url}" target="_blank" data-network="${net}" style="${styleStr}">${svgStr}</a>`;
    }
  });

  wrapper.setAttribute('data-active-networks', activeNets.join(','));
  wrapper.innerHTML = html;
  saveState();
}

/* ==========================================================================
   SETTINGS LISTENERS
   ========================================================================== */
function setupSettingsListeners() {
  const canvas = document.getElementById('email-canvas');
  const canvasContainer = document.getElementById('canvas-container');

  const widthSlider = document.getElementById('setting-canvas-width');
  widthSlider.addEventListener('input', (e) => {
    state.canvasWidth = e.target.value;
    canvas.style.width = state.canvasWidth + 'px';
    document.getElementById('val-canvas-width').textContent = e.target.value + 'px';
  });
  widthSlider.addEventListener('change', () => saveState());

  const alignCenter = document.getElementById('setting-align-center');
  const alignLeft = document.getElementById('setting-align-left');

  alignCenter.addEventListener('click', () => {
    alignCenter.classList.add('active');
    alignLeft.classList.remove('active');
    canvasContainer.style.alignItems = 'center';
    state.canvasAlign = 'center';
    saveState();
  });

  alignLeft.addEventListener('click', () => {
    alignLeft.classList.add('active');
    alignCenter.classList.remove('active');
    canvasContainer.style.alignItems = 'flex-start';
    state.canvasAlign = 'left';
    saveState();
  });

  const bgPage = document.getElementById('setting-bg-page');
  const bgPageText = document.getElementById('setting-bg-page-text');
  const bgEmail = document.getElementById('setting-bg-email');
  const bgEmailText = document.getElementById('setting-bg-email-text');

  bgPage.addEventListener('input', (e) => {
    canvasContainer.style.backgroundColor = e.target.value;
    bgPageText.value = e.target.value;
    state.bgPage = e.target.value;
  });
  bgPage.addEventListener('change', () => saveState());
  bgPageText.addEventListener('change', (e) => {
    canvasContainer.style.backgroundColor = e.target.value;
    bgPage.value = rgbToHex(e.target.value);
    state.bgPage = e.target.value;
    saveState();
  });

  bgEmail.addEventListener('input', (e) => {
    canvas.style.backgroundColor = e.target.value;
    bgEmailText.value = e.target.value;
    state.bgEmail = e.target.value;
  });
  bgEmail.addEventListener('change', () => saveState());
  bgEmailText.addEventListener('change', (e) => {
    canvas.style.backgroundColor = e.target.value;
    bgEmail.value = rgbToHex(e.target.value);
    state.bgEmail = e.target.value;
    saveState();
  });

  const fontSelect = document.getElementById('setting-font-family');
  fontSelect.addEventListener('change', (e) => {
    canvas.style.fontFamily = e.target.value;
    state.fontFamily = e.target.value;
    saveState();
  });
}

/* ==========================================================================
   HEADER ACTIONS & RESPONSIVENESS
   ========================================================================== */
function setupActionButtons() {
  const container = document.getElementById('canvas-container');

  const btnDesktop = document.getElementById('btn-view-desktop');
  const btnTablet = document.getElementById('btn-view-tablet');
  const btnMobile = document.getElementById('btn-view-mobile');

  function clearViewModes() {
    btnDesktop.classList.remove('active');
    btnTablet.classList.remove('active');
    btnMobile.classList.remove('active');
    container.classList.remove('tablet-mode', 'mobile-mode');
  }

  btnDesktop.addEventListener('click', () => {
    clearViewModes();
    btnDesktop.classList.add('active');
  });

  btnTablet.addEventListener('click', () => {
    clearViewModes();
    btnTablet.classList.add('active');
    container.classList.add('tablet-mode');
  });

  btnMobile.addEventListener('click', () => {
    clearViewModes();
    btnMobile.classList.add('active');
    container.classList.add('mobile-mode');
  });

  document.getElementById('btn-undo').addEventListener('click', undo);
  document.getElementById('btn-redo').addEventListener('click', redo);

  document.getElementById('btn-clear').addEventListener('click', () => {
    if (confirm('Tem certeza de que deseja limpar todo o canvas?')) {
      const canvas = document.getElementById('email-canvas');
      canvas.innerHTML = '';
      deselectAll();
      checkEmptyState();
      saveState();
      showToast('Canvas limpo com sucesso.');
    }
  });

  document.getElementById('btn-export').addEventListener('click', openExportModal);
}

/* ==========================================================================
   HTML EXPORT ENGINE (COMPATIBLE AND RESPONSIVE CODE GENERATOR)
   ========================================================================== */
function generateHTMLOutput() {
  const canvas = document.getElementById('email-canvas');
  const rows = canvas.querySelectorAll('.email-row');

  let bodyStyles = `margin:0; padding:0; background-color:${state.bgPage}; font-family:${state.fontFamily};`;
  let wrapperStyles = `width:100%; table-layout:fixed; background-color:${state.bgPage}; padding:40px 0;`;
  
  let html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-mail Responsivo</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body { ${bodyStyles} }
    table { border-spacing: 0; }
    td { padding: 0; }
    img { border: 0; }
    .content-table { width: 100%; max-width: ${state.canvasWidth}px; margin: 0 auto; background-color: ${state.bgEmail}; }
    @media screen and (max-width: 600px) {
      .col-responsive { display: block !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; }
      img, video, iframe { max-width: 100% !important; }
      .multi-img-grid { grid-template-columns: 1fr !important; }
      table { max-width: 100% !important; }
    }
  </style>
</head>
<body>
  <center style="${wrapperStyles}">
    <table class="content-table" align="${state.canvasAlign}" role="presentation">
      <tr>
        <td style="padding: 0;">
  `;

  rows.forEach(row => {
    const cols = row.querySelectorAll('.email-col');
    const bg = row.style.backgroundColor || 'transparent';
    const padTop = row.style.paddingTop || '0px';
    const padBot = row.style.paddingBottom || '0px';

    html += `
          <!-- Start Row -->
          <table width="100%" role="presentation" style="background-color: ${bg};">
            <tr>
              <td style="padding-top: ${padTop}; padding-bottom: ${padBot}; font-size: 0; text-align: center; vertical-align: top;">
    `;

    cols.forEach(col => {
      let flexVal = col.style.flex || 1;
      let pctWidth = Math.round(parseFloat(flexVal) * 100);

      html += `
                <!--[if mso]>
                <td width="${pctWidth}%" style="vertical-align: top; padding: 10px;">
                <![endif]-->
                <div class="col-responsive" style="display: inline-block; width: ${pctWidth}%; vertical-align: top; font-size: 14px; text-align: left; box-sizing: border-box; padding: 15px;">
      `;

      const elements = col.querySelectorAll('.email-element');
      elements.forEach(element => {
        const item = getBlockRoot(element);
        if (!item) return;

        const align = element.style.textAlign || 'left';

        const cleanItem = item.cloneNode(true);
        cleanItem.removeAttribute('contenteditable');
        cleanItem.classList.remove('inline-edit');

        html += `
                  <div style="padding: 0; margin: 0; width: 100%; text-align: ${align};">
                    ${cleanItem.outerHTML}
                  </div>
        `;
      });

      html += `
                </div>
                <!--[if mso]>
                </td>
                <![endif]-->
      `;
    });

    html += `
              </td>
            </tr>
          </table>
          <!-- End Row -->
    `;
  });

  html += `
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;

  return html;
}

function openExportModal() {
  const modal = document.getElementById('export-modal');
  const codeBox = document.getElementById('export-code');
  codeBox.value = generateHTMLOutput();
  modal.classList.add('active');
}

function setupModalEvents() {
  const modal = document.getElementById('export-modal');
  
  document.getElementById('btn-close-modal').addEventListener('click', () => {
    modal.classList.remove('active');
  });

  document.getElementById('btn-copy-code').addEventListener('click', () => {
    const codeBox = document.getElementById('export-code');
    codeBox.select();
    navigator.clipboard.writeText(codeBox.value);
    showToast('Código copiado para a área de transferência!');
  });

  document.getElementById('btn-download-code').addEventListener('click', () => {
    const code = document.getElementById('export-code').value;
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-responsivo.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Download do HTML iniciado!');
  });
}

/* ==========================================================================
   UNDO / REDO STATE MANAGEMENT
   ========================================================================== */
function saveState() {
  const canvas = document.getElementById('email-canvas');
  const cleanHTML = canvas.innerHTML;

  if (state.historyIndex < state.history.length - 1) {
    state.history = state.history.slice(0, state.historyIndex + 1);
  }

  state.history.push({
    html: cleanHTML,
    canvasWidth: state.canvasWidth,
    canvasAlign: state.canvasAlign,
    bgPage: state.bgPage,
    bgEmail: state.bgEmail,
    fontFamily: state.fontFamily
  });
  state.historyIndex++;

  updateUndoRedoButtons();
}

function undo() {
  if (state.historyIndex > 0) {
    state.historyIndex--;
    applyHistoryState(state.history[state.historyIndex]);
  }
}

function redo() {
  if (state.historyIndex < state.history.length - 1) {
    state.historyIndex++;
    applyHistoryState(state.history[state.historyIndex]);
  }
}

function applyHistoryState(hist) {
  const canvas = document.getElementById('email-canvas');
  canvas.innerHTML = hist.html;
  
  state.canvasWidth = hist.canvasWidth;
  state.canvasAlign = hist.canvasAlign;
  state.bgPage = hist.bgPage;
  state.bgEmail = hist.bgEmail;
  state.fontFamily = hist.fontFamily;

  canvas.style.width = state.canvasWidth + 'px';
  canvas.style.backgroundColor = state.bgEmail;
  canvas.style.fontFamily = state.fontFamily;
  document.getElementById('canvas-container').style.backgroundColor = state.bgPage;

  canvas.querySelectorAll('.email-row').forEach(row => {
    setupRowToolbarEvents(row);
    row.addEventListener('click', (e) => { e.stopPropagation(); selectElement(row); });
    row.addEventListener('dragstart', (e) => {
      draggedElement = row;
      row.classList.add('dragging');
      draggedData = null;
      e.stopPropagation();
    });
    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
    });
  });

  canvas.querySelectorAll('.email-element').forEach(block => {
    setupBlockToolbarEvents(block);
    block.addEventListener('click', (e) => { e.stopPropagation(); selectElement(block); });
    block.addEventListener('dragstart', (e) => {
      draggedElement = block;
      block.classList.add('dragging');
      draggedData = null;
      e.stopPropagation();
    });
    block.addEventListener('dragend', () => {
      block.classList.remove('dragging');
    });
    const editable = block.querySelector('.inline-edit');
    if (editable) {
      editable.addEventListener('blur', () => saveState());
    }
  });

  deselectAll();
  checkEmptyState();
  updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
  document.getElementById('btn-undo').disabled = (state.historyIndex <= 0);
  document.getElementById('btn-redo').disabled = (state.historyIndex >= state.history.length - 1);
}

/* ==========================================================================
   HELPERS & UTILITIES
   ========================================================================== */
function checkEmptyState() {
  const canvas = document.getElementById('email-canvas');
  const empty = canvas.querySelector('.canvas-empty-state');
  const rows = canvas.querySelectorAll('.email-row');

  if (rows.length > 0) {
    if (empty) empty.style.display = 'none';
  } else {
    if (empty) {
      empty.style.display = 'flex';
    } else {
      canvas.innerHTML = `
        <div class="canvas-empty-state">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h3>Seu E-mail Está Vazio</h3>
          <p>Arraste uma Linha (Row) da aba "Rows" na direita para começar a estruturar seu e-mail.</p>
        </div>
      `;
    }
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-message').textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function rgbToHex(rgb) {
  if (!rgb || rgb === 'transparent') return '';
  if (rgb.startsWith('#')) return rgb;
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return '';
  function hex(x) {
    return ("0" + parseInt(x).toString(16)).slice(-2);
  }
  return "#" + hex(match[1]) + hex(match[2]) + hex(match[3]);
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      undo();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      redo();
    }
  });
}

// Image layout modal flows
let activeImageBlockNode = null;
function openImageLayoutModal(blockNode) {
  activeImageBlockNode = blockNode;
  const modal = document.getElementById('image-layout-modal');
  modal.classList.add('active');
}

function setupImageModalEvents() {
  document.querySelectorAll('#image-layout-modal .layout-modal-card').forEach(card => {
    card.addEventListener('click', () => {
      const layout = card.getAttribute('data-layout');
      if (activeImageBlockNode) {
        const root = getBlockRoot(activeImageBlockNode);
        let newContent = '';
        if (layout === '1') {
          newContent = `<img src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format" style="width:100%; display:block; margin:0 auto;" alt="Foto 1">`;
        } else if (layout === '3') {
          newContent = `
            <div class="multi-img-grid grid-3">
              <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format" alt="Foto 1">
              <img src="https://images.unsplash.com/photo-1519046904884-53103b34b206?w=200&auto=format" alt="Foto 2">
              <img src="https://images.unsplash.com/photo-1473116763269-255ea7604668?w=200&auto=format" alt="Foto 3">
            </div>
          `;
        } else if (layout === '6') {
          newContent = `
            <div class="multi-img-grid grid-6">
              <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format" alt="Foto 1">
              <img src="https://images.unsplash.com/photo-1519046904884-53103b34b206?w=200&auto=format" alt="Foto 2">
              <img src="https://images.unsplash.com/photo-1473116763269-255ea7604668?w=200&auto=format" alt="Foto 3">
              <img src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=200&auto=format" alt="Foto 4">
              <img src="https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=200&auto=format" alt="Foto 5">
              <img src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&auto=format" alt="Foto 6">
            </div>
          `;
        }
        root.innerHTML = newContent;
        root.classList.remove('image-placeholder');
        saveState();
        selectElement(activeImageBlockNode);
      }
      document.getElementById('image-layout-modal').classList.remove('active');
    });
  });

  document.querySelector('.btn-close-image-modal').addEventListener('click', () => {
    document.getElementById('image-layout-modal').classList.remove('active');
  });
}

// Icon library modal flows
let activeIconTargetCallback = null;
function openIconLibraryModal(callback) {
  activeIconTargetCallback = callback;
  document.getElementById('icon-library-modal').classList.add('active');
  renderIconLibraryGrid();
}

function openIconLibraryForBlock(blockNode) {
  openIconLibraryModal((svgString) => {
    const root = getBlockRoot(blockNode);
    root.innerHTML = `
      <div class="icons-wrapper" style="text-align: center;">
        <span style="font-size:24px; color:#635bff; margin:0 5px; display:inline-block; vertical-align:middle;">
          ${svgString}
        </span>
      </div>
    `;
    saveState();
    selectElement(blockNode);
  });
}

function setupIconLibraryModalEvents() {
  const modal = document.getElementById('icon-library-modal');
  const searchInput = document.getElementById('icon-search-input');
  const categorySelect = document.getElementById('icon-category-select');

  searchInput.addEventListener('input', () => {
    renderIconLibraryGrid(searchInput.value, categorySelect.value);
  });

  categorySelect.addEventListener('change', () => {
    renderIconLibraryGrid(searchInput.value, categorySelect.value);
  });

  document.querySelector('.btn-close-icon-modal').addEventListener('click', () => {
    modal.classList.remove('active');
  });
}

function renderIconLibraryGrid(searchTerm = '', category = 'all') {
  const grid = document.getElementById('icon-library-grid');
  grid.innerHTML = '';

  Object.keys(iconLibrary).forEach(cat => {
    if (category !== 'all' && cat !== category) return;
    
    Object.keys(iconLibrary[cat]).forEach(name => {
      if (searchTerm && !name.toLowerCase().includes(searchTerm.toLowerCase())) return;

      const svgContent = iconLibrary[cat][name];
      const card = document.createElement('div');
      card.className = 'icon-box-card';
      card.innerHTML = `
        ${svgContent}
        <span style="font-size:10px; color:var(--text-muted); text-transform:capitalize;">${name}</span>
      `;
      card.addEventListener('click', () => {
        if (activeIconTargetCallback) {
          activeIconTargetCallback(svgContent);
        }
        document.getElementById('icon-library-modal').classList.remove('active');
      });
      grid.appendChild(card);
    });
  });
}


  
  if (typeof startApp !== 'undefined') startApp();
}
