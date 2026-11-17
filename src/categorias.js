import {
  IconBook,
  IconCar,
  IconDeviceGamepad2,
  IconDeviceTv,
  IconDots,
  IconHeartbeat,
  IconHome,
  IconShoppingBag,
  IconShoppingCart,
  IconToolsKitchen2,
} from "@tabler/icons-react";

/* Categorias de gasto. Identificadas por ÍCONE + NOME (nunca só por cor):
   o gráfico "Para onde vai a grana" usa barras de uma cor só, ordenadas
   por valor — 10 categorias não cabem numa paleta de cores distinguíveis.

   O `id` é o que fica salvo nos dados: não renomeie um id existente
   (os lançamentos antigos perderiam a categoria). Nome e ícone podem mudar. */
export const CATEGORIAS = [
  { id: "mercado", nome: "Mercado", Icone: IconShoppingCart },
  { id: "moradia", nome: "Moradia", Icone: IconHome },
  { id: "transporte", nome: "Transporte", Icone: IconCar },
  { id: "alimentacao", nome: "Restaurantes e delivery", Icone: IconToolsKitchen2 },
  { id: "saude", nome: "Saúde", Icone: IconHeartbeat },
  { id: "educacao", nome: "Educação", Icone: IconBook },
  { id: "lazer", nome: "Lazer", Icone: IconDeviceGamepad2 },
  { id: "compras", nome: "Compras", Icone: IconShoppingBag },
  { id: "assinaturas", nome: "Assinaturas", Icone: IconDeviceTv },
  { id: "outros", nome: "Outros", Icone: IconDots },
];

export const CATEGORIA_PADRAO = "outros";
export const IDS_CATEGORIAS = CATEGORIAS.map((c) => c.id);

export const categoriaPorId = (id) =>
  CATEGORIAS.find((c) => c.id === id) ?? CATEGORIAS[CATEGORIAS.length - 1];
