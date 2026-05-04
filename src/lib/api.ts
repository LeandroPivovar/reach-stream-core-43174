const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const defaultApiUrl = isProd ? window.location.origin : 'http://localhost:3000';
export const API_URL = import.meta.env.VITE_API_URL || defaultApiUrl;





export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  referralCode?: string;
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
  twoFactorEnabled?: boolean;
  planName?: string;
  document?: string;
  address?: string;
  postalCode?: string;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user?: User;
  token?: string;
  twoFactorRequired?: boolean;
  email?: string;
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
  twoFactorEnabled?: boolean;
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
  externalId?: string;
  couponCode?: string;
  product?: {
    id: number;
    name: string;
  };
  campaign?: {
    id: number;
    name: string;
  };
  paymentMethod?: string;
  channel?: string;
}

export interface CreateSaleData {
  productId: number;
  quantity: number;
  customerName?: string;
  customerEmail?: string;
  status?: string;
  contactId?: number;
  unitPrice?: number;
  totalValue?: number;
  channel?: string;
  paymentMethod?: string;
}

export interface DashboardStats {
  faturamento: number;
  previousFaturamento?: number;
  dailyRevenue?: Array<{ date: string; faturamento: number }>;
  vendas: number;
  ticketMedio: number;
  trends: {
    faturamento: number;
    vendas: number;
    ticketMedio: number;
  };
}

export interface SalesByCampaign {
  nome: string;
  canal: string;
  faturamento: number;
  vendas: number;
}

export interface SalesByChannel {
  canal: string;
  faturamento: number;
  vendas: number;
}

export interface TopProduct {
  nome: string;
  vendas: number;
  faturamento: number;
}

export interface PaymentMethodStats {
  metodo: string;
  transacoes: number;
  faturamento?: number;
  percentual: number;
  tempoMedio: string;
}

export interface FunnelStage {
  id?: string;
  name?: string;  // New standard
  stage: string;  // Legacy standard
  count?: number; // New standard
  value: number;  // Legacy standard
  percentage: number;
  description?: string;
}

export interface HeatmapSegment {
  name: string;
  leads: number;
  engaged: number;
  cart: number;
  abandoned: number;
  purchase: number;
  loyal: number;
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
  birthDate?: string;
  gender?: string;
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
  sales?: Sale[];
  hasActiveCoupon?: boolean;
  hasClickedCampaign?: boolean;
  hasOpenedCampaign?: boolean;
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
  birthDate?: string;
  gender?: string;
  groupId?: number;
  tagIds?: number[];
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
  birthDate?: string;
  gender?: string;
  groupId?: number | null;
  tagIds?: number[];
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
  type: 'smtp' | 'domain';
  email?: string;
  smtpHost?: string;
  smtpPort?: number;
  username?: string;
  secure: boolean;
  domain?: string;
  status: 'pending' | 'verified' | 'rejected';
  dnsTxt?: string;
  dnsCname?: string;
  dnsMx?: string;
  adminNote?: string;
  createdAt: string;
}

export interface TrayConnection {
  id: number;
  shopUrl: string;
  apiUrl?: string;
  isActive: boolean;
  lastSyncAt?: string;
  createdAt: string;
}

