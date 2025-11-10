import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { HeaderActions } from '@/components/layout/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  image?: string;
  sku: string;
  sales: number;
  createdAt: string;
}

export default function Produtos() {
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    cost: '',
    stock: '',
    category: '',
    sku: '',
    image: '',
  });

  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: 'Camiseta Premium',
      description: 'Camiseta 100% algodão com estampa exclusiva',
      price: 89.90,
      cost: 35.00,
      stock: 150,
      category: 'Vestuário',
      status: 'active',
      sku: 'CAM-001',
      sales: 342,
      createdAt: '2024-01-15',
    },
    {
      id: 2,
      name: 'Tênis Esportivo',
      description: 'Tênis confortável para corrida e caminhada',
      price: 299.90,
      cost: 150.00,
      stock: 45,
      category: 'Calçados',
      status: 'active',
      sku: 'TEN-002',
      sales: 128,
      createdAt: '2024-02-10',
    },
    {
      id: 3,
      name: 'Relógio Digital',
      description: 'Relógio smartwatch com múltiplas funções',
      price: 599.90,
      cost: 280.00,
      stock: 0,
      category: 'Eletrônicos',
      status: 'out_of_stock',
      sku: 'REL-003',
      sales: 89,
      createdAt: '2024-03-05',
    },
    {
      id: 4,
      name: 'Mochila Executiva',
      description: 'Mochila com compartimento para notebook',
      price: 179.90,
      cost: 80.00,
      stock: 12,
      category: 'Acessórios',
      status: 'active',
      sku: 'MOC-004',
      sales: 256,
      createdAt: '2024-01-20',
    },
  ]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setNewProduct({ ...newProduct, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateProduct = () => {
    const product: Product = {
      id: products.length + 1,
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      cost: parseFloat(newProduct.cost),
      stock: parseInt(newProduct.stock),
      category: newProduct.category,
      status: 'active',
      sku: newProduct.sku,
      image: newProduct.image,
      sales: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setProducts([...products, product]);
    setIsNewProductOpen(false);
    setNewProduct({
      name: '',
      description: '',
      price: '',
      cost: '',
      stock: '',
      category: '',
      sku: '',
      image: '',
    });
    setImagePreview('');
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
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

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const outOfStock = products.filter(p => p.status === 'out_of_stock').length;
  const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const totalSales = products.reduce((acc, p) => acc + p.sales, 0);

  const actions = (
    <>
      <HeaderActions.Filter onClick={() => console.log('Filter clicked')} />
      <HeaderActions.Export onClick={() => console.log('Export clicked')} />
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
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Custo</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Margem</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Estoque</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Vendas</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const margin = ((product.price - product.cost) / product.price * 100).toFixed(1);
                  return (
                    <tr key={product.id} className="border-b border-border last:border-0">
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded" />
                            ) : (
                              <Package className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className="text-sm font-mono">{product.sku}</span>
                      </td>
                      <td className="py-4 px-2">
                        <Badge variant="outline">{product.category}</Badge>
                      </td>
                      <td className="py-4 px-2 text-right font-medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(product.price)}
                      </td>
                      <td className="py-4 px-2 text-right text-muted-foreground">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(product.cost)}
                      </td>
                      <td className="py-4 px-2 text-right">
                        <span className={`font-medium ${parseFloat(margin) > 30 ? 'text-green-600' : 'text-orange-600'}`}>
                          {margin}%
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <span className={`font-medium ${product.stock < 20 ? 'text-red-600' : ''}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right font-medium">
                        {product.sales}
                      </td>
                      <td className="py-4 px-2">
                        <Badge variant={getStatusVariant(product.status)}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(product.status)}`}></div>
                          {getStatusLabel(product.status)}
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
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setIsEditProductOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar Produto
                              </Button>
                              <Button
                                variant="ghost"
                                className="justify-start text-destructive"
                                onClick={() => handleDeleteProduct(product.id)}
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
                })}
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
            <div className="grid gap-2">
              <Label htmlFor="product-image">Imagem do Produto</Label>
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="product-image-upload"
                  />
                  <label htmlFor="product-image-upload">
                    <Button type="button" variant="outline" className="w-full" asChild>
                      <div className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload de Imagem
                      </div>
                    </Button>
                  </label>
                </div>
                {imagePreview && (
                  <div className="relative w-32 h-32 border rounded-md">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-md" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 bg-background"
                      onClick={() => {
                        setImagePreview('');
                        setNewProduct({ ...newProduct, image: '' });
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

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
                <Label htmlFor="product-sku">SKU *</Label>
                <Input
                  id="product-sku"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  placeholder="Ex: CAM-001"
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
              <Label htmlFor="product-category">Categoria *</Label>
              <Select value={newProduct.category} onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
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

            <div className="grid grid-cols-3 gap-4">
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
                <Label htmlFor="product-cost">Custo (R$) *</Label>
                <Input
                  id="product-cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newProduct.cost}
                  onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="product-stock">Estoque Inicial *</Label>
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

            {newProduct.price && newProduct.cost && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">
                  <span className="text-muted-foreground">Margem de Lucro: </span>
                  <span className="font-medium">
                    {((parseFloat(newProduct.price) - parseFloat(newProduct.cost)) / parseFloat(newProduct.price) * 100).toFixed(1)}%
                  </span>
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setIsNewProductOpen(false);
              setNewProduct({
                name: '',
                description: '',
                price: '',
                cost: '',
                stock: '',
                category: '',
                sku: '',
                image: '',
              });
              setImagePreview('');
            }}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateProduct}
              disabled={!newProduct.name || !newProduct.sku || !newProduct.price || !newProduct.cost || !newProduct.stock || !newProduct.category}
            >
              Criar Produto
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
