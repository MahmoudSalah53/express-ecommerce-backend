import { COOKIE_NAME } from "./cookie";
import { env } from "./env";

const errorSchema = {
  type: "object",
  required: ["status", "message"],
  properties: {
    status: { type: "string", example: "error" },
    message: { type: "string" },
  },
};

const userSchema = {
  type: "object",
  required: ["id", "name", "email"],
  properties: {
    id: { type: "integer", example: 1 },
    name: { type: "string", example: "Ali" },
    email: { type: "string", format: "email", example: "ali@test.com" },
  },
};

/** OpenAPI document served by Swagger UI. Add paths here as routes are added. */
export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "E-commerce API",
    version: "1.0.0",
    description: `Session is an HttpOnly cookie named ${COOKIE_NAME}. Login sets it; logout clears it.`,
  },
  servers: [{ url: `http://localhost:${env.PORT}` }],
  tags: [
    { name: "Auth", description: "Signup, login, and logout" },
    { name: "Categories", description: "Product categories" },
    { name: "Products", description: "Product catalog" },
    { name: "Cart", description: "The signed-in customer's cart" },
    { name: "Health", description: "Process health" },
  ],
  components: {
    parameters: {
      CategoryId: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "integer", minimum: 1, example: 1 },
      },
    },
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: COOKIE_NAME,
        description: "HttpOnly cookie set by POST /api/users/login.",
      },
    },
    schemas: {
      SignupRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", minLength: 1, example: "Ali" },
          email: { type: "string", format: "email", example: "ali@test.com" },
          password: { type: "string", minLength: 8, format: "password", example: "12345678" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "ali@test.com" },
          password: { type: "string", minLength: 8, format: "password", example: "12345678" },
        },
      },
      UserResponse: {
        type: "object",
        required: ["status", "data"],
        properties: {
          status: { type: "string", example: "success" },
          data: userSchema,
        },
      },
      MeResponse: {
        type: "object",
        required: ["status", "data"],
        properties: {
          status: { type: "string", example: "success" },
          data: {
            type: "object",
            required: ["id", "name", "email", "role"],
            properties: {
              id: { type: "integer", example: 1 },
              name: { type: "string", example: "Ali" },
              email: { type: "string", format: "email", example: "ali@test.com" },
              role: { type: "string", enum: ["CUSTOMER", "ADMIN"], example: "CUSTOMER" },
            },
          },
        },
      },
      MessageResponse: {
        type: "object",
        required: ["status", "message"],
        properties: {
          status: { type: "string", example: "success" },
          message: { type: "string", example: "Logged out successfully" },
        },
      },
      Category: {
        type: "object",
        required: ["id", "name", "slug"],
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Mobile Phones" },
          slug: { type: "string", example: "mobile-phones" },
        },
      },
      CategoryResponse: {
        type: "object",
        required: ["status", "data"],
        properties: {
          status: { type: "string", example: "success" },
          data: { $ref: "#/components/schemas/Category" },
        },
      },
      CategoryListResponse: {
        type: "object",
        required: ["status", "data"],
        properties: {
          status: { type: "string", example: "success" },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Category" },
          },
        },
      },
      CreateCategoryRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", minLength: 1, example: "Mobile Phones" },
        },
      },
      UpdateCategoryRequest: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1, example: "Mobile Phones" },
          slug: { type: "string", example: "mobile-phones" },
        },
      },
      Product: {
        type: "object",
        required: ["id", "name", "description", "price", "stock", "isActive", "category"],
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Phone" },
          description: { type: "string", example: "A phone" },
          price: { type: "string", example: "199.00" },
          stock: { type: "integer", example: 10 },
          imageUrl: { type: "string", nullable: true, example: "https://example.com/phone.jpg" },
          isActive: { type: "boolean", example: true },
          category: { $ref: "#/components/schemas/Category" },
        },
      },
      CreateProductRequest: {
        type: "object",
        required: ["name", "description", "price", "stock", "categoryId"],
        properties: {
          name: { type: "string", minLength: 1, example: "Phone" },
          description: { type: "string", minLength: 1, example: "A phone" },
          price: { type: "number", minimum: 0, example: 199 },
          stock: { type: "integer", minimum: 0, example: 10 },
          imageUrl: { type: "string", format: "uri", example: "https://example.com/phone.jpg" },
          categoryId: { type: "integer", minimum: 1, example: 1 },
        },
      },
      UpdateProductRequest: {
        type: "object",
        minProperties: 1,
        properties: {
          name: { type: "string", minLength: 1, example: "Phone" },
          description: { type: "string", minLength: 1, example: "A phone" },
          price: { type: "number", minimum: 0, example: 199 },
          stock: { type: "integer", minimum: 0, example: 20 },
          imageUrl: { type: "string", format: "uri", example: "https://example.com/phone.jpg" },
          categoryId: { type: "integer", minimum: 1, example: 1 },
        },
      },
      CreatedProductResponse: {
        type: "object",
        required: ["status", "data"],
        properties: {
          status: { type: "string", example: "success" },
          data: {
            type: "object",
            required: ["id", "name", "description", "price", "stock"],
            properties: {
              id: { type: "integer", example: 1 },
              name: { type: "string", example: "Phone" },
              description: { type: "string", example: "A phone" },
              price: { type: "string", example: "199" },
              stock: { type: "integer", example: 10 },
              imageUrl: { type: "string", nullable: true, example: "https://example.com/phone.jpg" },
            },
          },
        },
      },
      ProductResponse: {
        type: "object",
        required: ["status", "data"],
        properties: {
          status: { type: "string", example: "success" },
          data: { $ref: "#/components/schemas/Product" },
        },
      },
      ProductListResponse: {
        type: "object",
        required: ["status", "data", "meta"],
        properties: {
          status: { type: "string", example: "success" },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Product" },
          },
          meta: {
            type: "object",
            required: ["page", "limit", "total"],
            properties: {
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 10 },
              total: { type: "integer", example: 1 },
            },
          },
        },
      },
      CartResponse: {
        type: "object",
        required: ["status", "data"],
        properties: {
          status: { type: "string", example: "success" },
          data: {
            type: "object",
            required: ["items", "subtotal"],
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  required: ["id", "quantity", "product"],
                  properties: {
                    id: { type: "integer", example: 1 },
                    quantity: { type: "integer", example: 2 },
                    product: {
                      type: "object",
                      required: ["id", "name", "price", "stock", "isActive"],
                      properties: {
                        id: { type: "integer", example: 1 },
                        name: { type: "string", example: "Phone" },
                        price: { type: "string", example: "199" },
                        imageUrl: { type: "string", nullable: true, example: "https://example.com/phone.jpg" },
                        stock: { type: "integer", example: 10 },
                        isActive: { type: "boolean", example: true },
                      },
                    },
                  },
                },
              },
              subtotal: { type: "string", example: "398" },
            },
          },
        },
      },
      AddCartItemRequest: {
        type: "object",
        required: ["productId", "quantity"],
        properties: {
          productId: { type: "integer", minimum: 1, example: 1 },
          quantity: { type: "integer", minimum: 1, maximum: 99, example: 2 },
        },
      },
      CartItemResponse: {
        type: "object",
        required: ["status", "data"],
        properties: {
          status: { type: "string", example: "success" },
          data: {
            type: "object",
            required: ["id", "cartId", "productId", "quantity"],
            properties: {
              id: { type: "integer", example: 1 },
              cartId: { type: "integer", example: 1 },
              productId: { type: "integer", example: 1 },
              quantity: { type: "integer", example: 2 },
            },
          },
        },
      },
      ErrorResponse: errorSchema,
      ValidationErrorResponse: {
        type: "object",
        required: ["status", "message", "errors"],
        properties: {
          status: { type: "string", example: "error" },
          message: { type: "string", example: "Validation failed" },
          errors: {
            type: "object",
            additionalProperties: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      },
    },
  },
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        operationId: "getHealth",
        summary: "Health check",
        description: "Reports that the process is running. Does not query the database.",
        responses: {
          "200": {
            description: "Process is running",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: {
                    status: { type: "string", example: "ok" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/users/signup": {
      post: {
        tags: ["Auth"],
        operationId: "signup",
        summary: "Create an account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignupRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Account created. The password is not returned.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
              },
            },
          },
          "409": {
            description: "Email already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/users/login": {
      post: {
        tags: ["Auth"],
        operationId: "login",
        summary: "Log in",
        description: `Checks email and password, then sets the ${COOKIE_NAME} cookie. The token is not in the JSON body.`,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Logged in",
            headers: {
              "Set-Cookie": {
                description: `HttpOnly session cookie ${COOKIE_NAME}`,
                schema: { type: "string" },
              },
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserResponse" },
              },
            },
          },
          "400": {
            description: "Validation failed, or a valid session cookie is already present",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Invalid email or password",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/users/me": {
      get: {
        tags: ["Auth"],
        operationId: "getMe",
        summary: "Current user",
        description: "Returns the user attached to the session cookie. The password is not included.",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Current user",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MeResponse" },
              },
            },
          },
          "401": {
            description: "Missing, invalid, or expired session cookie",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/categories": {
      get: {
        tags: ["Categories"],
        operationId: "listCategories",
        summary: "List categories",
        description: "Public. Sorted by name.",
        responses: {
          "200": {
            description: "Categories",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CategoryListResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Categories"],
        operationId: "createCategory",
        summary: "Create a category",
        description: "Admin only. The slug is generated from the name.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateCategoryRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Category created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CategoryResponse" },
              },
            },
          },
          "401": {
            description: "Not logged in",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Logged in, but not an admin",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "Name or slug already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/categories/{id}": {
      get: {
        tags: ["Categories"],
        operationId: "getCategory",
        summary: "Get a category",
        parameters: [{ $ref: "#/components/parameters/CategoryId" }],
        responses: {
          "200": {
            description: "Category",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CategoryResponse" },
              },
            },
          },
          "404": {
            description: "Category not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Categories"],
        operationId: "updateCategory",
        summary: "Update a category",
        description: "Admin only. Send name, slug, or both. A new name regenerates the slug unless slug is sent too.",
        security: [{ cookieAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/CategoryId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateCategoryRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Category updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CategoryResponse" },
              },
            },
          },
          "401": {
            description: "Not logged in",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Logged in, but not an admin",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Category not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "Name or slug already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Categories"],
        operationId: "deleteCategory",
        summary: "Delete a category",
        description: "Admin only. Refused when the category still has products.",
        security: [{ cookieAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/CategoryId" }],
        responses: {
          "200": {
            description: "Category deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CategoryResponse" },
              },
            },
          },
          "401": {
            description: "Not logged in",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Logged in, but not an admin",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Category not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "Category has products",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/products": {
      get: {
        tags: ["Products"],
        operationId: "listProducts",
        summary: "List products",
        description:
          "Public. Active products only. An admin cookie with includeInactive=true also returns hidden products. Other callers sending includeInactive are ignored. total counts every match, not just the current page.",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 10 } },
          { name: "categoryId", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "search", in: "query", schema: { type: "string" }, description: "Case-insensitive match on the product name." },
          { name: "minPrice", in: "query", schema: { type: "number", minimum: 0 } },
          { name: "maxPrice", in: "query", schema: { type: "number", minimum: 0 } },
          { name: "includeInactive", in: "query", schema: { type: "string", enum: ["true", "false"], default: "false" } },
        ],
        responses: {
          "200": {
            description: "Products",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductListResponse" },
              },
            },
          },
          "400": {
            description: "Invalid query, including limit above 100 or minPrice greater than maxPrice",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Products"],
        operationId: "createProduct",
        summary: "Create a product",
        description: "Admin only. The category must already exist.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateProductRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Product created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreatedProductResponse" },
              },
            },
          },
          "400": {
            description: "Invalid body, including a negative price or stock",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
              },
            },
          },
          "401": {
            description: "Not logged in",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Logged in, but not an admin",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Category not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/products/{id}": {
      get: {
        tags: ["Products"],
        operationId: "getProduct",
        summary: "Get a product",
        description: "Public. A hidden product is returned only when the caller is an admin. Guests and customers get 404.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1, example: 1 } },
        ],
        responses: {
          "200": {
            description: "Product",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductResponse" },
              },
            },
          },
          "400": {
            description: "Invalid id",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
              },
            },
          },
          "404": {
            description: "Product not found, or hidden from this caller",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Products"],
        operationId: "updateProduct",
        summary: "Update a product",
        description: "Admin only. Send one or more fields. stock replaces the current value. An empty body is rejected.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1, example: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProductRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Product updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreatedProductResponse" },
              },
            },
          },
          "400": {
            description: "Invalid id or body, including an empty body",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
              },
            },
          },
          "401": {
            description: "Not logged in",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Logged in, but not an admin",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Product or category not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Products"],
        operationId: "deleteProduct",
        summary: "Hide a product",
        description: "Admin only. Sets isActive to false and keeps the row, so older orders that reference this product stay valid. Guests and customers then get 404 from the list and the product details.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1, example: 1 } },
        ],
        responses: {
          "200": {
            description: "Product hidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreatedProductResponse" },
              },
            },
          },
          "400": {
            description: "Invalid id",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
              },
            },
          },
          "401": {
            description: "Not logged in",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Logged in, but not an admin",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Product not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/cart": {
      get: {
        tags: ["Cart"],
        operationId: "getCart",
        summary: "Get my cart",
        description:
          "The signed-in user only, including an admin. A customer with no cart gets 200 with an empty items list and subtotal 0. Hidden products stay in items so they can be removed, and they are left out of subtotal.",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Cart",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CartResponse" },
              },
            },
          },
          "401": {
            description: "Missing, invalid, or expired session cookie",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/cart/items": {
      post: {
        tags: ["Cart"],
        operationId: "addCartItem",
        summary: "Add a product to my cart",
        description:
          "Signed-in user only, including an admin. The cart is created on the first add. Adding the same product again increases quantity on the same item. If the resulting quantity is greater than stock, nothing is saved.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AddCartItemRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Item added or quantity increased",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CartItemResponse" },
              },
            },
          },
          "400": {
            description: "Quantity is not an integer from 1 to 99, or the resulting quantity is greater than stock",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Missing, invalid, or expired session cookie",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Product not found, or hidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/users/logout": {
      post: {
        tags: ["Auth"],
        operationId: "logout",
        summary: "Log out",
        description: `Clears the ${COOKIE_NAME} cookie.`,
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Logged out",
            headers: {
              "Set-Cookie": {
                description: `Clears ${COOKIE_NAME}`,
                schema: { type: "string" },
              },
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MessageResponse" },
              },
            },
          },
        },
      },
    },
  },
};
