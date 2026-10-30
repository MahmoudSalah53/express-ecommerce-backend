import { COOKIE_NAME } from "./cookie";

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
  servers: [{ url: "/" }],
  tags: [
    { name: "Auth", description: "Signup, login, and logout" },
    { name: "Categories", description: "Product categories" },
    { name: "Products", description: "Product catalog" },
    { name: "Cart", description: "The signed-in customer's cart" },
    { name: "Addresses", description: "The signed-in customer's delivery addresses" },
    { name: "Orders", description: "Orders placed from the cart" },
    { name: "Admin Orders", description: "Admin view and status changes for every order" },
    { name: "Reviews", description: "Product reviews" },
    { name: "Admin Coupons", description: "Admin management of discount coupons" },
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
      UpdateCartItemRequest: {
        type: "object",
        required: ["quantity"],
        properties: {
          quantity: { type: "integer", minimum: 1, maximum: 99, example: 3 },
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
      Address: {
        type: "object",
        required: ["id", "userId", "city", "street", "phone", "isDefault"],
        properties: {
          id: { type: "integer", example: 1 },
          userId: { type: "integer", example: 1 },
          city: { type: "string", example: "Cairo" },
          street: { type: "string", example: "12 Tahrir St" },
          phone: { type: "string", example: "01012345678" },
          isDefault: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      AddressResponse: {
        type: "object",
        required: ["status", "data"],
        properties: {
          status: { type: "string", example: "success" },
          data: { $ref: "#/components/schemas/Address" },
        },
      },
      AddressListResponse: {
        type: "object",
        required: ["status", "data"],
        properties: {
          status: { type: "string", example: "success" },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/Address" },
          },
        },
      },
      CreateAddressRequest: {
        type: "object",
        required: ["city", "street", "phone"],
        properties: {
          city: { type: "string", minLength: 1, example: "Cairo" },
          street: { type: "string", minLength: 1, example: "12 Tahrir St" },
          phone: { type: "string", minLength: 1, example: "01012345678" },
        },
      },
      UpdateAddressRequest: {
        type: "object",
        minProperties: 1,
        properties: {
          city: { type: "string", minLength: 1, example: "Giza" },
          street: { type: "string", minLength: 1, example: "5 Pyramids Rd" },
          phone: { type: "string", minLength: 1, example: "01112345678" },
          isDefault: { type: "boolean", example: true },
        },
      },
      CreateOrderRequest: {
        type: "object",
        properties: {
          addressId: { type: "integer", minimum: 1, example: 1, description: "Defaults to the caller's default address." },
          couponCode: {
            type: "string",
            example: "save10",
            description: "Optional. Case does not matter. Must be active, not expired, and not used up.",
          },
        },
      },
      OrderItem: {
        type: "object",
        required: ["id", "orderId", "productId", "name", "unitPrice", "quantity"],
        properties: {
          id: { type: "integer", example: 1 },
          orderId: { type: "integer", example: 1 },
          productId: { type: "integer", example: 1 },
          name: { type: "string", example: "Phone", description: "Product name at purchase time" },
          unitPrice: { type: "string", example: "199", description: "Product price at purchase time" },
          quantity: { type: "integer", example: 2 },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Order: {
        type: "object",
        required: ["id", "userId", "status", "subtotal", "discount", "total", "shippingCity", "shippingStreet", "shippingPhone", "items"],
        properties: {
          id: { type: "integer", example: 1 },
          userId: { type: "integer", example: 1 },
          status: { type: "string", enum: ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"], example: "PENDING" },
          subtotal: { type: "string", example: "398" },
          discount: { type: "string", example: "0" },
          total: { type: "string", example: "398" },
          couponCode: { type: "string", nullable: true, example: null },
          shippingCity: { type: "string", example: "Cairo" },
          shippingStreet: { type: "string", example: "12 Tahrir St" },
          shippingPhone: { type: "string", example: "01012345678" },
          items: { type: "array", items: { $ref: "#/components/schemas/OrderItem" } },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      OrderResponse: {
        type: "object",
        required: ["status", "data"],
        properties: {
          status: { type: "string", example: "success" },
          data: { $ref: "#/components/schemas/Order" },
        },
      },
      Review: {
        type: "object",
        required: ["id", "rating", "createdAt", "user"],
        properties: {
          id: { type: "integer", example: 1 },
          rating: { type: "integer", minimum: 1, maximum: 5, example: 4 },
          comment: { type: "string", nullable: true, example: "Good phone" },
          createdAt: { type: "string", format: "date-time" },
          user: {
            type: "object",
            required: ["name"],
            properties: {
              name: { type: "string", example: "Ali" },
            },
          },
        },
      },
      CreateReviewRequest: {
        type: "object",
        required: ["rating"],
        properties: {
          rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
          comment: { type: "string", minLength: 1, maxLength: 1000, example: "Great phone" },
        },
      },
      UpdateReviewRequest: {
        type: "object",
        minProperties: 1,
        properties: {
          rating: { type: "integer", minimum: 1, maximum: 5, example: 4 },
          comment: { type: "string", nullable: true, minLength: 1, maxLength: 1000, example: "Still good after a month", description: "Send null to remove the comment." },
        },
      },
      ReviewResponse: {
        type: "object",
        required: ["status", "data"],
        properties: {
          status: { type: "string", example: "success" },
          data: { $ref: "#/components/schemas/Review" },
        },
      },
      ProductReviewsResponse: {
        type: "object",
        required: ["status", "data", "meta"],
        properties: {
          status: { type: "string", example: "success" },
          data: {
            type: "object",
            required: ["items", "average", "count"],
            properties: {
              items: { type: "array", items: { $ref: "#/components/schemas/Review" } },
              average: { type: "number", example: 4.3, description: "Rounded to one decimal. 0 when there are no reviews." },
              count: { type: "integer", example: 12 },
            },
          },
          meta: {
            type: "object",
            required: ["page", "limit", "total"],
            properties: {
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 10 },
              total: { type: "integer", example: 12 },
            },
          },
        },
      },
      Coupon: {
        type: "object",
        required: ["id", "code", "percent", "expiresAt", "isActive", "usageLimit", "usedCount"],
        properties: {
          id: { type: "integer", example: 1 },
          code: { type: "string", example: "SAVE10" },
          percent: { type: "integer", minimum: 1, maximum: 80, example: 10 },
          expiresAt: { type: "string", format: "date-time", example: "2026-12-31T23:59:59.000Z" },
          isActive: { type: "boolean", example: true },
          usageLimit: { type: "integer", minimum: 1, example: 100 },
          usedCount: { type: "integer", minimum: 0, example: 0 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CouponResponse: {
        type: "object",
        required: ["status", "data"],
        properties: {
          status: { type: "string", example: "success" },
          data: { $ref: "#/components/schemas/Coupon" },
        },
      },
      CouponListResponse: {
        type: "object",
        required: ["status", "data"],
        properties: {
          status: { type: "string", example: "success" },
          data: { type: "array", items: { $ref: "#/components/schemas/Coupon" } },
        },
      },
      CreateCouponRequest: {
        type: "object",
        required: ["code", "percent", "expiresAt", "usageLimit"],
        properties: {
          code: {
            type: "string",
            minLength: 1,
            maxLength: 50,
            pattern: "^[A-Za-z0-9_-]+$",
            example: "save10",
            description: "Saved in uppercase, so save10 and SAVE10 are the same code.",
          },
          percent: { type: "integer", minimum: 1, maximum: 80, example: 10 },
          expiresAt: { type: "string", format: "date-time", example: "2026-12-31T23:59:59.000Z", description: "Must be in the future." },
          usageLimit: { type: "integer", minimum: 1, example: 100 },
          isActive: { type: "boolean", default: true, example: true },
        },
      },
      UpdateCouponRequest: {
        type: "object",
        minProperties: 1,
        properties: {
          isActive: { type: "boolean", example: false },
          expiresAt: { type: "string", format: "date-time", example: "2027-03-31T23:59:59.000Z", description: "Must be in the future." },
          usageLimit: { type: "integer", minimum: 1, example: 200, description: "Cannot be less than usedCount." },
        },
      },
      UpdateOrderStatusRequest: {
        type: "object",
        required: ["status"],
        properties: {
          status: { type: "string", enum: ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"], example: "SHIPPED" },
        },
      },
      OrderListResponse: {
        type: "object",
        required: ["status", "data", "meta"],
        properties: {
          status: { type: "string", example: "success" },
          data: { type: "array", items: { $ref: "#/components/schemas/Order" } },
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
      delete: {
        tags: ["Cart"],
        operationId: "clearCart",
        summary: "Empty my cart",
        description: "Signed-in user only. Removes every item and keeps the cart. A user with no cart gets count 0.",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Cart emptied",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status", "data"],
                  properties: {
                    status: { type: "string", example: "success" },
                    data: {
                      type: "object",
                      required: ["count"],
                      properties: {
                        count: { type: "integer", example: 2, description: "Number of items removed" },
                      },
                    },
                  },
                },
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
    "/api/cart/items/{id}": {
      patch: {
        tags: ["Cart"],
        operationId: "updateCartItem",
        summary: "Set a cart item quantity",
        description:
          "Signed-in user only. quantity replaces the current value. Another customer's item is returned as 404. If quantity is greater than stock, nothing is saved.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1, example: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateCartItemRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Quantity replaced",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CartItemResponse" },
              },
            },
          },
          "400": {
            description: "Quantity is not an integer from 1 to 99, or it is greater than stock",
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
            description: "Cart item not found, including an item that belongs to another customer",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Cart"],
        operationId: "deleteCartItem",
        summary: "Remove a cart item",
        description: "Signed-in user only. Removes the item and keeps the cart. Another customer's item is returned as 404.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1, example: 1 } },
        ],
        responses: {
          "200": {
            description: "Item removed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CartItemResponse" },
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
            description: "Missing, invalid, or expired session cookie",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Cart item not found, including an item that belongs to another customer",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/addresses": {
      get: {
        tags: ["Addresses"],
        operationId: "listAddresses",
        summary: "List my addresses",
        description: "Signed-in user only. Returns only the caller's addresses.",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Addresses",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AddressListResponse" },
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
      post: {
        tags: ["Addresses"],
        operationId: "createAddress",
        summary: "Add an address",
        description: "Signed-in user only. The first address becomes the default automatically. Later addresses are not default.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateAddressRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Address created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AddressResponse" },
              },
            },
          },
          "400": {
            description: "Invalid body",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
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
    "/api/addresses/{id}": {
      patch: {
        tags: ["Addresses"],
        operationId: "updateAddress",
        summary: "Update an address",
        description:
          "Signed-in user only. Send one or more fields. isDefault: true makes this the only default address. Another customer's address is returned as 404.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1, example: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateAddressRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Address updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AddressResponse" },
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
            description: "Missing, invalid, or expired session cookie",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Address not found, including an address that belongs to another customer",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Addresses"],
        operationId: "deleteAddress",
        summary: "Delete an address",
        description:
          "Signed-in user only. If the default address is deleted and others remain, the oldest one becomes the default. Another customer's address is returned as 404.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1, example: 1 } },
        ],
        responses: {
          "200": {
            description: "Address deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status", "data"],
                  properties: {
                    status: { type: "string", example: "success" },
                    data: {
                      type: "object",
                      required: ["message"],
                      properties: {
                        message: { type: "string", example: "Address deleted successfully" },
                      },
                    },
                  },
                },
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
            description: "Missing, invalid, or expired session cookie",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Address not found, including an address that belongs to another customer",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/products/{id}/reviews": {
      get: {
        tags: ["Reviews"],
        operationId: "listProductReviews",
        summary: "List a product's reviews",
        description:
          "Public. Newest first. Each review shows the reviewer's name only, never the email. average and count cover every review of the product, not just the current page, and are calculated when read. A hidden product returns 404 unless the caller is an admin.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1, example: 1 } },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 10 } },
        ],
        responses: {
          "200": {
            description: "Reviews with average and count",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductReviewsResponse" },
              },
            },
          },
          "400": {
            description: "Invalid id or query",
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
      post: {
        tags: ["Reviews"],
        operationId: "createProductReview",
        summary: "Review a product",
        description:
          "Signed-in user only. The caller must have a DELIVERED order that contains this product. One review per product per user. A product hidden after purchase can still be reviewed.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1, example: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateReviewRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Review created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ReviewResponse" },
              },
            },
          },
          "400": {
            description: "Invalid id or body, including a rating outside 1 to 5",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
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
          "403": {
            description: "No DELIVERED order with this product",
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
          "409": {
            description: "You already reviewed this product",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/reviews/{id}": {
      patch: {
        tags: ["Reviews"],
        operationId: "updateReview",
        summary: "Edit my review",
        description:
          "Signed-in user only. Send rating, comment, or both. Another user's review is returned as 404. The product's average changes on the next read.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1, example: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateReviewRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Review updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ReviewResponse" },
              },
            },
          },
          "400": {
            description: "Invalid id or body, including an empty body or a rating outside 1 to 5",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
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
            description: "Review not found, including a review written by another user",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Reviews"],
        operationId: "deleteReview",
        summary: "Delete my review",
        description:
          "Signed-in user only. Another user's review is returned as 404. After deleting, the user may review the product again.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1, example: 1 } },
        ],
        responses: {
          "200": {
            description: "Review deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ReviewResponse" },
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
            description: "Missing, invalid, or expired session cookie",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Review not found, including a review written by another user",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/orders": {
      post: {
        tags: ["Orders"],
        operationId: "createOrder",
        summary: "Place an order from my cart",
        description:
          "Signed-in user only. Uses addressId, or the default address when it is omitted. The address, product names, and prices are copied into the order. With a coupon, discount = subtotal * percent / 100 rounded to 2 decimals, and total = subtotal - discount. Stock is reduced, the coupon's usedCount goes up by 1, and the cart is emptied in one transaction; if any step fails, nothing changes. Cancelling the order later does not give the coupon use back.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateOrderRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Order created with status PENDING",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrderResponse" },
              },
            },
          },
          "400": {
            description:
              "Empty cart, no address, a hidden product in the cart, not enough stock (names the product), a coupon that does not exist or is inactive, expired, or used up, or invalid body",
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
            description: "addressId not found, including an address that belongs to another customer",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      get: {
        tags: ["Orders"],
        operationId: "listOrders",
        summary: "List my orders",
        description: "Signed-in user only. Returns only the caller's orders, newest first. total counts every order, not just the current page.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 10 } },
        ],
        responses: {
          "200": {
            description: "Orders",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrderListResponse" },
              },
            },
          },
          "400": {
            description: "Invalid query, including limit above 100",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
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
    "/api/orders/{id}": {
      get: {
        tags: ["Orders"],
        operationId: "getOrder",
        summary: "Get one of my orders",
        description: "Signed-in user only. Another customer's order is returned as 404, not 403, so the id is not confirmed to exist.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1, example: 1 } },
        ],
        responses: {
          "200": {
            description: "Order with its items",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrderResponse" },
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
            description: "Missing, invalid, or expired session cookie",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Order not found, including an order that belongs to another customer",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/orders/{id}/cancel": {
      post: {
        tags: ["Orders"],
        operationId: "cancelOrder",
        summary: "Cancel one of my orders",
        description:
          "Signed-in user only. Allowed only while the order is PENDING. Sets status to CANCELLED and returns every item's quantity to stock. Cancelling twice returns 400 the second time and stock is restored only once.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1, example: 1 } },
        ],
        responses: {
          "200": {
            description: "Order cancelled",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrderResponse" },
              },
            },
          },
          "400": {
            description: "Invalid id, or the order is SHIPPED, DELIVERED, or already CANCELLED",
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
            description: "Order not found, including an order that belongs to another customer",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/admin/coupons": {
      get: {
        tags: ["Admin Coupons"],
        operationId: "listCoupons",
        summary: "List coupons",
        description: "Admin only. Newest first.",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Coupons",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CouponListResponse" },
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
        },
      },
      post: {
        tags: ["Admin Coupons"],
        operationId: "createCoupon",
        summary: "Create a coupon",
        description: "Admin only. The code is saved in uppercase. usedCount starts at 0.",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateCouponRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Coupon created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CouponResponse" },
              },
            },
          },
          "400": {
            description: "Invalid body, including percent outside 1 to 80 or expiresAt in the past",
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
          "409": {
            description: "Coupon code already exists, in any letter case",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/admin/coupons/{id}": {
      patch: {
        tags: ["Admin Coupons"],
        operationId: "updateCoupon",
        summary: "Update a coupon",
        description:
          "Admin only. Activate or deactivate it, move expiresAt to a later date, or change usageLimit. code and percent cannot be changed.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1, example: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateCouponRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Coupon updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CouponResponse" },
              },
            },
          },
          "400": {
            description: "Invalid id or body, an empty body, expiresAt in the past, or usageLimit below usedCount",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
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
            description: "Coupon not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/admin/orders": {
      get: {
        tags: ["Admin Orders"],
        operationId: "adminListOrders",
        summary: "List all orders",
        description: "Admin only. Every customer's orders, newest first, with the customer's id, name, and email. Filter by status.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "status", in: "query", schema: { type: "string", enum: ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"] } },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 10 } },
        ],
        responses: {
          "200": {
            description: "Orders",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrderListResponse" },
              },
            },
          },
          "400": {
            description: "Invalid query, including an unknown status or limit above 100",
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
        },
      },
    },
    "/api/admin/orders/{id}": {
      patch: {
        tags: ["Admin Orders"],
        operationId: "updateOrderStatus",
        summary: "Change an order's status",
        description:
          "Admin only. Allowed: PENDING to SHIPPED, SHIPPED to DELIVERED, PENDING to CANCELLED. Cancelling returns every item's quantity to stock. DELIVERED and CANCELLED are final.",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1, example: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateOrderStatusRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Status changed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrderResponse" },
              },
            },
          },
          "400": {
            description: "Invalid id or status, or a transition that is not allowed (for example PENDING to DELIVERED)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
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
            description: "Order not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "The status was changed by another request at the same time",
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
