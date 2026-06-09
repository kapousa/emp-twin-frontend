(function() {
  const scriptTag = document.currentScript;
  const personaId = scriptTag.getAttribute('data-id');

  // Point this directly to your FastAPI backend server instance
  const apiBaseUrl = "http://localhost:8000/public";

  if (!personaId) return;

  // --- 1. Unique Session Identifier Generation ---
  const sessionId = `sess_${Math.random().toString(36).substring(2, 11)}`;

  // --- 2. Create the Launcher Button ---
  const launcher = document.createElement('div');
  Object.assign(launcher.style, {
    position: 'fixed', bottom: '20px', right: '20px',
    width: '60px', height: '60px', borderRadius: '50%',
    backgroundColor: '#1f2937', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    zIndex: '1000000', fontSize: '24px', transition: 'all 0.2s ease'
  });
  launcher.innerHTML = '💬';

  // --- 3. Create Main Widget Container ---
  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed', bottom: '90px', right: '20px',
    width: '400px', height: '600px', zIndex: '999999',
    display: 'none', flexDirection: 'column',
    boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
    borderRadius: '16px', overflow: 'hidden',
    backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
    fontFamily: 'sans-serif'
  });

  // --- 4. Create Header Panel ---
  const header = document.createElement('div');
  Object.assign(header.style, {
    padding: '0 15px', background: '#1f2937', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center', height: '60px',
    borderBottom: '3px solid #b59410', flexShrink: '0'
  });

  const nameLabel = document.createElement('span');
  nameLabel.innerText = 'Faleh AI Advisor';
  Object.assign(nameLabel.style, {
    color: 'white', fontWeight: '700', fontSize: '15px'
  });

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '✕';
  Object.assign(closeBtn.style, {
    border: 'none', background: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '20px'
  });

  header.appendChild(nameLabel);
  header.appendChild(closeBtn);
  container.appendChild(header);

  // --- 5. Native Message Display Box Area ---
  const msgArea = document.createElement('div');
  Object.assign(msgArea.style, {
    flex: '1', padding: '15px', overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: '10px'
  });
  container.appendChild(msgArea);

  // Helper function to append message bubbles dynamically
  function addMessage(text, isUser, uiType = 'text', meta = {}) {
    const bubbleWrapper = document.createElement('div');
    bubbleWrapper.style.display = 'flex';
    bubbleWrapper.style.justifyContent = isUser ? 'flex-end' : 'flex-start';
    bubbleWrapper.style.width = '100%';

    const bubble = document.createElement('div');
    Object.assign(bubble.style, {
      maxWidth: '80%', padding: '10px 14px', borderRadius: '14px',
      fontSize: '14px', lineHeight: '1.4', whiteSpace: 'pre-wrap'
    });

    if (isUser) {
      bubble.style.backgroundColor = '#c89a4d';
      bubble.style.color = 'white';
      bubble.innerText = text;
    } else {
      bubble.style.backgroundColor = 'white';
      bubble.style.color = '#1e293b';
      bubble.style.border = '1px solid #e2e8f0';
      bubble.innerText = text;

      // FIX: Correctly look into scoped parameter 'meta.downloadUrl' instead of 'data' object
      if (uiType === 'document' && meta.downloadUrl) {
        const actionBtn = document.createElement('a');
        actionBtn.href = meta.downloadUrl;
        actionBtn.target = '_blank';
        actionBtn.innerText = '📄 View Compiled Document';
        Object.assign(actionBtn.style, {
          display: 'block', marginTop: '8px', padding: '6px 10px',
          backgroundColor: '#10b981', color: 'white', textDecoration: 'none',
          textAlign: 'center', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold'
        });
        bubble.appendChild(actionBtn);
      } else if (uiType === 'email_confirmation') {
        const checkTag = document.createElement('div');
        checkTag.innerText = '📧 Corporate Mail Dispatched';
        Object.assign(checkTag.style, {
          fontSize: '11px', color: '#c89a4d', marginTop: '5px', fontWeight: 'bold'
        });
        bubble.appendChild(checkTag);
      }
    }

    bubbleWrapper.appendChild(bubble);
    msgArea.appendChild(bubbleWrapper);
    msgArea.scrollTop = msgArea.scrollHeight;
  }

  // Welcome Message
  addMessage("Hello! How can I assist you with Black Rock Real Estate properties today?", false);

  // --- 6. Input Control Bar ---
  const inputForm = document.createElement('form');
  Object.assign(inputForm.style, {
    display: 'flex', padding: '10px', background: 'white',
    borderTop: '1px solid #e2e8f0', gap: '8px', flexShrink: '0'
  });

  const chatInput = document.createElement('input');
  chatInput.type = 'text';
  chatInput.placeholder = 'Type your message...';
  Object.assign(chatInput.style, {
    flex: '1', padding: '10px', borderRadius: '8px',
    border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'
  });

  const sendBtn = document.createElement('button');
  sendBtn.type = 'submit';
  sendBtn.innerText = 'Send';
  Object.assign(sendBtn.style, {
    padding: '10px 16px', backgroundColor: '#1f2937', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold'
  });

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

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId,
          chatInput: queryText
        })
      });

      if (!response.ok) throw new Error("Gateway communication error.");

      const data = await response.json();

      // 1. Safely pull message text variants
      const finalMessage = data.message || data.text || "Processed successfully.";

      // 2. Identify layout variant (force document view structure if link is detected)
      const uiType = data.uiType || (data.downloadUrl ? 'document' : 'text');

      // 3. Bridging Layer: Map root level download links down into the meta frame object
      const meta = data.meta || {};
      if (data.downloadUrl) {
          meta.downloadUrl = data.downloadUrl;
      }

      // Render the response cleanly inside the interface framework
      addMessage(
        finalMessage,
        false,
        uiType,
        meta
      );

    } catch (error) {
      addMessage("⚠️ System pipeline connection error. Unable to contact advisor runtime.", false);
    } finally {
      chatInput.disabled = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }
  };

  launcher.onclick = () => {
    const isHidden = container.style.display === 'none';
    container.style.display = isHidden ? 'flex' : 'none';
    launcher.innerHTML = isHidden ? '✕' : '💬';
  };

  closeBtn.onclick = () => {
    container.style.display = 'none';
    launcher.innerHTML = '💬';
  };
})();