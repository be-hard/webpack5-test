const http = require("node:http");

const port = Number(process.env.MOCK_SWAGGER_PORT || 5050);

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let rawBody = "";

    request.on("data", (chunk) => {
      rawBody += chunk;
    });
    request.on("end", () => {
      try {
        resolve(rawBody ? JSON.parse(rawBody) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(payload));
}

function createOpenApiSpec() {
  return {
    openapi: "3.0.0",
    info: {
      title: "Backend Service",
      version: "1.0.0",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
    paths: {
      "/auth/login": {
        post: {
          tags: ["auth"],
          operationId: "login",
          summary: "Login",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LoginParams",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Login result",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/LoginResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/auth/refresh": {
        post: {
          tags: ["auth"],
          operationId: "refreshToken",
          summary: "Refresh access token",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RefreshTokenParams",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Refresh token result",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/RefreshTokenResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/auth/profile": {
        get: {
          tags: ["auth"],
          operationId: "getProfile",
          summary: "Get current user profile",
          responses: {
            200: {
              description: "Current user profile",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/UserProfileResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/users/{userId}/orders": {
        get: {
          tags: ["orders"],
          operationId: "getUserOrders",
          summary: "Get user orders",
          parameters: [
            {
              name: "userId",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "status",
              in: "query",
              schema: {
                type: "string",
                enum: ["pending", "paid", "cancelled"],
              },
            },
            {
              name: "page",
              in: "query",
              schema: {
                type: "number",
                default: 1,
              },
            },
            {
              name: "pageSize",
              in: "query",
              schema: {
                type: "number",
                default: 20,
              },
            },
          ],
          responses: {
            200: {
              description: "User order list",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/OrderListResponse",
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        LoginParams: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: {
              type: "string",
            },
            password: {
              type: "string",
            },
          },
        },
        LoginResult: {
          type: "object",
          required: ["accessToken"],
          properties: {
            accessToken: {
              type: "string",
            },
            refreshToken: {
              type: "string",
            },
          },
        },
        RefreshTokenParams: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: {
              type: "string",
            },
          },
        },
        RefreshTokenResult: {
          type: "object",
          required: ["accessToken"],
          properties: {
            accessToken: {
              type: "string",
            },
            refreshToken: {
              type: "string",
            },
          },
        },
        UserProfile: {
          type: "object",
          required: ["id", "name", "roles"],
          properties: {
            id: {
              type: "string",
            },
            name: {
              type: "string",
            },
            avatarUrl: {
              type: "string",
            },
            roles: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
        },
        LoginResponse: {
          allOf: [
            {
              $ref: "#/components/schemas/ApiResponse",
            },
            {
              type: "object",
              properties: {
                data: {
                  $ref: "#/components/schemas/LoginResult",
                },
              },
            },
          ],
        },
        RefreshTokenResponse: {
          allOf: [
            {
              $ref: "#/components/schemas/ApiResponse",
            },
            {
              type: "object",
              properties: {
                data: {
                  $ref: "#/components/schemas/RefreshTokenResult",
                },
              },
            },
          ],
        },
        UserProfileResponse: {
          allOf: [
            {
              $ref: "#/components/schemas/ApiResponse",
            },
            {
              type: "object",
              properties: {
                data: {
                  $ref: "#/components/schemas/UserProfile",
                },
              },
            },
          ],
        },
        Order: {
          type: "object",
          required: ["id", "title", "status", "amount"],
          properties: {
            id: {
              type: "string",
            },
            title: {
              type: "string",
            },
            status: {
              type: "string",
              enum: ["pending", "paid", "cancelled"],
            },
            amount: {
              type: "number",
            },
          },
        },
        OrderList: {
          type: "object",
          required: ["items", "total"],
          properties: {
            items: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Order",
              },
            },
            total: {
              type: "number",
            },
          },
        },
        OrderListResponse: {
          allOf: [
            {
              $ref: "#/components/schemas/ApiResponse",
            },
            {
              type: "object",
              properties: {
                data: {
                  $ref: "#/components/schemas/OrderList",
                },
              },
            },
          ],
        },
        ApiResponse: {
          type: "object",
          required: ["code", "data"],
          properties: {
            code: {
              type: "number",
            },
            message: {
              type: "string",
            },
            data: {},
          },
        },
      },
    },
  };
}

const server = http.createServer(async (request, response) => {
  if (request.url === "/swagger.json") {
    const featureTag = request.headers["feature-tag"];
    console.log(`GET /swagger.json feature-tag=${featureTag || "<empty>"}`);

    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(createOpenApiSpec()));
    return;
  }

  if (request.url === "/api/auth/login" && request.method === "POST") {
    const featureTag = request.headers["feature-tag"];
    const body = await readJsonBody(request);
    console.log(`POST /api/auth/login feature-tag=${featureTag || "<empty>"}`);

    if (body.username !== "admin" || body.password !== "123456") {
      sendJson(response, 401, {
        code: 401,
        message: "Invalid username or password",
      });
      return;
    }

    sendJson(response, 200, {
      code: 0,
      message: "ok",
      data: {
        accessToken: "expired-access-token",
        refreshToken: "valid-refresh-token",
      },
    });
    return;
  }

  if (request.url === "/api/auth/refresh" && request.method === "POST") {
    const featureTag = request.headers["feature-tag"];
    const body = await readJsonBody(request);
    console.log(`POST /api/auth/refresh feature-tag=${featureTag || "<empty>"}`);

    if (body.refreshToken !== "valid-refresh-token") {
      sendJson(response, 401, {
        code: 401,
        message: "Refresh token expired",
      });
      return;
    }

    sendJson(response, 200, {
      code: 0,
      message: "ok",
      data: {
        accessToken: "valid-access-token",
        refreshToken: "valid-refresh-token",
      },
    });
    return;
  }

  if (request.url === "/api/auth/profile") {
    const featureTag = request.headers["feature-tag"];
    console.log(`GET /api/auth/profile feature-tag=${featureTag || "<empty>"}`);

    if (request.headers.authorization !== "Bearer valid-access-token") {
      sendJson(response, 401, {
        code: 401,
        message: "Access token expired",
      });
      return;
    }

    sendJson(response, 200, {
      code: 0,
      message: "ok",
      data: {
        id: "1",
        name: "Mock User",
        roles: ["admin"],
      },
    });
    return;
  }

  if (request.url?.startsWith("/api/users/") && request.url.includes("/orders")) {
    const featureTag = request.headers["feature-tag"];
    console.log(`GET ${request.url} feature-tag=${featureTag || "<empty>"}`);

    response.writeHead(200, { "content-type": "application/json" });
    response.end(
      JSON.stringify({
        code: 0,
        message: "ok",
        data: {
          items: [
            {
              id: "order-1",
              title: "Mock order",
              status: "paid",
              amount: 199,
            },
          ],
          total: 1,
        },
      }),
    );
    return;
  }

  response.writeHead(404, { "content-type": "application/json" });
  response.end(JSON.stringify({ message: "Not found" }));
});

server.listen(port, () => {
  console.log(`Mock Swagger server is running at http://localhost:${port}/swagger.json`);
});
