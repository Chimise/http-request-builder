import http from "node:http";

class Request {
  constructor({ method, url, headers, body }) {
    this.method = method;
    this.url = url;
    this.headers =
      headers instanceof Map ? Object.fromEntries(headers.entries()) : headers;
    this.body = body;
  }

  send() {
    return new Promise((resolve, reject) => {
      const req = http.request(
        this.url,
        {
          method: this.method,
          headers: this.headers,
        },
        (res) => {
          const parseJson = async (str) => {
            return JSON.parse(str);
          };

          res.json = function () {
            return new Promise((resolveJSON, rejectJSON) => {
              if (this.body) {
                return parseJson(this.body).then(resolveJSON, rejectJSON);
              }

              this.body = "";
              this.on("data", (chunk) => {
                this.body += chunk;
              });

              this.on("error", rejectJSON);

              this.on("end", () => {
                this.removeListener("error", rejectJSON);
                parseJson(this.body).then(resolveJSON, rejectJSON);
              });
            });
          };

          res.text = function () {
            return new Promise((resolveText, rejectText) => {
              if (this.body) {
                return resolveText(this.body);
              }
              this.body = "";
              this.on("data", (chunk) => {
                this.body += chunk;
              });
              this.on("error", rejectText);

              this.on("end", () => {
                this.removeListener("error", rejectText);
                resolveText(this.body);
              });
            });
          };

          resolve(res);
        }
      );

      req.on("error", reject);

      if (this.body) {
        req.write(this.body);
      }
      req.end();
    });
  }
}

export default Request;

