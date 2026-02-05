(function() {
  const scriptTag = document.currentScript;
  const personaId = scriptTag.getAttribute('data-id');
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
    zIndex: '1000000', fontSize: '24px', transition: 'transform 0.2s'
  });
  launcher.innerHTML = '💬'; // You can replace this with an icon image
  launcher.onmouseover = () => launcher.style.transform = 'scale(1.1)';
  launcher.onmouseout = () => launcher.style.transform = 'scale(1)';

  // --- 2. Create Container (Reduced Size) ---
  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed',
    bottom: '90px', // Lifted up to sit above the launcher
    right: '20px',
    width: '380px',  // Reduced from 420px
    height: '550px', // Reduced from 650px
    zIndex: '999999',
    display: 'none', // Hidden by default
    flexDirection: 'column',
    boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: 'white',
    border: '1px solid #d1d5db'
  });

  // --- 3. Create Header ---
  const header = document.createElement('div');
  Object.assign(header.style, {
    padding: '0 15px', background: '#1f2937', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center', height: '50px',
    borderBottom: '2px solid #b59410'
  });

  const nameLabel = document.createElement('span');
  nameLabel.innerText = 'Faleh Advisor';
  Object.assign(nameLabel.style, {
    color: '#f3f4f6', fontFamily: 'sans-serif', fontWeight: '600', fontSize: '14px'
  });

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '✕';
  Object.assign(closeBtn.style, {
    border: 'none', background: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '18px'
  });

  header.appendChild(nameLabel);
  header.appendChild(closeBtn);

  // --- 4. Assembly ---
  const iframe = document.createElement('iframe');
  iframe.src = `${baseUrl}/${personaId}?embed=true`;
  Object.assign(iframe.style, { width: '100%', height: 'calc(100% - 50px)', border: 'none' });

  container.appendChild(header);
  container.appendChild(iframe);
  document.body.appendChild(launcher);
  document.body.appendChild(container);

  // --- 5. Toggle Logic ---
  launcher.onclick = () => {
    container.style.display = container.style.display === 'none' ? 'flex' : 'none';
  };

  closeBtn.onclick = () => {
    container.style.display = 'none';
  };

})();