import Request from "./request.js";

const methods = ["get", "post", "put", "head", "patch", "delete", "options"];

class RequestBuilder {
  #headers = new Map();
  constructor() {
    methods.forEach((method) => {
      this[method] = (url) => {
        if (!url) {
          throw new Error("url must be provided");
        }

        try {
          this.url = new URL(url);
        } catch (error) {
          throw new Error("Invalid url");
        }

        this.method = method.toUpperCase();
        return this;
      };
    });
  }

  send(body) {
    if (!body) {
      throw new Error("Body must be provided");
    }

    if (typeof body === "string") {
      this.#headers.set("Content-Type", "text/plain");
      this.#headers.set("Content-Length", body.length);
      this.body = body;
    } else if (typeof body === "object") {
      this.#headers.set("Content-Type", "application/json");
      const jsonBody = JSON.stringify(body);
      this.#headers.set("Content-Length", jsonBody.length);
      this.body = jsonBody;
    } else if (body instanceof URLSearchParams) {
      this.#headers.set("Content-Type", "application/x-www-form-urlencoded");
      this.body = body.toString();
    } else {
      throw new Error("Invalid body");
    }

    return this;
  }

  validate() {
    if (!this.url || !this.method) {
      throw new Error("Must specify a url and an http method");
    }

    if (this.query) {
      this.query.forEach((value, key) => {
        this.url.searchParams.set(key, value);
      });
    }
  }

  set(key, value) {
    this.#headers.set(key, value);
    return this;
  }

  setQuery(query) {
    if (!query) {
      throw new Error("No query provided");
    }
    this.query = new URLSearchParams(query);
    return this;
  }

  invoke() {
    this.validate();
    const request = new Request({
      method: this.method,
      url: this.url,
      headers: this.#headers,
      body: this.body,
    });

    return request.send();
  }
}

export default function request(url) {
  const builder = new RequestBuilder();
  if (url) {
    builder.get(url);
  }
  return builder;
}
