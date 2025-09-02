const messagesEl = document.getElementById('messages');
const form = document.getElementById('chat-form');
const input = document.getElementById('msg-input');
const resetBtn = document.getElementById('reset-btn');

// Mapping ekspresi AI berdasarkan kata kunci
const expressions = {
  senang: "static/img/smile.jpg", // Happy
  marah: "static/img/angry.jpg", // Angry
  sedih: "static/img/sad.jpg", // Sad
  default: "static/img/neutral.jpg" // Neutral
};

function getExpressionImage(text) {
  text = text.toLowerCase();
  if (text.includes("terima kasih") || text.includes("hebat") || text.includes("senang")) {
    return expressions.senang;
  } else if (text.includes("tidak") || text.includes("marah")) {
    return expressions.marah;
  } else if (text.includes("sedih") || text.includes("kecewa")) {
    return expressions.sedih;
  }
  return expressions.default;
}

function addMsg(text, who='ai') {
  const div = document.createElement('div');
  div.className = `msg ${who}`;
  
  if (who === 'ai') {
    // tambahkan gambar ekspresi
    const img = document.createElement('img');
    img.src = getExpressionImage(text);
    img.className = 'ai-avatar';
    div.appendChild(img);

    const span = document.createElement('span');
    span.textContent = text;
    div.appendChild(span);
  } else {
    div.textContent = text;
  }

  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function sendMessage(text) {
  const loading = document.createElement('div');
  loading.className = 'msg ai loading';
  loading.textContent = 'AI sedang mengetik…';
  messagesEl.appendChild(loading);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    loading.remove();
    if (!res.ok) {
      addMsg(`Error: ${data.error || 'Gagal memproses.'}`, 'ai');
      return;
    }
    addMsg(data.reply, 'ai');
  } catch (e) {
    loading.remove();
    addMsg(`Error jaringan: ${e}`, 'ai');
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addMsg(text, 'user');
  input.value='';
  sendMessage(text);
});

resetBtn.addEventListener('click', async () => {
  await fetch('/api/reset', { method: 'POST' });
  messagesEl.innerHTML = '';
  addMsg('Riwayat percakapan direset. Mulai chat lagi 👍', 'ai');
});