export interface TwilioConnection {
  id: number;
  friendlyName?: string;
  whatsappFrom: string;
  status: 'pending' | 'verified' | 'rejected';
  adminNote?: string;
  createdAt: string;
  userId: number;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateTwilioConnectionData {
  friendlyName?: string;
  whatsappFrom: string;
}

export interface CreateEmailConnectionData {
  type: 'domain';
  domain: string;
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
  categoryId?: number;
  categoryEntity?: Category;
  active: boolean;
  coverPhoto?: string;
  gallery?: string[];
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: number;
  name: string;
  complexity: string;
  channel: string;
  status: string;
  recipientsCount: number;
  sentCount: number;
  deliveredCount: number;
  clicksCount: number;
  revenue: number | string;
  config: any;
  scheduledAt?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface SegmentationParam {
  id: string;
  params?: {
    days?: number;
    minPurchases?: number;
    minTicket?: number;
    [key: string]: any;
  };
}

export interface CreateCampaignData {
  name: string;
  complexity: string;
  channel: string;
  status?: string;
  config?: any;
  scheduledAt?: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  sku?: string;
  category?: string;
  categoryId?: number;
  active?: boolean;
  coverPhoto?: string;
  gallery?: string[];
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  sku?: string;
  category?: string;
  categoryId?: number;
  active?: boolean;
  coverPhoto?: string;
  gallery?: string[];
}

export interface Pixel {
  id: number;
  pixelId: string;
  name: string;
  userId: number;
  eventsCount?: number;
  conversionsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCapacityStats {
  email: {
    consumed: number;
    providerLimit: number;
    clientsContracted: number;
    usagePercent: number;
    daysRemaining: number;
    projection: number;
    marginOfSafety: number;
    isAlert: boolean;
  };
  sms: {
    consumed: number;
    providerLimit: number;
    clientsContracted: number;
    usagePercent: number;
    daysRemaining: number;
    projection: number;
    marginOfSafety: number;
    isAlert: boolean;
  };
  whatsapp: {
    consumed: number;
    providerLimit: number;
    clientsContracted: number;
    usagePercent: number;
    daysRemaining: number;
    projection: number;
    marginOfSafety: number;
    isAlert: boolean;
  };
}

export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminGlobalStats {
  dau: number;
  mau: number;
  activeCompanies: number;
  mrr: number;
  growthMoM: number;
  churnRate: number;
  defaultRate: number;
  averageLtv: number;
  cac: number;
  ticketByPlan: Record<string, number>;
  totalAverageTicket: number;
}

export interface InternalAnalyticsEvent {
  type: 'page_view' | 'action';
  name: string;
  metadata?: any;
}

export interface AdminSystemOverviewStats {
  counts: {
    contacts: number;
    campaigns: number;
    categories: number;
    trackingLinks: number;
    integrations: number;
    emailsSent: number;
    smsSent: number;
  };
  integrationsBreakdown: {
    shopify: number;
    nuvemshop: number;
    vtex: number;
    lojaIntegrada: number;
  };
  topPages: Array<{ name: string; count: number }>;
  topActions: Array<{ name: string; count: number }>;
}

export interface AdminEventTrend {
  date: string;
  count: number;
}

export interface AdminUserStats {
  billingAmount: number;
  lifetimeProfit: number;
  contactsCount: number;
  campaignsCount: number;
  usage: {
    emails: {
      used: number;
      contracted: number;
      extra: number;
      total: number;
      available: number;
    };
    sms: {
      used: number;
      contracted: number;
      extra: number;
      total: number;
      available: number;
    };
    whatsapp: {
      used: number;
      unlimited: boolean;
    };
  };
  subscription: {
    planName: string;
    status: string;
    createdAt: string;
  };
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: number;
  subject: string;
  category: string;
  status: 'pendente' | 'respondido' | 'finalizado';
  userId: number;
  user?: User;
  messages?: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: number;
  message: string;
  ticketId: number;
  senderId: number;
  sender?: User;
  isAdmin: boolean;
  createdAt: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  active?: boolean;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  active?: boolean;
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  // Loja Integrada Integration
  // Tickets API
  public ticketsApi = {
    create: (data: { subject: string; category: string; message: string }) =>
      this.request<Ticket>('/tickets', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getAll: () =>
      this.request<Ticket[]>('/tickets', {
        method: 'GET',
      }),
    getById: (id: number) =>
      this.request<Ticket>(`/tickets/${id}`, {
        method: 'GET',
      }),
    addMessage: (id: number, message: string) =>
      this.request<TicketMessage>(`/tickets/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
    finish: (id: number) =>
      this.request<Ticket>(`/tickets/${id}/finish`, {
        method: 'PUT',
      }),
  };

  public lojaIntegradaApi = {
    connect: (data: { storeName: string; apiKey: string; applicationKey?: string }) =>
      this.request<LojaIntegradaConnection>('/loja-integrada/connect', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getConnection: () =>
      this.request<LojaIntegradaConnection>('/loja-integrada/connection', {
        method: 'GET',
      }),
    sync: () =>
      this.request<{ products: any; orders: any; checkouts: any }>('/loja-integrada/sync', {
        method: 'POST',
      }),
  };

  public trayApi = {
    getAuthUrl: (shopUrl: string, callbackUrl: string) =>
      this.request<{ url: string }>(`/tray/auth-url?shopUrl=${encodeURIComponent(shopUrl)}&callbackUrl=${encodeURIComponent(callbackUrl)}`, {
        method: 'GET',
      }),
    finalizeConnection: (code: string, shopUrl: string) =>
      this.request<{ success: boolean; connection: TrayConnection }>('/tray/finalize-connection', {
        method: 'POST',
        body: JSON.stringify({ code, shopUrl }),
      }),
    sync: () =>
      this.request<{ products: any; customers: any; orders: any; checkouts: any }>('/tray/sync', {
        method: 'POST',
      }),
  };

  // Twilio Connections
  public twilioConnectionsApi = {
    request: (data: CreateTwilioConnectionData) =>
      this.request<TwilioConnection>('/twilio-connections', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getMyRequests: () =>
      this.request<TwilioConnection[]>('/twilio-connections/me', {
        method: 'GET',
      }),
    remove: (id: number) =>
      this.request<void>(`/twilio-connections/${id}`, {
        method: 'DELETE',
      }),
    // Admin
    getAdminPending: () =>
      this.request<TwilioConnection[]>('/twilio-connections/admin/pending', {
        method: 'GET',
      }),
    approve: (id: number, credentials: { accountSid: string; authToken: string }) =>
      this.request<TwilioConnection>(`/twilio-connections/admin/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    reject: (id: number, reason: string) =>
      this.request<TwilioConnection>(`/twilio-connections/admin/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
  };

  // Admin Template Requests
  public adminTemplateRequestsApi = {
    getRequests: () =>
      this.request<any[]>('/admin/template-requests', {
        method: 'GET',
      }),
    approve: (id: number, adminNote?: string) =>
      this.request<any>(`/admin/template-requests/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ adminNote }),
      }),
    reject: (id: number, adminNote: string) =>
      this.request<any>(`/admin/template-requests/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ adminNote }),
      }),
  };

  // Admin Campaign Templates
  public adminCampaignTemplatesApi = {
    getAll: () =>
      this.request<any[]>('/admin/campaign-templates', { method: 'GET' }),
    create: (data: { name: string; description?: string; workflow?: any; status?: string }) =>
      this.request<any>('/admin/campaign-templates', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Partial<{ name: string; description: string; workflow: any; status: string }>) =>
      this.request<any>(`/admin/campaign-templates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      this.request<void>(`/admin/campaign-templates/${id}`, { method: 'DELETE' }),
    getPublic: () =>
      this.request<any[]>('/campaigns/admin-templates', { method: 'GET' }),
  };

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      ...options.headers,
    };

