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

-- Produtos de limpeza (baseados em columbiastore.com.br)
insert into products (title, description, price, stock, image_url) values
  ('Luva de Látex Silver Azul M Volk Slim', 'Luva de látex resistente e confortável, ideal para limpeza profissional e doméstica. Tamanho M, modelo slim de alta durabilidade com proteção total das mãos.', 6.81, 120, 'https://images.tcdn.com.br/img/img_prod/1234949/luva_de_latex_silver_azul_m_volk_slim_1259_1_56b9831d2425fb85d61b2c1ee4f23d12.jpeg'),
  ('Saco de Lixo 110 Litros Preto Tonovale BE 4', 'Saco de lixo reforçado 110 litros na cor preta. Pacote econômico com alta resistência para uso doméstico e comercial. Marca Tonovale.', 84.09, 60, 'https://images.tcdn.com.br/img/img_prod/1234949/saco_de_lixo_110_litros_be_4_preto_tonovale_3720_1_0fff14d09042ee6e00382623e41fd929.jpg'),
  ('Amaciante Diluído Maciez Intensiva 5L Comfort', 'Amaciante concentrado Comfort 5 litros para até 100 lavagens. Fórmula de maciez intensiva com perfume duradouro. Ideal para uso doméstico e profissional.', 58.67, 35, 'https://images.tcdn.com.br/img/img_prod/1234949/amaciante_diluido_maciez_intensiva_5_litros_comfort_3068_1_5bd3c67ee9e45c727b02992014ac9989.jpg'),
  ('Esponja Mágica Scotch-Brite 3M', 'Esponja mágica Scotch-Brite 3M para limpeza pesada sem arranhões. Remove manchas difíceis de gordura, ferrugem e sujeira com menos esforço.', 8.39, 200, 'https://images.tcdn.com.br/img/img_prod/1234949/esponja_magica_scotch_brite_3m_para_limpeza_pesada_15_1_0c73c6046b1a8cf6c455b1ac037e7330.jpg'),
  ('Kit Limpa Vidros Rodo 35cm + Extensor 4,5m Bralimpia', 'Kit completo para limpeza de vidros em altura: rodo de 35cm com cabo extensível de até 4,5 metros. Ideal para janelas, fachadas e superfícies de difícil acesso.', 394.41, 15, 'https://images.tcdn.com.br/img/img_prod/1234949/kit_limpa_vidros_com_rodo_35cm_e_extensor_4_5m_espanador_1579_1_f6f9d4685f9b6390882f141b21667c73.jpg'),
  ('Kit 2 Sabão Líquido Lava-Roupas Perfect White 7L OMO', 'Kit com 2 unidades de sabão líquido OMO Perfect White 7 litros cada. Fórmula exclusiva que remove manchas difíceis e mantém as roupas brancas por mais tempo.', 182.30, 28, 'https://images.tcdn.com.br/img/img_prod/1234949/kit_2_detergentes_liquido_lava_roupas_perfect_white_7_litros_omo_3064_1_f243f5ea0c45706b552941081c3d02ad.jpg')
on conflict do nothing;

-- Cartão do Tester (Mastercard de teste do Mercado Pago)
insert into cards (client_id, last_four, brand, holder_name, expiration_month, expiration_year, is_default)
select id, '6351', 'mastercard', 'TESTER COLUMBIA', 11, 2030, true
from clients where email = 'tester@columbia.shop'
on conflict do nothing;
