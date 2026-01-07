import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeaderActions } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { SuccessModal } from '@/components/ui/success-modal';
import { useToast } from '@/hooks/use-toast';
import { api, Product as ApiProduct, Sale } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Package,
  MoreHorizontal,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Upload,
  X,
  History,
  User,
  Filter,
  RefreshCw,
  Check,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface Product extends ApiProduct {
  status?: 'active' | 'inactive' | 'out_of_stock';
  sales?: number;
}

export default function Produtos() {
  const { toast } = useToast();
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isPurchaseHistoryOpen, setIsPurchaseHistoryOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);
  const [isLoadingSales, setIsLoadingSales] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalContent, setSuccessModalContent] = useState({
    title: '',
    description: '',
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Todos os produtos (sem filtros)
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [shopifyConnections, setShopifyConnections] = useState<any[]>([]);
  const [nuvemshopConnections, setNuvemshopConnections] = useState<any[]>([]);
  const [selectedIntegrations, setSelectedIntegrations] = useState<{
    shopify: string[];
    nuvemshop: string[];
  }>({
    shopify: [],
    nuvemshop: [],
  });
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [syncDirection, setSyncDirection] = useState<'send' | 'receive' | 'both'>('both');
  const [filters, setFilters] = useState({
    category: 'all',
    minPrice: '',
    maxPrice: '',
    stockFilter: 'all', // 'all', 'with_stock', 'without_stock'
  });
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '0',
    category: '',
    sku: '',
    active: true,
  });
  const [editProduct, setEditProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '0',
    category: '',
    sku: '',
    active: true,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (isSyncModalOpen) {
      loadIntegrations();
    }
  }, [isSyncModalOpen]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await api.getProducts();
      // Adicionar status calculado baseado em active e stock
      const productsWithStatus = data.map(p => {
        const stock = typeof p.stock === 'string' ? parseInt(p.stock, 10) : (typeof p.stock === 'number' ? p.stock : 0);
        const active = p.active === true || p.active === 1;
        return {
          ...p,
          stock: stock,
          active: active,
          status: !active ? 'inactive' : (stock === 0 ? 'out_of_stock' : 'active'),
          sales: p.sales || 0, // Placeholder, pode ser implementado depois
        };
      });
      setAllProducts(productsWithStatus);
      // Aplicar filtros após carregar produtos
      applyFilters(productsWithStatus, searchTerm, filters);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: 'Erro ao carregar produtos',
        description: error instanceof Error ? error.message : 'Não foi possível carregar os produtos',
        variant: 'destructive',
      });
      // Garantir que products seja sempre um array
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast({
        title: 'Atenção',
        description: 'Preencha pelo menos o nome e o preço do produto',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      await api.createProduct({
        name: newProduct.name,
        description: newProduct.description || undefined,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock) || 0,
        category: newProduct.category || undefined,
        sku: newProduct.sku || undefined,
        active: newProduct.active,
      });

      setSuccessModalContent({
        title: 'Produto Criado com Sucesso!',
        description: 'O produto foi adicionado ao seu catálogo.',
      });
      setShowSuccessModal(true);
      
      setIsNewProductOpen(false);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        stock: '0',
        category: '',
        sku: '',
        active: true,
      });
      
      await loadProducts();
    } catch (error) {
      toast({
        title: 'Erro ao criar produto',
        description: error instanceof Error ? error.message : 'Não foi possível criar o produto',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditProduct = async () => {
    if (!selectedProduct || !editProduct.name || !editProduct.price) {
      toast({
        title: 'Atenção',
        description: 'Preencha pelo menos o nome e o preço do produto',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      await api.updateProduct(selectedProduct.id, {
        name: editProduct.name,
        description: editProduct.description || undefined,
        price: parseFloat(editProduct.price),
        stock: parseInt(editProduct.stock) || 0,
        category: editProduct.category || undefined,
        sku: editProduct.sku || undefined,
        active: editProduct.active,
      });

      setSuccessModalContent({
        title: 'Produto Atualizado com Sucesso!',
        description: 'As alterações foram salvas.',
      });
      setShowSuccessModal(true);
      
      setIsEditProductOpen(false);
      setSelectedProduct(null);
      
      await loadProducts();
    } catch (error) {
      toast({
        title: 'Erro ao atualizar produto',
        description: error instanceof Error ? error.message : 'Não foi possível atualizar o produto',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setProductToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await api.deleteProduct(productToDelete);
      toast({
        title: 'Produto excluído',
        description: 'O produto foi removido com sucesso',
      });
      setIsDeleteConfirmOpen(false);
      setProductToDelete(null);
      await loadProducts();
    } catch (error) {
      toast({
        title: 'Erro ao excluir produto',
        description: error instanceof Error ? error.message : 'Não foi possível excluir o produto',
        variant: 'destructive',
      });
    }
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditProduct({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category || '',
      sku: product.sku || '',
      active: product.active,
    });
    setIsEditProductOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'out_of_stock': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'out_of_stock': return 'Sem Estoque';
      default: return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'out_of_stock': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPurchaseStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'processing': return 'Processando';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getPurchaseStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const handleViewPurchaseHistory = async (product: Product) => {
    setSelectedProduct(product);
    setIsPurchaseHistoryOpen(true);
    await loadSalesHistory(product.id);
  };

  // Função para aplicar filtros e busca
  const applyFilters = (productsList: Product[], search: string, filterOptions: typeof filters) => {
    let filtered = [...productsList];

    // Aplicar busca
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.sku?.toLowerCase().includes(searchLower) ||
        p.category?.toLowerCase().includes(searchLower)
      );
    }

    // Aplicar filtro de categoria
    if (filterOptions.category && filterOptions.category !== 'all') {
      filtered = filtered.filter(p => p.category === filterOptions.category);
    }

    // Aplicar filtro de preço
    if (filterOptions.minPrice) {
      const minPrice = parseFloat(filterOptions.minPrice);
      filtered = filtered.filter(p => {
        const price = typeof p.price === 'string' ? parseFloat(p.price) : (typeof p.price === 'number' ? p.price : 0);
        return price >= minPrice;
      });
    }

    if (filterOptions.maxPrice) {
      const maxPrice = parseFloat(filterOptions.maxPrice);
      filtered = filtered.filter(p => {
        const price = typeof p.price === 'string' ? parseFloat(p.price) : (typeof p.price === 'number' ? p.price : 0);
        return price <= maxPrice;
      });
    }

    // Aplicar filtro de estoque
    if (filterOptions.stockFilter === 'with_stock') {
      filtered = filtered.filter(p => {
        const stock = typeof p.stock === 'string' ? parseInt(p.stock, 10) : (typeof p.stock === 'number' ? p.stock : 0);
        return stock > 0;
      });
    } else if (filterOptions.stockFilter === 'without_stock') {
      filtered = filtered.filter(p => {
        const stock = typeof p.stock === 'string' ? parseInt(p.stock, 10) : (typeof p.stock === 'number' ? p.stock : 0);
        return stock === 0;
      });
    }

    setProducts(filtered);
  };

  // Efeito para aplicar filtros quando mudarem
  useEffect(() => {
    applyFilters(allProducts, searchTerm, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filters.category, filters.minPrice, filters.maxPrice, filters.stockFilter]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      category: 'all',
      minPrice: '',
      maxPrice: '',
      stockFilter: 'all',
    });
    setSearchTerm('');
  };

  // Funções de exportação
  const exportToCSV = () => {
    const headers = ['Nome', 'Descrição', 'SKU', 'Categoria', 'Preço', 'Estoque', 'Status', 'Ativo'];
    const rows = products.map(p => [
      p.name,
      p.description || '',
      p.sku || '',
      p.category || '',
      typeof p.price === 'string' ? parseFloat(p.price) : p.price,
      typeof p.stock === 'string' ? parseInt(p.stock, 10) : p.stock,
      p.status || 'active',
      p.active ? 'Sim' : 'Não',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `produtos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToXLSX = async () => {
    try {
      // Criar conteúdo TSV (tab-separated) que Excel pode abrir
      const headers = ['Nome', 'Descrição', 'SKU', 'Categoria', 'Preço', 'Estoque', 'Status', 'Ativo'];
      const rows = products.map(p => [
        p.name,
        p.description || '',
        p.sku || '',
        p.category || '',
        typeof p.price === 'string' ? parseFloat(p.price) : p.price,
        typeof p.stock === 'string' ? parseInt(p.stock, 10) : p.stock,
        p.status || 'active',
        p.active ? 'Sim' : 'Não',
      ]);

      const tsvContent = [
        headers.join('\t'),
        ...rows.map(row => row.map(cell => String(cell)).join('\t'))
      ].join('\n');

      const blob = new Blob(['\ufeff' + tsvContent], { type: 'application/vnd.ms-excel' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `produtos_${new Date().toISOString().split('T')[0]}.xlsx`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      toast({
        title: 'Erro ao exportar',
        description: 'Não foi possível exportar para XLSX',
        variant: 'destructive',
      });
    }
  };

  const exportToPDF = () => {
    // Criar conteúdo HTML para PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Lista de Produtos</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>Lista de Produtos</h1>
          <p>Data de exportação: ${new Date().toLocaleDateString('pt-BR')}</p>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>SKU</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Status</th>
                <th>Ativo</th>
              </tr>
            </thead>
            <tbody>
              ${products.map(p => `
                <tr>
                  <td>${p.name}</td>
                  <td>${p.description || '-'}</td>
                  <td>${p.sku || '-'}</td>
                  <td>${p.category || '-'}</td>
                  <td>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(typeof p.price === 'string' ? parseFloat(p.price) : p.price)}</td>
                  <td>${typeof p.stock === 'string' ? parseInt(p.stock, 10) : p.stock}</td>
                  <td>${p.status === 'active' ? 'Ativo' : p.status === 'inactive' ? 'Inativo' : 'Sem Estoque'}</td>
                  <td>${p.active ? 'Sim' : 'Não'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Abrir em nova janela para impressão/PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleExport = async (format: 'pdf' | 'xlsx' | 'csv') => {
    if (products.length === 0) {
      toast({
        title: 'Atenção',
        description: 'Não há produtos para exportar',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsExporting(true);
      
      switch (format) {
        case 'csv':
          exportToCSV();
          break;
        case 'xlsx':
          await exportToXLSX();
          break;
        case 'pdf':
          exportToPDF();
          break;
      }

      toast({
        title: 'Exportação realizada',
        description: `Produtos exportados com sucesso em formato ${format.toUpperCase()}`,
      });
      
      setIsExportModalOpen(false);
    } catch (error) {
      toast({
        title: 'Erro ao exportar',
        description: error instanceof Error ? error.message : 'Não foi possível exportar os produtos',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const loadSalesHistory = async (productId: number) => {
    try {
      setIsLoadingSales(true);
      const sales = await api.getSalesByProduct(productId);
      setSalesHistory(sales);
    } catch (error) {
      console.error('Erro ao carregar histórico de vendas:', error);
      toast({
        title: 'Erro ao carregar histórico',
        description: error instanceof Error ? error.message : 'Não foi possível carregar o histórico de vendas',
        variant: 'destructive',
      });
      setSalesHistory([]);
    } finally {
      setIsLoadingSales(false);
    }
  };

  const loadIntegrations = async () => {
    try {
      setLoadingConnections(true);
      const [shopify, nuvemshop] = await Promise.all([
        api.getShopifyConnections().catch(() => []),
        api.getNuvemshopConnections().catch(() => []),
      ]);
      setShopifyConnections(shopify.filter((c: any) => c.isActive));
      setNuvemshopConnections(nuvemshop.filter((c: any) => c.isActive));
    } catch (error) {
      console.error('Erro ao carregar integrações:', error);
      toast({
        title: 'Erro ao carregar integrações',
        description: error instanceof Error ? error.message : 'Não foi possível carregar as integrações',
        variant: 'destructive',
      });
    } finally {
      setLoadingConnections(false);
    }
  };

  const handleSyncProducts = async () => {
    const hasSelection = selectedIntegrations.shopify.length > 0 || selectedIntegrations.nuvemshop.length > 0;
    
    if (!hasSelection) {
      toast({
        title: 'Atenção',
        description: 'Selecione pelo menos uma integração para sincronizar',
        variant: 'destructive',
      });
      return;
    }

    if (syncDirection === 'send' && products.length === 0) {
      toast({
        title: 'Atenção',
        description: 'Não há produtos para enviar',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSyncing(true);
      const syncPromises: Promise<any>[] = [];
      let productsToSync = 0;

      // ENVIAR produtos para as lojas
      if (syncDirection === 'send' || syncDirection === 'both') {
        // Sincronizar com Shopify
        for (const shop of selectedIntegrations.shopify) {
          for (const product of products) {
            productsToSync++;
            syncPromises.push(
              api.syncShopifyProduct(shop, {
                title: product.name,
                description: product.description || '',
                variants: [{
                  price: product.price.toString(),
                  sku: product.sku || '',
                  inventory_quantity: product.stock || 0,
                }],
              }).catch((error) => {
                console.error(`Erro ao sincronizar produto ${product.name} com Shopify ${shop}:`, error);
                return { error: true, product: product.name, integration: `Shopify: ${shop}` };
              })
            );
          }
        }

        // Sincronizar com Nuvemshop
        for (const storeId of selectedIntegrations.nuvemshop) {
          for (const product of products) {
            productsToSync++;
            syncPromises.push(
              api.syncNuvemshopProduct(storeId, {
                name: { pt: product.name },
                description: { pt: product.description || '' },
                variants: [{
                  price: product.price.toString(),
                  stock_management: true,
                  stock: product.stock || 0,
                  weight: '0.5',
                  sku: product.sku || '',
                }],
              }).catch((error) => {
                console.error(`Erro ao sincronizar produto ${product.name} com Nuvemshop ${storeId}:`, error);
                return { error: true, product: product.name, integration: `Nuvemshop: ${storeId}` };
              })
            );
          }
        }
      }

      // RECEBER produtos das lojas
      if (syncDirection === 'receive' || syncDirection === 'both') {
        // Buscar produtos da Shopify
        for (const shop of selectedIntegrations.shopify) {
          try {
            const response = await api.getShopifyProducts(shop, { limit: 250 });
            for (const shopifyProduct of response.products) {
              productsToSync++;
              // Buscar primeira variante
              const variant = shopifyProduct.variants?.[0] || {};
              syncPromises.push(
                api.createProduct({
                  name: shopifyProduct.title || 'Produto sem nome',
                  description: shopifyProduct.body_html || '',
                  price: parseFloat(variant.price || '0'),
                  stock: variant.inventory_quantity || 0,
                  sku: variant.sku || undefined,
                  category: shopifyProduct.product_type || undefined,
                  active: shopifyProduct.status === 'active',
                }).catch((error) => {
                  console.error(`Erro ao importar produto ${shopifyProduct.title} da Shopify:`, error);
                  return { error: true, product: shopifyProduct.title, integration: `Shopify: ${shop}` };
                })
              );
            }
          } catch (error) {
            console.error(`Erro ao buscar produtos da Shopify ${shop}:`, error);
          }
        }

        // Buscar produtos da Nuvemshop
        for (const storeId of selectedIntegrations.nuvemshop) {
          try {
            const response = await api.getNuvemshopProducts(storeId, { limit: 250 });
            for (const nuvemshopProduct of response.products) {
              productsToSync++;
              // Buscar primeira variante
              const variant = nuvemshopProduct.variants?.[0] || {};
              const name = typeof nuvemshopProduct.name === 'object' 
                ? (nuvemshopProduct.name.pt || nuvemshopProduct.name.en || nuvemshopProduct.name.es || 'Produto sem nome')
                : (nuvemshopProduct.name || 'Produto sem nome');
              const description = typeof nuvemshopProduct.description === 'object'
                ? (nuvemshopProduct.description?.pt || nuvemshopProduct.description?.en || nuvemshopProduct.description?.es || '')
                : (nuvemshopProduct.description || '');
              
              syncPromises.push(
                api.createProduct({
                  name: name,
                  description: description,
                  price: parseFloat(variant.price || '0'),
                  stock: variant.stock || 0,
                  sku: variant.sku || undefined,
                  active: true,
                }).catch((error) => {
                  console.error(`Erro ao importar produto ${name} da Nuvemshop:`, error);
                  return { error: true, product: name, integration: `Nuvemshop: ${storeId}` };
                })
              );
            }
          } catch (error) {
            console.error(`Erro ao buscar produtos da Nuvemshop ${storeId}:`, error);
          }
        }
      }

      const results = await Promise.all(syncPromises);
      const errors = results.filter(r => r?.error);
      const success = results.filter(r => !r?.error);

      if (errors.length > 0) {
        toast({
          title: 'Sincronização parcial',
          description: `${success.length} produto(s) processado(s), ${errors.length} erro(s)`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Sincronização concluída!',
          description: `${success.length} produto(s) processado(s) com sucesso`,
        });
      }

      // Recarregar produtos se recebeu da loja
      if (syncDirection === 'receive' || syncDirection === 'both') {
        await loadProducts();
      }

      setIsSyncModalOpen(false);
      setSelectedIntegrations({ shopify: [], nuvemshop: [] });
      setSyncDirection('both');
    } catch (error) {
      toast({
        title: 'Erro ao sincronizar',
        description: error instanceof Error ? error.message : 'Não foi possível sincronizar os produtos',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleShopifyConnection = (shop: string) => {
    setSelectedIntegrations(prev => ({
      ...prev,
      shopify: prev.shopify.includes(shop)
        ? prev.shopify.filter(s => s !== shop)
        : [...prev.shopify, shop],
    }));
  };

  const toggleNuvemshopConnection = (storeId: string) => {
    setSelectedIntegrations(prev => ({
      ...prev,
      nuvemshop: prev.nuvemshop.includes(storeId)
        ? prev.nuvemshop.filter(s => s !== storeId)
        : [...prev.nuvemshop, storeId],
    }));
  };

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const outOfStock = products.filter(p => p.status === 'out_of_stock').length;
  // Calcular valor total apenas dos produtos ativos (status 'active' e active === true)
  const activeProductsForValue = products.filter(p => {
    // Produto deve estar ativo E ter status 'active' (não inativo e não sem estoque)
    return p.active === true && p.status === 'active';
  });
  
  const totalValue = activeProductsForValue.reduce((acc, p) => {
    // Converter para número, tratando strings e valores decimais do MySQL
    const price = p.price ? (typeof p.price === 'string' ? parseFloat(p.price) : (typeof p.price === 'number' ? p.price : 0)) : 0;
    const stock = p.stock ? (typeof p.stock === 'string' ? parseInt(p.stock, 10) : (typeof p.stock === 'number' ? p.stock : 0)) : 0;
    const productValue = price * stock;
    return acc + productValue;
  }, 0);
  const totalSales = products.reduce((acc, p) => {
    const sales = typeof p.sales === 'number' ? p.sales : 0;
    return acc + sales;
  }, 0);

  // Obter categorias únicas dos produtos
  const categories = Array.from(new Set(allProducts.map(p => p.category).filter(Boolean)));

  const actions = (
    <>
      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Filtros</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 text-xs"
              >
                Limpar
              </Button>
            </div>

            {/* Filtro de Categoria */}
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange({ category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Preço */}
            <div className="space-y-2">
              <Label>Faixa de Preço</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="minPrice" className="text-xs text-muted-foreground">Mínimo</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="R$ 0,00"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange({ minPrice: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="maxPrice" className="text-xs text-muted-foreground">Máximo</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="R$ 0,00"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange({ maxPrice: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Filtro de Estoque */}
            <div className="space-y-2">
              <Label>Estoque</Label>
              <Select
                value={filters.stockFilter}
                onValueChange={(value) => handleFilterChange({ stockFilter: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="with_stock">Com estoque</SelectItem>
                  <SelectItem value="without_stock">Sem estoque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Button variant="outline" onClick={() => setIsSyncModalOpen(true)}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Sincronizar Produtos
      </Button>
      <HeaderActions.Export onClick={() => setIsExportModalOpen(true)} />
      <HeaderActions.Add onClick={() => setIsNewProductOpen(true)}>
        Novo Produto
      </HeaderActions.Add>
    </>
  );

  return (
    <Layout 
      title="Produtos" 
      subtitle="Gerencie seu catálogo de produtos"
      actions={actions}
      showSearch
      onSearchChange={handleSearchChange}
      searchValue={searchTerm}
    >
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Produtos</p>
                <p className="text-2xl font-bold text-foreground">{totalProducts}</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Produtos Ativos</p>
                <p className="text-2xl font-bold text-foreground">{activeProducts}</p>
              </div>
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sem Estoque</p>
                <p className="text-2xl font-bold text-foreground">{outOfStock}</p>
              </div>
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor em Estoque</p>
                <p className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(totalValue)}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Vendas</p>
                <p className="text-2xl font-bold text-foreground">{totalSales}</p>
              </div>
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Products Table */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Produto</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">SKU</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Categoria</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Preço</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Estoque</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Carregando produtos...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Nenhum produto cadastrado. Clique em "Novo Produto" para começar.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    return (
                      <tr key={product.id} className="border-b border-border last:border-0">
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                              <Package className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {product.description || '-'}
                              </div>
                            </div>
                          </div>
                        </td>
                      <td className="py-4 px-2">
                        <span className="text-sm font-mono">{product.sku || '-'}</span>
                      </td>
                      <td className="py-4 px-2">
                        {product.category ? (
                          <Badge variant="outline">{product.category}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-4 px-2 text-right font-medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(product.price)}
                      </td>
                      <td className="py-4 px-2 text-right">
                        <span className={`font-medium ${product.stock < 20 ? 'text-red-600' : ''}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <Badge variant={getStatusVariant(product.status || 'active')}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(product.status || 'active')}`}></div>
                          {getStatusLabel(product.status || 'active')}
                        </Badge>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Ações do Produto</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-2">
                              <Button
                                variant="ghost"
                                className="justify-start"
                                onClick={() => handleViewPurchaseHistory(product)}
                              >
                                <History className="w-4 h-4 mr-2" />
                                Ver Histórico de Compras
                              </Button>
                              <Button
                                variant="ghost"
                                className="justify-start"
                                onClick={() => handleOpenEdit(product)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar Produto
                              </Button>
                              <Button
                                variant="ghost"
                                className="justify-start text-destructive"
                                onClick={() => handleDeleteClick(product.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir Produto
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* New Product Modal */}
      <Dialog open={isNewProductOpen} onOpenChange={setIsNewProductOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Produto</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="product-name">Nome do Produto *</Label>
                <Input
                  id="product-name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Ex: Camiseta Premium"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="product-sku">SKU</Label>
                <Input
                  id="product-sku"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  placeholder="Ex: CAM-001 (opcional)"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="product-description">Descrição</Label>
              <Textarea
                id="product-description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                placeholder="Descreva o produto..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="product-category">Categoria</Label>
              <Select value={newProduct.category} onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vestuário">Vestuário</SelectItem>
                  <SelectItem value="Calçados">Calçados</SelectItem>
                  <SelectItem value="Acessórios">Acessórios</SelectItem>
                  <SelectItem value="Eletrônicos">Eletrônicos</SelectItem>
                  <SelectItem value="Casa">Casa</SelectItem>
                  <SelectItem value="Esporte">Esporte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="product-price">Preço de Venda (R$) *</Label>
                <Input
                  id="product-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="product-stock">Estoque Inicial</Label>
                <Input
                  id="product-stock"
                  type="number"
                  min="0"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="new-product-active"
                checked={newProduct.active}
                onCheckedChange={(checked) => setNewProduct({ ...newProduct, active: checked })}
              />
              <Label htmlFor="new-product-active" className="cursor-pointer">
                Produto ativo
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setIsNewProductOpen(false);
              setNewProduct({
                name: '',
                description: '',
                price: '',
                stock: '0',
                category: '',
                sku: '',
                active: true,
              });
            }}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateProduct}
              disabled={!newProduct.name || !newProduct.price || isSaving}
            >
              {isSaving ? 'Criando...' : 'Criar Produto'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase History Modal */}
      <Dialog open={isPurchaseHistoryOpen} onOpenChange={setIsPurchaseHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Compras - {selectedProduct?.name}</DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <>
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="w-16 h-16 bg-background rounded flex items-center justify-center flex-shrink-0">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-sm">
                      <span className="text-muted-foreground">SKU:</span> <span className="font-mono font-medium">{selectedProduct.sku}</span>
                    </span>
                    <span className="text-sm">
                      <span className="text-muted-foreground">Vendas Totais:</span> <span className="font-medium">{salesHistory.length}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Compras Realizadas
                </h4>

                {isLoadingSales ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                    <p>Carregando histórico de vendas...</p>
                  </div>
                ) : salesHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">Cliente</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">E-mail</th>
                          <th className="text-right py-3 px-2 font-medium text-muted-foreground">Qtd</th>
                          <th className="text-right py-3 px-2 font-medium text-muted-foreground">Preço Unit.</th>
                          <th className="text-right py-3 px-2 font-medium text-muted-foreground">Valor Total</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">Data</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesHistory.map((sale) => (
                          <tr key={sale.id} className="border-b border-border last:border-0">
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-primary" />
                                </div>
                                <span className="font-medium">{sale.customerName || 'Cliente não informado'}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-sm text-muted-foreground">
                              {sale.customerEmail || '-'}
                            </td>
                            <td className="py-3 px-2 text-right font-medium">
                              {sale.quantity}
                            </td>
                            <td className="py-3 px-2 text-right text-sm text-muted-foreground">
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              }).format(Number(sale.unitPrice))}
                            </td>
                            <td className="py-3 px-2 text-right font-medium">
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              }).format(Number(sale.totalValue))}
                            </td>
                            <td className="py-3 px-2 text-sm">
                              {new Date(sale.createdAt).toLocaleString('pt-BR')}
                            </td>
                            <td className="py-3 px-2">
                              <Badge variant={getPurchaseStatusVariant(sale.status)}>
                                {getPurchaseStatusLabel(sale.status)}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma venda registrada para este produto</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsPurchaseHistoryOpen(false)}>
                  Fechar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={isEditProductOpen} onOpenChange={(open) => {
        setIsEditProductOpen(open);
        if (!open) {
          setSelectedProduct(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-product-name">Nome do Produto *</Label>
                <Input
                  id="edit-product-name"
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  placeholder="Ex: Camiseta Premium"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-product-sku">SKU</Label>
                <Input
                  id="edit-product-sku"
                  value={editProduct.sku}
                  onChange={(e) => setEditProduct({ ...editProduct, sku: e.target.value })}
                  placeholder="Ex: CAM-001 (opcional)"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-product-description">Descrição</Label>
              <Textarea
                id="edit-product-description"
                value={editProduct.description}
                onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                placeholder="Descreva o produto..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-product-category">Categoria</Label>
              <Select value={editProduct.category} onValueChange={(value) => setEditProduct({ ...editProduct, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vestuário">Vestuário</SelectItem>
                  <SelectItem value="Calçados">Calçados</SelectItem>
                  <SelectItem value="Acessórios">Acessórios</SelectItem>
                  <SelectItem value="Eletrônicos">Eletrônicos</SelectItem>
                  <SelectItem value="Casa">Casa</SelectItem>
                  <SelectItem value="Esporte">Esporte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-product-price">Preço de Venda (R$) *</Label>
                <Input
                  id="edit-product-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editProduct.price}
                  onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-product-stock">Estoque</Label>
                <Input
                  id="edit-product-stock"
                  type="number"
                  min="0"
                  value={editProduct.stock}
                  onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-product-active"
                checked={editProduct.active}
                onCheckedChange={(checked) => setEditProduct({ ...editProduct, active: checked })}
              />
              <Label htmlFor="edit-product-active" className="cursor-pointer">
                Produto ativo
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setIsEditProductOpen(false);
              setSelectedProduct(null);
            }}>
              Cancelar
            </Button>
            <Button
              onClick={handleEditProduct}
              disabled={!editProduct.name || !editProduct.price || isSaving}
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteConfirmOpen(false);
                setProductToDelete(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
            >
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Exportar Produtos</DialogTitle>
            <DialogDescription>
              Selecione o formato para exportar a lista de produtos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3"
              onClick={() => handleExport('csv')}
              disabled={isExporting || products.length === 0}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 dark:text-green-400 font-bold text-sm">CSV</span>
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium">CSV</div>
                  <div className="text-xs text-muted-foreground">Arquivo de texto separado por vírgulas</div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3"
              onClick={() => handleExport('xlsx')}
              disabled={isExporting || products.length === 0}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 dark:text-green-400 font-bold text-sm">XLSX</span>
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium">Excel (XLSX)</div>
                  <div className="text-xs text-muted-foreground">Planilha do Microsoft Excel</div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3"
              onClick={() => handleExport('pdf')}
              disabled={isExporting || products.length === 0}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 dark:text-red-400 font-bold text-sm">PDF</span>
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium">PDF</div>
                  <div className="text-xs text-muted-foreground">Documento para impressão</div>
                </div>
              </div>
            </Button>
          </div>
          {products.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              Nenhum produto para exportar
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsExportModalOpen(false)}
              disabled={isExporting}
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sync Products Modal */}
      <Dialog open={isSyncModalOpen} onOpenChange={setIsSyncModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Sincronizar Produtos
            </DialogTitle>
            <DialogDescription>
              Selecione as integrações para sincronizar seus produtos. Apenas integrações conectadas aparecem aqui.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Direção da Sincronização */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Direção da Sincronização</Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSyncDirection('send')}
                  className={`p-4 border-2 rounded-lg transition-colors text-left ${
                    syncDirection === 'send'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium mb-1">Enviar</div>
                  <div className="text-xs text-muted-foreground">
                    Enviar produtos do sistema para as lojas
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSyncDirection('receive')}
                  className={`p-4 border-2 rounded-lg transition-colors text-left ${
                    syncDirection === 'receive'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium mb-1">Receber</div>
                  <div className="text-xs text-muted-foreground">
                    Importar produtos das lojas para o sistema
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSyncDirection('both')}
                  className={`p-4 border-2 rounded-lg transition-colors text-left ${
                    syncDirection === 'both'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium mb-1">Ambos</div>
                  <div className="text-xs text-muted-foreground">
                    Enviar e receber produtos
                  </div>
                </button>
              </div>
            </div>

            {loadingConnections ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                <p>Carregando integrações...</p>
              </div>
            ) : (
              <>
                {/* Shopify Connections */}
                {shopifyConnections.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 text-white" />
                      </div>
                      Shopify
                    </h4>
                    <div className="space-y-2 pl-10">
                      {shopifyConnections.map((connection) => (
                        <div
                          key={connection.id}
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <Checkbox
                            id={`shopify-${connection.id}`}
                            checked={selectedIntegrations.shopify.includes(connection.shop)}
                            onCheckedChange={() => toggleShopifyConnection(connection.shop)}
                          />
                          <Label
                            htmlFor={`shopify-${connection.id}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium">{connection.shop}</div>
                            <div className="text-xs text-muted-foreground">
                              {connection.isActive ? 'Conectado' : 'Desconectado'}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nuvemshop Connections */}
                {nuvemshopConnections.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 text-white" />
                      </div>
                      Nuvemshop
                    </h4>
                    <div className="space-y-2 pl-10">
                      {nuvemshopConnections.map((connection) => (
                        <div
                          key={connection.id}
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <Checkbox
                            id={`nuvemshop-${connection.id}`}
                            checked={selectedIntegrations.nuvemshop.includes(connection.storeId)}
                            onCheckedChange={() => toggleNuvemshopConnection(connection.storeId)}
                          />
                          <Label
                            htmlFor={`nuvemshop-${connection.id}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium">Loja ID: {connection.storeId}</div>
                            <div className="text-xs text-muted-foreground">
                              {connection.isActive ? 'Conectado' : 'Desconectado'}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Connections Message */}
                {shopifyConnections.length === 0 && nuvemshopConnections.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="font-medium mb-1">Nenhuma integração conectada</p>
                    <p className="text-sm">
                      Conecte suas integrações em{' '}
                      <a href="/integracoes" className="text-primary hover:underline">
                        Integrações
                      </a>{' '}
                      para sincronizar produtos
                    </p>
                  </div>
                )}

                {/* Selected Count */}
                {(selectedIntegrations.shopify.length > 0 || selectedIntegrations.nuvemshop.length > 0) && (
                  <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                    <p className="text-sm font-medium mb-1">
                      {selectedIntegrations.shopify.length + selectedIntegrations.nuvemshop.length} integração(ões) selecionada(s)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {syncDirection === 'send' && `${products.length} produto(s) serão enviados`}
                      {syncDirection === 'receive' && `Produtos serão importados das lojas`}
                      {syncDirection === 'both' && `${products.length} produto(s) serão sincronizados (enviados e recebidos)`}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsSyncModalOpen(false);
                setSelectedIntegrations({ shopify: [], nuvemshop: [] });
              }}
              disabled={isSyncing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSyncProducts}
              disabled={
                isSyncing ||
                loadingConnections ||
                (selectedIntegrations.shopify.length === 0 && selectedIntegrations.nuvemshop.length === 0) ||
                (syncDirection !== 'receive' && products.length === 0)
              }
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Sincronizar
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <SuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        title={successModalContent.title}
        description={successModalContent.description}
      />
    </Layout>
  );
}
