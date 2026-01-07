const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface Sale {
  id: number;
  productId: number;
  userId: number;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  customerName?: string;
  customerEmail?: string;
  status: string;
  createdAt: string;
}

export interface CreateSaleData {
  productId: number;
  quantity: number;
  customerName?: string;
  customerEmail?: string;
  status?: string;
}

export interface Contact {
  id: number;
  name: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  notes?: string;
  status?: string;
  source?: string;
  state?: string;
  city?: string;
  groupId?: number;
  group?: {
    id: number;
    name: string;
    description?: string;
    color?: string;
  };
  contactTags?: Array<{
    id: number;
    tag: {
      id: number;
      name: string;
      color?: string;
    };
  }>;
  contactSegmentations?: Array<{
    id: number;
    segmentationId: string;
  }>;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactData {
  name: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  notes?: string;
  status?: string;
  source?: string;
  state?: string;
  city?: string;
  groupId?: number;
  tagIds?: number[];
  segmentationIds?: string[];
}

export interface UpdateContactData {
  name?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  notes?: string;
  status?: string;
  source?: string;
  state?: string;
  city?: string;
  groupId?: number | null;
  tagIds?: number[];
  segmentationIds?: string[];
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  color?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupData {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateGroupData {
  name?: string;
  description?: string;
  color?: string;
}

export interface Tag {
  id: number;
  name: string;
  color?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagData {
  name: string;
  color?: string;
}

export interface UpdateTagData {
  name?: string;
  color?: string;
}

export interface EmailConnection {
  id: number;
  email: string;
  smtpHost: string;
  smtpPort: number;
  username: string;
  secure: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailConnectionData {
  email: string;
  smtpHost: string;
  smtpPort: number;
  username: string;
  password: string;
  secure?: boolean;
}

export interface ScoreConfig {
  id: number;
  userId: number;
  emailOpens: number;
  linkClicks: number;
  purchases: number;
  ltvDivisor: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateScoreConfigData {
  emailOpens?: number;
  linkClicks?: number;
  purchases?: number;
  ltvDivisor?: number;
}

export interface ContactPurchase {
  id: number;
  contactId: number;
  productId?: number;
  value: number;
  productName?: string;
  paymentMethod?: string;
  status: string;
  purchaseDate: string;
  createdAt: string;
}

export interface CreateContactPurchaseData {
  contactId: number;
  productId?: number;
  value: number;
  quantity?: number;
  productName?: string;
  paymentMethod?: string;
  status?: string;
  purchaseDate: string;
}

export interface UpdateContactPurchaseData {
  productId?: number;
  value?: number;
  productName?: string;
  paymentMethod?: string;
  status?: string;
  purchaseDate?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number | string; // Pode vir como string do backend (decimal)
  stock: number;
  sku?: string;
  category?: string;
  active: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  sku?: string;
  category?: string;
  active?: boolean;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  sku?: string;
  category?: string;
  active?: boolean;
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Adicionar /api se não estiver presente no endpoint e se o API_URL não já incluir /api
    const baseUrl = API_URL.endsWith('/api') ? API_URL.replace(/\/api$/, '') : API_URL;
    const apiEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
    const response = await fetch(`${baseUrl}${apiEndpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let error;
      try {
        const text = await response.text();
        error = text ? JSON.parse(text) : { message: 'Erro ao processar requisição' };
      } catch {
        error = { message: 'Erro ao processar requisição' };
      }
      // NestJS retorna mensagens de erro em error.message ou em um array
      const errorMessage = error.message || 
                          (Array.isArray(error.message) ? error.message.join(', ') : 'Erro ao processar requisição');
      throw new Error(errorMessage);
    }

    // Verificar se a resposta tem conteúdo (status 204 No Content não tem body)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Resposta vazia (como DELETE 204) - retornar void
      return undefined as any;
    }

    try {
      const text = await response.text();
      // Se não houver texto, retornar undefined
      if (!text) {
        return undefined as any;
      }
      return JSON.parse(text);
    } catch (error) {
      console.error('Erro ao parsear resposta JSON:', error);
      // Se não conseguir parsear, retornar undefined (pode ser resposta vazia válida)
      return undefined as any;
    }
  }

  async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await this.request<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Erro na API de registro:', error);
      throw error;
    }
  }

  // Email Verification
  async verifyEmail(token: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/auth/verify-email?token=${token}`, {
      method: 'GET',
    });
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async login(data: LoginData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/users/me', {
      method: 'GET',
    });
  }

  async updateUser(data: UpdateUserData): Promise<User> {
    return this.request<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    return this.request<{ message: string }>('/users/me/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Password Recovery
  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyResetCode(email: string, code: string): Promise<{ valid: boolean }> {
    return this.request<{ valid: boolean }>('/auth/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }

  async resetPassword(
    email: string,
    code: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword, confirmPassword }),
    });
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('/products', {
      method: 'GET',
    });
  }

  async getProduct(id: number): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: 'GET',
    });
  }

