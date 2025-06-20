document.getElementById('menuForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const price = parseFloat(document.getElementById('price').value);
    const imageFile = document.getElementById('image').files[0];
  
    if (!name) {
      alert("Name and image are required!");
      return;
    }
  
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result.split(',')[1];
  
      const res = await fetch('/.netlify/functions/updateMenuWithImage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          price,
          imageName: imageFile.name,
          imageContent: base64Image
        })
      });
  
      const data = await res.json();
      document.getElementById('status').innerText = data.message;
    };
  
    reader.readAsDataURL(imageFile);
  });
  