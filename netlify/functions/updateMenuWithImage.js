exports.handler = async (event) => {
  const token = process.env.GITHUB_TOKEN;
  const repo = "hassamali898/restautant-cms";
  const branch = "main";
  const menuPath = "public-site/menu.json";
  const imageFolder = "public-site/images/";

  try {
    const { name, description, price, imageName, imageContent } = JSON.parse(event.body);

    const headers = {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "Netlify-CMS"
    };

    // Get current menu.json SHA
    const menuRes = await fetch(`https://api.github.com/repos/${repo}/contents/${menuPath}?ref=${branch}`, { headers });
    const menuData = await menuRes.json();
    const menuSHA = menuData.sha;
    const currentMenu = JSON.parse(Buffer.from(menuData.content, 'base64').toString());

    // Add new item
    const newItem = {
      id: Date.now(),
      name,
      description,
      price,
      image: `images/${imageName}`
    };
    currentMenu.push(newItem);

    const updatedMenuBase64 = Buffer.from(JSON.stringify(currentMenu, null, 2)).toString('base64');

    // Update menu.json
    await fetch(`https://api.github.com/repos/${repo}/contents/${menuPath}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: "Update menu.json from admin panel",
        content: updatedMenuBase64,
        sha: menuSHA,
        branch
      })
    });

    // Upload image
    const imageRes = await fetch(`https://api.github.com/repos/${repo}/contents/${imageFolder}${imageName}?ref=${branch}`, { headers });
    const imageSHA = imageRes.status === 200 ? (await imageRes.json()).sha : null;

    await fetch(`https://api.github.com/repos/${repo}/contents/${imageFolder}${imageName}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: "Add menu image from admin panel",
        content: imageContent,
        ...(imageSHA ? { sha: imageSHA } : {}),
        branch
      })
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Menu updated and image uploaded!" })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Error: ${error.message}` })
    };
  }
};
