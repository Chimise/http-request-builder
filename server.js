import http from "node:http";
const posts = [
  {
    id: 1,
    message: "How are you doing",
    created_at: new Date(new Date().setFullYear(2021, 10, 9)).toISOString(),
  },
  {
    id: 2,
    message: "Whats up",
    created_at: new Date(new Date().setFullYear(2022, 2, 20)).toISOString(),
  },
  {
    id: 3,
    message: "I have been trying to reach you",
    created_at: new Date(new Date().setFullYear(2023, 6, 9)).toISOString(),
  },
  {
    id: 4,
    message: "Hello there",
    created_at: new Date(new Date().setFullYear(2020, 5, 22)).toISOString(),
  },
];

const jsonHeader = { "Content-Type": "application/json" };

async function main() {
  const PORT = process.env.PORT || 3000;
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    console.log(`${req.method} from ${url.pathname}`);
    if (req.method === "GET" && url.pathname === "/") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Welcome to post api");
    } else if (req.method === "GET" && url.pathname.match(/^\/posts\/+d$/)) {
      const id = url.pathname.split("/").slice(-1)[0];
      const selectedPost = posts.find((post) => post.id == id);

      if (!selectedPost) {
        res.writeHead(404, jsonHeader);
        return res.end(JSON.stringify({ message: "Post not found" }));
      }
      res.writeHead(200, jsonHeader);
      res.end(JSON.stringify(selectedPost));
    } else if (req.method === "POST" && url.pathname === "/posts") {
      let data = "";
      req.on("data", (chunk) => {
        data += chunk;
      });

      req.on("end", () => {
        if (!data) {
          res.writeHead(400, jsonHeader);
          return res.end(JSON.stringify({ message: "Invalid body" }));
        }

        try {
          const parsedData = JSON.parse(data);
          if (!parsedData.message) {
            throw new Error("No message found");
          }

          parsedData.id = Math.round(Math.random() * 10000);
          parsedData.created_at = new Date().toISOString();
          posts.push(parsedData);
          res.writeHead(201, jsonHeader);
          res.end(JSON.stringify(parsedData));
        } catch (error) {
          res.writeHead(400, jsonHeader);
          return res.end(JSON.stringify({ message: "Invalid body" }));
        }
      });
    }else if(req.method === 'GET' && url.pathname === '/posts') {
        res.writeHead(200, jsonHeader);
        res.end(JSON.stringify(posts));
    }
     else {
      res.writeHead(405, jsonHeader);
      res.end(JSON.stringify({ message: "Path not allowed" }));
    }
  });

  server.listen(PORT, () => {
    console.log("Server listening on port %d", PORT);
  });
}

main().catch((err) => console.log(err));