    // Only add JSON content type if body is NOT FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Adicionar /api se nÃ£o estiver presente no endpoint e se o API_URL nÃ£o jÃ¡ incluir /api
    const baseUrl = API_URL.endsWith('/api') ? API_URL.replace(/\/api$/, '') : API_URL;
    const apiEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
    const response = await fetch(`${baseUrl}${apiEndpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }

      let error;
      try {
        const text = await response.text();
        error = text ? JSON.parse(text) : { message: 'Erro ao processar requisiÃ§Ã£o' };
      } catch {
        error = { message: 'Erro ao processar requisiÃ§Ã£o' };
      }
      // NestJS retorna mensagens de erro em error.message ou em um array
      const errorMessage = error.message ||
        (Array.isArray(error.message) ? error.message.join(', ') : 'Erro ao processar requisiÃ§Ã£o');
      throw new Error(errorMessage);
    }

    // Verificar se a resposta tem conteÃºdo (status 204 No Content nÃ£o tem body)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Resposta vazia (como DELETE 204) - retornar void
      return undefined as any;
    }

    try {
      const text = await response.text();
      // Se nÃ£o houver texto, retornar undefined
      if (!text) {
        return undefined as any;
      }
      const data = JSON.parse(text);

      // Log para APIs de vendas conforme solicitado pelo usuÃ¡rio
      if (apiEndpoint.includes('/sales')) {
        console.log(`[Sales API] ${options.method || 'GET'} ${apiEndpoint} - Response:`, data);
      }

      return data;
    } catch (error) {
      console.error('Erro ao parsear resposta JSON:', error);
      // Se nÃ£o conseguir parsear, retornar undefined (pode ser resposta vazia vÃ¡lida)
      return undefined as any;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
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

  async wipeData(): Promise<void> {
    await this.request('/users/me/wipe-data', {
      method: 'POST',
    });
  }

  async toggle2fa(enabled: boolean): Promise<User> {
    return this.updateUser({ twoFactorEnabled: enabled });
  }


  async verify2fa(email: string, code: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/verify-2fa', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
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
   * Importa produto de integraÃ§Ã£o (cria ou atualiza se jÃ¡ existir)
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

  async uploadProductPhoto(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.getAuthToken();
    const baseUrl = API_URL.endsWith('/api') ? API_URL.replace(/\/api$/, '') : API_URL;
    const response = await fetch(`${baseUrl}/api/products/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao enviar foto' }));
      throw new Error(error.message || 'Erro ao enviar foto');
    }

    return response.json();
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

