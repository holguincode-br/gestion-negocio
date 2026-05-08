-- ============================================
-- SCHEMA: Gestión de Negocio
-- ============================================

-- Categorias
CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE
);

-- Productos
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  precio_compra NUMERIC(10,2) NOT NULL DEFAULT 0,
  precio_venta NUMERIC(10,2) NOT NULL,
  stock_minimo INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Almacenes
CREATE TABLE IF NOT EXISTS almacenes (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  es_principal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock por almacen (composite key)
CREATE TABLE IF NOT EXISTS stock_almacen (
  almacen_id INTEGER NOT NULL REFERENCES almacenes(id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  cantidad INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (almacen_id, producto_id)
);

-- Movimientos del banco
CREATE TABLE IF NOT EXISTS banco_movimientos (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  tipo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  monto NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Socios
CREATE TABLE IF NOT EXISTS socios (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  porcentaje INTEGER NOT NULL,
  retencion NUMERIC(10,2) NOT NULL DEFAULT 0,
  ganancias_acumuladas NUMERIC(10,2) NOT NULL DEFAULT 0,
  retiros_acumulados NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Config reinversion (single row)
CREATE TABLE IF NOT EXISTS config_reinversion (
  id INTEGER PRIMARY KEY DEFAULT 1,
  porcentaje INTEGER NOT NULL DEFAULT 10,
  balance NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- Compras
CREATE TABLE IF NOT EXISTS compras (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  almacen_id INTEGER NOT NULL REFERENCES almacenes(id),
  total NUMERIC(10,2) NOT NULL,
  productos JSONB NOT NULL DEFAULT '[]',
  gastos JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- IPV (Inventario, Produccion, Ventas)
CREATE TABLE IF NOT EXISTS ipvs (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  estado TEXT NOT NULL DEFAULT 'abierto',
  ventas JSONB NOT NULL DEFAULT '[]',
  mermas JSONB NOT NULL DEFAULT '[]',
  consumos JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Retiros de socios
CREATE TABLE IF NOT EXISTS retiros_socios (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  socio_id INTEGER NOT NULL REFERENCES socios(id),
  monto NUMERIC(10,2) NOT NULL,
  descripcion TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS POLICIES (open for now, secure later)
-- ============================================

ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE almacenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_almacen ENABLE ROW LEVEL SECURITY;
ALTER TABLE banco_movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE socios ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_reinversion ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE retiros_socios ENABLE ROW LEVEL SECURITY;

-- Allow all operations (public app, no auth yet)
CREATE POLICY "public_all" ON categorias FOR ALL USING (true);
CREATE POLICY "public_all" ON productos FOR ALL USING (true);
CREATE POLICY "public_all" ON almacenes FOR ALL USING (true);
CREATE POLICY "public_all" ON stock_almacen FOR ALL USING (true);
CREATE POLICY "public_all" ON banco_movimientos FOR ALL USING (true);
CREATE POLICY "public_all" ON socios FOR ALL USING (true);
CREATE POLICY "public_all" ON config_reinversion FOR ALL USING (true);
CREATE POLICY "public_all" ON compras FOR ALL USING (true);
CREATE POLICY "public_all" ON ipvs FOR ALL USING (true);
CREATE POLICY "public_all" ON retiros_socios FOR ALL USING (true);

-- ============================================
-- SEED DATA
-- ============================================

-- Categorias
INSERT INTO categorias (nombre) VALUES
  ('Confituras'), ('Carnicos'), ('Lacteos'), ('Bebidas'), ('Snacks')
ON CONFLICT (nombre) DO NOTHING;

-- Almacenes
INSERT INTO almacenes (id, nombre, es_principal) VALUES
  (1, 'En Venta', true),
  (2, 'Bodega Central', false)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for almacenes
SELECT setval('almacenes_id_seq', (SELECT MAX(id) FROM almacenes));

-- Productos
INSERT INTO productos (id, nombre, categoria, precio_compra, precio_venta, stock_minimo) VALUES
  (1, 'Mermelada de Fresa', 'Confituras', 0, 45, 10),
  (2, 'Mermelada de Mora', 'Confituras', 0, 50, 10),
  (3, 'Jamon Serrano', 'Carnicos', 0, 120, 5),
  (4, 'Salchicha Premium', 'Carnicos', 0, 55, 15),
  (5, 'Queso Oaxaca', 'Lacteos', 0, 90, 8),
  (6, 'Yogurt Natural', 'Lacteos', 0, 30, 20),
  (7, 'Refresco Cola', 'Bebidas', 0, 20, 30),
  (8, 'Agua Mineral', 'Bebidas', 0, 12, 40),
  (9, 'Papas Fritas', 'Snacks', 0, 25, 25),
  (10, 'Galletas Chocolate', 'Snacks', 0, 18, 20)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for productos
SELECT setval('productos_id_seq', (SELECT MAX(id) FROM productos));

-- Stock Almacen 1 (En Venta)
INSERT INTO stock_almacen (almacen_id, producto_id, cantidad) VALUES
  (1, 1, 50), (1, 2, 30), (1, 3, 8), (1, 4, 20), (1, 5, 15),
  (1, 6, 45), (1, 7, 60), (1, 8, 80), (1, 9, 40), (1, 10, 35)
ON CONFLICT (almacen_id, producto_id) DO NOTHING;

-- Stock Almacen 2 (Bodega Central)
INSERT INTO stock_almacen (almacen_id, producto_id, cantidad) VALUES
  (2, 1, 20), (2, 2, 15), (2, 3, 12), (2, 4, 10), (2, 5, 8),
  (2, 6, 25), (2, 7, 30), (2, 8, 50), (2, 9, 20), (2, 10, 15)
ON CONFLICT (almacen_id, producto_id) DO NOTHING;

-- Banco - movimiento inicial
INSERT INTO banco_movimientos (fecha, tipo, descripcion, monto) VALUES
  ('2025-01-15', 'deposito', 'Capital inicial', 15000)
ON CONFLICT DO NOTHING;

-- Socios
INSERT INTO socios (id, nombre, porcentaje, retencion, ganancias_acumuladas, retiros_acumulados) VALUES
  (1, 'Carlos Mendez', 40, 0, 0, 0),
  (2, 'Ana Lopez', 35, 0, 0, 0),
  (3, 'Roberto Silva', 15, 0, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for socios
SELECT setval('socios_id_seq', (SELECT MAX(id) FROM socios));

-- Config reinversion
INSERT INTO config_reinversion (id, porcentaje, balance) VALUES
  (1, 10, 0)
ON CONFLICT (id) DO NOTHING;
