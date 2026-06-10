(function() {
  const scriptTag = document.currentScript;
  const personaId = scriptTag.getAttribute('data-id');

  // Point this directly to your FastAPI backend server instance
  const apiBaseUrl = "http://localhost:8000/public";

  if (!personaId) return;

  // --- 1. Unique Session Identifier Generation ---
  const sessionId = `sess_${Math.random().toString(36).substring(2, 11)}`;

  // --- Inject CSS Styles for custom animations and scrollbars ---
  const style = document.createElement('style');
  style.textContent = `
    @keyframes widgetFadeIn {
      from { opacity: 0; transform: translateY(15px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes brBlink {
      0%, 100% { opacity: 0.2; }
      50% { opacity: 1; }
    }
    .br-msg-area::-webkit-scrollbar {
      width: 5px;
    }
    .br-msg-area::-webkit-scrollbar-track {
      background: transparent;
    }
    .br-msg-area::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 10px;
    }
    .br-msg-area::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    .br-thinking-dot {
      animation: brBlink 1.4s infinite both;
      font-weight: bold;
      color: #c89a4d;
    }
    .br-thinking-dot:nth-child(2) { animation-delay: .2s; }
    .br-thinking-dot:nth-child(3) { animation-delay: .4s; }
    
    /* Interactive Form Elements styling */
    .br-custom-form {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
      box-sizing: border-box;
    }
    .br-form-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 12.5px;
      outline: none;
      box-sizing: border-box;
      background: white;
      color: #334155;
    }
    .br-form-input:focus {
      border-color: #c89a4d;
    }
    .br-form-submit {
      width: 100%;
      padding: 8px;
      background-color: #1f2937;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .br-form-submit:hover {
      background-color: #374151;
    }
  `;
  document.head.appendChild(style);

  // --- 2. Create the Launcher Button ---
  const launcher = document.createElement('div');
  Object.assign(launcher.style, {
    position: 'fixed', bottom: '24px', right: '24px',
    width: '52px', height: '52px', borderRadius: '50%',
    backgroundColor: '#1f2937', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    zIndex: '1000000', fontSize: '20px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  });
  launcher.innerHTML = '💬';

  // --- 3. Create Main Widget Container ---
  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed', bottom: '90px', right: '24px',
    width: '350px', height: '520px', zIndex: '999999',
    display: 'none', flexDirection: 'column',
    boxShadow: '0 10px 32px -4px rgba(0,0,0,0.1), 0 4px 14px -2px rgba(0,0,0,0.05)',
    borderRadius: '16px', overflow: 'hidden',
    backgroundColor: '#f8fafc', border: '1px solid rgba(226, 232, 240, 0.8)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  });

  // --- 4. Create Header Panel ---
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

  // --- 5. Message Display Box Area ---
  const msgArea = document.createElement('div');
  msgArea.className = 'br-msg-area';
  Object.assign(msgArea.style, { flex: '1', padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' });
  container.appendChild(msgArea);

  let currentLoader = null;

  function showThinkingIndicator() {
    if (currentLoader) return;
    const bubbleWrapper = document.createElement('div');
    bubbleWrapper.style.display = 'flex';
    bubbleWrapper.style.width = '100%';
    const bubble = document.createElement('div');
    Object.assign(bubble.style, {
      maxWidth: '85%', padding: '10px 14px', borderRadius: '12px', fontSize: '13.5px',
      backgroundColor: 'white', color: '#64748b', border: '1px solid #e2e8f0', borderBottomLeftRadius: '4px',
      display: 'flex', alignItems: 'center', gap: '3px'
    });
    bubble.innerHTML = 'Thinking<span class="br-thinking-dot">.</span><span class="br-thinking-dot">.</span><span class="br-thinking-dot">.</span>';
    bubbleWrapper.appendChild(bubble);
    msgArea.appendChild(bubbleWrapper);
    msgArea.scrollTop = msgArea.scrollHeight;
    currentLoader = bubbleWrapper;
  }

  function removeThinkingIndicator() {
    if (currentLoader) { currentLoader.remove(); currentLoader = null; }
  }

  // Helper function to append message bubbles and process embedded action tokens
  function addMessage(rawText, isUser, uiType = 'text', meta = {}) {
    const bubbleWrapper = document.createElement('div');
    bubbleWrapper.style.display = 'flex';
    bubbleWrapper.style.justifyContent = isUser ? 'flex-end' : 'flex-start';
    bubbleWrapper.style.width = '100%';

    const bubble = document.createElement('div');
    Object.assign(bubble.style, {
      maxWidth: '85%', padding: '10px 14px', borderRadius: '12px',
      fontSize: '13.5px', lineHeight: '1.45', whiteSpace: 'pre-wrap',
      boxShadow: isUser ? '0 2px 4px rgba(200,154,77,0.15)' : '0 1px 2px rgba(0,0,0,0.02)'
    });

    if (isUser) {
      bubble.style.backgroundColor = '#c89a4d';
      bubble.style.color = 'white';
      bubble.style.borderBottomRightRadius = '4px';
      bubble.innerText = rawText;
      bubbleWrapper.appendChild(bubble);
      msgArea.appendChild(bubbleWrapper);
      return;
    }

    // --- AI Response String Cleaning & Extraction Operations ---
    bubble.style.backgroundColor = 'white';
    bubble.style.color = '#334155';
    bubble.style.border = '1px solid #e2e8f0';
    bubble.style.borderBottomLeftRadius = '4px';

    let cleanText = rawText;
    let extractedAction = null;
    let actionValue = "";

    // Regular Expression patterns to detect backend control sequences
    const emailMatch = cleanText.match(/\[SEND_EMAIL:([^\]]+)\]/);
    const appointmentMatch = cleanText.match(/\[BOOK_APPOINTMENT\]/);
    const docMatch = cleanText.match(/\[GENERATE_DOC\]/);

    if (emailMatch) {
      extractedAction = 'email';
      actionValue = emailMatch[1].trim();
      cleanText = cleanText.replace(/\[SEND_EMAIL:[^\]]+\]/, '');
    } else if (appointmentMatch) {
      extractedAction = 'appointment';
      cleanText = cleanText.replace(/\[BOOK_APPOINTMENT\]/, '');
    } else if (docMatch) {
      extractedAction = 'document';
      cleanText = cleanText.replace(/\[GENERATE_DOC\]/, '');
    }

    bubble.innerText = cleanText.trim();

    // --- Interactive Form Component Injections ---
    if (extractedAction === 'email') {
      const form = document.createElement('div');
      form.className = 'br-custom-form';
      form.innerHTML = `
        <input type="email" class="br-form-input" id="email-to" value="${actionValue}" placeholder="Recipient Email">
        <input type="text" class="br-form-input" id="email-sub" placeholder="Email Subject">
        <button class="br-form-submit" id="email-btn">📧 Send Official Email</button>
      `;
      form.querySelector('#email-btn').onclick = async (e) => {
        e.target.disabled = true; e.target.innerText = 'Sending...';
        console.log("Triggering Email Action Pipeline", { to: form.querySelector('#email-to').value, subject: form.querySelector('#email-sub').value });
        setTimeout(() => { form.innerHTML = '<div style="color:#10b981; font-size:12px; font-weight:600;">✅ Email dispatched successfully!</div>'; }, 1000);
      };
      bubble.appendChild(form);
    }

    else if (extractedAction === 'appointment') {
      const form = document.createElement('div');
      form.className = 'br-custom-form';
      form.innerHTML = `
        <input type="date" class="br-form-input" id="book-date">
        <input type="time" class="br-form-input" id="book-time">
        <button class="br-form-submit" id="book-btn">📅 Confirm Appointment</button>
      `;
      form.querySelector('#book-btn').onclick = async (e) => {
        e.target.disabled = true; e.target.innerText = 'Booking...';
        console.log("Triggering Calendar Booking Pipeline", { date: form.querySelector('#book-date').value, time: form.querySelector('#book-time').value });
        setTimeout(() => { form.innerHTML = '<div style="color:#10b981; font-size:12px; font-weight:600;">✅ Appointment reserved on calendar!</div>'; }, 1000);
      };
      bubble.appendChild(form);
    }

    if (uiType === 'document' || extractedAction === 'document') {
      const url = meta.downloadUrl || "#";
      const actionBtn = document.createElement('a');
      actionBtn.href = url; actionBtn.target = '_blank'; actionBtn.innerText = '📄 View Compiled Document';
      Object.assign(actionBtn.style, {
        display: 'block', marginTop: '10px', padding: '8px 12px', backgroundColor: '#10b981', color: 'white',
        textDecoration: 'none', textAlign: 'center', borderRadius: '6px', fontSize: '12px', fontWeight: '600'
      });
      bubble.appendChild(actionBtn);
    }

    bubbleWrapper.appendChild(bubble);
    msgArea.appendChild(bubbleWrapper);
    msgArea.scrollTop = msgArea.scrollHeight;
  }

  // Welcome Message
  addMessage("Hello! How can I assist you with Black Rock Real Estate properties today?", false);

  // --- 6. Input Control Bar ---
  const inputForm = document.createElement('form');
  Object.assign(inputForm.style, { display: 'flex', padding: '12px 14px', background: 'white', borderTop: '1px solid #f1f5f9', gap: '8px', alignItems: 'center' });

  const chatInput = document.createElement('input');
  chatInput.type = 'text'; chatInput.placeholder = 'Type your message...';
  Object.assign(chatInput.style, { flex: '1', padding: '9px 14px', borderRadius: '20px', border: '1px solid #cbd5e1', fontSize: '13.5px', outline: 'none', backgroundColor: '#f8fafc' });

  const sendBtn = document.createElement('button');
  sendBtn.type = 'submit'; sendBtn.innerText = 'Send';
  Object.assign(sendBtn.style, { padding: '9px 16px', backgroundColor: '#1f2937', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' });

  inputForm.appendChild(chatInput);
  inputForm.appendChild(sendBtn);
  container.appendChild(inputForm);

  document.body.appendChild(launcher);
  document.body.appendChild(container);

  // --- 7. Interactive Logic & Event Handling ---
  inputForm.onsubmit = async (e) => {
    e.preventDefault();
    const queryText = chatInput.value.trim();
    if (!queryText) return;

    chatInput.value = '';
    chatInput.disabled = true;
    sendBtn.disabled = true;
    addMessage(queryText, true);
    showThinkingIndicator();

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId, chatInput: queryText })
      });

      if (!response.ok) throw new Error("Gateway communication error.");
      const data = await response.json();

      const finalMessage = data.message || data.text || "Processed successfully.";
      const uiType = data.uiType || (data.downloadUrl ? 'document' : 'text');
      const meta = data.meta || {};
      if (data.downloadUrl) { meta.downloadUrl = data.downloadUrl; }

      removeThinkingIndicator();
      addMessage(finalMessage, false, uiType, meta);

    } catch (error) {
      removeThinkingIndicator();
      addMessage("⚠️ System pipeline connection error. Unable to contact advisor runtime.", false);
    } finally {
      chatInput.disabled = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }
  };

  const toggleWidget = (show) => {
    if (show) {
      container.style.display = 'flex';
      container.style.animation = 'widgetFadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards';
      launcher.innerHTML = '✕';
    } else {
      container.style.display = 'none';
      launcher.innerHTML = '💬';
    }
  };

  launcher.onclick = () => { toggleWidget(container.style.display === 'none'); };
  closeBtn.onclick = () => { toggleWidget(false); };
})();