(function() {
  const scriptTag = document.currentScript;
  const personaId = scriptTag.getAttribute('data-id');
  const baseUrl = "http://localhost:8080/p/public";

  if (!personaId) return;

  // --- 1. Create Container ---
  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed', bottom: '20px', right: '20px', width: '420px', height: '650px',
    zIndex: '999999', display: 'flex', flexDirection: 'column',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)', borderRadius: '16px', overflow: 'hidden',
    backgroundColor: 'white', border: '1px solid #e5e7eb'
  });

  // --- 2. Create Header with Name Placeholder ---
  const header = document.createElement('div');
  Object.assign(header.style, {
    padding: '0 16px', background: '#4f46e5', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center', height: '50px'
  });

  // The Name Element
  const nameLabel = document.createElement('span');
  nameLabel.innerText = 'Chat'; // Default fallback
  Object.assign(nameLabel.style, {
    color: 'white', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '16px'
  });

  const btnContainer = document.createElement('div');
  btnContainer.style.display = 'flex';
  btnContainer.style.gap = '8px';

  const createBtn = (entity, title) => {
    const btn = document.createElement('button');
    btn.innerHTML = `<span style="font-size: 22px; line-height: 1;">${entity}</span>`;
    btn.title = title;
    Object.assign(btn.style, {
      border: 'none', background: 'none', color: 'white', cursor: 'pointer',
      width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center'
    });
    return btn;
  };

  const minBtn = createBtn('&minus;', 'Minimize');
  const closeBtn = createBtn('&times;', 'Close');

  btnContainer.appendChild(minBtn);
  btnContainer.appendChild(closeBtn);
  header.appendChild(nameLabel); // Add name to left side
  header.appendChild(btnContainer); // Add buttons to right side

  // --- 3. Message Listener (The Secret Sauce) ---
  window.addEventListener('message', (event) => {
    // Only accept messages from your trusted domain
    if (event.origin !== "http://localhost:8080") return;

    if (event.data.type === 'SET_PERSONA_NAME') {
      nameLabel.innerText = event.data.name;
    }
  });

  // --- 4. Assembly ---
  const iframe = document.createElement('iframe');
  iframe.src = `${baseUrl}/${personaId}?embed=true`;
  Object.assign(iframe.style, { width: '100%', height: 'calc(100% - 50px)', border: 'none' });

  container.appendChild(header);
  container.appendChild(iframe);
  document.body.appendChild(container);

  // ... rest of minimize/launcher logic ...
  minBtn.onclick = () => { container.style.display = 'none'; };
})();