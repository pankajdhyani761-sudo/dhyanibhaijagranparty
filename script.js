const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle.addEventListener("click", () => {
  mainNav.classList.toggle("open");
  menuToggle.textContent = mainNav.classList.contains("open") ? "✕" : "☰";
});

document.querySelectorAll("#mainNav a").forEach(link => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.textContent = "☰";
  });
});

document.getElementById("year").textContent = new Date().getFullYear();

const dateInput = document.getElementById("date");
if (dateInput) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  dateInput.min = `${yyyy}-${mm}-${dd}`;
}

document.getElementById("bookingForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const eventType = document.getElementById("event").value;
  const date = document.getElementById("date").value;
  const location = document.getElementById("location").value.trim();
  const duration = document.getElementById("duration").value;
  const message = document.getElementById("message").value.trim();

  if (!name || !phone || !eventType || !date || !location) {
    alert("कृपया सभी जरूरी जानकारी भरें।");
    return;
  }

  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  const whatsappMessage =
`🙏 Jai Mata Di 🙏

*Dhyani Bhai Jagran Party - Booking Enquiry*

Name: ${name}
Mobile: ${phone}
Event: ${eventType}
Date: ${formattedDate}
Location: ${location}
Duration: ${duration}
Additional Details: ${message || "N/A"}

Mujhe booking/package ke baare mein quotation chahiye.`;

  const whatsappUrl = "https://wa.me/918587994018?text=" + encodeURIComponent(whatsappMessage);
  window.open(whatsappUrl, "_blank", "noopener");
});


