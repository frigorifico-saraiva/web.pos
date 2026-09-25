"use client";

import { Minus, Plus, X } from "lucide-react";
import { CartItem } from "./types";
import {
  formatBRL,
  formatQty,
  lineTotalCents,
  parsePriceToCents,
} from "./utils";

type Props = {
  cart: CartItem[];
  totalItems: number;
  totalAmount: number;
  itemDiscountTotal: number;
  onRemoveItem: (itemId: string) => void;
  onUpdateQtyFromInput: (itemId: string, rawValue: string) => void;
  onUpdateItemDiscountFromInput: (itemId: string, rawValue: string) => void;
  onUpdateQty: (itemId: string, delta: number) => void;
};

export function CartPanel({
  cart,
  totalItems,
  totalAmount,
  itemDiscountTotal,
  onRemoveItem,
  onUpdateQtyFromInput,
  onUpdateItemDiscountFromInput,
  onUpdateQty,
}: Props) {
  return (
    <div className="border relative h-full flex flex-col px-2 overflow-y-scroll scrollbar-hidden">
      <div className="sticky top-0 py-2 bg-white z-10">
        <p className="text-4xl text-secondary font-light">produtos</p>
      </div>

      <div className="mt-6 flex-1 flex flex-col gap-4">
        {cart.length === 0 && (
          <p className="text-tertiary text-sm text-center mt-8">
            nenhum produto adicionado
          </p>
        )}
        {cart.slice().reverse().map((item, idx) => {
          const priceCents = parsePriceToCents(item.product.price);
          const grossLineTotalCents = lineTotalCents(item.product.price, item.quantity);
          const lineDiscountCents = Math.min(item.discountCents, grossLineTotalCents);
          const lineTotalCentsValue = Math.max(grossLineTotalCents - lineDiscountCents, 0);

          return (
            <div key={item.id} className="border p-1">
              <div className="text-lg flex justify-between border-b">
                <p className="truncate pr-2">
                  {String(cart.length - idx).padStart(2, "0")}. {item.product.name}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <p>{formatBRL(priceCents / 100)}</p>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-tertiary hover:text-black transition-colors"
                  >
                    <X size={14} strokeWidth={1} />
                  </button>
                </div>
              </div>

              <div className="mt-8 text-lg font-normal flex justify-center items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatQty(item.quantity)}
                  onChange={(e) => onUpdateQtyFromInput(item.id, e.target.value)}
                  className="w-20 bg-transparent border-b border-tertiary/30 text-center outline-none focus:border-tertiary"
                  aria-label={`quantidade de ${item.product.name}`}
                />
                {item.product.unit && (
                  <span className="text-sm text-tertiary uppercase">{item.product.unit}</span>
                )}
              </div>

              <div className="text-lg font-normal flex justify-center gap-2">
                <p>total</p>
                <p>{formatBRL(lineTotalCentsValue / 100)}</p>
              </div>

              <div className="mt-1 text-sm flex items-center justify-center gap-2">
                <label htmlFor={`item-discount-${item.id}`} className="text-tertiary">
                  desconto
                </label>
                <input
                  id={`item-discount-${item.id}`}
                  type="text"
                  inputMode="numeric"
                  value={formatBRL(item.discountCents / 100)}
                  onChange={(e) =>
                    onUpdateItemDiscountFromInput(item.id, e.target.value)
                  }
                  className="w-15 bg-transparent text-tertiary text-center outline-none"
                  aria-label={`desconto de ${item.product.name}`}
                />
              </div>

              <div className="mt-7 text-lg flex justify-between gap-2">
                <button
                  onClick={() => onUpdateQty(item.id, -0.5)}
                  className="hover:opacity-60 transition-opacity cursor-pointer"
                >
                  <Minus strokeWidth={0.8} />
                </button>
                <button
                  onClick={() => onUpdateQty(item.id, 0.5)}
                  className="hover:opacity-60 transition-opacity cursor-pointer"
                >
                  <Plus strokeWidth={0.8} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-0 mt-auto bg-white pt-2 z-10">
        <p className="text-base font-light">totais</p>
        <div className="text-lg flex justify-between">
          <p>{String(totalItems).padStart(2, "0")}</p>
          <p>{formatBRL(totalAmount)}</p>
        </div>
        <div className="text-sm flex justify-between text-tertiary">
          <p>desconto itens</p>
          <p>- {formatBRL(itemDiscountTotal)}</p>
        </div>
      </div>
    </div>
  );
}
