document.getElementById("menuForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();
  const price = document.getElementById("price").value.trim();

  if (!name || !description || !price) {
    document.getElementById("status").innerText = "Please fill in all fields.";
    return;
  }

  try {
    const res = await fetch("/.netlify/functions/updateMenu", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, description, price })
    });

    const text = await res.text();

    if (!res.ok) {
      console.error("Server error:", text);
      document.getElementById("status").innerText = "Server error. Check logs.";
      return;
    }

    const data = JSON.parse(text);
    document.getElementById("status").innerText = data.message || "Item added!";
    document.getElementById("menuForm").reset();
  } catch (err) {
    console.error("Error:", err);
    document.getElementById("status").innerText = "Something went wrong.";
  }
});