// Photo/video gallery. Configure Supabase values in supabase-config.js before deployment.
(() => {
  const grid = document.getElementById("galleryGrid");
  const toggle = document.getElementById("galleryAdminToggle");
  const panel = document.getElementById("galleryAdminPanel");
  if (!grid || !toggle || !panel) return;

  const status = document.getElementById("galleryStatus");
  const loginForm = document.getElementById("galleryLoginForm");
  const uploadArea = document.getElementById("galleryUploadArea");
  const filesInput = document.getElementById("galleryFiles");
  const uploadBtn = document.getElementById("galleryUploadBtn");
  const logoutBtn = document.getElementById("galleryLogoutBtn");
  const supaConfig = window.DHYANI_SUPABASE || {};
  let supabase = null;
  let currentUser = null;

  const setStatus = (message, isError = false) => {
    status.textContent = message;
    status.style.color = isError ? "#b42318" : "#246b36";
  };

  if (window.supabase?.createClient && supaConfig.url && supaConfig.anonKey &&
      !supaConfig.url.includes("YOUR_") && !supaConfig.anonKey.includes("YOUR_")) {
    supabase = window.supabase.createClient(supaConfig.url, supaConfig.anonKey);
  }

  toggle.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    if (panel.hidden) return;
    if (!supabase) setStatus("पहले supabase-config.js में Supabase Project URL और anon key भरें। README में तरीका दिया है।", true);
    else refreshSession();
  });

  function makeCard(item) {
    const card = document.createElement("article");
    card.className = "gallery-photo";
    const isVideo = item.media_type === "video" || /\.(mp4|webm|mov)(\?|$)/i.test(item.public_url || "");
    let media;
    if (isVideo) {
      media = document.createElement("video");
      media.controls = true;
      media.preload = "metadata";
      media.playsInline = true;
    } else {
      media = document.createElement("img");
      media.loading = "lazy";
      media.alt = item.caption || "Dhyani Bhai Jagran Party event";
    }
    media.src = item.public_url;
    card.appendChild(media);
    if (item.caption) {
      const caption = document.createElement("p");
      caption.className = "gallery-caption";
      caption.textContent = item.caption;
      card.appendChild(caption);
    }
    if (currentUser) {
      const del = document.createElement("button");
      del.type = "button";
      del.className = "gallery-delete-btn";
      del.textContent = "Delete";
      del.addEventListener("click", async () => {
        if (!confirm("इस फोटो/वीडियो को गैलरी से हटाएँ?")) return;
        const { error } = await supabase.from("gallery_items").delete().eq("id", item.id);
        if (error) return setStatus("Delete नहीं हुआ: " + error.message, true);
        await loadGallery();
        setStatus("फाइल गैलरी से हटा दी गई।");
      });
      card.appendChild(del);
    }
    return card;
  }

  async function loadGallery() {
    if (!supabase) return;
    const { data, error } = await supabase.from("gallery_items").select("id, public_url, media_type, caption, created_at").order("created_at", { ascending: false });
    if (error) {
      grid.innerHTML = "";
      const msg = document.createElement("p");
      msg.className = "gallery-empty";
      msg.textContent = "गैलरी अभी लोड नहीं हो पाई। सेटअप के बाद यहाँ फोटो और वीडियो दिखेंगे।";
      grid.appendChild(msg);
      if (!panel.hidden) setStatus("Gallery load error: " + error.message, true);
      return;
    }
    grid.innerHTML = "";
    if (!data?.length) {
      const msg = document.createElement("p");
      msg.className = "gallery-empty";
      msg.textContent = "अभी नई फोटो/वीडियो नहीं हैं। जल्द ही यहाँ हमारी कार्यक्रमों की झलक देखें।";
      grid.appendChild(msg);
      return;
    }
    data.forEach(item => grid.appendChild(makeCard(item)));
  }

  async function refreshSession() {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    currentUser = data.session?.user || null;
    loginForm.hidden = !!currentUser;
    uploadArea.hidden = !currentUser;
    document.getElementById("galleryLoggedInAs").textContent = currentUser ? "Logged in: " + currentUser.email : "";
    await loadGallery();
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!supabase) return setStatus("Supabase config missing है।", true);
    setStatus("लॉगिन हो रहा है…");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: document.getElementById("galleryEmail").value.trim(),
      password: document.getElementById("galleryPassword").value
    });
    if (error) return setStatus("Login नहीं हुआ: " + error.message, true);
    currentUser = data.user;
    await refreshSession();
    setStatus("लॉगिन सफल। अब फोटो/वीडियो चुनकर Upload करें।");
  });

  uploadBtn.addEventListener("click", async () => {
    if (!supabase || !currentUser) return setStatus("पहले admin login करें।", true);
    const files = Array.from(filesInput.files || []);
    if (!files.length) return setStatus("पहले फोटो या वीडियो चुनें।", true);
    if (files.some(file => file.size > 100 * 1024 * 1024)) return setStatus("हर फाइल 100 MB से छोटी होनी चाहिए।", true);
    uploadBtn.disabled = true;
    const caption = document.getElementById("galleryCaption").value.trim();
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) throw new Error("केवल फोटो या वीडियो अपलोड करें।");
        setStatus(`अपलोड हो रहा है: ${i + 1}/${files.length} — ${file.name}`);
        const safeName = file.name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-100);
        const path = `${currentUser.id}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from("gallery").upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(path);
        const { error: insertError } = await supabase.from("gallery_items").insert({
          public_url: urlData.publicUrl,
          storage_path: path,
          media_type: file.type.startsWith("video/") ? "video" : "image",
          caption
        });
        if (insertError) throw insertError;
      }
      filesInput.value = "";
      await loadGallery();
      setStatus("अपलोड पूरा! फोटो/वीडियो अब वेबसाइट की Gallery में दिखेंगे।");
    } catch (error) {
      setStatus("अपलोड नहीं हुआ: " + (error.message || "कृपया Supabase setup और Storage policy जाँचें।"), true);
    } finally {
      uploadBtn.disabled = false;
    }
  });

  logoutBtn.addEventListener("click", async () => {
    if (supabase) await supabase.auth.signOut();
    currentUser = null;
    await refreshSession();
    setStatus("Logout हो गया।");
  });

  if (supabase) {
    supabase.auth.onAuthStateChange((_event, session) => {
      currentUser = session?.user || null;
      loginForm.hidden = !!currentUser;
      uploadArea.hidden = !currentUser;
      loadGallery();
    });
    loadGallery();
  }
})();
