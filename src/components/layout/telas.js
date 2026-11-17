import {
  IconCreditCard,
  IconLayoutDashboard,
  IconReceipt,
  IconSettings,
} from "@tabler/icons-react";

/* As 4 telas do app — compartilhado pela barra inferior (celular)
   e pelo menu lateral (desktop). */
export const TELAS = [
  { id: "resumo", rotulo: "Resumo", Icone: IconLayoutDashboard },
  { id: "contas", rotulo: "Contas", Icone: IconReceipt },
  { id: "cartoes", rotulo: "Cartões", Icone: IconCreditCard },
  { id: "ajustes", rotulo: "Ajustes", Icone: IconSettings },
];
