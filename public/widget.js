(function() {
  const scriptTag = document.currentScript;
  const personaId = scriptTag.getAttribute('data-id');

  // IMPORTANT: Ensure this URL points to your actual backend API/Persona route
  // If your persona chat is at /p/public/[id], this should be the base.
  const baseUrl = "http://localhost:8080/p/public";

  if (!personaId) return;

  // --- 1. Create the Launcher Button ---
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

  // --- 2. Create Container ---
  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed', bottom: '90px', right: '20px',
    width: '400px', height: '600px', zIndex: '999999',
    display: 'none', flexDirection: 'column',
    boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
    borderRadius: '16px', overflow: 'hidden',
    backgroundColor: 'white', border: '1px solid #e5e7eb'
  });

  // --- 3. Create Header ---
  const header = document.createElement('div');
  Object.assign(header.style, {
    padding: '0 15px', background: '#1f2937', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center', height: '60px',
    borderBottom: '3px solid #b59410'
  });

  const nameLabel = document.createElement('span');
  nameLabel.innerText = 'Croconus Digital Twin';
  Object.assign(nameLabel.style, {
    color: 'white', fontFamily: 'sans-serif', fontWeight: '700', fontSize: '15px'
  });

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '✕';
  Object.assign(closeBtn.style, {
    border: 'none', background: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '20px'
  });

  header.appendChild(nameLabel);
  header.appendChild(closeBtn);

  // --- 4. Iframe Assembly ---
  const iframe = document.createElement('iframe');
  // Construct the URL. ?embed=true can be used by your backend to hide headers/footers
  iframe.src = `${baseUrl}/${personaId}?embed=true`;
  Object.assign(iframe.style, { width: '100%', height: 'calc(100% - 60px)', border: 'none' });

  container.appendChild(header);
  container.appendChild(iframe);
  document.body.appendChild(launcher);
  document.body.appendChild(container);

  // --- 5. Logic ---
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