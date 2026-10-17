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
