(function () {
  const scriptTag = document.currentScript;
  const personaId = scriptTag.getAttribute('data-id');

  // ── CONFIGURE THIS ──────────────────────────────────────────────────────────
  const N8N_WEBHOOK_URL = scriptTag.getAttribute('data-webhook') || "http://localhost:5678/webhook/1ca35cf4-f9af-46cb-a188-56032c2bd1ff/chat";
  // ────────────────────────────────────────────────────────────────────────────

  if (!personaId) return;

  const sessionId = `sess_${Math.random().toString(36).substring(2, 11)}`;

  // ── STYLES ──────────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    @keyframes widgetFadeIn {
      from { opacity: 0; transform: translateY(15px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0)   scale(1);    }
    }
    @keyframes brBlink {
      0%, 100% { opacity: 0.2; }
      50%       { opacity: 1;   }
    }
    .br-msg-area::-webkit-scrollbar { width: 5px; }
    .br-msg-area::-webkit-scrollbar-track { background: transparent; }
    .br-msg-area::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    .br-msg-area::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    .br-thinking-dot { animation: brBlink 1.4s infinite both; font-weight: bold; color: #c89a4d; }
    .br-thinking-dot:nth-child(2) { animation-delay: .2s; }
    .br-thinking-dot:nth-child(3) { animation-delay: .4s; }
    .br-custom-form {
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
      padding: 12px; margin-top: 10px; display: flex; flex-direction: column;
      gap: 8px; width: 100%; box-sizing: border-box;
    }
    .br-form-input {
      width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px;
      font-size: 12.5px; outline: none; box-sizing: border-box; background: white; color: #334155;
    }
    .br-form-input:focus { border-color: #c89a4d; }
    .br-form-submit {
      width: 100%; padding: 8px; background-color: #1f2937; color: white; border: none;
      border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer; transition: background 0.2s;
    }
    .br-form-submit:hover { background-color: #374151; }
    .br-action-link {
      display: block; margin-top: 10px; padding: 8px 12px; color: white;
      text-decoration: none; text-align: center; border-radius: 6px;
      font-size: 12px; font-weight: 600; cursor: pointer; border: none; width: 100%; box-sizing: border-box;
    }
    .br-rich-card {
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
      padding: 12px; margin-top: 10px; display: flex; flex-direction: column;
      gap: 10px; width: 100%; box-sizing: border-box;
    }
  `;
  document.head.appendChild(style);

  // ── LAUNCHER BUTTON ─────────────────────────────────────────────────────────
  const launcher = document.createElement('div');
  Object.assign(launcher.style, {
    position: 'fixed', bottom: '24px', right: '24px', width: '52px', height: '52px',
    borderRadius: '50%', backgroundColor: '#1f2937', color: 'white', display: 'flex',
    alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)', zIndex: '1000000', fontSize: '20px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  });
  launcher.innerHTML = '💬';

  // ── WIDGET CONTAINER ─────────────────────────────────────────────────────────
  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed', bottom: '90px', right: '24px', width: '350px', height: '520px',
    zIndex: '999999', display: 'none', flexDirection: 'column',
    boxShadow: '0 10px 32px -4px rgba(0,0,0,0.1), 0 4px 14px -2px rgba(0,0,0,0.05)',
    borderRadius: '16px', overflow: 'hidden', backgroundColor: '#f8fafc',
    border: '1px solid rgba(226,232,240,0.8)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  });

  // ── HEADER ───────────────────────────────────────────────────────────────────
  const header = document.createElement('div');
  Object.assign(header.style, {
    padding: '0 16px', background: '#1f2937', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center', height: '56px',
    borderBottom: '2.5px solid #c89a4d', flexShrink: '0'
  });
  const nameLabel = document.createElement('span');
  nameLabel.innerText = 'Black Rock Smart Agent';
  Object.assign(nameLabel.style, { color: 'white', fontWeight: '600', fontSize: '14px' });
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '✕';
  Object.assign(closeBtn.style, { border: 'none', background: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '16px' });
  header.appendChild(nameLabel);
  header.appendChild(closeBtn);
  container.appendChild(header);

  // ── MESSAGE AREA ─────────────────────────────────────────────────────────────
  const msgArea = document.createElement('div');
  msgArea.className = 'br-msg-area';
  Object.assign(msgArea.style, { flex: '1', padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' });
  container.appendChild(msgArea);

  let currentLoader = null;

  function showThinking() {
    if (currentLoader) return;
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;width:100%';
    const b = document.createElement('div');
    Object.assign(b.style, {
      maxWidth: '85%', padding: '10px 14px', borderRadius: '12px', fontSize: '13.5px',
      backgroundColor: 'white', color: '#64748b', border: '1px solid #e2e8f0',
      borderBottomLeftRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px'
    });
    b.innerHTML = 'Thinking<span class="br-thinking-dot">.</span><span class="br-thinking-dot">.</span><span class="br-thinking-dot">.</span>';
    wrap.appendChild(b);
    msgArea.appendChild(wrap);
    msgArea.scrollTop = msgArea.scrollHeight;
    currentLoader = wrap;
  }

  function removeThinking() {
    if (currentLoader) { currentLoader.remove(); currentLoader = null; }
  }

  // ── PARSE N8N RESPONSE ───────────────────────────────────────────────────────
  function parseN8nResponse(data) {
    const d = Array.isArray(data) ? data[0] : data;
    const rawText = d.output || d.message || d.text || d.chatInput || '';

    const cleanText = rawText
      .replace(/\[GENERATE_DOC\]/gi, '')
      .replace(/\[SEND_EMAIL:[^\]]+\]/gi, '')
      .replace(/\[COLLECT_EMAIL\]/gi, '')
      .replace(/\[COLLECT_WHATSAPP\]/gi, '')
      .replace(/\[WHATSAPP:[^\]]+\]/gi, '')
      .replace(/\[BOOK_APPOINTMENT\]/gi, '')
      .replace(/\[COMMAND_TAG_NONE\]/gi, '')
      .replace(/\[COMMAND TAG\]/gi, '')
      .replace(/COMMAND TAGS:\s*$/gi, '')
      .trim();

    let actionLink = d.actionLink || null;
    let type = d.type || 'chat';

    // ── AUTOMATIC FALLBACK SAFETY ────────────────────────────────────────────
    // If n8n output text mentions your main website link but has no actionLink object,
    // we auto-generate it right here so you don't have to worry about backend formats.
    if (!actionLink && cleanText.toLowerCase().includes('blackrockrealestate.com')) {
      actionLink = {
        label: "Visit Our Website",
        url: "https://blackrockrealestate.com"
      };
    }

    return {
      text:          cleanText,
      type:          type,
      intent:        d.intent || (actionLink ? 'website' : null),
      downloadUrl:   d.downloadUrl || null,
      actionLink:    actionLink,
      emailRecipient: d.emailRecipient || null,
    };
  }

  // ── ADD MESSAGE BUBBLE ────────────────────────────────────────────────────────
  function addMessage(parsed, isUser) {
    const wrap = document.createElement('div');
    wrap.style.cssText = `display:flex;justify-content:${isUser ? 'flex-end' : 'flex-start'};width:100%`;

    const bubble = document.createElement('div');
    Object.assign(bubble.style, {
      maxWidth: '85%', padding: '10px 14px', borderRadius: '12px',
      fontSize: '13.5px', lineHeight: '1.45', whiteSpace: 'pre-wrap',
    });

    if (isUser) {
      bubble.style.cssText += ';background:#c89a4d;color:white;border-bottom-right-radius:4px;box-shadow:0 2px 4px rgba(200,154,77,0.15)';
      bubble.innerText = typeof parsed === 'string' ? parsed : parsed.text;
      wrap.appendChild(bubble);
      msgArea.appendChild(wrap);
      msgArea.scrollTop = msgArea.scrollHeight;
      return;
    }

    bubble.style.cssText += ';background:white;color:#334155;border:1px solid #e2e8f0;border-bottom-left-radius:4px';
    const p = typeof parsed === 'string' ? { text: parsed, type: 'chat' } : parsed;
    bubble.innerText = p.text;

    // ── CASE 1: PORTFOLIO / DOCUMENT PREVIEW CARD ────────────────────────────
    if (p.type === 'document' && p.downloadUrl) {
      const docCard = document.createElement('div');
      docCard.className = 'br-rich-card';
      docCard.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 24px;">📄</span>
          <div style="flex: 1;">
            <div style="color: #1e293b; font-weight: 600; font-size: 13px;">Property Portfolio</div>
            <div style="color: #64748b; font-size: 11px;">Custom Real Estate Overview.pdf</div>
          </div>
        </div>
        <a href="${p.downloadUrl}" target="_blank" class="br-action-link" style="background-color: #10b981; margin-top: 4px;">Open & Download Portfolio</a>
      `;
      bubble.appendChild(docCard);
    }

    // ── CASE 2: WEBSITE PREVIEW CARD ─────────────────────────────────────────
    else if (p.actionLink && p.actionLink.url && p.actionLink.url !== '#') {
      const isWebsite = p.intent === 'website' || p.actionLink.url.includes('blackrockrealestate');
      const cardTitle = isWebsite ? 'Black Rock Real Estate' : (p.actionLink.label || 'External Link');
      const cardSubtitle = isWebsite ? 'Explore residential & commercial listings' : 'Click below to navigate';
      const cardColor = isWebsite ? '#1f2937' : '#c89a4d';
      const cardIcon = isWebsite ? '🌐' : '🔗';

      const webCard = document.createElement('div');
      webCard.className = 'br-rich-card';
      webCard.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 24px;">${cardIcon}</span>
          <div style="flex: 1;">
            <div style="color: #1e293b; font-weight: 600; font-size: 13px;">${cardTitle}</div>
            <div style="color: #64748b; font-size: 11px;">${cardSubtitle}</div>
          </div>
        </div>
        <a href="${p.actionLink.url}" target="_blank" class="br-action-link" style="background-color: ${cardColor}; margin-top: 4px;">
          ${isWebsite ? 'Visit Our Website' : (p.actionLink.label || 'Open Link')}
        </a>
      `;
      bubble.appendChild(webCard);
    }

    // ── CORE INTERACTIVE CONTEXT FORMS ───────────────────────────────────────
    if (p.type === 'collect_email') {
      const form = document.createElement('div');
      form.className = 'br-custom-form';
      form.innerHTML = `
        <input type="email" class="br-form-input" id="br-email-input" placeholder="your@email.com">
        <button class="br-form-submit" id="br-email-btn">✉️ Submit Email</button>`;
      form.querySelector('#br-email-btn').onclick = () => {
        const val = form.querySelector('#br-email-input').value.trim();
        if (!val) return;
        form.innerHTML = `<div style="color:#10b981;font-size:12px;font-weight:600;">✅ Email noted: ${val}</div>`;
        sendMessage(val);
      };
      bubble.appendChild(form);
    }

    else if (p.type === 'collect_whatsapp') {
      const form = document.createElement('div');
      form.className = 'br-custom-form';
      form.innerHTML = `
        <input type="tel" class="br-form-input" id="br-wa-input" placeholder="+971501234567">
        <button class="br-form-submit" id="br-wa-btn">📱 Submit Number</button>`;
      form.querySelector('#br-wa-btn').onclick = () => {
        const val = form.querySelector('#br-wa-input').value.trim();
        if (!val) return;
        form.innerHTML = `<div style="color:#10b981;font-size:12px;font-weight:600;">✅ Number noted: ${val}</div>`;
        sendMessage(val);
      };
      bubble.appendChild(form);
    }

    else if (p.type === 'appointment' || (p.actionLink && p.actionLink.url && p.actionLink.url.includes('calendly'))) {
      const form = document.createElement('div');
      form.className = 'br-custom-form';
      const bookUrl = (p.actionLink && p.actionLink.url) || '#';
      form.innerHTML = `
        <input type="date" class="br-form-input" id="br-date">
        <input type="time" class="br-form-input" id="br-time">
        <button class="br-form-submit" id="br-book-btn">📅 Confirm Appointment</button>`;
      form.querySelector('#br-book-btn').onclick = (e) => {
        e.target.disabled = true; e.target.innerText = 'Booking...';
        setTimeout(() => {
          form.innerHTML = `<div style="color:#10b981;font-size:12px;font-weight:600;">✅ Appointment reserved! <a href="${bookUrl}" target="_blank" style="color:#c89a4d">View calendar</a></div>`;
        }, 800);
      };
      bubble.appendChild(form);
    }

    else if (p.type === 'whatsapp' && p.actionLink) {
      const btn = document.createElement('a');
      btn.href = p.actionLink.url; btn.target = '_blank';
      btn.className = 'br-action-link';
      btn.style.backgroundColor = '#25D366';
      btn.innerText = p.actionLink.label || '💬 Open WhatsApp';
      bubble.appendChild(btn);
    }

    else if (p.type === 'email' && p.emailRecipient) {
      const note = document.createElement('div');
      note.style.cssText = 'margin-top:8px;padding:6px 10px;background:#f0fdf4;border-radius:6px;font-size:11.5px;color:#16a34a;font-weight:600';
      note.innerText = `✅ Email sent to ${p.emailRecipient}`;
      bubble.appendChild(note);
    }

    wrap.appendChild(bubble);
    msgArea.appendChild(wrap);
    msgArea.scrollTop = msgArea.scrollHeight;
  }

  addMessage({ text: "Hello! How can I assist you with Black Rock Real Estate today?", type: 'chat' }, false);

  const inputForm = document.createElement('form');
  Object.assign(inputForm.style, {
    display: 'flex', padding: '12px 14px', background: 'white',
    borderTop: '1px solid #f1f5f9', gap: '8px', alignItems: 'center'
  });
  const chatInput = document.createElement('input');
  chatInput.type = 'text'; chatInput.placeholder = 'Type your message...';
  Object.assign(chatInput.style, {
    flex: '1', padding: '9px 14px', borderRadius: '20px', border: '1px solid #cbd5e1',
    fontSize: '13.5px', outline: 'none', backgroundColor: '#f8fafc'
  });
  const sendBtn = document.createElement('button');
  sendBtn.type = 'submit'; sendBtn.innerText = 'Send';
  Object.assign(sendBtn.style, {
    padding: '9px 16px', backgroundColor: '#1f2937', color: 'white', border: 'none',
    borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
  });
  inputForm.appendChild(chatInput);
  inputForm.appendChild(sendBtn);
  container.appendChild(inputForm);

  document.body.appendChild(launcher);
  document.body.appendChild(container);

  async function sendMessage(text) {
    if (!text) return;
    chatInput.disabled = true;
    sendBtn.disabled = true;
    showThinking();

    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, chatInput: text, action: 'sendMessage' })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      removeThinking();
      addMessage(parseN8nResponse(data), false);

    } catch (err) {
      removeThinking();
      addMessage({ text: '⚠️ Could not reach the advisor. Please try again.', type: 'chat' }, false);
      console.error('[BlackRock Widget]', err);
    } finally {
      chatInput.disabled = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }
  }

  inputForm.onsubmit = (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = '';
    addMessage(text, true);
    sendMessage(text);
  };

  const toggle = (show) => {
    if (show) {
      container.style.display = 'flex';
      container.style.animation = 'widgetFadeIn 0.25s cubic-bezier(0.4,0,0.2,1) forwards';
      launcher.innerHTML = '✕';
    } else {
      container.style.display = 'none';
      launcher.innerHTML = '💬';
    }
  };
  launcher.onclick = () => toggle(container.style.display === 'none');
  closeBtn.onclick  = () => toggle(false);
})();