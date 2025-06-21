exports.handler = async (event) => {
  const token = process.env.GITHUB_TOKEN;
  const repo = "hassamali898/thegoodjointdc-restaurant"; // 🔁 Replace with your actual GitHub repo
  const branch = "main";
  const menuPath = "public/menu.json";

  try {
    // Step 1: Parse request body
    const { name, description, price, imageURL } = JSON.parse(event.body);

    // Step 2: Validate input
    if (!name || !description || !price || !imageURL) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing name, description, or price" }),
      };
    }

    // Step 3: Setup GitHub API headers
    const headers = {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "Netlify-CMS"
    };

    // Step 4: Get current menu.json
    const response = await fetch(`https://api.github.com/repos/${repo}/contents/${menuPath}?ref=${branch}`, {
      headers
    });
    const data = await response.json();

    if (!data.content || !data.sha) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "menu.json not found in repo" }),
      };
    }

    const menu = JSON.parse(Buffer.from(data.content, 'base64').toString());

    // Step 5: Add new item
    const newItem = {
      id: Date.now(),
      name,
      description,
      price,
      imageURL: imageURL
    };
    menu.push(newItem);

    const updatedContent = Buffer.from(JSON.stringify(menu, null, 2)).toString('base64');

    // Step 6: Commit the updated menu.json
    await fetch(`https://api.github.com/repos/${repo}/contents/${menuPath}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: "Add new menu item from admin panel",
        content: updatedContent,
        sha: data.sha,
        branch
      })
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Menu updated successfully" })
    };

  } catch (err) {
    console.error("Function error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error", error: err.message })
    };
  }
};