  async getDashboardStats(period: number = 7, filters: { campaignId?: string | number; productId?: string | number; startDate?: string; endDate?: string } = {}): Promise<DashboardStats> {
    const params = new URLSearchParams();
    params.append('period', period.toString());
    if (filters?.campaignId) params.append('campaignId', filters.campaignId.toString());
    if (filters?.productId) params.append('productId', filters.productId.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    return this.request<DashboardStats>(`/sales/dashboard/stats?${params.toString()}`, {
      method: 'GET',
    });
  }

  async getSalesByCampaign(period: number = 7, filters: { productId?: string | number; startDate?: string; endDate?: string } = {}): Promise<SalesByCampaign[]> {
    const params = new URLSearchParams();
    params.append('period', period.toString());
    if (filters?.productId) params.append('productId', filters.productId.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    return this.request<SalesByCampaign[]>(`/sales/dashboard/campaigns?${params.toString()}`, {
      method: 'GET',
    });
  }

  async getSalesByChannel(period: number = 7, filters: { campaignId?: string | number; productId?: string | number; startDate?: string; endDate?: string } = {}): Promise<SalesByChannel[]> {
    const params = new URLSearchParams();
    params.append('period', period.toString());
    if (filters?.campaignId) params.append('campaignId', filters.campaignId.toString());
    if (filters?.productId) params.append('productId', filters.productId.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    return this.request<SalesByChannel[]>(`/sales/dashboard/channels?${params.toString()}`, {
      method: 'GET',
    });
  }

  async getTopProducts(period: number = 7, filters: { campaignId?: string | number; startDate?: string; endDate?: string } = {}): Promise<TopProduct[]> {
    const params = new URLSearchParams();
    params.append('period', period.toString());
    if (filters?.campaignId) params.append('campaignId', filters.campaignId.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    return this.request<TopProduct[]>(`/sales/dashboard/products?${params.toString()}`, {
      method: 'GET',
    });
  }

  async getPaymentMethods(period: number = 7, filters: { campaignId?: string | number; productId?: string | number; startDate?: string; endDate?: string } = {}): Promise<PaymentMethodStats[]> {
    const params = new URLSearchParams();
    params.append('period', period.toString());
    if (filters?.campaignId) params.append('campaignId', filters.campaignId.toString());
    if (filters?.productId) params.append('productId', filters.productId.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    return this.get<PaymentMethodStats[]>(`/sales/dashboard/payment-methods?${params.toString()}`);
  }

  async getCampaignDashboardPerformance(period: string, filters: { campaignId?: string | number; productId?: string | number } = {}): Promise<any> {
    const params = new URLSearchParams();
    params.append('period', period);
    if (filters.campaignId) params.append('campaignId', filters.campaignId.toString());
    if (filters.productId) params.append('productId', filters.productId.toString());

    return this.get<any>(`/campaigns/dashboard/performance?${params.toString()}`);
  }

  async getContactsBySegments(segmentations: (string | SegmentationParam)[], groupIds?: number[]): Promise<Contact[]> {
    return this.request<Contact[]>('/contacts/segments', {
      method: 'POST',
      body: JSON.stringify({ segmentations, groupIds })
    });
  }

  // --- Categories ---
  async getCategories(): Promise<Category[]> {
    return this.get<Category[]>('/categories');
  }

  async getCategory(id: number): Promise<Category> {
    return this.get<Category>(`/categories/${id}`);
  }

  async createCategory(data: CreateCategoryData): Promise<Category> {
    return this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateCategory(id: number, data: UpdateCategoryData): Promise<Category> {
    return this.request<Category>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deleteCategory(id: number): Promise<void> {
    return this.request<void>(`/categories/${id}`, {
      method: 'DELETE'
    });
  }

  // --- Admin User Methods ---

  async getAdminCapacityStats(): Promise<AdminCapacityStats> {
    return this.get<AdminCapacityStats>('/admin/capacity/stats');
  }

  async getAdminUsers(planId?: number): Promise<AdminUser[]> {
    const url = planId ? `/admin/users?planId=${planId}` : '/admin/users';
    return this.get<AdminUser[]>(url);
  }

  async updateAdminUser(id: number, data: Partial<AdminUser>): Promise<AdminUser> {
    return this.request<AdminUser>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async impersonateAdminUser(userId: number): Promise<{ token: string; user: any }> {
    return this.request<{ token: string; user: any }>(`/admin/stats/users/${userId}/impersonate`, {
      method: 'POST'
    });
  }

  async assignAdminUserPlan(userId: number, planId: number | null): Promise<any> {
    return this.request<any>(`/admin/users/${userId}/plan`, {
      method: 'POST',
      body: JSON.stringify({ planId })
    });
  }

  async getAdminGlobalStats(month?: number, year?: number): Promise<AdminGlobalStats> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    const queryString = params.toString();
    return this.get<AdminGlobalStats>(`/admin/stats/global${queryString ? `?${queryString}` : ''}`);
  }

  async getAdminUserStats(userId: number): Promise<AdminUserStats> {
    return this.get<AdminUserStats>(`/admin/stats/users/${userId}`);
  }

  async resetAdminUserPassword(userId: number, newPassword?: string): Promise<{ tempPassword?: string }> {
    return this.request<{ tempPassword?: string }>(`/admin/stats/users/${userId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  }

  async addAdminUserCredits(userId: number, type: 'email' | 'sms' | 'whatsapp', amount: number): Promise<any> {
    return this.request<any>(`/admin/stats/users/${userId}/credits`, {
      method: 'POST',
      body: JSON.stringify({ type, amount }),
    });
  }

  async getPendingEmailConnections(): Promise<any[]> {
    return this.get<any[]>('/admin/email-connections/pending');
  }

  async approveEmailConnection(id: number): Promise<any> {
    return this.request<any>(`/admin/email-connections/${id}/approve`, {
      method: 'POST'
    });
  }

  async rejectEmailConnection(id: number, adminNote: string): Promise<any> {
    return this.request<any>(`/admin/email-connections/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ adminNote })
    });
  }

  async impersonateUser(userId: number): Promise<{ token: string }> {
    return this.request<{ token: string }>(`/admin/stats/users/${userId}/impersonate`, {
      method: 'POST',
    });
  }

  // --- Checkout Flow ---
  async checkoutPlan(data: {
    planId: number,
    document: string,
    address: string,
    phone: string,
    name: string,
    billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX',
    creditCard?: {
      holderName: string,
      number: string,
      expiryMonth: string,
      expiryYear: string,
      ccv: string
    },
    creditCardHolderInfo?: {
      name: string,
      email: string,
      cpfCnpj: string,
      postalCode: string,
      addressNumber: string,
      addressComplement?: string,
      phone?: string,
      mobilePhone?: string
    }
  }): Promise<any> {
    return this.request<any>('/subscriptions/checkout', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async cancelSubscription(): Promise<any> {
    return this.request<any>('/subscriptions/cancel', { method: 'POST' });
  }

  async setAdminUserSubscriptionExpiry(userId: number, expiryDate: string): Promise<any> {
    return this.request<any>(`/admin/users/${userId}/subscription-expiry`, {
      method: 'PATCH',
      body: JSON.stringify({ expiryDate })
    });
  }

  // --- Admin Settings ---
  async getSystemSettings(): Promise<SystemSetting[]> {
    return this.get<SystemSetting[]>('/admin/settings');
  }

  async updateSystemSettings(key: string, value: string): Promise<any> {
    return this.request<any>(`/system-settings/${key}`, {
      method: 'PATCH',
      body: JSON.stringify({ value })
    });
  }

  async updateSystemSettingsBulk(settings: { key: string, value: string }[]): Promise<any> {
    return this.request<any>('/admin/settings/bulk', {
      method: 'PATCH',
      body: JSON.stringify(settings)
    });
  }

  // --- Campaign Contacts ---

  async getFunnelData(period: number = 7, filters: { campaignId?: string | number; productId?: string | number; startDate?: string; endDate?: string } = {}): Promise<FunnelStage[]> {
    const params = new URLSearchParams();
    params.append('period', period.toString());
    if (filters?.campaignId) params.append('campaignId', filters.campaignId.toString());
    if (filters?.productId) params.append('productId', filters.productId.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    return this.request<FunnelStage[]>(`/sales/dashboard/funnel?${params.toString()}`, {
      method: 'GET',
    });
  }

  async getDashboardHeatmap(period: number = 7, filters: { campaignId?: string | number; productId?: string | number; startDate?: string; endDate?: string } = {}): Promise<HeatmapSegment[]> {
    const params = new URLSearchParams();
    params.append('period', period.toString());
    if (filters?.campaignId) params.append('campaignId', filters.campaignId.toString());
    if (filters?.productId) params.append('productId', filters.productId.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    return this.get<HeatmapSegment[]>(`/sales/dashboard/heatmap?${params.toString()}`);
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

  async getSegmentationStats(period: number = 7, filters: { campaignId?: string | number; productId?: string | number } = {}): Promise<any> {
    const params = new URLSearchParams();
    params.append('period', period.toString());
    if (filters?.campaignId) params.append('campaignId', filters.campaignId.toString());
    if (filters?.productId) params.append('productId', filters.productId.toString());

    return this.get<any>(`/sales/dashboard/segmentation?${params.toString()}`);
  }

  async getContactSegmentationStats(): Promise<Record<string, number>> {
    return this.get<Record<string, number>>('/contacts/segmentation-stats');
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

  async getTwilioTemplates(): Promise<any[]> {
    return this.request<any[]>('/campaigns/twilio/templates', {
      method: 'GET',
    });
  }

  async getTwilioConfig(): Promise<{ configured: boolean }> {
    return this.request<{ configured: boolean }>('/twilio-connections/config', {
      method: 'GET',
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

  async syncShopifyCustomers(shop: string): Promise<{ success: boolean; imported: number; updated: number }> {
    return this.request<{ success: boolean; imported: number; updated: number }>('/shopify/sync/customers', {
      method: 'POST',
      body: JSON.stringify({ shop }),
    });
  }

  async syncShopifyOrders(shop: string): Promise<{ success: boolean; imported: number; updated: number }> {
    return this.request<{ success: boolean; imported: number; updated: number }>('/shopify/sync/orders', {
      method: 'POST',
      body: JSON.stringify({ shop }),
    });
  }

  async syncShopifyCheckouts(shop: string): Promise<{ success: boolean; imported: number; updated: number }> {
    return this.request<{ success: boolean; imported: number; updated: number }>('/shopify/sync/checkouts', {
      method: 'POST',
      body: JSON.stringify({ shop }),
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

  async testVtexConnection(accountName: string): Promise<{ success: boolean; message?: string }> {
    return this.request<{ success: boolean; message?: string }>('/vtex/test', {
      method: 'POST',
      body: JSON.stringify({ accountName }),
    });
  }

  async getVtexConnections(): Promise<any[]> {
    return this.request<any[]>('/vtex/connections', {
      method: 'GET',
    });
  }

  async disconnectVtex(accountName: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/vtex/disconnect', {
      method: 'POST',
      body: JSON.stringify({ accountName }),
    });
  }

  public vtexApi = {
    connect: (data: { accountName: string; appKey: string; appToken: string }) =>
      this.request<any>('/vtex/connect', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getConnections: () =>
      this.request<any[]>('/vtex/connections', {
        method: 'GET',
      }),
    disconnect: (accountName: string) =>
      this.request<{ success: boolean; message: string }>('/vtex/disconnect', {
        method: 'POST',
        body: JSON.stringify({ accountName }),
      }),
    sync: (accountName?: string) =>
      this.request<any>('/vtex/sync', {
        method: 'POST',
        body: JSON.stringify({ accountName }),
      }),
  };

  // Campaigns
  async getCampaigns(filters: {
    startDate?: string;
    endDate?: string;
    minSends?: number;
    maxSends?: number;
    channel?: string;
    minRevenue?: number;
    maxRevenue?: number;
  } = {}): Promise<Campaign[]> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.minSends !== undefined) params.append('minSends', filters.minSends.toString());
    if (filters.maxSends !== undefined) params.append('maxSends', filters.maxSends.toString());
    if (filters.channel) params.append('channel', filters.channel);
    if (filters.minRevenue !== undefined) params.append('minRevenue', filters.minRevenue.toString());
    if (filters.maxRevenue !== undefined) params.append('maxRevenue', filters.maxRevenue.toString());

    return this.request<Campaign[]>(`/campaigns?${params.toString()}`, {
      method: 'GET',
    });
  }

  async getActiveCoupons(): Promise<any[]> {
    return this.get<any[]>('/campaigns/active-coupons');
  }

  async getCampaign(id: number): Promise<Campaign> {
    return this.request<Campaign>(`/campaigns/${id}`, {
      method: 'GET',
    });
  }

  async createCampaign(data: CreateCampaignData): Promise<Campaign> {
    return this.request<Campaign>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCampaign(id: number, data: Partial<CreateCampaignData>): Promise<Campaign> {
    return this.request<Campaign>(`/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCampaign(id: number): Promise<void> {
    return this.request<void>(`/campaigns/${id}`, {
      method: 'DELETE',
    });
  }

  async addContactsToCampaign(campaignId: number, contactIds: number[]): Promise<any> {
    return this.request<any>(`/campaigns/${campaignId}/contacts`, {
      method: 'POST',
      body: JSON.stringify({ contactIds }),
    });
  }

  // Subscriptions
  async getPlans(): Promise<Plan[]> {
    return this.request<Plan[]>('/subscriptions/plans', {
      method: 'GET',
    });
  }

  async getCurrentSubscription(): Promise<Subscription | null> {
    return this.request<Subscription | null>('/subscriptions/current', {
      method: 'GET',
    });
  }

  async getInvoices(): Promise<Invoice[]> {
    return this.request<Invoice[]>('/subscriptions/invoices', {
      method: 'GET',
    });
  }

  async getSubscriptionStats(): Promise<SubscriptionStats> {
    return this.request<SubscriptionStats>('/subscriptions/dashboard/stats', {
      method: 'GET',
    });
  }

  async buyCredits(data: {
    type: 'email' | 'sms' | 'whatsapp',
    amount: number,
    billingType: 'PIX' | 'CREDIT_CARD',
    creditCard?: any,
    creditCardHolderInfo?: any
  }): Promise<any> {
    return this.request<any>('/subscriptions/buy-credits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async buyTemplateRequest(data: {
    content: string,
    billingType: 'PIX' | 'CREDIT_CARD',
    creditCard?: any,
    creditCardHolderInfo?: any
  }): Promise<any> {
    return this.request<any>('/subscriptions/buy-template-request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Pixels
  async getPixels(): Promise<Pixel[]> {
    return this.request<Pixel[]>('/pixels', {
      method: 'GET',
    });
  }

  async testEmail(email: string): Promise<any> {
    return this.request<any>('/admin/settings/test-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async createPixel(data: { name: string }): Promise<Pixel> {
    return this.request<Pixel>('/pixels', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async getPixelMetrics(period = 30): Promise<PixelMetrics> {
    return this.request<PixelMetrics>(`/pixels/metrics?period=${period}`, {
      method: 'GET',
    });
  }

  // Referrals
  async getMyReferralCode(): Promise<{ referralCode: string }> {
    return this.get<{ referralCode: string }>('/referrals/my-code');
  }

  async generateReferralCode(): Promise<{ referralCode: string }> {
    return this.request<{ referralCode: string }>('/referrals/generate', {
      method: 'POST',
    });
  }

  async getMyReferrals(): Promise<any[]> {
    return this.get<any[]>('/referrals/my-referrals');
  }

  async getReferralStats(): Promise<any> {
    return this.get<any>('/referrals/stats');
  }

  async validateReferralCode(code: string): Promise<{ referrerName: string; isValid: boolean }> {
    return this.get<{ referrerName: string; isValid: boolean }>(`/referrals/validate/${code}`);
  }

  // Webhooks
  async getWebhookLogs(): Promise<any[]> {
    return this.get<any[]>('/webhooks/logs');
  }

  async getWebhookLog(id: number): Promise<any> {
    return this.get<any>(`/webhooks/logs/${id}`);
  }

  // NotificaÃ§Ãµes
  async getNotifications(): Promise<Notification[]> {
    return this.get<Notification[]>('/notifications');
  }

  async getUnreadNotificationsCount(): Promise<{ count: number }> {
    return this.get<{ count: number }>('/notifications/unread-count');
  }

  async markNotificationAsRead(id: number): Promise<void> {
    return this.request<void>(`/notifications/${id}/read`, {
      method: 'POST',
    });
  }

  async deleteNotification(id: number): Promise<void> {
    return this.request<void>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  async getNotificationPreferences(): Promise<{ type: string, enabled: boolean }[]> {
    return this.get<{ type: string, enabled: boolean }[]>('/notifications/preferences');
  }

  async updateNotificationPreferences(preferences: { type: string, enabled: boolean }[]): Promise<void> {
    return this.request<void>('/notifications/preferences', {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
  }

  // Admin NotificaÃ§Ãµes


  async createCoupon(data: {
    shop?: string;
    title: string;
    code: string;
    value: string;
    valueType: 'percentage' | 'fixed';
    endsAt?: string;
  }): Promise<any> {
    return this.request<any>('/shopify/coupons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createNuvemshopCoupon(data: {
    storeId?: string;
    code: string;
    type: 'percentage' | 'absolute' | 'shipping';
    value?: string;
    start_date?: string;
    end_date?: string;
    min_price?: string;
    max_uses?: number;
    first_consumer_purchase?: boolean;
  }): Promise<any> {
    return this.request<any>('/nuvemshop/coupons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // SincronizaÃ§Ã£o em Background (Nuvemshop)
  async syncNuvemshopCustomers(storeId: string): Promise<any> {
    return this.request<any>('/nuvemshop/sync/customers', {
      method: 'POST',
      body: JSON.stringify({ storeId }),
    });
  }

  async syncNuvemshopOrders(storeId: string): Promise<any> {
    return this.request<any>('/nuvemshop/sync/orders', {
      method: 'POST',
      body: JSON.stringify({ storeId }),
    });
  }

  async syncNuvemshopCheckouts(storeId: string): Promise<any> {
    return this.request<any>('/nuvemshop/sync/checkouts', {
      method: 'POST',
      body: JSON.stringify({ storeId }),
    });
  }

  async syncNuvemshopProductsToCrm(storeId: string): Promise<any> {
    return this.request<any>('/nuvemshop/sync/products-to-crm', {
      method: 'POST',
      body: JSON.stringify({ storeId }),
    });
  }

  async getIntegrationStatus(type: 'nuvemshop' | 'shopify' | 'vtex' | 'loja_integrada'): Promise<{ connected: boolean }> {
    try {
      let connections: any[] = [];
      if (type === 'nuvemshop') {
        connections = await this.nuvemshopApi.getConnections();
      } else if (type === 'shopify') {
        connections = await this.shopifyApi.getConnections();
      } else if (type === 'vtex') {
        connections = await this.vtexApi.getConnections();
      } else if (type === 'loja_integrada') {
        const conn = await this.lojaIntegradaApi.getConnection();
        return { connected: !!conn && conn.isActive };
      }
      return { connected: connections && connections.length > 0 && connections.some((c: any) => c.isActive) };
    } catch (error) {
      console.error(`Error getting ${type} status:`, error);
      return { connected: false };
    }
  }

  // Unified Sync for all platforms
  async syncAllPlatforms(): Promise<any> {
    const results: any = {};
    
    // Check which integrations are active and sync them
    try {
      const [shopify, nuvemshop, vtex, lojaIntegrada] = await Promise.all([
        this.getIntegrationStatus('shopify'),
        this.getIntegrationStatus('nuvemshop'),
        this.getIntegrationStatus('vtex'),
        this.getIntegrationStatus('loja_integrada'),
      ]);

      const syncPromises = [];
      if (shopify.connected) syncPromises.push(this.shopifyApi.syncAll().then(r => results.shopify = r).catch(e => results.shopifyError = e.message));
      if (nuvemshop.connected) syncPromises.push(this.nuvemshopApi.syncAll().then(r => results.nuvemshop = r).catch(e => results.nuvemshopError = e.message));
      if (vtex.connected) syncPromises.push(this.vtexApi.sync().then(r => results.vtex = r).catch(e => results.vtexError = e.message));
      if (lojaIntegrada.connected) syncPromises.push(this.lojaIntegradaApi.sync().then(r => results.lojaIntegrada = r).catch(e => results.lojaIntegradaError = e.message));

      if (syncPromises.length > 0) {
        await Promise.all(syncPromises);
      }
    } catch (e) {
      console.error('Error in unified sync:', e);
    }
    
    return results;
  }

  // Shopify Sync
  public shopifyApi = {
    getConnections: () => this.request<any[]>('/shopify/connections'),
    syncAll: (shop?: string) => this.request<any>('/shopify/sync-all', {
      method: 'POST',
      body: JSON.stringify({ shop }),
    }),
  };

  // Nuvemshop Sync
  public nuvemshopApi = {
    getConnections: () => this.request<any[]>('/nuvemshop/connections'),
    syncAll: (storeId?: string) => this.request<any>('/nuvemshop/sync-all', {
      method: 'POST',
      body: JSON.stringify({ storeId }),
    }),
  };

  async syncShopifyProductsToCrm(shop: string): Promise<any> {
    return this.request<any>('/shopify/sync/products-to-crm', {
      method: 'POST',
      body: JSON.stringify({ shop }),
    });
  }

  async importSales(file: File): Promise<{ created: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const baseUrl = API_URL.endsWith('/api') ? API_URL.replace(/\/api$/, '') : API_URL;
    const response = await fetch(`${baseUrl}/api/sales/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao importar vendas' }));
      throw new Error(error.message || 'Erro ao importar vendas');
    }

    return response.json();
  }

  // --- Admin Plan Management ---
  async getAdminPlans(): Promise<Plan[]> {
    return this.get<Plan[]>('/admin/plans');
  }

  async createAdminPlan(data: Partial<Plan>): Promise<Plan> {
    return this.request<Plan>('/admin/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminPlan(id: number, data: Partial<Plan>): Promise<Plan> {
    return this.request<Plan>(`/admin/plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminPlan(id: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/plans/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Admin Finance Stats ---
  async getAdminFinanceStats(days = 365): Promise<AdminFinanceStats> {
    return this.get<AdminFinanceStats>(`/admin/finance/stats?days=${days}`);
  }

  // --- Admin Settings ---
  async getAdminSettings(): Promise<any[]> {
    return this.get<any[]>('/admin/settings');
  }

  async updateAdminSetting(key: string, value: string, description?: string): Promise<any> {
    return this.request<any>(`/admin/settings/${key}`, {
      method: 'PATCH',
      body: JSON.stringify({ value, description }),
    });
  }

  // Analytics
  async trackEvent(data: InternalAnalyticsEvent): Promise<void> {
    return this.request('/analytics/track', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Admin System Overview
  async getAdminSystemOverview(): Promise<AdminSystemOverviewStats> {
    return this.request<AdminSystemOverviewStats>('/admin/overview/stats', {
      method: 'GET',
    });
  }

  async getAdminEventStats(days = 30): Promise<AdminEventTrend[]> {
    return this.request<AdminEventTrend[]>(`/admin/overview/events?days=${days}`, {
      method: 'GET',
    });
  }

  // Admin Lead Requests
  async getAdminLeadRequests(): Promise<LeadRequest[]> {
    return this.request<LeadRequest[]>('/lead-requests/admin/all', {
      method: 'GET',
    });
  }

  async updateAdminLeadStatus(id: number, status: string): Promise<LeadRequest> {
    return this.request<LeadRequest>(`/lead-requests/admin/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async generateTestAccount(level) {
    return this.request('/admin/generate-test-account', {
      method: 'POST',
      body: JSON.stringify({ level }),
    });
  }

  // Admin Referrals
  public referralsAdminApi = {
    getStats: () =>
      this.request<any>('/referrals/admin/stats', { method: 'GET' }),
    getList: (params?: any) => {
      const query = new URLSearchParams(params).toString();
      return this.request<any[]>(`/referrals/admin/list${query ? `?${query}` : ''}`, { method: 'GET' });
    },
    updateStatus: (id: number, status: string) =>
      this.request<any>(`/referrals/admin/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    getCommissions: (params?: any) => {
      const query = new URLSearchParams(params).toString();
      return this.request<any[]>(`/referrals/admin/commissions${query ? `?${query}` : ''}`, { method: 'GET' });
    },
    updateCommissionStatus: (id: number, status: string) =>
      this.request<any>(`/referrals/admin/commissions/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    getRanking: () =>
      this.request<any[]>('/referrals/admin/ranking', { method: 'GET' }),
    getRewardsConfig: () =>
      this.request<any[]>('/referrals/admin/rewards-config', { method: 'GET' }),
    updateRewardsConfig: (data: any) =>
      this.request<any>('/referrals/admin/rewards-config', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getAdminUsers: () =>
      this.request<any[]>('/referrals/admin/users', { method: 'GET' }),
    updateUserPercentage: (id: number, percentage: number) =>
      this.request<any>(`/referrals/admin/users/${id}/percentage`, {
        method: 'PATCH',
        body: JSON.stringify({ percentage }),
      }),
  };

  // Knowledge Base (Tutorials)
  public knowledgeBaseApi = {
    list: () =>
      this.request<any[]>('/admin/knowledge-base', { method: 'GET' }),
    create: (data: FormData) =>
      this.request<any>('/admin/knowledge-base', {
        method: 'POST',
        body: data, // Note: fetch will set the correct Content-Type with boundary for FormData
      }),
    update: (id: number, data: FormData) =>
      this.request<any>(`/admin/knowledge-base/${id}`, {
        method: 'PATCH',
        body: data,
      }),
    delete: (id: number) =>
      this.request<any>(`/admin/knowledge-base/${id}`, { method: 'DELETE' }),
  };
}

export const api = new ApiService();

export interface PixelMetrics {
  clicks: { value: number; change: number };
  leads: { value: number; change: number };
  conversionRate: { value: number; change: number };
  topPages: Array<{
    name: string;
    visits: number;
    conversions: number;
    rate: number;
  }>;
  funnelData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  conversionSources: Array<{
    source: string;
    conversions: number;
    percentage: number;
    color: string;
  }>;
  paymentMethods: Array<{
    method: string;
    usage: number;
    percentage: number;
    color: string;
    avgTime: string;
  }>;
  topForms: Array<{
    name: string;
    submissions: number;
    rate: number;
    efficiency: string;
  }>;
  clicksBreakdown: {
    abandonedCarts: {
      total: number;
      value: string;
      items: Array<{ product: string; count: number; value: string }>;
    };
    completedPurchases: {
      total: number;
      value: string;
      avgTicket: string;
      items: Array<{ date: string; customer: string; product: string; value: string }>;
    };
    topProducts: Array<{
      name: string;
      sales: number;
      revenue: string;
      conversion: number;
    }>;
    topCustomers: Array<{
      name: string;
      purchases: number;
      total: string;
      avgTicket: string;
    }>;
  };
}

export interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  active: boolean;
  role: string;
  createdAt: string;
  currentPlan?: Plan;
  extraEmailsBalance?: number;
  extraSmsBalance?: number;
  templateId?: string;
  lastLoginAt?: string;
}



export interface Plan {
  id: number;
  name: string;
  price: number;
  priceYearly: number;
  interval: string;
  features: string[];
  limits: {
    contacts: number;
    emails: number;
    whatsapp: boolean;
    whatsappLimit: number;
    sms: number;
    internalUsers?: number;
    advancedCampaigns?: number;
  };
  active: boolean;
}

export interface AdminFinanceStats {
  monthlyData: {
    month: string;
    monthFull: string;
    subscriptionRevenue: number;
    oneTimeRevenue: number;
    totalRevenue: number;
    costs: number;
    netProfit: number;
    margin: number;
  }[];
  projections: {
    month: string;
    revenue: number;
    profit: number;
  }[];
  currentMrr: number;
  ytdRevenue: number;
  avgMargin: number;
  growthRate: number;
  revenueByPlan: { name: string; value: number }[];
  inadimplency: {
    totalAmount: number;
    count: number;
    recentInvoices: {
      id: number;
      userName: string;
      amount: number;
      status: string;
      date: string;
    }[];
  };
  cancellationsByReason: { reason: string; count: number }[];
  settings?: {
    costSms: number;
    costEmail: number;
  };
}

export interface Subscription {
  id: number;
  userId: number;
  planId: number;
  plan?: Plan;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface Invoice {
  id: number;
  subscriptionId?: number;
  userId: number;
  amount: number;
  status: string;
  hostedInvoiceUrl?: string;
  pdfUrl?: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'system' | 'info' | 'success' | 'warning' | 'error' | 'campaign' | 'billing' | 'security' | 'marketing';
  link?: string;
  userId?: number;
  read?: boolean;
  readAt?: string;
  createdAt: string;
}

export interface SubscriptionStats {
  contactsUsed: number;
  contactsLimit: number;
  emailsSent: number;
  emailsLimit: number;
  smsSent: number;
  smsLimit: number;
  whatsappSent: number;
  whatsappLimit: number;
  campaignsCreated: number;
  campaignsLimit: number;
  currentPlan: string;
  price: number;
}

export interface LojaIntegradaConnection {
  id: number;
  storeName: string;
  isActive: boolean;
  lastSyncAt?: string;
}





export interface LeadRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  source?: string;
  status: string;
  segmento?: string;
  canalVendas?: string;
  instagram?: string;
  siteUrl?: string;
  faturamentoMedio?: string;
  comoAjudar?: string;
  createdAt: string;
  updatedAt: string;
}
