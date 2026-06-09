
import React from 'react';
import './AdminEmailBuilder.css';
import { initEmailBuilder } from './emailBuilderApp';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default function AdminEmailBuilder() {
  const canvasRef = (node: HTMLDivElement | null) => {
    if (node) {
      initEmailBuilder();
    }
  };

  return (
    <AdminLayout title="E-mail Builder" subtitle="Crie templates responsivos de e-mail arrastando e soltando.">
      <div className="email-builder-wrapper" style={{ height: 'calc(100vh - 100px)', width: '100%', position: 'relative' }}>
        <main className="app-body">

    
    {/* Center Canvas Area */}
    <section className="canvas-container" id="canvas-container">
      <div className="header-actions floating-actions">
        {/* Undo / Redo */}
        <div className="btn-group">
          <button id="btn-undo" className="btn btn-icon" title="Desfazer">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"/>
            </svg>
          </button>
          <button id="btn-redo" className="btn btn-icon" title="Refazer">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"/>
            </svg>
          </button>
        </div>

        {/* Responsive View Toggle */}
        <div className="btn-group">
          <button id="btn-view-desktop" className="btn btn-icon active" title="Visualização Desktop">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </button>
          <button id="btn-view-tablet" className="btn btn-icon" title="Visualização Tablet">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
          </button>
          <button id="btn-view-mobile" className="btn btn-icon" title="Visualização Mobile">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
          </button>
        </div>

        {/* Actions */}
        <button id="btn-clear" className="btn" style={{"color":"var(--accent-danger)"}}>Limpar</button>
        <button id="btn-export" className="btn btn-primary">Exportar HTML</button>
      </div>

      <div id="email-canvas" ref={canvasRef}>
        <div className="canvas-empty-state">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h3>Seu E-mail Está Vazio</h3>
          <p>Arraste uma Linha (Row) da aba "Rows" na direita para começar a estruturar seu e-mail.</p>
        </div>
      </div>
    </section>

    {/* Unified Sidebar on the Right */}
    <aside className="sidebar" id="main-sidebar">
      {/* Normal Tabs Nav */}
      <nav className="tabs-nav" id="sidebar-tabs-nav">
        <button className="tab-btn active" data-tab="tab-content">Content</button>
        <button className="tab-btn" data-tab="tab-rows">Rows</button>
        <button className="tab-btn" data-tab="tab-settings">Settings</button>
      </nav>

      <div className="tabs-content" id="sidebar-tabs-content">
        {/* Content Panel */}
        <div id="tab-content" className="tab-panel active">
          <div className="blocks-grid">
            <div className="block-item" draggable="true" data-type="title">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h7"/>
              </svg>
              <span>Title</span>
            </div>
            <div className="block-item" draggable="true" data-type="paragraph">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
              <span>Paragraph</span>
            </div>
            <div className="block-item" draggable="true" data-type="list">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16M4 6h.01M4 12h.01M4 18h.01"/>
              </svg>
              <span>List</span>
            </div>
            
            <div className="block-item" draggable="true" data-type="image">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span>Foto / Imagem</span>
            </div>

            <div className="block-item" draggable="true" data-type="button">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
              </svg>
              <span>Button</span>
            </div>
            <div className="block-item" draggable="true" data-type="table">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              <span>Table</span>
            </div>
            <div className="block-item" draggable="true" data-type="divider">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4"/>
              </svg>
              <span>Divider</span>
            </div>
            <div className="block-item" draggable="true" data-type="spacer">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/>
              </svg>
              <span>Spacer</span>
            </div>
            <div className="block-item" draggable="true" data-type="social">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 10.742l8.996-4.498m-8.996 9.012l8.996 4.498M21 12a3 3 0 11-6 0 3 3 0 016 0zm-12 6a3 3 0 11-6 0 3 3 0 016 0zm0-12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span>Social</span>
            </div>
            <div className="block-item" draggable="true" data-type="html">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
              </svg>
              <span>HTML</span>
            </div>
            <div className="block-item" draggable="true" data-type="video">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              <span>Video</span>
            </div>
            <div className="block-item" draggable="true" data-type="icons">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z"/>
              </svg>
              <span>Icons</span>
            </div>
            <div className="block-item" draggable="true" data-type="menu">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
              <span>Menu</span>
            </div>
            <div className="block-item" draggable="true" data-type="sticker">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Sticker</span>
            </div>
            <div className="block-item" draggable="true" data-type="gif">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4"/>
              </svg>
              <span>GIF</span>
            </div>
          </div>
        </div>

        {/* Rows Panel with new pre-made layout templates */}
        <div id="tab-rows" className="tab-panel">
          <div className="rows-list">
            {/* Pre-made Complex Templates first */}
            <div className="row-item" draggable="true" data-cols="header">
              <div className="row-layout-preview" style={{"background":"#1e1e24","display":"flex","alignItems":"center","justifyContent":"space-between","padding":"0 8px","borderRadius":"var(--radius-sm)"}}>
                <span style={{"color":"#635bff","fontWeight":"bold","fontSize":"10px"}}>★ LOGO</span>
                <span style={{"color":"#aaa","fontSize":"9px"}}>Menu Links</span>
              </div>
              <div className="row-item-label">Header Template</div>
            </div>

            <div className="row-item" draggable="true" data-cols="hero">
              <div className="row-layout-preview" style={{"background":"#e2e2ec","display":"flex","flexDirection":"column","justifyContent":"center","alignItems":"center","borderRadius":"var(--radius-sm)","gap":"3px"}}>
                <div style={{"background":"#aaa","width":"40%","height":"4px"}}></div>
                <div style={{"background":"#888","width":"70%","height":"3px"}}></div>
                <div style={{"background":"#635bff","width":"30%","height":"6px","borderRadius":"2px"}}></div>
              </div>
              <div className="row-item-label">Hero Banner Template</div>
            </div>

            <div className="row-item" draggable="true" data-cols="footer">
              <div className="row-layout-preview" style={{"background":"#0f0f13","display":"flex","flexDirection":"column","justifyContent":"center","alignItems":"center","borderRadius":"var(--radius-sm)","gap":"4px"}}>
                <div style={{"display":"flex","gap":"4px"}}><span style={{"color":"#635bff","fontSize":"8px"}}>●</span><span style={{"color":"#635bff","fontSize":"8px"}}>●</span><span style={{"color":"#635bff","fontSize":"8px"}}>●</span></div>
                <div style={{"background":"#444","width":"50%","height":"2px"}}></div>
              </div>
              <div className="row-item-label">Footer Template</div>
            </div>

            {/* Standard empty grids */}
            <hr style={{"border":"none","borderTop":"1px solid var(--border-color)","margin":"10px 0"}} />

            <div className="row-item" draggable="true" data-cols="1">
              <div className="row-layout-preview">
                <div className="row-col-preview"></div>
              </div>
              <div className="row-item-label">1 Coluna Vazia</div>
            </div>
            <div className="row-item" draggable="true" data-cols="2">
              <div className="row-layout-preview">
                <div className="row-col-preview"></div>
                <div className="row-col-preview"></div>
              </div>
              <div className="row-item-label">2 Colunas Vazias</div>
            </div>
            <div className="row-item" draggable="true" data-cols="3">
              <div className="row-layout-preview">
                <div className="row-col-preview"></div>
                <div className="row-col-preview"></div>
                <div className="row-col-preview"></div>
              </div>
              <div className="row-item-label">3 Colunas Vazias</div>
            </div>
            <div className="row-item" draggable="true" data-cols="4">
              <div className="row-layout-preview">
                <div className="row-col-preview"></div>
                <div className="row-col-preview"></div>
                <div className="row-col-preview"></div>
                <div className="row-col-preview"></div>
              </div>
              <div className="row-item-label">4 Colunas Vazias</div>
            </div>
            <div className="row-item" draggable="true" data-cols="30-70">
              <div className="row-layout-preview">
                <div className="row-col-preview" style={{"flex":"3"}}></div>
                <div className="row-col-preview" style={{"flex":"7"}}></div>
              </div>
              <div className="row-item-label">Layout 30% / 70%</div>
            </div>
            <div className="row-item" draggable="true" data-cols="70-30">
              <div className="row-layout-preview">
                <div className="row-col-preview" style={{"flex":"7"}}></div>
                <div className="row-col-preview" style={{"flex":"3"}}></div>
              </div>
              <div className="row-item-label">Layout 70% / 30%</div>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <div id="tab-settings" className="tab-panel">
          <div className="settings-group">
            <div className="settings-group-title">Layout Geral</div>
            <div className="form-group">
              <label>Largura do E-mail</label>
              <div className="slider-container">
                <input type="range" id="setting-canvas-width" min="480" max="800" value="600" step="10" />
                <span className="slider-val" id="val-canvas-width">600px</span>
              </div>
            </div>
            <div className="form-group">
              <label>Alinhamento</label>
              <div className="align-toggle-group">
                <button className="align-btn active" id="setting-align-center">Centro</button>
                <button className="align-btn" id="setting-align-left">Esquerda</button>
              </div>
            </div>
          </div>

          <div className="settings-group">
            <div className="settings-group-title">Cores & Estilos</div>
            <div className="form-group">
              <label>Cor de Fundo da Página</label>
              <div className="color-input-wrapper">
                <input type="color" id="setting-bg-page" className="color-picker" value="#f4f4f7" />
                <input type="text" id="setting-bg-page-text" className="form-input" value="#f4f4f7" />
              </div>
            </div>
            <div className="form-group">
              <label>Cor de Fundo do E-mail</label>
              <div className="color-input-wrapper">
                <input type="color" id="setting-bg-email" className="color-picker" value="#ffffff" />
                <input type="text" id="setting-bg-email-text" className="form-input" value="#ffffff" />
              </div>
            </div>
            <div className="form-group">
              <label>Fonte Padrão</label>
              <select id="setting-font-family" className="form-input">
                <option value="Arial, sans-serif">Arial</option>
                <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
                <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Courier New', Courier, monospace">Courier New</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Overlay Panel */}
      <div className="properties-panel" id="properties-panel">
        <div className="properties-header">
          <button className="btn btn-icon" id="btn-back-to-tabs" title="Voltar para Blocos">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
          </button>
          <h3>Propriedades</h3>
        </div>
        <div className="properties-body" id="properties-content">
          {/* Populated by JS */}
        </div>
      </div>
    </aside>

  
</main>

  <div className="modal-overlay" id="export-modal">
    <div className="modal-content">
      <div className="modal-header">
        <h3>Código HTML Pronto</h3>
        <button className="btn btn-icon" id="btn-close-modal">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div className="modal-body">
        <p style={{"marginBottom":"12px","fontSize":"0.875rem","color":"var(--text-muted)"}}>
          Copie o código HTML responsivo gerado para colar em sua ferramenta de e-mail marketing.
        </p>
        <textarea className="code-textarea" id="export-code" readOnly></textarea>
      </div>
      <div className="modal-footer">
        <button className="btn" id="btn-copy-code">Copiar Código</button>
        <button className="btn btn-primary" id="btn-download-code">Baixar HTML</button>
      </div>
    </div>
  </div>

  {/* Image Layout Modal */}
  <div className="modal-overlay" id="image-layout-modal">
    <div className="modal-content" style={{"maxWidth":"600px"}}>
      <div className="modal-header">
        <h3>Escolha o Layout da Imagem</h3>
        <button className="btn btn-icon btn-close-image-modal">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div className="modal-body">
        <p style={{"marginBottom":"20px","fontSize":"0.875rem","color":"var(--text-muted)"}}>
          Selecione a quantidade de fotos e o formato de exibição desejado:
        </p>
        <div className="layout-picker-grid" style={{"gridTemplateColumns":"repeat(3, 1fr)","gap":"15px"}}>
          <div className="layout-modal-card" data-layout="1" style={{"border":"1px solid var(--border-color)","borderRadius":"var(--radius-md)","padding":"15px","cursor":"pointer","textAlign":"center","transition":"var(--transition)"}}>
            <div style={{"background":"#eef0f4","borderRadius":"4px","height":"60px","marginBottom":"10px","display":"flex","alignItems":"center","justifyContent":"center","color":"#aaa","fontWeight":"bold"}}>1 FOTO</div>
            <strong style={{"fontSize":"13px","color":"var(--text-main)"}}>Layout Único</strong>
          </div>
          <div className="layout-modal-card" data-layout="3" style={{"border":"1px solid var(--border-color)","borderRadius":"var(--radius-md)","padding":"15px","cursor":"pointer","textAlign":"center","transition":"var(--transition)"}}>
            <div style={{"background":"#eef0f4","borderRadius":"4px","height":"60px","marginBottom":"10px","display":"flex","gap":"4px","padding":"4px"}}>
              <div style={{"background":"#ccd0d8","flex":"1","borderRadius":"2px"}}></div>
              <div style={{"background":"#ccd0d8","flex":"1","borderRadius":"2px"}}></div>
              <div style={{"background":"#ccd0d8","flex":"1","borderRadius":"2px"}}></div>
            </div>
            <strong style={{"fontSize":"13px","color":"var(--text-main)"}}>Grid 3 Fotos</strong>
          </div>
          <div className="layout-modal-card" data-layout="6" style={{"border":"1px solid var(--border-color)","borderRadius":"var(--radius-md)","padding":"15px","cursor":"pointer","textAlign":"center","transition":"var(--transition)"}}>
            <div style={{"background":"#eef0f4","borderRadius":"4px","height":"60px","marginBottom":"10px","display":"flex","flexDirection":"column","gap":"4px","padding":"4px"}}>
              <div style={{"display":"flex","gap":"4px","flex":"1"}}>
                <div style={{"background":"#ccd0d8","flex":"1","borderRadius":"2px"}}></div>
                <div style={{"background":"#ccd0d8","flex":"1","borderRadius":"2px"}}></div>
                <div style={{"background":"#ccd0d8","flex":"1","borderRadius":"2px"}}></div>
              </div>
              <div style={{"display":"flex","gap":"4px","flex":"1"}}>
                <div style={{"background":"#ccd0d8","flex":"1","borderRadius":"2px"}}></div>
                <div style={{"background":"#ccd0d8","flex":"1","borderRadius":"2px"}}></div>
                <div style={{"background":"#ccd0d8","flex":"1","borderRadius":"2px"}}></div>
              </div>
            </div>
            <strong style={{"fontSize":"13px","color":"var(--text-main)"}}>Grid 6 Fotos</strong>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Icon Library Modal */}
  <div className="modal-overlay" id="icon-library-modal">
    <div className="modal-content" style={{"maxWidth":"700px","height":"80vh"}}>
      <div className="modal-header">
        <h3>Biblioteca de Ícones</h3>
        <button className="btn btn-icon btn-close-icon-modal">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div className="modal-body" style={{"display":"flex","flexDirection":"column","gap":"15px","overflow":"hidden"}}>
        <div style={{"display":"flex","gap":"10px"}}>
          <input type="text" id="icon-search-input" className="form-input" placeholder="Buscar ícones por nome..." style={{"flex":"1"}} />
          <select id="icon-category-select" className="form-input" style={{"width":"180px"}}>
            <option value="all">Todas Categorias</option>
            <option value="social">Social</option>
            <option value="navigation">Navegação</option>
            <option value="communication">Comunicação</option>
            <option value="business">Negócios</option>
            <option value="ecommerce">E-commerce</option>
            <option value="interface">Interface</option>
          </select>
        </div>
        <div id="icon-library-grid" style={{"flex":"1","overflowY":"auto","display":"grid","gridTemplateColumns":"repeat(5, 1fr)","gap":"12px","padding":"5px"}}>
          {/* Dynamically populated */}
        </div>
      </div>
    </div>
  </div>

  {/* Toast */}
  <div className="email-builder-toast" id="email-builder-toast">
    <span id="email-builder-toast-message">Mensagem</span>
  </div>

  
      </div>
    </AdminLayout>
  );
}
