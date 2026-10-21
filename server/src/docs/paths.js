/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Create an account
 *     description: Always creates a `user`. The `role` field is ignored.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: Ada Lovelace }
 *               email: { type: string, example: ada@example.com }
 *               password: { type: string, minLength: 8, example: Str0ngPassw0rd }
 *     responses:
 *       201:
 *         description: Account created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 token: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       409: { description: Email already registered }
 *
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in and receive a JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: ada@example.com }
 *               password: { type: string, example: Str0ngPassw0rd }
 *     responses:
 *       200:
 *         description: Logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 token: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *       401: { description: Invalid email or password }
 *
 * /auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Get the current user's profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Current user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 user: { $ref: '#/components/schemas/User' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 * /transactions:
 *   get:
 *     tags: [Transactions]
 *     summary: List my transactions (paginated, filterable)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20, maximum: 100 } }
 *       - { in: query, name: type, schema: { type: string, enum: [income, expense] } }
 *       - { in: query, name: category, schema: { type: string } }
 *       - { in: query, name: month, schema: { type: string, example: '2025-05' }, description: Format YYYY-MM }
 *     responses:
 *       200:
 *         description: Transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Transaction' } }
 *                 page: { type: integer }
 *                 limit: { type: integer }
 *                 total: { type: integer }
 *                 pages: { type: integer }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *   post:
 *     tags: [Transactions]
 *     summary: Add an income or expense
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TransactionInput' }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Transaction' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 * /transactions/monthly-summary:
 *   get:
 *     tags: [Transactions]
 *     summary: Total earned and spent per category for a month
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: month, schema: { type: string, example: '2025-05' }, description: Defaults to the current month }
 *     responses:
 *       200:
 *         description: Monthly summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 month: { type: string }
 *                 totalIncome: { type: number }
 *                 totalExpense: { type: number }
 *                 balance: { type: number }
 *                 byCategory:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category: { type: string }
 *                       type: { type: string }
 *                       total: { type: number }
 *                       count: { type: integer }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 * /transactions/{id}:
 *   put:
 *     tags: [Transactions]
 *     summary: Edit a transaction
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TransactionInput' }
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Transaction' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   delete:
 *     tags: [Transactions]
 *     summary: Delete a transaction
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Deleted }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: List predefined and my custom categories
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Category' } }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *   post:
 *     tags: [Categories]
 *     summary: Create a custom category
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type]
 *             properties:
 *               name: { type: string, example: Pets }
 *               type: { type: string, enum: [income, expense] }
 *     responses:
 *       201: { description: Created }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       409: { description: Category already exists }
 *
 * /upload/profile-picture:
 *   post:
 *     tags: [Upload]
 *     summary: Upload a profile picture (JPEG, PNG or WebP, max 2 MB)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [picture]
 *             properties:
 *               picture: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Picture uploaded; returns the updated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 user: { $ref: '#/components/schemas/User' }
 *       400: { description: Missing or invalid file }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *
 * /admin/overview:
 *   get:
 *     tags: [Admin]
 *     summary: Platform-wide stats (admin only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Overview
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 totalUsers: { type: integer }
 *                 newUsersLast30Days: { type: integer }
 *                 totalTransactions: { type: integer }
 *                 totalIncome: { type: number }
 *                 totalExpense: { type: number }
 *                 topSpendingCategories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category: { type: string }
 *                       total: { type: number }
 *                       count: { type: integer }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { description: Admin role required }
 */
export {};