  async createProduct(data: CreateProductData): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Importa produto de integração (cria ou atualiza se já existir)
   * Verifica por SKU ou externalIds antes de criar
   */
  async importProduct(
    data: CreateProductData & {
      externalIds?: {
        nuvemshop?: Record<string, number>;
        shopify?: Record<string, string>;
      };
    },
  ): Promise<Product> {
    return this.request<Product>('/products/import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: number, data: UpdateProductData): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: number): Promise<void> {
    return this.request<void>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Sales
  async getSalesByProduct(productId: number): Promise<Sale[]> {
    return this.request<Sale[]>(`/sales/product/${productId}`, {
      method: 'GET',
    });
  }

  async getAllSales(): Promise<Sale[]> {
    return this.request<Sale[]>('/sales', {
      method: 'GET',
    });
  }

  async createSale(data: CreateSaleData): Promise<Sale> {
    return this.request<Sale>('/sales', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Contacts
  async getContacts(): Promise<Contact[]> {
    return this.request<Contact[]>('/contacts', {
      method: 'GET',
    });
  }

  async getContact(id: number): Promise<Contact> {
    return this.request<Contact>(`/contacts/${id}`, {
      method: 'GET',
    });
  }

  async createContact(data: CreateContactData): Promise<Contact> {
    return this.request<Contact>('/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContact(id: number, data: UpdateContactData): Promise<Contact> {
    return this.request<Contact>(`/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteContact(id: number): Promise<void> {
    return this.request<void>(`/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  async importContacts(file: File): Promise<{ created: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const baseUrl = API_URL.endsWith('/api') ? API_URL.replace(/\/api$/, '') : API_URL;
    const response = await fetch(`${baseUrl}/api/contacts/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao importar contatos' }));
      throw new Error(error.message || 'Erro ao importar contatos');
    }

    return response.json();
  }

  // Groups
  async getGroups(): Promise<Group[]> {
    return this.request<Group[]>('/groups', {
      method: 'GET',
    });
  }

  async getGroup(id: number): Promise<Group> {
    return this.request<Group>(`/groups/${id}`, {
      method: 'GET',
    });
  }

  async createGroup(data: CreateGroupData): Promise<Group> {
    return this.request<Group>('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGroup(id: number, data: UpdateGroupData): Promise<Group> {
    return this.request<Group>(`/groups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteGroup(id: number): Promise<void> {
    return this.request<void>(`/groups/${id}`, {
      method: 'DELETE',
    });
  }

  // Tags
  async getTags(): Promise<Tag[]> {
    return this.request<Tag[]>('/tags', {
      method: 'GET',
    });
  }

  async getTag(id: number): Promise<Tag> {
    return this.request<Tag>(`/tags/${id}`, {
      method: 'GET',
    });
  }

  async createTag(data: CreateTagData): Promise<Tag> {
    return this.request<Tag>('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTag(id: number, data: UpdateTagData): Promise<Tag> {
    return this.request<Tag>(`/tags/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTag(id: number): Promise<void> {
    return this.request<void>(`/tags/${id}`, {
      method: 'DELETE',
    });
  }

  // Email Connections
  async getEmailConnections(): Promise<EmailConnection[]> {
    return this.request<EmailConnection[]>('/email-connections', {
      method: 'GET',
    });
  }

  async getEmailConnection(id: number): Promise<EmailConnection> {
    return this.request<EmailConnection>(`/email-connections/${id}`, {
      method: 'GET',
    });
  }

  async createEmailConnection(data: CreateEmailConnectionData): Promise<EmailConnection> {
    return this.request<EmailConnection>('/email-connections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteEmailConnection(id: number): Promise<void> {
    return this.request<void>(`/email-connections/${id}`, {
      method: 'DELETE',
    });
  }

  // Score Config
  async getScoreConfig(): Promise<ScoreConfig> {
    return this.request<ScoreConfig>('/score-config', {
      method: 'GET',
    });
  }

  async updateScoreConfig(data: UpdateScoreConfigData): Promise<ScoreConfig> {
    return this.request<ScoreConfig>('/score-config', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async resetScoreConfig(): Promise<ScoreConfig> {
    return this.request<ScoreConfig>('/score-config/reset', {
      method: 'POST',
    });
  }

  // Contact Purchases
  async getContactPurchases(contactId?: number): Promise<ContactPurchase[]> {
    const url = contactId 
      ? `/contact-purchases?contactId=${contactId}`
      : '/contact-purchases';
    return this.request<ContactPurchase[]>(url, {
      method: 'GET',
    });
  }

  async getContactPurchase(id: number): Promise<ContactPurchase> {
    return this.request<ContactPurchase>(`/contact-purchases/${id}`, {
      method: 'GET',
    });
  }

  async createContactPurchase(data: CreateContactPurchaseData): Promise<ContactPurchase> {
    return this.request<ContactPurchase>('/contact-purchases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContactPurchase(id: number, data: UpdateContactPurchaseData): Promise<ContactPurchase> {
    return this.request<ContactPurchase>(`/contact-purchases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteContactPurchase(id: number): Promise<void> {
    return this.request<void>(`/contact-purchases/${id}`, {
      method: 'DELETE',
    });
  }

  async getContactLTV(contactId: number): Promise<number> {
    return this.request<number>(`/contact-purchases/contact/${contactId}/ltv`, {
      method: 'GET',
    });
  }

  // Shopify Integration
  async initShopifyAuth(shop: string): Promise<{ authUrl: string; state: string; shop: string }> {
    return this.request<{ authUrl: string; state: string; shop: string }>('/shopify/auth/init', {
      method: 'POST',
      body: JSON.stringify({ shop }),
    });
  }

  async getShopifyConnections(): Promise<any[]> {
    return this.request<any[]>('/shopify/connections', {
      method: 'GET',
    });
  }

  async syncShopifyProduct(shop: string, product: any): Promise<any> {
    return this.request<any>('/shopify/products/sync', {
      method: 'POST',
      body: JSON.stringify({ shop, product }),
    });
  }

  async getShopifyProducts(shop: string, params?: { limit?: number; page?: number }): Promise<{ products: any[]; count: number }> {
    const queryParams = new URLSearchParams();
    queryParams.append('shop', shop);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    return this.request<{ products: any[]; count: number }>(`/shopify/products?${queryParams.toString()}`, {
      method: 'GET',
    });
  }

  async getAbandonedCheckouts(
    shop: string,
    params?: {
      limit?: number;
      created_at_min?: string;
      created_at_max?: string;
      status?: 'open' | 'closed';
    }
  ): Promise<{ checkouts: any[]; count: number }> {
    const queryParams = new URLSearchParams();
    queryParams.append('shop', shop);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.created_at_min) queryParams.append('created_at_min', params.created_at_min);
    if (params?.created_at_max) queryParams.append('created_at_max', params.created_at_max);
    if (params?.status) queryParams.append('status', params.status);

    return this.request<{ checkouts: any[]; count: number }>(`/shopify/checkouts/abandoned?${queryParams.toString()}`, {
      method: 'GET',
    });
  }

  async createShopifyWebhook(shop: string, topic: string, address: string): Promise<any> {
    return this.request<any>('/shopify/webhooks', {
      method: 'POST',
      body: JSON.stringify({ shop, topic, address }),
    });
  }

  async listShopifyWebhooks(shop: string): Promise<{ webhooks: any[] }> {
    return this.request<{ webhooks: any[] }>(`/shopify/webhooks?shop=${shop}`, {
      method: 'GET',
    });
  }

  async disconnectShopify(shop: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/shopify/disconnect', {
      method: 'POST',
      body: JSON.stringify({ shop }),
    });
  }

  // Nuvemshop Integration
  async initNuvemshopAuth(): Promise<{ authUrl: string; state: string }> {
    return this.request<{ authUrl: string; state: string }>('/nuvemshop/auth/init', {
      method: 'POST',
    });
  }

  async connectNuvemshop(data: { storeId: string; accessToken: string; scope: string }): Promise<{ success: boolean; connection: any }> {
    return this.request<{ success: boolean; connection: any }>('/nuvemshop/auth/connect', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getNuvemshopConnections(): Promise<any[]> {
    return this.request<any[]>('/nuvemshop/connections', {
      method: 'GET',
    });
  }

  async syncNuvemshopProduct(storeId: string, product: any): Promise<any> {
    return this.request<any>('/nuvemshop/products/sync', {
      method: 'POST',
      body: JSON.stringify({ storeId, ...product }),
    });
  }

  async getNuvemshopProducts(storeId: string, params?: { limit?: number; page?: number }): Promise<{ products: any[]; count: number }> {
    const queryParams = new URLSearchParams();
    queryParams.append('storeId', storeId);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    return this.request<{ products: any[]; count: number }>(`/nuvemshop/products?${queryParams.toString()}`, {
      method: 'GET',
    });
  }

  async getNuvemshopAbandonedCheckouts(
    storeId: string,
    params?: {
      limit?: number;
      since_id?: number;
    }
  ): Promise<{ checkouts: any[]; count: number }> {
    const queryParams = new URLSearchParams();
    queryParams.append('storeId', storeId);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.since_id) queryParams.append('since_id', params.since_id.toString());

    return this.request<{ checkouts: any[]; count: number }>(`/nuvemshop/checkouts/abandoned?${queryParams.toString()}`, {
      method: 'GET',
    });
  }

  async createNuvemshopWebhook(storeId: string, event: string, url: string): Promise<any> {
    return this.request<any>('/nuvemshop/webhooks', {
      method: 'POST',
      body: JSON.stringify({ storeId, event, url }),
    });
  }

  async listNuvemshopWebhooks(storeId: string): Promise<{ webhooks: any[] }> {
    return this.request<{ webhooks: any[] }>(`/nuvemshop/webhooks?storeId=${storeId}`, {
      method: 'GET',
    });
  }

  async disconnectNuvemshop(storeId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/nuvemshop/disconnect', {
      method: 'POST',
      body: JSON.stringify({ storeId }),
    });
  }

  // VTEX Integration
  async connectVtex(data: { accountName: string; appKey: string; appToken: string }): Promise<{ success: boolean; connection: any }> {
    return this.request<{ success: boolean; connection: any }>('/vtex/auth/connect', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getVtexConnections(): Promise<any[]> {
    return this.request<any[]>('/vtex/connections', {
      method: 'GET',
    });
  }

  async testVtexConnection(accountName: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/vtex/test-connection', {
      method: 'POST',
      body: JSON.stringify({ accountName }),
    });
  }

  async disconnectVtex(accountName: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/vtex/disconnect', {
      method: 'POST',
      body: JSON.stringify({ accountName }),
    });
  }
}

export const api = new ApiService();

