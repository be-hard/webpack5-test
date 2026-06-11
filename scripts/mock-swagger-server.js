const http = require("node:http");

const port = Number(process.env.MOCK_SWAGGER_PORT || 5050);

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

const server = http.createServer((request, response) => {
  if (request.url === "/swagger.json") {
    const featureTag = request.headers["feature-tag"];
    console.log(`GET /swagger.json feature-tag=${featureTag || "<empty>"}`);

    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(createOpenApiSpec()));
    return;
  }

  if (request.url === "/api/auth/profile") {
    const featureTag = request.headers["feature-tag"];
    console.log(`GET /api/auth/profile feature-tag=${featureTag || "<empty>"}`);

    response.writeHead(200, { "content-type": "application/json" });
    response.end(
      JSON.stringify({
        code: 0,
        message: "ok",
        data: {
          id: "1",
          name: "Mock User",
          roles: ["admin"],
        },
      }),
    );
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
