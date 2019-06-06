import { Injectable } from '@angular/core';
import { VatCategory, VatCategoriesService } from './vat-categories.service';

export interface InvoiceLine {
  product: string;
  vatCategory: VatCategory;
  priceInclusiveVat: number;
}

export interface InvoiceLineComplete extends InvoiceLine {
  priceExclusiveVat: number;
}

export interface Invoice {
  invoiceLines: InvoiceLineComplete[];
  totalPriceInclusiveVat: number;
  totalPriceExclusiveVat: number;
  totalVat: number;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceCalculatorService {

  constructor(private vatCategoriesService: VatCategoriesService) { }

  public CalculatePriceExclusiveVat(priceInclusiveVat: number, vatPercentage: number): number {
    const factor = 100 / (100 + vatPercentage);
    return priceInclusiveVat * factor;
  }

  public CalculateInvoice(invoiceLines: InvoiceLine[]): Invoice {
    let lines: Invoice = { invoiceLines: undefined, totalPriceExclusiveVat: 0.0, totalPriceInclusiveVat: 0.0, totalVat: 0.0 };
    let vatExl: InvoiceLineComplete[] = [];

    invoiceLines.forEach(line => { 
      if (line.priceInclusiveVat == undefined || line.priceInclusiveVat <= 0) {
        vatExl.push({ product: line.product, vatCategory: line.vatCategory, priceInclusiveVat: line.priceInclusiveVat, priceExclusiveVat: -1 });
      } else {
        let curPriceExclusiveVat: number = this.CalculatePriceExclusiveVat(line.priceInclusiveVat, this.vatCategoriesService.getVat(line.vatCategory));
        vatExl.push({vatCategory: line.vatCategory, priceInclusiveVat: line.priceInclusiveVat, priceExclusiveVat: curPriceExclusiveVat,  product: line.product});
        lines.totalPriceExclusiveVat += curPriceExclusiveVat;
        lines.totalPriceInclusiveVat += line.priceInclusiveVat;
      }
    });

    lines.totalVat = lines.totalPriceInclusiveVat - lines.totalPriceExclusiveVat;
    lines.invoiceLines = vatExl;

    return lines;
  }
}
