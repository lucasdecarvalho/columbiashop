-- ColumbiaShop — Seed de dados iniciais
-- Senha para ambos: Columbia2026!@

-- Cliente Tester
insert into clients (name, email, password) values
  ('Tester', 'tester@columbia.shop', '$2b$12$zT/LNX/Vxgz6G35p4QauT.WxbHbxh.Qpgy7mhgK2t8hQUpiC3XNJC')
on conflict (email) do nothing;

-- Admin
insert into admins (name, email, password) values
  ('Admin', 'admin@columbia.shop', '$2b$12$zT/LNX/Vxgz6G35p4QauT.WxbHbxh.Qpgy7mhgK2t8hQUpiC3XNJC')
on conflict (email) do nothing;

-- Produtos
insert into products (title, description, price, stock, image_url) values
  ('Tênis Urbano Runner X', 'Tênis casual de alta performance com solado de borracha e cabedal em mesh respirável. Ideal para o dia a dia com estilo e conforto.', 349.90, 18, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'),
  ('Mochila Explorer Pro', 'Mochila resistente à água com compartimento para notebook até 15", alças ergonômicas e 30L de capacidade. Perfeita para viagens e trabalho.', 289.90, 12, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80'),
  ('Relógio Clássico Slim', 'Relógio analógico de pulso com caixa em aço inoxidável, pulseira de couro legítimo e movimento japonês de precisão. Design atemporal.', 499.90, 8, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'),
  ('Óculos de Sol Polarizado', 'Armação leve em acetato com lentes polarizadas UV400. Proteção total contra raios UVA e UVB com visual moderno e sofisticado.', 199.90, 25, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80'),
  ('Fone Bluetooth Premium', 'Headphone over-ear com cancelamento de ruído ativo, 30h de bateria, conexão Bluetooth 5.3 e áudio Hi-Fi. Compatível com todos os dispositivos.', 649.90, 10, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'),
  ('Camiseta Algodão Pima', 'Camiseta premium confeccionada em algodão Pima peruano, ultra macia e durável. Corte slim com acabamento perfeito. Disponível em várias cores.', 129.90, 40, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80')
on conflict do nothing;

-- Cartão do Tester (Mastercard de teste do Mercado Pago)
insert into cards (client_id, last_four, brand, holder_name, expiration_month, expiration_year, is_default)
select id, '6351', 'mastercard', 'TESTER COLUMBIA', 11, 2030, true
from clients where email = 'tester@columbia.shop'
on conflict do nothing;
